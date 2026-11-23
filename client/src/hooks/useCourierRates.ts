/**
 * useCourierRates — shared courier rates state with sync / edit / timestamp.
 *
 * All pages that display or edit courier rates (CODCalculator, Pricing,
 * Overview dashboard) must use this hook so they read from and write to
 * the same localStorage-backed source of truth.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  STORAGE_KEYS,
  scopedGetItem,
  scopedSetItem,
  scopedGetRaw,
  scopedSetRaw,
} from '@/utils/scopedStorage';
import {
  DEFAULT_COURIER_RATES,
  sanitizeCourierRates,
  ratesEqual,
  COURIER_SYNC_TIMESTAMP_KEY,
  type CourierRatesConfig,
} from '@/utils/courierEngine';
import { addNotificationDirect } from './useNotifications';

/** Debounce window (ms) for courier rate update notifications. */
const NOTIFY_DEBOUNCE_MS = 1500;

export interface UseCourierRatesReturn {
  /** Current active rates (may be user-edited or synced defaults). */
  rates: CourierRatesConfig;
  /** Replace current rates and persist. Used by the rate editor. */
  updateRates: (config: CourierRatesConfig) => void;
  /** Reset rates to DEFAULT_COURIER_RATES without updating sync timestamp. */
  resetToDefaults: () => void;
  /** Sync rates back to the central default table AND stamp the sync timestamp. */
  syncRates: () => void;
  /** ISO timestamp of the last sync, or null if never synced. */
  lastSyncedAt: string | null;
  /** True when the current rates differ from the central defaults. */
  isCustomized: boolean;
  /** Show a brief confirmation flag (set true after sync, consumer should clear it). */
  justSynced: boolean;
  /** Clear the justSynced flag after showing confirmation. */
  clearJustSynced: () => void;
}

export function useCourierRates(): UseCourierRatesReturn {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);

  const [rates, setRates] = useState<CourierRatesConfig>(DEFAULT_COURIER_RATES);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [justSynced, setJustSynced] = useState(false);
  const initialized = useRef(false);
  const notifyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Debounced notification helper ────────────────────────────────────────
  const debouncedNotify = useCallback(
    (message: string) => {
      if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);
      notifyTimerRef.current = setTimeout(() => {
        addNotificationDirect(userId, message, 'courier');
      }, NOTIFY_DEBOUNCE_MS);
    },
    [userId],
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);
    };
  }, []);

  // ── Load persisted state on mount ────────────────────────────────────────
  useEffect(() => {
    if (!userId || initialized.current) return;
    initialized.current = true;

    const stored = scopedGetItem<CourierRatesConfig>(
      STORAGE_KEYS.COURIER_RATES,
      userId,
      null as unknown as CourierRatesConfig,
    );
    if (stored && stored.couriers) {
      setRates(sanitizeCourierRates(stored));
    }

    const ts = scopedGetRaw(COURIER_SYNC_TIMESTAMP_KEY, userId, '');
    if (ts) setLastSyncedAt(ts);
  }, [userId]);

  // ── Persist helper ──────────────────────────────────────────────────────
  const persist = useCallback(
    (config: CourierRatesConfig) => {
      if (userId) {
        scopedSetItem(STORAGE_KEYS.COURIER_RATES, userId, config);
      }
    },
    [userId],
  );

  // ── Public API ──────────────────────────────────────────────────────────
  const updateRates = useCallback(
    (config: CourierRatesConfig) => {
      setRates(config);
      persist(config);
      // Fire debounced notification when user edits/customizes a rate
      if (!ratesEqual(config, DEFAULT_COURIER_RATES)) {
        debouncedNotify('Courier rates updated');
      }
    },
    [persist, debouncedNotify],
  );

  const resetToDefaults = useCallback(() => {
    updateRates(DEFAULT_COURIER_RATES);
  }, [updateRates]);

  const syncRates = useCallback(() => {
    const now = new Date().toISOString();
    updateRates(DEFAULT_COURIER_RATES);
    setLastSyncedAt(now);
    setJustSynced(true);
    if (userId) {
      scopedSetRaw(COURIER_SYNC_TIMESTAMP_KEY, userId, now);
    }
    // Fire debounced notification for courier rate sync
    debouncedNotify('Courier rates updated');
  }, [userId, updateRates, debouncedNotify]);

  const clearJustSynced = useCallback(() => setJustSynced(false), []);

  const isCustomized = !ratesEqual(rates, DEFAULT_COURIER_RATES);

  return {
    rates,
    updateRates,
    resetToDefaults,
    syncRates,
    lastSyncedAt,
    isCustomized,
    justSynced,
    clearJustSynced,
  };
}
