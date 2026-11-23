import Product from '../models/Product';
import type { IProduct } from '../models/Product';

export interface CreateProductData {
  userId: string;
  name: string;
  sellingPrice: number;
  productCost: number;
  deliveryCost: number;
  otherCosts: number;
  adBudget: number;
  expectedOrders: number;
  market: string;
  category: string;
}

export interface UpdateProductData {
  name?: string;
  sellingPrice?: number;
  productCost?: number;
  deliveryCost?: number;
  otherCosts?: number;
  adBudget?: number;
  expectedOrders?: number;
  market?: string;
  category?: string;
}

/** Default product seeded for every new user */
export const DEFAULT_PRODUCT_DATA: Omit<CreateProductData, 'userId'> = {
  name: 'Premium Skincare Serum',
  sellingPrice: 3000,
  productCost: 900,
  deliveryCost: 250,
  otherCosts: 150,
  adBudget: 12000,
  expectedOrders: 20,
  market: 'Pakistan',
  category: 'Skincare',
};

/**
 * Get all products for a user (max 2 allowed).
 */
export async function getUserProducts(userId: string): Promise<IProduct[]> {
  return Product.find({ userId }).sort({ createdAt: 1 });
}

/**
 * Get a single product by ID, verifying ownership.
 */
export async function getProductById(productId: string, userId: string): Promise<IProduct | null> {
  return Product.findOne({ _id: productId, userId });
}

/**
 * Create a new product for a user. Enforces max 2 products per user.
 */
export async function createProduct(data: CreateProductData): Promise<IProduct> {
  const existingCount = await Product.countDocuments({ userId: data.userId });
  if (existingCount >= 2) {
    throw new Error('Maximum of 2 products allowed. Delete an existing product first.');
  }
  return Product.create(data);
}

/**
 * Update an existing product, verifying ownership.
 */
export async function updateProduct(
  productId: string,
  userId: string,
  data: UpdateProductData
): Promise<IProduct | null> {
  return Product.findOneAndUpdate(
    { _id: productId, userId },
    { $set: data },
    { new: true, runValidators: true }
  );
}

/**
 * Delete a product, verifying ownership.
 */
export async function deleteProduct(productId: string, userId: string): Promise<boolean> {
  const result = await Product.deleteOne({ _id: productId, userId });
  return result.deletedCount > 0;
}

/**
 * Seed the default product for a new user if they have no products yet.
 */
export async function seedDefaultProduct(userId: string): Promise<void> {
  const count = await Product.countDocuments({ userId });
  if (count === 0) {
    await Product.create({ ...DEFAULT_PRODUCT_DATA, userId });
  }
}
