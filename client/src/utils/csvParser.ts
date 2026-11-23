/**
 * Lightweight client-side CSV parser for Daraz / Shopify order exports.
 *
 * Handles quoted fields, flexible header matching, and validation.
 * No external library needed — the schema is well-defined.
 */

import type { ImportedOrder, CsvImportSummary } from '@/types';

// ─── Header aliases ────────────────────────────────────────────────────────
// Maps canonical field names to accepted variations (lowercased).

const HEADER_ALIASES: Record<string, string[]> = {
  date: ['date', 'order date', 'created at', 'created_at', 'order_date', 'ordered on'],
  product: ['product', 'product name', 'product_name', 'item', 'item name', 'item_name', 'title'],
  selling_price: ['selling_price', 'selling price', 'price', 'sale price', 'sale_price', 'total', 'amount'],
  product_cost: ['product_cost', 'product cost', 'cost', 'cogs', 'unit cost', 'unit_cost'],
  courier: ['courier', 'shipping method', 'shipping_method', 'carrier', 'delivery service'],
  city: ['city', 'destination', 'destination city', 'destination_city', 'delivery city'],
  delivery_status: ['delivery_status', 'delivery status', 'status', 'fulfillment status', 'fulfillment_status', 'order status'],
  ad_spend: ['ad_spend', 'ad spend', 'ads', 'advertising', 'advertising spend', 'marketing cost'],
};

export const REQUIRED_COLUMNS = [
  'date',
  'product',
  'selling_price',
  'product_cost',
  'courier',
  'city',
  'delivery_status',
  'ad_spend',
] as const;

// ─── CSV line splitter (handles quoted fields) ─────────────────────────────

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Escaped quote ""
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

// ─── Parse raw CSV text ────────────────────────────────────────────────────

export interface CsvParseResult {
  orders: ImportedOrder[];
  summary: CsvImportSummary;
  errors: string[];
}

export function parseCsv(text: string): CsvParseResult {
  const errors: string[] = [];
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { orders: [], summary: emptySummary(), errors: ['CSV must have a header row and at least one data row.'] };
  }

  // Map headers
  const rawHeaders = splitCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
  const colMap: Record<string, number> = {};

  for (const canonical of REQUIRED_COLUMNS) {
    const aliases = HEADER_ALIASES[canonical];
    const idx = rawHeaders.findIndex((h) => aliases.includes(h));
    if (idx !== -1) {
      colMap[canonical] = idx;
    }
  }

  // Check missing columns
  const missing = REQUIRED_COLUMNS.filter((c) => !(c in colMap));
  if (missing.length > 0) {
    return {
      orders: [],
      summary: emptySummary(),
      errors: [`Missing required columns: ${missing.join(', ')}`],
    };
  }

  // Parse rows
  const orders: ImportedOrder[] = [];
  const dates: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i]);
    if (fields.length < rawHeaders.length) continue; // skip malformed

    const dateStr = fields[colMap.date] || '';
    const product = fields[colMap.product] || '';
    const sellingPrice = parseFloat(fields[colMap.selling_price]) || 0;
    const productCost = parseFloat(fields[colMap.product_cost]) || 0;
    const courier = fields[colMap.courier] || '';
    const city = fields[colMap.city] || '';
    const rawStatus = (fields[colMap.delivery_status] || '').toLowerCase().trim();
    const adSpend = parseFloat(fields[colMap.ad_spend]) || 0;

    // Normalise delivery status
    let deliveryStatus: 'delivered' | 'returned';
    if (rawStatus.includes('return') || rawStatus.includes('cancel') || rawStatus.includes('fail') || rawStatus === 'rto') {
      deliveryStatus = 'returned';
    } else {
      deliveryStatus = 'delivered';
    }

    const id = `csv-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`;

    orders.push({
      id,
      date: dateStr,
      product,
      sellingPrice,
      productCost,
      courier,
      city,
      deliveryStatus,
      adSpend,
    });

    if (dateStr) dates.push(dateStr);
  }

  if (orders.length === 0) {
    return { orders: [], summary: emptySummary(), errors: ['No valid rows found in CSV.'] };
  }

  // Build summary
  const deliveredCount = orders.filter((o) => o.deliveryStatus === 'delivered').length;
  const returnedCount = orders.filter((o) => o.deliveryStatus === 'returned').length;
  const totalRevenue = orders
    .filter((o) => o.deliveryStatus === 'delivered')
    .reduce((sum, o) => sum + o.sellingPrice, 0);
  const totalAdSpend = orders.reduce((sum, o) => sum + o.adSpend, 0);
  const totalProductCost = orders
    .filter((o) => o.deliveryStatus === 'delivered')
    .reduce((sum, o) => sum + o.productCost, 0);
  const totalCourierCost = orders
    .filter((o) => o.deliveryStatus === 'delivered')
    .reduce((sum, o) => sum + 0, 0); // courier column is name, not cost

  dates.sort();

  const summary: CsvImportSummary = {
    totalRows: orders.length,
    deliveredCount,
    returnedCount,
    dateRange: { min: dates[0] || '', max: dates[dates.length - 1] || '' },
    totalRevenue,
    totalAdSpend,
    totalProductCost,
    totalCourierCost,
  };

  return { orders, summary, errors };
}

// ─── Compute aggregated actuals from imported orders ───────────────────────

export function computeImportedActuals(orders: ImportedOrder[]) {
  const delivered = orders.filter((o) => o.deliveryStatus === 'delivered');
  const returned = orders.filter((o) => o.deliveryStatus === 'returned');

  const revenue = delivered.reduce((sum, o) => sum + o.sellingPrice, 0);
  const productCostTotal = delivered.reduce((sum, o) => sum + o.productCost, 0);
  const adSpend = orders.reduce((sum, o) => sum + o.adSpend, 0);
  const profit = revenue - productCostTotal - adSpend;
  const roas = adSpend > 0 ? revenue / adSpend : null;
  const totalOrders = delivered.length + returned.length;
  const deliveryRate = totalOrders > 0 ? (delivered.length / totalOrders) * 100 : 0;

  return {
    revenue,
    profit,
    roas,
    deliveryRate,
    ordersDelivered: delivered.length,
    ordersReturned: returned.length,
    adSpend,
    deliveryCost: 0, // Not available from CSV — courier column is name only
  };
}

// ─── CSV Template download ─────────────────────────────────────────────────

const TEMPLATE_CSV = `date,product,selling_price,product_cost,courier,city,delivery_status,ad_spend
2026-01-15,Premium Skincare Serum,2499,450,Leopards,Karachi,delivered,150
2026-01-16,Premium Skincare Serum,2499,450,TCS,Lahore,delivered,180
2026-01-17,Premium Skincare Serum,2499,450,Call Courier,Islamabad,returned,120`;

export function downloadCsvTemplate(): void {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'launchlens-order-import-template.csv';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function emptySummary(): CsvImportSummary {
  return {
    totalRows: 0,
    deliveredCount: 0,
    returnedCount: 0,
    dateRange: { min: '', max: '' },
    totalRevenue: 0,
    totalAdSpend: 0,
    totalProductCost: 0,
    totalCourierCost: 0,
  };
}
