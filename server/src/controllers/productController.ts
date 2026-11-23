import type { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';

/**
 * GET /api/products — list all products for the authenticated user
 */
export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }
    const products = await productService.getUserProducts(req.user._id.toString());
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id — get a single product
 */
export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }
    const product = await productService.getProductById(req.params.id, req.user._id.toString());
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found', statusCode: 404 });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products — create a new product
 */
export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }
    const { name, sellingPrice, productCost, deliveryCost, otherCosts, adBudget, expectedOrders, market, category } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, error: 'Product name is required', statusCode: 400 });
      return;
    }
    if (sellingPrice === undefined || sellingPrice < 0) {
      res.status(400).json({ success: false, error: 'Valid selling price is required', statusCode: 400 });
      return;
    }

    const product = await productService.createProduct({
      userId: req.user._id.toString(),
      name: name.trim(),
      sellingPrice: Number(sellingPrice),
      productCost: Number(productCost) || 0,
      deliveryCost: Number(deliveryCost) || 0,
      otherCosts: Number(otherCosts) || 0,
      adBudget: Number(adBudget) || 0,
      expectedOrders: Number(expectedOrders) || 0,
      market: market || 'Pakistan',
      category: category || 'Skincare',
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Maximum of 2 products')) {
      res.status(400).json({ success: false, error: err.message, statusCode: 400 });
      return;
    }
    next(err);
  }
}

/**
 * PUT /api/products/:id — update an existing product
 */
export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }

    const updates: Record<string, unknown> = {};
    const allowedFields = ['name', 'sellingPrice', 'productCost', 'deliveryCost', 'otherCosts', 'adBudget', 'expectedOrders', 'market', 'category'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'name' ? String(req.body[field]).trim() : Number(req.body[field]) || req.body[field];
      }
    }

    const product = await productService.updateProduct(req.params.id, req.user._id.toString(), updates);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found', statusCode: 404 });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id — delete a product
 */
export async function deleteProductHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }
    const deleted = await productService.deleteProduct(req.params.id, req.user._id.toString());
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Product not found', statusCode: 404 });
      return;
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}
