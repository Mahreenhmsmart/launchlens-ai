import mongoose, { Schema, Document } from 'mongoose';

export type PlanType = 'basic' | 'standard' | 'business';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'pending_setup' | 'active' | 'cancelled';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: PlanType;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  paymentMethod: string;
  paymentConfigured: boolean;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  businessName: string;
  nextBillingDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'standard', 'business'],
      required: [true, 'Plan is required'],
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: [true, 'Billing cycle is required'],
      default: 'monthly',
    },
    status: {
      type: String,
      enum: ['pending_setup', 'active', 'cancelled'],
      required: [true, 'Status is required'],
      default: 'pending_setup',
    },
    paymentMethod: {
      type: String,
      default: '',
    },
    paymentConfigured: {
      type: Boolean,
      default: false,
    },
    buyerName: {
      type: String,
      default: '',
      trim: true,
    },
    buyerEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    buyerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    businessName: {
      type: String,
      default: '',
      trim: true,
    },
    nextBillingDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure one active/pending subscription per user
subscriptionSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
