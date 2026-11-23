import apiClient from './apiClient';
import type { SelectPlanRequest, Subscription, ChangePlanRequest } from '@/types';

/**
 * Select a plan for the authenticated user.
 */
export async function selectPlanRequest(payload: SelectPlanRequest): Promise<{ success: boolean; data?: Subscription; error?: string }> {
  const { data } = await apiClient.post('/subscriptions/select-plan', payload);
  return data;
}

/**
 * Get the current subscription for the authenticated user.
 */
export async function getCurrentSubscriptionRequest(): Promise<{ success: boolean; data?: Subscription | null; error?: string }> {
  const { data } = await apiClient.get('/subscriptions/current');
  return data;
}

/**
 * Check whether payment processing is configured.
 */
export async function getPaymentStatusRequest(): Promise<{ success: boolean; data?: { paymentConfigured: boolean }; error?: string }> {
  const { data } = await apiClient.get('/subscriptions/status');
  return data;
}

/**
 * Change the user's plan (upgrade/downgrade).
 */
export async function changePlanRequest(payload: ChangePlanRequest): Promise<{ success: boolean; data?: Subscription; error?: string }> {
  const { data } = await apiClient.put('/subscriptions/change-plan', payload);
  return data;
}

/**
 * Cancel the user's subscription.
 */
export async function cancelSubscriptionRequest(): Promise<{ success: boolean; data?: Subscription; error?: string }> {
  const { data } = await apiClient.post('/subscriptions/cancel');
  return data;
}

/**
 * Get subscription history.
 */
export async function getSubscriptionHistoryRequest(): Promise<{ success: boolean; data?: Subscription[]; error?: string }> {
  const { data } = await apiClient.get('/subscriptions/history');
  return data;
}
