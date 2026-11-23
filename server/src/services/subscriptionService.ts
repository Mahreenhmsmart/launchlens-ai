import Subscription, { type PlanType, type BillingCycle } from '../models/Subscription';

export interface BuyerDetailsInput {
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  businessName?: string;
}

/**
 * Check whether a user has admin role. Admin users bypass all plan restrictions.
 * Accepts either a role string or an object with a role property.
 */
export function isAdminUser(roleOrUser: string | { role?: string } | undefined | null): boolean {
  if (!roleOrUser) return false;
  const role = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser.role;
  return role === 'admin';
}

/**
 * Select or update a user's plan. Creates a new subscription with
 * status "pending_setup" if none exists, or updates the existing one.
 */
export async function selectPlan(
  userId: string,
  plan: PlanType,
  billingCycle: BillingCycle,
  paymentMethod: string,
  buyerDetails?: BuyerDetailsInput
) {
  const setFields: Record<string, unknown> = {
    plan,
    billingCycle,
    paymentMethod,
    status: 'pending_setup',
    paymentConfigured: false,
  };

  // Only set buyer fields if provided
  if (buyerDetails?.buyerName !== undefined) setFields.buyerName = buyerDetails.buyerName;
  if (buyerDetails?.buyerEmail !== undefined) setFields.buyerEmail = buyerDetails.buyerEmail;
  if (buyerDetails?.buyerPhone !== undefined) setFields.buyerPhone = buyerDetails.buyerPhone;
  if (buyerDetails?.businessName !== undefined) setFields.businessName = buyerDetails.businessName;

  const subscription = await Subscription.findOneAndUpdate(
    { userId },
    { $set: setFields },
    { upsert: true, new: true, runValidators: true }
  );

  return subscription;
}

/**
 * Get the current subscription for a user. Returns null if none exists.
 */
export async function getCurrentSubscription(userId: string) {
  const subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });
  return subscription;
}

/**
 * Change the user's plan (upgrade or downgrade).
 */
export async function changePlan(
  userId: string,
  plan: PlanType,
  billingCycle: BillingCycle
) {
  const subscription = await Subscription.findOneAndUpdate(
    { userId, status: { $in: ['pending_setup', 'active'] } },
    {
      $set: {
        plan,
        billingCycle,
        status: 'pending_setup',
        paymentConfigured: false,
      },
    },
    { new: true, runValidators: true }
  );

  return subscription;
}

/**
 * Cancel the user's subscription.
 */
export async function cancelSubscription(userId: string) {
  const subscription = await Subscription.findOneAndUpdate(
    { userId, status: { $in: ['pending_setup', 'active'] } },
    {
      $set: {
        status: 'cancelled',
        nextBillingDate: null,
      },
    },
    { new: true }
  );

  return subscription;
}

/**
 * Get subscription history for a user (all subscriptions sorted by creation date).
 */
export async function getSubscriptionHistory(userId: string) {
  const history = await Subscription.find({ userId }).sort({ createdAt: -1 });
  return history;
}

/**
 * Check whether payment processing is configured globally.
 * Reads PAYMENT_PROVIDER_CONFIGURED env var (defaults to false).
 */
export function isPaymentConfigured(): boolean {
  return process.env.PAYMENT_PROVIDER_CONFIGURED === 'true';
}
