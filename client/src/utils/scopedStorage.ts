/**
 * User-scoped localStorage utilities.
 *
 * All user-created data is stored under keys that include the authenticated
 * user's unique ID, ensuring data isolation between accounts.
 *
 * On first load after this fix, any data found under old unscoped keys is
 * migrated to the current user's scoped key and the old key is removed.
 */

// ─── Base keys (shared constants) ────────────────────────────────────────────

export const STORAGE_KEYS = {
  SIMULATOR_ANALYSES: 'launchlens_saved_simulator_analyses',
  COD_ANALYSES: 'launchlens_cod_analyses',
  COD_ACTUAL_RESULTS: 'launchlens_cod_actual_results',
  SCENARIOS: 'launchlens_scenarios',
  CHECKLIST: 'launchlens_checklist',
  CURRENCY: 'launchlens_currency',
  LANGUAGE: 'launchlens_language',
  SIMULATOR_INPUTS: 'launchlens_simulator_inputs',
  RESEARCH: 'launchlens_research',
  TRENDSCOUT_CHAT: 'launchlens_trendscout_chat',
  DISCOVERY_FILTERS: 'launchlens_discovery_filters',
  PRICING_CURRENCY: 'launchlens_pricing_currency',
  ONBOARDING_DONE: 'launchlens_onboarding_done',
  COURIER_RATES: 'launchlens_courier_rates',
  PROFIT_ACTUALS: 'launchlens_profit_actuals',
  SCENARIO_ANALYSES: 'launchlens_scenario_analyses',
  CHECKLIST_OVERRIDES: 'launchlens_checklist_overrides',
  CSV_IMPORTS: 'launchlens_csv_imports',
  TEAM_MEMBERS: 'launchlens_team_members',
  NOTIFICATIONS: 'launchlens_notifications',
} as const;

// ─── Scoped key builder ──────────────────────────────────────────────────────

/**
 * Returns a user-scoped localStorage key: `${baseKey}:${userId}`.
 */
export function scopedKey(baseKey: string, userId: string): string {
  return `${baseKey}:${userId}`;
}

// ─── Scoped get / set / remove helpers ───────────────────────────────────────

/**
 * Reads a value from localStorage under the user-scoped key.
 * Falls back to the old unscoped key for migration purposes:
 * if the scoped key has no data but the old key does, the data is
 * migrated to the scoped key and the old key is deleted.
 */
export function scopedGetItem<T>(
  baseKey: string,
  userId: string | null,
  fallback: T
): T {
  if (!userId) return fallback;

  const key = scopedKey(baseKey, userId);
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) return JSON.parse(stored) as T;

    // Migration: check old unscoped key
    const oldStored = localStorage.getItem(baseKey);
    if (oldStored !== null) {
      const parsed = JSON.parse(oldStored) as T;
      localStorage.setItem(key, oldStored);
      localStorage.removeItem(baseKey);
      return parsed;
    }
  } catch {
    // Ignore parse/storage errors
  }
  return fallback;
}

/**
 * Reads a raw string from localStorage under the user-scoped key.
 * Includes migration from old unscoped key.
 */
export function scopedGetRaw(
  baseKey: string,
  userId: string | null,
  fallback: string
): string {
  if (!userId) return fallback;

  const key = scopedKey(baseKey, userId);
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) return stored;

    // Migration: check old unscoped key
    const oldStored = localStorage.getItem(baseKey);
    if (oldStored !== null) {
      localStorage.setItem(key, oldStored);
      localStorage.removeItem(baseKey);
      return oldStored;
    }
  } catch {
    // Ignore storage errors
  }
  return fallback;
}

/**
 * Writes a value to localStorage under the user-scoped key.
 */
export function scopedSetItem<T>(
  baseKey: string,
  userId: string | null,
  value: T
): void {
  if (!userId) return;

  const key = scopedKey(baseKey, userId);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Writes a raw string to localStorage under the user-scoped key.
 */
export function scopedSetRaw(
  baseKey: string,
  userId: string | null,
  value: string
): void {
  if (!userId) return;

  const key = scopedKey(baseKey, userId);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Removes a user-scoped key from localStorage.
 */
export function scopedRemoveItem(
  baseKey: string,
  userId: string | null
): void {
  if (!userId) return;

  const key = scopedKey(baseKey, userId);
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}
