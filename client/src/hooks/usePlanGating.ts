import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { GatedFeature, PlanType, PlanLimits } from '@/types';
import { PLAN_LIMITS } from '@/types';

interface UsePlanGatingResult {
  currentPlan: PlanType;
  isFeatureAvailable: (feature: GatedFeature) => boolean;
  getUpgradePrompt: (feature: GatedFeature) => string | null;
  canAccessFeature: (feature: GatedFeature) => boolean;
  usageLimit: number | null;
  currentLimits: PlanLimits;
  isAdmin: boolean;
}

const FEATURE_UPGRADE_MESSAGES: Record<GatedFeature, string> = {
  advancedAIAnalysis: 'Advanced AI analysis requires Standard or Business plan',
  exportReports: 'Report exports require Standard or Business plan',
  teamCollaboration: 'Team collaboration requires Business plan',
  higherUsageLimits: 'Higher usage limits require Standard or Business plan',
};

/** All gated features — used to grant admins full access. */
const ALL_FEATURES: GatedFeature[] = [
  'advancedAIAnalysis',
  'exportReports',
  'teamCollaboration',
  'higherUsageLimits',
];

const ADMIN_LIMITS: PlanLimits = {
  maxAnalysesPerMonth: null, // unlimited
  features: ALL_FEATURES,
};

/**
 * Hook for checking feature access based on subscription plan AND payment confirmation.
 * Features are gated on both plan tier and active payment status.
 * Users with pending_setup (Payment Pending) status are locked out of premium features
 * regardless of their selected plan tier. Only status === 'active' grants access.
 *
 * Admin users (role === 'admin') bypass ALL plan restrictions and receive full access
 * to every feature regardless of their subscription plan or payment status.
 */
export function usePlanGating(): UsePlanGatingResult {
  const { subscription } = useAppSelector((s) => s.subscription);
  const user = useAppSelector((s) => s.auth.user);

  const isAdmin = user?.role === 'admin';

  const currentPlan: PlanType = subscription?.plan || 'basic';
  const isPaymentConfirmed = subscription?.status === 'active';
  // If payment is not confirmed, fall back to basic limits regardless of plan tier
  const effectivePlan: PlanType = isAdmin ? 'business' : (isPaymentConfirmed ? currentPlan : 'basic');
  const currentLimits = isAdmin ? ADMIN_LIMITS : PLAN_LIMITS[effectivePlan];

  const isFeatureAvailable = useCallback(
    (feature: GatedFeature): boolean => {
      if (isAdmin) return true;
      return currentLimits.features.includes(feature);
    },
    [isAdmin, currentLimits]
  );

  const canAccessFeature = useCallback(
    (feature: GatedFeature): boolean => {
      if (isAdmin) return true;
      return isFeatureAvailable(feature);
    },
    [isAdmin, isFeatureAvailable]
  );

  const getUpgradePrompt = useCallback(
    (feature: GatedFeature): string | null => {
      if (isAdmin) return null;
      if (isFeatureAvailable(feature)) return null;
      return FEATURE_UPGRADE_MESSAGES[feature];
    },
    [isAdmin, isFeatureAvailable]
  );

  const usageLimit = isAdmin ? null : currentLimits.maxAnalysesPerMonth;

  return {
    currentPlan,
    isFeatureAvailable,
    getUpgradePrompt,
    canAccessFeature,
    usageLimit,
    currentLimits,
    isAdmin,
  };
}
