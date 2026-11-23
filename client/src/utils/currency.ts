/**
 * Currency utility module for LaunchLens AI
 * Provides comprehensive currency list and locale-aware formatting
 */

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
  decimals: number;
}

// Exchange rates relative to PKR (base currency)
// These are approximate rates - actual rates may vary
export const EXCHANGE_RATES_TO_PKR: Record<string, number> = {
  PKR: 1,
  USD: 278,
  GBP: 352,
  EUR: 302,
  AED: 75.7,
  SAR: 74.1,
  INR: 3.32,
  BDT: 2.34,
  CNY: 38.3,
  CAD: 205,
  AUD: 180,
  NZD: 168,
  SGD: 207,
  MYR: 62.5,
  IDR: 0.0175,
  TRY: 8.65,
  JPY: 1.86,
  KRW: 0.203,
  CHF: 312,
  HKD: 35.7,
  QAR: 76.4,
  KWD: 905,
  OMR: 722,
  BHD: 738,
  LKR: 0.94,
  NPR: 0.75,
  NGN: 0.175,
  ZAR: 15.2,
  EGP: 5.88,
  MXN: 16.4,
  BRL: 56.2,
  PHP: 4.88,
  THB: 7.75,
  VND: 0.011,
  PLN: 69.5,
  SEK: 26.8,
  NOK: 25.2,
  DKK: 40.5,
  CZK: 11.8,
  HUF: 0.76,
  RON: 60.5,
  BGN: 154.5,
  HRK: 39.8,
  ISK: 2.02,
  ILS: 75.5,
  CLP: 0.295,
  COP: 0.069,
  PEN: 74.5,
  ARS: 0.31,
  KES: 2.15,
  GHS: 21.8,
  TZS: 0.112,
  UGX: 0.074,
  MAD: 27.8,
  JOD: 392,
  LBP: 0.031,
};

/**
 * Convert an amount from one currency to another using PKR as base
 * @param value - The amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount
 */
export function convertAmount(
  value: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    // Even for same-currency, round to 2 decimals to prevent floating-point artifacts
    return roundTwo(value);
  }

  const fromRate = EXCHANGE_RATES_TO_PKR[fromCurrency.toUpperCase()] ?? 1;
  const toRate = EXCHANGE_RATES_TO_PKR[toCurrency.toUpperCase()] ?? 1;

  // Convert: value in fromCurrency -> PKR -> toCurrency
  const valueInPKR = value * fromRate;
  const convertedValue = valueInPKR / toRate;

  // Round to exactly 2 decimal places using exponential notation to avoid
  // IEEE 754 artifacts that Number.toFixed can still produce in edge cases
  return roundTwo(convertedValue);
}

export const CURRENCIES: Currency[] = [
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', decimals: 0 },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimals: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 0 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', decimals: 2 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', decimals: 3 },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', decimals: 3 },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', decimals: 3 },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', decimals: 2 },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', decimals: 2 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimals: 2 },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', decimals: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimals: 2 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimals: 0 },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 0 },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', decimals: 2 },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', decimals: 2 },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', decimals: 2 },
  { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', decimals: 0 },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', decimals: 2 },
  { code: 'CLP', name: 'Chilean Peso', symbol: 'CL$', decimals: 0 },
  { code: 'COP', name: 'Colombian Peso', symbol: 'COL$', decimals: 0 },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', decimals: 2 },
  { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$', decimals: 2 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', decimals: 2 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimals: 0 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimals: 0 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', decimals: 2 },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD', decimals: 3 },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£', decimals: 0 },
];

/**
 * Round a number to exactly 2 decimal places.
 * Uses string-based exponential notation shifting to avoid IEEE 754
 * float64 multiplication artefacts (e.g. 1500.555 * 100 producing
 * 150055.49999999997). This guarantees a clean float64 result.
 */
export function roundTwo(value: number): number {
  if (!Number.isFinite(value)) return value;
  // Shift by 2 decimals using string exponent to avoid float64 multiply error,
  // round to integer, then shift back.
  const shifted = Number(`${value}e2`);
  const rounded = Math.round(shifted);
  return Number(`${rounded}e-2`);
}

export const DEFAULT_CURRENCY = 'PKR';

/**
 * Hardcoded USD→PKR exchange rate for pricing display.
 * No live API is available; this is a reasonable approximation.
 */
export const USD_TO_PKR_RATE = 278;
export const EXCHANGE_RATE_UPDATED_DATE = '19 Nov 2026';

/**
 * Identifies the origin of the exchange rate. This is a manually-entered
 * indicative rate — not sourced from a live market feed or external API.
 */
export const RATE_SOURCE = 'Indicative manual rate';

/**
 * Disclaimer explaining that the rate may differ from actual bank/market rates.
 */
export const RATE_SOURCE_NOTE = 'This rate is indicative only and may differ from actual bank or market rates.';

/**
 * Returns a formatted exchange rate label for display on Pricing/Checkout.
 * Includes the source attribution so users know where the rate comes from.
 */
export function getExchangeRateLabel(): string {
  return `1 USD = ${USD_TO_PKR_RATE} PKR · ${RATE_SOURCE} · Updated ${EXCHANGE_RATE_UPDATED_DATE}`;
}

/**
 * Convert a PKR amount to USD using the hardcoded rate.
 * Uses integer arithmetic rounding to avoid IEEE 754 float32 artifacts.
 */
export function convertPKRtoUSD(pkrAmount: number): number {
  return roundTwo(pkrAmount / USD_TO_PKR_RATE);
}

/**
 * Canonical USD prices — these are the authoritative USD values, NOT derived
 * from PKR conversion. Keyed by PKR monthly/yearly amounts for lookup.
 *
 * Basic:    $0/mo,  $0/yr
 * Standard: $19/mo, $15/mo equivalent yearly ($180/yr total)
 * Business: $49/mo, $39/mo equivalent yearly ($468/yr total)
 */
const CANONICAL_USD_PRICES: Record<number, number> = {
  // Monthly prices (PKR → USD)
  0: 0,
  1500: 19,
  4000: 49,
  // Yearly totals (PKR → USD)
  14400: 180,
  38400: 468,
  // Yearly monthly equivalents (PKR yearly / 12 → USD monthly equivalent)
  // Standard: 14400/12 = 1200 PKR → $15.00/mo equivalent
  1200: 15,
  // Business: 38400/12 = 3200 PKR → $39.00/mo equivalent
  3200: 39,
};

/**
 * Format a price in either PKR or USD depending on the selected currency.
 * When currency is USD, uses canonical hardcoded USD prices (never derived
 * from PKR conversion). When PKR, formats the PKR amount directly.
 */
export function formatPlanPrice(amountPKR: number, currency: string): string {
  if (currency === 'USD') {
    const usd = CANONICAL_USD_PRICES[amountPKR] ?? convertPKRtoUSD(amountPKR);
    if (usd === 0) return '$0';
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (amountPKR === 0) return 'PKR 0';
  return `PKR ${amountPKR.toLocaleString('en-PK')}`;
}

/**
 * Get currency object by ISO code
 */
export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code.toUpperCase());
}

/**
 * Format a number using the specified currency's locale conventions
 * Uses Intl.NumberFormat for proper localization
 * @param amount - The amount to format (assumed to be in PKR/base currency)
 * @param currencyCode - Target currency code for display
 * @param options - Formatting options
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options: {
    showSymbol?: boolean;
    compact?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    baseCurrency?: string; // Currency of the input amount (defaults to PKR)
  } = {}
): string {
  const { showSymbol = true, compact = false, minimumFractionDigits, maximumFractionDigits, baseCurrency = DEFAULT_CURRENCY } = options;

  // Convert from base currency to target currency (already rounded to 2dp inside convertAmount)
  const convertedAmount = convertAmount(amount, baseCurrency, currencyCode);

  // Safety net: strip any residual IEEE 754 noise before formatting
  const cleanAmount = roundTwo(convertedAmount);

  const currency = getCurrency(currencyCode);
  if (!currency) {
    // Fallback to USD if currency not found
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cleanAmount);
  }

  // Determine decimal places based on currency or overrides
  const minDecimals = minimumFractionDigits ?? currency.decimals;
  const maxDecimals = maximumFractionDigits ?? currency.decimals;

  // Use compact notation for large numbers if requested
  const notation = compact && Math.abs(cleanAmount) >= 1000 ? 'compact' : 'standard';

  try {
    // Try using Intl.NumberFormat with currency style
    const formatter = new Intl.NumberFormat('en-US', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency.code,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
      notation,
    });

    return formatter.format(cleanAmount);
  } catch {
    // Fallback if currency code is not supported by Intl
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
      notation,
    });

    const formattedNumber = formatter.format(cleanAmount);
    return showSymbol && currency.symbol
      ? `${currency.symbol}${formattedNumber}`
      : formattedNumber;
  }
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format a multiplier (e.g., ROAS as "5.0x")
 */
export function formatMultiplier(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}x`;
}

/**
 * Search currencies by name or code
 */
export function searchCurrencies(query: string): Currency[] {
  if (!query.trim()) return CURRENCIES;

  const lowerQuery = query.toLowerCase().trim();
  return CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(lowerQuery) ||
      c.name.toLowerCase().includes(lowerQuery) ||
      (c.symbol && c.symbol.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get the display label for a currency (code + name)
 */
export function getCurrencyLabel(code: string): string {
  const currency = getCurrency(code);
  if (!currency) return code;
  return `${currency.code} - ${currency.name}`;
}
