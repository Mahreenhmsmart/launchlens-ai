import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
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

const productSchema = new Schema<IProduct>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    productCost: {
      type: Number,
      required: [true, 'Product cost is required'],
      min: [0, 'Product cost cannot be negative'],
    },
    deliveryCost: {
      type: Number,
      required: [true, 'Delivery cost is required'],
      min: [0, 'Delivery cost cannot be negative'],
    },
    otherCosts: {
      type: Number,
      default: 0,
      min: [0, 'Other costs cannot be negative'],
    },
    adBudget: {
      type: Number,
      required: [true, 'Ad budget is required'],
      min: [0, 'Ad budget cannot be negative'],
    },
    expectedOrders: {
      type: Number,
      required: [true, 'Expected orders is required'],
      min: [0, 'Expected orders cannot be negative'],
    },
    market: {
      type: String,
      default: 'Pakistan',
      trim: true,
    },
    category: {
      type: String,
      default: 'Skincare',
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index for fast per-user queries
productSchema.index({ userId: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
