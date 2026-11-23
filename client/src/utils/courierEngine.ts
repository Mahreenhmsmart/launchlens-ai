/**
 * Courier cost calculation engine for COD/RTO Calculator.
 * Pure functions shared across CODCalculator, LaunchSimulator,
 * LaunchDecisionEngine, and Scenarios pages.
 *
 * All rates are indicative (researched Nov 2026) and user-editable.
 */

import { roundTwo } from './currency';

// ─── Types ──────────────────────────────────────────────────────────────────

export type CourierId = 'tcs' | 'leopards' | 'mp';

export type Zone = 'within-city' | 'same-zone' | 'different-zone';

export interface CourierRatePreset {
  id: CourierId;
  name: string;
  baseRate1kg: number; // PKR per first kg
  codFeePercent: number; // percentage of order value
  codFeeMinimum: number; // minimum COD fee in PKR
  settlementDays: string; // e.g. "7–14"
}

export interface CourierRatesConfig {
  couriers: Record<CourierId, CourierRatePreset>;
  zoneMultipliers: Record<Zone, number>;
  extraWeightPerKg: number; // PKR per additional kg
  rtoCostDefault: number; // default RTO shipping cost per returned order
  rtoCostRangeLow: number; // indicative low end of full RTO cost
  rtoCostRangeHigh: number; // indicative high end of full RTO cost
}

export interface CourierCostResult {
  courierId: CourierId;
  courierName: string;
  deliveryCost: number;
  codFee: number;
  expectedRtoCost: number;
  totalCostPerPlacedOrder: number;
  expectedContributionPerPlacedOrder: number;
  breakEvenRoas: number | null;
  isCheapest: boolean;
  settlementDays: string;
}

export interface CityDeliveryCost {
  city: string;
  costs: Record<CourierId, number>;
}

// ─── Default Rates (indicative, researched Nov 2026) ───────────────────────

export const DEFAULT_COURIER_RATES: CourierRatesConfig = {
  couriers: {
    tcs: {
      id: 'tcs',
      name: 'TCS',
      baseRate1kg: 275,
      codFeePercent: 1.0,
      codFeeMinimum: 50,
      settlementDays: '7–14',
    },
    leopards: {
      id: 'leopards',
      name: 'Leopards',
      baseRate1kg: 240,
      codFeePercent: 1.5,
      codFeeMinimum: 35,
      settlementDays: '7–10',
    },
    mp: {
      id: 'mp',
      name: 'M&P',
      baseRate1kg: 240,
      codFeePercent: 2.5,
      codFeeMinimum: 0,
      settlementDays: '5–8',
    },
  },
  zoneMultipliers: {
    'within-city': 1.0,
    'same-zone': 1.15,
    'different-zone': 1.35,
  },
  extraWeightPerKg: 60,
  rtoCostDefault: 200,
  rtoCostRangeLow: 450,
  rtoCostRangeHigh: 600,
};

export const ZONE_LABELS: Record<Zone, string> = {
  'within-city': 'Within City',
  'same-zone': 'Same Zone',
  'different-zone': 'Different Zone',
};

export const COURIER_IDS: CourierId[] = ['tcs', 'leopards', 'mp'];

// ─── City Delivery Success Rates (indicative, researched Nov 2026) ──────────

export const CITY_DELIVERY_SUCCESS_RATES: Record<string, number> = {
  Karachi: 80,
  Lahore: 78,
  Islamabad: 82,
  Rawalpindi: 77,
  Faisalabad: 75,
};

export const ALL_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'] as const;

// ─── Calculation Functions ─────────────────────────────────────────────────

/**
 * Calculate delivery cost for a single courier.
 * Formula: base × zoneMultiplier + max(0, weight - 1) × extraWeightPerKg
 */
export function calculateDeliveryCost(
  courier: CourierRatePreset,
  weight: number,
  zone: Zone,
  config: CourierRatesConfig
): number {
  const zoneMultiplier = config.zoneMultipliers[zone];
  const baseCost = courier.baseRate1kg * zoneMultiplier;
  const extraWeightCost = Math.max(0, weight - 1) * config.extraWeightPerKg;
  return roundTwo(baseCost + extraWeightCost);
}

/**
 * Calculate COD fee: max(orderValue × feePercent/100, minimum)
 */
export function calculateCodFee(
  courier: CourierRatePreset,
  orderValue: number
): number {
  const fee = roundTwo(orderValue * courier.codFeePercent / 100);
  return Math.max(fee, courier.codFeeMinimum);
}

/**
 * Calculate expected RTO cost per placed order.
 * = rtoCost × (1 - deliveryRate)
 */
export function calculateExpectedRtoCost(
  rtoCost: number,
  deliveryRatePercent: number
): number {
  const deliveryRate = deliveryRatePercent / 100;
  return roundTwo(rtoCost * (1 - deliveryRate));
}

/**
 * Full courier cost breakdown for one courier.
 *
 * Canonical formula:
 *   1. Delivered Contribution = orderValue − productCost − deliveryCost − otherCosts
 *   2. Expected Contribution  = Delivered Contribution × deliveryRate − rtoCost × (1 − deliveryRate)
 *   3. Break-Even ROAS        = (deliveryRate × orderValue) / Expected Contribution
 */
export function calculateCourierCost(
  courierId: CourierId,
  weight: number,
  zone: Zone,
  orderValue: number,
  deliveryRatePercent: number,
  adBudget: number,
  config: CourierRatesConfig,
  rtoCost?: number,
  productCost: number = 0,
  otherCosts: number = 0
): CourierCostResult {
  const courier = config.couriers[courierId];
  const effectiveRtoCost = rtoCost ?? config.rtoCostDefault;

  const deliveryCost = calculateDeliveryCost(courier, weight, zone, config);
  const codFee = calculateCodFee(courier, orderValue);
  const expectedRtoCost = calculateExpectedRtoCost(effectiveRtoCost, deliveryRatePercent);
  const totalCostPerPlacedOrder = roundTwo(deliveryCost + codFee + expectedRtoCost);

  const deliveryRate = deliveryRatePercent / 100;

  // Step 1: Delivered Contribution = Selling Price − Product Cost − Delivery Cost − Other Costs
  const deliveredContribution = roundTwo(orderValue - productCost - deliveryCost - otherCosts);

  // Step 2: Expected Contribution = Delivered Contribution × Delivery Rate − RTO Cost × (1 − Delivery Rate)
  const expectedContributionPerPlacedOrder = roundTwo(
    deliveredContribution * deliveryRate - effectiveRtoCost * (1 - deliveryRate)
  );

  // Step 3: Break-Even ROAS = (Delivery Rate × Selling Price) / Expected Contribution
  let breakEvenRoas: number | null = null;
  if (expectedContributionPerPlacedOrder > 0 && adBudget > 0) {
    const expectedRevenuePerPlacedOrder = roundTwo(orderValue * deliveryRate);
    breakEvenRoas = roundTwo(expectedRevenuePerPlacedOrder / expectedContributionPerPlacedOrder);
  }

  return {
    courierId,
    courierName: courier.name,
    deliveryCost,
    codFee,
    expectedRtoCost,
    totalCostPerPlacedOrder,
    expectedContributionPerPlacedOrder,
    breakEvenRoas,
    isCheapest: false, // computed by caller
    settlementDays: courier.settlementDays,
  };
}

/**
 * Calculate all three couriers side-by-side and mark the cheapest.
 */
export function calculateAllCouriers(
  weight: number,
  zone: Zone,
  orderValue: number,
  deliveryRatePercent: number,
  adBudget: number,
  config: CourierRatesConfig,
  rtoCost?: number,
  productCost: number = 0,
  otherCosts: number = 0
): CourierCostResult[] {
  const results = COURIER_IDS.map((id) =>
    calculateCourierCost(id, weight, zone, orderValue, deliveryRatePercent, adBudget, config, rtoCost, productCost, otherCosts)
  );

  // Find cheapest by total cost
  const minTotal = Math.min(...results.map((r) => r.totalCostPerPlacedOrder));
  results.forEach((r) => {
    r.isCheapest = r.totalCostPerPlacedOrder === minTotal;
  });

  return results;
}

/**
 * Calculate break-even ROAS for each courier across multiple cities.
 * For origin city: uses within-city rate.
 * For other cities: uses different-zone rate.
 */
export function calculateBreakEvenByCity(
  originCity: string,
  cities: string[],
  weight: number,
  orderValue: number,
  deliveryRatePercent: number,
  adBudget: number,
  config: CourierRatesConfig,
  rtoCost?: number,
  productCost: number = 0,
  otherCosts: number = 0
): Record<string, Record<CourierId, number | null>> {
  const result: Record<string, Record<CourierId, number | null>> = {};

  for (const city of cities) {
    const zone: Zone = city === originCity ? 'within-city' : 'different-zone';
    const courierResults = calculateAllCouriers(
      weight, zone, orderValue, deliveryRatePercent, adBudget, config, rtoCost, productCost, otherCosts
    );
    result[city] = {
      tcs: courierResults.find((r) => r.courierId === 'tcs')?.breakEvenRoas ?? null,
      leopards: courierResults.find((r) => r.courierId === 'leopards')?.breakEvenRoas ?? null,
      mp: courierResults.find((r) => r.courierId === 'mp')?.breakEvenRoas ?? null,
    };
  }

  return result;
}

/**
 * Calculate delivery cost per courier for a list of destination cities
 * (1kg parcel, within-city for same city, different-zone for others).
 */
export function calculateCityDeliveryCosts(
  originCity: string,
  destinationCities: string[],
  weight: number,
  config: CourierRatesConfig
): CityDeliveryCost[] {
  return destinationCities.map((city) => {
    const zone: Zone = city === originCity ? 'within-city' : 'different-zone';
    const costs: Record<CourierId, number> = {
      tcs: calculateDeliveryCost(config.couriers.tcs, weight, zone, config),
      leopards: calculateDeliveryCost(config.couriers.leopards, weight, zone, config),
      mp: calculateDeliveryCost(config.couriers.mp, weight, zone, config),
    };
    return { city, costs };
  });
}

/**
 * Sanitize a CourierRatesConfig loaded from localStorage to fix float32
 * precision artefacts (e.g. 1.149999976158142 → 1.15). Rounds all numeric
 * fields to 2 decimal places so the round-trip default → store → retrieve →
 * display produces exact values.
 */
export function sanitizeCourierRates(config: CourierRatesConfig): CourierRatesConfig {
  const r = (v: number) => Math.round(v * 100) / 100;
  return {
    ...config,
    couriers: {
      tcs: {
        ...config.couriers.tcs,
        baseRate1kg: r(config.couriers.tcs.baseRate1kg),
        codFeePercent: r(config.couriers.tcs.codFeePercent),
        codFeeMinimum: r(config.couriers.tcs.codFeeMinimum),
      },
      leopards: {
        ...config.couriers.leopards,
        baseRate1kg: r(config.couriers.leopards.baseRate1kg),
        codFeePercent: r(config.couriers.leopards.codFeePercent),
        codFeeMinimum: r(config.couriers.leopards.codFeeMinimum),
      },
      mp: {
        ...config.couriers.mp,
        baseRate1kg: r(config.couriers.mp.baseRate1kg),
        codFeePercent: r(config.couriers.mp.codFeePercent),
        codFeeMinimum: r(config.couriers.mp.codFeeMinimum),
      },
    },
    zoneMultipliers: {
      'within-city': r(config.zoneMultipliers['within-city']),
      'same-zone': r(config.zoneMultipliers['same-zone']),
      'different-zone': r(config.zoneMultipliers['different-zone']),
    },
    extraWeightPerKg: r(config.extraWeightPerKg),
    rtoCostDefault: r(config.rtoCostDefault),
    rtoCostRangeLow: r(config.rtoCostRangeLow),
    rtoCostRangeHigh: r(config.rtoCostRangeHigh),
  };
}

/**
 * Calculate break-even ROAS given explicit cost components.
 * Used for integration with existing tools that have their own cost inputs.
 *
 * Canonical formula:
 *   1. Delivered Contribution = orderValue − productCost − deliveryCost − otherCosts
 *   2. Expected Contribution  = Delivered Contribution × deliveryRate − rtoCost × (1 − deliveryRate)
 *   3. Break-Even ROAS        = (deliveryRate × orderValue) / Expected Contribution
 */
export function calculateBreakEvenROAS(
  deliveryCost: number,
  codFee: number,
  rtoCost: number,
  orderValue: number,
  deliveryRatePercent: number,
  adBudget: number,
  productCost: number = 0,
  otherCosts: number = 0
): number | null {
  const deliveryRate = deliveryRatePercent / 100;

  // Step 1: Delivered Contribution
  const deliveredContribution = roundTwo(orderValue - productCost - deliveryCost - otherCosts);

  // Step 2: Expected Contribution
  const expectedContribution = roundTwo(
    deliveredContribution * deliveryRate - rtoCost * (1 - deliveryRate)
  );

  if (expectedContribution <= 0 || adBudget <= 0) return null;

  // Step 3: Break-Even ROAS
  const expectedRevenue = roundTwo(orderValue * deliveryRate);
  return roundTwo(expectedRevenue / expectedContribution);
}

// ─── Rate Sync Helpers ──────────────────────────────────────────────────────

/**
 * Deep-compare two CourierRatesConfig objects by value.
 * Returns true when every numeric and string field matches.
 */
export function ratesEqual(a: CourierRatesConfig, b: CourierRatesConfig): boolean {
  const ids: CourierId[] = ['tcs', 'leopards', 'mp'];
  for (const id of ids) {
    if (
      a.couriers[id].baseRate1kg !== b.couriers[id].baseRate1kg ||
      a.couriers[id].codFeePercent !== b.couriers[id].codFeePercent ||
      a.couriers[id].codFeeMinimum !== b.couriers[id].codFeeMinimum ||
      a.couriers[id].settlementDays !== b.couriers[id].settlementDays
    ) return false;
  }
  const zones: Zone[] = ['within-city', 'same-zone', 'different-zone'];
  for (const z of zones) {
    if (a.zoneMultipliers[z] !== b.zoneMultipliers[z]) return false;
  }
  return (
    a.extraWeightPerKg === b.extraWeightPerKg &&
    a.rtoCostDefault === b.rtoCostDefault &&
    a.rtoCostRangeLow === b.rtoCostRangeLow &&
    a.rtoCostRangeHigh === b.rtoCostRangeHigh
  );
}

/** Storage key for the last-sync ISO timestamp (user-scoped via scopedStorage). */
export const COURIER_SYNC_TIMESTAMP_KEY = 'launchlens_courier_sync_ts';
