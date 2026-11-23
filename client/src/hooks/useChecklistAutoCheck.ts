/**
 * Auto-check logic for the Launch Readiness Checklist.
 *
 * Determines which tasks can be automatically marked complete based on
 * existing app data (product fields, saved simulations, courier config).
 * Tasks that cannot be proven from data remain purely manual.
 */

import { useMemo, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import { STORAGE_KEYS, scopedGetItem } from '@/utils/scopedStorage';
import { getSavedSimulatorAnalyses } from '@/utils/saveExport';
import {
  DEFAULT_COURIER_RATES,
  sanitizeCourierRates,
  type CourierRatesConfig,
} from '@/utils/courierEngine';
import type { SimulationInputs } from '@/utils/calculations';
import { addNotificationDirect } from './useNotifications';

/** Task IDs that support auto-check (must match DEFAULT_CHECKLIST_TASKS ids). */
export const AUTO_CHECKABLE_IDS = new Set([
  'pricing-economics',
  'shipping-fulfillment',
  'testing-budget',
]);

/**
 * Returns a record mapping task IDs → whether they are auto-eligible.
 * Only tasks whose completion can be proven from existing data are included;
 * all others are omitted (treated as not auto-eligible).
 */
export function useAutoCheckEligibility(
  simulatorInputs: SimulationInputs,
): Record<string, boolean> {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const { items: products, activeProductId } = useAppSelector((s) => s.products);

  const activeProduct = useMemo(
    () => products.find((p) => p._id === activeProductId) || null,
    [products, activeProductId],
  );

  return useMemo(() => {
    const result: Record<string, boolean> = {};

    // ── pricing-economics ────────────────────────────────────────────────
    // Auto-tick when selling price > 0, product cost > 0, and contribution > 0
    if (activeProduct) {
      const contribution =
        activeProduct.sellingPrice -
        activeProduct.productCost -
        activeProduct.deliveryCost -
        activeProduct.otherCosts;
      result['pricing-economics'] =
        activeProduct.sellingPrice > 0 &&
        activeProduct.productCost > 0 &&
        contribution > 0;
    } else {
      // Fall back to simulator inputs
      const contribution =
        simulatorInputs.sellingPrice -
        simulatorInputs.productCost -
        simulatorInputs.deliveryCost -
        simulatorInputs.otherVariableCosts;
      result['pricing-economics'] =
        simulatorInputs.sellingPrice > 0 &&
        simulatorInputs.productCost > 0 &&
        contribution > 0;
    }

    // ── shipping-fulfillment ─────────────────────────────────────────────
    // Auto-tick when courier rates have been configured (non-default) OR
    // delivery cost has been explicitly set (> 0) in the active product / inputs
    const hasDeliveryCost = activeProduct
      ? activeProduct.deliveryCost > 0
      : simulatorInputs.deliveryCost > 0;

    // Check if user has customised courier rates
    let hasCustomCourierRates = false;
    if (userId) {
      const stored = scopedGetItem<CourierRatesConfig>(
        STORAGE_KEYS.COURIER_RATES,
        userId,
        null as unknown as CourierRatesConfig,
      );
      if (stored && stored.couriers) {
        const sanitised = sanitizeCourierRates(stored);
        // Compare against defaults — if any base rate differs, user configured it
        for (const cid of Object.keys(sanitised.couriers)) {
          const defaultRate = DEFAULT_COURIER_RATES.couriers[cid as keyof typeof DEFAULT_COURIER_RATES.couriers];
          const storedRate = sanitised.couriers[cid as keyof typeof sanitised.couriers];
          if (defaultRate && storedRate && storedRate.baseRate1kg !== defaultRate.baseRate1kg) {
            hasCustomCourierRates = true;
            break;
          }
        }
      }
    }

    result['shipping-fulfillment'] = hasDeliveryCost || hasCustomCourierRates;

    // ── testing-budget ───────────────────────────────────────────────────
    // Auto-tick when ad budget > 0 AND expected orders > 0
    if (activeProduct) {
      result['testing-budget'] =
        activeProduct.adBudget > 0 && activeProduct.expectedOrders > 0;
    } else {
      result['testing-budget'] =
        simulatorInputs.advertisingBudget > 0 &&
        simulatorInputs.expectedOrders > 0;
    }

    return result;
  }, [activeProduct, simulatorInputs, userId]);
}

/**
 * Checks whether any saved simulator analysis exists for the current user.
 * Used to auto-tick "Run the Launch Simulator" style tasks if we add them later.
 */
export function useHasSimulationResults(): boolean {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  return useMemo(() => {
    const analyses = getSavedSimulatorAnalyses(userId);
    return analyses.length > 0;
  }, [userId]);
}

/**
 * Fires a notification when the checklist readiness percentage increases
 * beyond the previously-persisted baseline.
 *
 * On mount, reads the last-known percentage from scoped localStorage so that
 * page reloads with unchanged data do NOT produce a phantom notification.
 * Only genuine increases AFTER mount trigger a notification.
 * Debounced to avoid duplicate notifications on rapid re-renders.
 * Call this from App.tsx or any component that computes checklistCompletion.
 */
export function useReadinessNotifications(completionPercentage: number): void {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const baselineRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // On mount, read the persisted baseline so reloads don't fire phantom notifications
  useEffect(() => {
    if (!userId) return;
    try {
      const stored = localStorage.getItem(`launchlens_readiness_pct:${userId}`);
      if (stored !== null) {
        baselineRef.current = Number(stored);
      }
    } catch {
      // localStorage unavailable — fall through to first-render baseline
    }
    mountedRef.current = true;
  }, [userId]);

  useEffect(() => {
    // Wait until the mount effect above has run and set the flag
    if (!mountedRef.current) return;

    // If no stored baseline exists (first ever visit), use the current value
    // and persist it — but do NOT fire a notification.
    if (baselineRef.current === null) {
      baselineRef.current = completionPercentage;
      if (userId) {
        try {
          localStorage.setItem(`launchlens_readiness_pct:${userId}`, String(completionPercentage));
        } catch { /* ignore */ }
      }
      return;
    }

    // No change — nothing to do
    if (baselineRef.current === completionPercentage) return;

    const oldPct = baselineRef.current;
    baselineRef.current = completionPercentage;

    // Persist the new value
    if (userId) {
      try {
        localStorage.setItem(`launchlens_readiness_pct:${userId}`, String(completionPercentage));
      } catch { /* ignore */ }
    }

    // Debounce: clear any pending notification from rapid successive changes
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // Only notify on meaningful increases (at least 1% change)
      if (completionPercentage > oldPct) {
        addNotificationDirect(
          userId,
          `Launch readiness ${completionPercentage}%`,
          'readiness',
        );
      }
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [completionPercentage, userId]);
}
