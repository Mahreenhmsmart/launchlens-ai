import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import type { SharedProduct, CreateProductRequest, UpdateProductRequest } from '../../types';
import { scopedGetRaw, scopedSetRaw } from '../../utils/scopedStorage';

// Scoped localStorage keys for per-user product state
const PRODUCTS_ACTIVE_KEY = 'activeProductId';
const PRODUCTS_ONBOARDING_KEY = 'onboardingCompleted';

interface ProductsState {
  items: SharedProduct[];
  activeProductId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  activeProductId: null,
  status: 'idle',
  error: null,
};

export const loadProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { getState }) => {
    const state = getState() as { auth: { user: { id: string } | null } };
    const userId = state.auth.user?.id ?? null;
    const products = await fetchProducts();

    // Restore per-user active product ID from scoped localStorage
    let storedActiveId: string | null = null;
    if (userId) {
      storedActiveId = scopedGetRaw(PRODUCTS_ACTIVE_KEY, userId, '') || null;
    }

    return { products, storedActiveId };
  }
);

export const addProduct = createAsyncThunk('products/create', async (payload: CreateProductRequest) => {
  return await createProduct(payload);
});

export const editProduct = createAsyncThunk(
  'products/update',
  async ({ id, data }: { id: string; data: UpdateProductRequest }) => {
    return await updateProduct(id, data);
  }
);

export const removeProduct = createAsyncThunk('products/delete', async (id: string) => {
  await deleteProduct(id);
  return id;
});

export const renameProduct = createAsyncThunk(
  'products/rename',
  async ({ id, name }: { id: string; name: string }) => {
    return await updateProduct(id, { name });
  }
);

export const duplicateProduct = createAsyncThunk(
  'products/duplicate',
  async (product: SharedProduct) => {
    const payload: CreateProductRequest = {
      name: `${product.name} (Copy)`,
      sellingPrice: product.sellingPrice,
      productCost: product.productCost,
      deliveryCost: product.deliveryCost,
      otherCosts: product.otherCosts,
      adBudget: product.adBudget,
      expectedOrders: product.expectedOrders,
      market: product.market,
      category: product.category,
    };
    return await createProduct(payload);
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setActiveProduct(state, action: { payload: string }) {
      state.activeProductId = action.payload;
    },
    /** Reset all product state — used on logout to prevent cross-account leakage */
    resetProducts(state) {
      state.items = [];
      state.activeProductId = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(loadProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.products;
        // Restore stored active product or auto-select first
        const storedActiveId = action.payload.storedActiveId;
        if (storedActiveId && action.payload.products.some((p) => p._id === storedActiveId)) {
          state.activeProductId = storedActiveId;
        } else if (!state.activeProductId && action.payload.products.length > 0) {
          state.activeProductId = action.payload.products[0]._id;
        }
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load products';
      })
      // Create
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
        // Auto-select newly created product
        state.activeProductId = action.payload._id;
      })
      // Update
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Rename
      .addCase(renameProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Duplicate
      .addCase(duplicateProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Delete
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
        // If deleted product was active, select the first remaining
        if (state.activeProductId === action.payload) {
          state.activeProductId = state.items.length > 0 ? state.items[0]._id : null;
        }
      });
  },
});

export const { setActiveProduct, resetProducts } = productsSlice.actions;
export default productsSlice.reducer;
