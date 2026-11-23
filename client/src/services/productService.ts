import apiClient from './apiClient';
import type { SharedProduct, CreateProductRequest, UpdateProductRequest } from '@/types';

/**
 * Fetch all products for the authenticated user.
 */
export async function fetchProducts(): Promise<SharedProduct[]> {
  const { data } = await apiClient.get('/products');
  return data.data;
}

/**
 * Create a new product.
 */
export async function createProduct(payload: CreateProductRequest): Promise<SharedProduct> {
  const { data } = await apiClient.post('/products', payload);
  return data.data;
}

/**
 * Update an existing product by ID.
 */
export async function updateProduct(id: string, payload: UpdateProductRequest): Promise<SharedProduct> {
  const { data } = await apiClient.put(`/products/${id}`, payload);
  return data.data;
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
