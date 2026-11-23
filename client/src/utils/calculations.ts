/**
 * Financial calculations module for LaunchLens AI
 * Pure functions for launch simulator calculations
 */

import { formatCurrency as formatCurrencyValue, roundTwo } from './currency';

export interface SimulationInputs {
  productName: string;
  sellingPrice: number;
  productCost: number;
  deliveryCost: number;
  rtoShippingCost: number; // cost per returned order (RTO shipping), default 200
  otherVariableCosts: number;
  advertisingBudget: number;
  expectedOrders: number;
  deliverySuccessRate: number; // percentage (0–100), default 75
}

export interface SimulationResults {
  revenue: number;
  variableCosts: number;
  contributionPerOrder: number;
  contributionBeforeAdvertising: number;
  campaignProfitLoss: number;
  roas: number | null;
  contributionMarginPercent: number | null;
  breakEvenRoas: number | null;
  breakEvenOrders: number | null;
  isValid: boolean;
  warnings: string[];
}

export const DEFAULT_SIMULATION_INPUTS: SimulationInputs = {
  productName: 'Premium Skincare Serum',
  sellingPrice: 3000,
  productCost: 900,
  deliveryCost: 250,
  rtoShippingCost: 200,
  otherVariableCosts: 150,
  advertisingBudget: 12000,
  expectedOrders: 20,
  deliverySuccessRate: 75,
};

/**
 * Validate simulation inputs
 */
export function validateInputs(inputs: SimulationInputs): string[] {
  const warnings: string[] = [];

  if (inputs.sellingPrice < 0) {
    warnings.push('Selling price cannot be negative');
  }
  if (inputs.productCost < 0) {
    warnings.push('Product cost cannot be negative');
  }
  if (inputs.deliveryCost < 0) {
    warnings.push('Delivery cost cannot be negative');
  }
  if (inputs.otherVariableCosts < 0) {
    warnings.push('Other variable costs cannot be negative');
  }
  if (inputs.advertisingBudget < 0) {
    warnings.push('Advertising budget cannot be negative');
  }
  if (inputs.expectedOrders < 0) {
    warnings.push('Expected orders cannot be negative');
  }

  return warnings;
}

/**
 * Calculate all financial metrics from simulation inputs.
 *
 * Revenue, Profit, and ROAS are delivery-rate-INDEPENDENT:
 *   - 'orders' means DELIVERED orders (the user's expectedOrders input)
 *   - Revenue = Expected Orders × Selling Price
 *   - Profit = Revenue − Total Costs
 *   - ROAS = Revenue / Ad Spend
 *
 * Delivery success rate affects ONLY break-even metrics:
 *   - Break-Even ROAS uses Expected Contribution per Placed Order
 *   - Break-Even Orders uses Expected Contribution per Placed Order
 *   - RTO Shipping Cost (not Delivery Cost) is used for per-returned-order loss
 */
export function calculateSimulation(inputs: SimulationInputs): SimulationResults {
  const warnings = validateInputs(inputs);

  const deliveryRate = (inputs.deliverySuccessRate ?? 75) / 100;
  const rtoRate = 1 - deliveryRate;
  const rtoCost = inputs.rtoShippingCost ?? inputs.deliveryCost;

  // ── Revenue / Profit / ROAS (delivery-rate-independent) ──────────────
  // 'expectedOrders' = delivered orders; revenue counts only these
  const revenue = roundTwo(inputs.sellingPrice * inputs.expectedOrders);

  // Variable costs: product cost + other variable costs + delivery cost per order
  const variableCosts = roundTwo(
    (inputs.productCost + inputs.otherVariableCosts + inputs.deliveryCost) * inputs.expectedOrders
  );

  // Contribution per delivered order (before advertising)
  const contributionPerOrder = roundTwo(
    inputs.sellingPrice - inputs.productCost - inputs.deliveryCost - inputs.otherVariableCosts
  );

  // Contribution before advertising = revenue − variable costs
  const contributionBeforeAdvertising = roundTwo(revenue - variableCosts);

  // Campaign profit/loss = contributionBeforeAdvertising − advertisingBudget
  const campaignProfitLoss = roundTwo(contributionBeforeAdvertising - inputs.advertisingBudget);

  // ROAS = revenue ÷ advertisingBudget (when advertisingBudget > 0)
  let roas: number | null = null;
  if (inputs.advertisingBudget > 0) {
    roas = roundTwo(revenue / inputs.advertisingBudget);
  }

  // Contribution margin % = (contributionPerOrder ÷ sellingPrice) × 100 (when sellingPrice > 0)
  let contributionMarginPercent: number | null = null;
  if (inputs.sellingPrice > 0) {
    contributionMarginPercent = roundTwo((contributionPerOrder / inputs.sellingPrice) * 100);
  }

  // ── Break-even metrics (delivery-rate-dependent) ────────────────────
  // Expected Contribution per Placed Order:
  //   = (Delivery Rate × Contribution per Delivered Order) − ((1 − Delivery Rate) × RTO Shipping Cost)
  // Uses rtoShippingCost (default PKR 200), NOT deliveryCost, for per-returned-order loss.
  let breakEvenRoas: number | null = null;
  const expectedContributionPerPlacedOrder = roundTwo(
    deliveryRate * contributionPerOrder - rtoRate * rtoCost
  );

  if (contributionPerOrder > 0) {
    const expectedRevenuePerPlacedOrder = roundTwo(deliveryRate * inputs.sellingPrice);
    if (expectedContributionPerPlacedOrder > 0) {
      breakEvenRoas = roundTwo(expectedRevenuePerPlacedOrder / expectedContributionPerPlacedOrder);
    } else {
      warnings.push('Cannot calculate break-even ROAS: expected contribution per placed order is zero or negative');
    }
  } else {
    warnings.push('Cannot calculate break-even ROAS: contribution per order is zero or negative');
  }

  // Break-even orders = Math.ceil(advertisingBudget ÷ expectedContributionPerPlacedOrder)
  let breakEvenOrders: number | null = null;
  if (expectedContributionPerPlacedOrder > 0) {
    breakEvenOrders = Math.ceil(inputs.advertisingBudget / expectedContributionPerPlacedOrder);
  } else {
    warnings.push('Cannot calculate break-even orders: expected contribution per placed order is zero or negative');
  }

  // Additional warnings for edge cases
  if (contributionPerOrder <= 0 && inputs.expectedOrders > 0) {
    warnings.push(
      'Warning: Negative or zero contribution margin means each order loses money'
    );
  }

  if (inputs.expectedOrders === 0) {
    warnings.push('No orders expected — results will show zero revenue and costs');
  }

  const isValid = warnings.filter((w) => w.startsWith('Warning:') || !w.includes('cannot')).length === 0;

  return {
    revenue,
    variableCosts,
    contributionPerOrder,
    contributionBeforeAdvertising,
    campaignProfitLoss,
    roas,
    contributionMarginPercent,
    breakEvenRoas,
    breakEvenOrders,
    isValid,
    warnings,
  };
}

/**
 * Generate a plain-language summary of the simulation results.
 * Accepts an optional translation function `t` for i18n support.
 */
export function generateResultSummary(
  inputs: SimulationInputs,
  results: SimulationResults,
  currencyCode: string,
  t?: (key: string) => string,
): string {
  const translate = t ?? ((key: string) => key);

  if (inputs.expectedOrders === 0) {
    return translate('With 0 orders, there is no revenue or profit to calculate. Enter expected orders to see projections.');
  }

  const formattedRevenue = formatCurrencyValue(results.revenue, currencyCode);
  const formattedProfit = formatCurrencyValue(Math.abs(results.campaignProfitLoss), currencyCode);
  const formattedAdSpend = formatCurrencyValue(inputs.advertisingBudget, currencyCode);
  const formattedSellingPrice = formatCurrencyValue(inputs.sellingPrice, currencyCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (results.campaignProfitLoss >= 0) {
    return translate('With {orders} orders at {price} each, your campaign generates {profit} profit after {adSpend} ad spend.')
      .replace('{orders}', String(inputs.expectedOrders))
      .replace('{price}', formattedSellingPrice)
      .replace('{profit}', formattedProfit)
      .replace('{adSpend}', formattedAdSpend);
  } else {
    return translate('With {orders} orders at {price} each, your campaign loses {profit} after {adSpend} ad spend. Consider adjusting pricing or reducing costs.')
      .replace('{orders}', String(inputs.expectedOrders))
      .replace('{price}', formattedSellingPrice)
      .replace('{profit}', formattedProfit)
      .replace('{adSpend}', formattedAdSpend);
  }
}

/**
 * Check if results indicate a profitable campaign
 */
export function isProfitable(results: SimulationResults): boolean {
  return results.campaignProfitLoss > 0;
}

/**
 * Get color coding based on profit/loss
 */
export function getProfitColor(profitLoss: number): 'green' | 'coral' | 'violet' {
  if (profitLoss > 0) return 'green';
  if (profitLoss < 0) return 'coral';
  return 'violet';
}
