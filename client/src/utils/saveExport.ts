/**
 * Save/Export utilities for LaunchLens AI analyses
 */

import type { SavedSimulatorAnalysis, SavedCodAnalysis, SavedScenarioAnalysis } from '@/types';
import { formatCurrency, formatMultiplier, formatPercentage } from './currency';
import { STORAGE_KEYS, scopedGetItem, scopedSetItem } from './scopedStorage';
import { addNotificationDirect } from '@/hooks/useNotifications';

// ─── Simulator Analyses ──────────────────────────────────────────────────

export function getSavedSimulatorAnalyses(userId: string | null): SavedSimulatorAnalysis[] {
  return scopedGetItem<SavedSimulatorAnalysis[]>(
    STORAGE_KEYS.SIMULATOR_ANALYSES,
    userId,
    []
  );
}

export function saveSimulatorAnalysis(analysis: SavedSimulatorAnalysis, userId: string | null): void {
  const analyses = getSavedSimulatorAnalyses(userId);
  analyses.push(analysis);
  scopedSetItem(STORAGE_KEYS.SIMULATOR_ANALYSES, userId, analyses);
  addNotificationDirect(userId, 'Analysis saved', 'analysis');
}

export function deleteSimulatorAnalysis(id: string, userId: string | null): void {
  const analyses = getSavedSimulatorAnalyses(userId).filter((a) => a.id !== id);
  scopedSetItem(STORAGE_KEYS.SIMULATOR_ANALYSES, userId, analyses);
}

// ─── Decision Engine Analyses ────────────────────────────────────────────

export function getSavedDecisionEngineAnalyses(userId: string | null): SavedCodAnalysis[] {
  return scopedGetItem<SavedCodAnalysis[]>(
    STORAGE_KEYS.COD_ANALYSES,
    userId,
    []
  );
}

// ─── Scenario Analyses ───────────────────────────────────────────────────

export function getSavedScenarioAnalyses(userId: string | null): SavedScenarioAnalysis[] {
  return scopedGetItem<SavedScenarioAnalysis[]>(
    STORAGE_KEYS.SCENARIO_ANALYSES,
    userId,
    []
  );
}

export function saveScenarioAnalysis(analysis: SavedScenarioAnalysis, userId: string | null): void {
  const analyses = getSavedScenarioAnalyses(userId);
  analyses.push(analysis);
  scopedSetItem(STORAGE_KEYS.SCENARIO_ANALYSES, userId, analyses);
  addNotificationDirect(userId, 'Analysis saved', 'analysis');
}

export function deleteScenarioAnalysis(id: string, userId: string | null): void {
  const analyses = getSavedScenarioAnalyses(userId).filter((a) => a.id !== id);
  scopedSetItem(STORAGE_KEYS.SCENARIO_ANALYSES, userId, analyses);
}

// ─── Export to Downloadable HTML File ──────────────────────────────────────

/**
 * Creates a downloadable HTML file using Blob + URL.createObjectURL.
 * This works reliably in all browsers including sandboxed iframes,
 * unlike window.print() which is blocked in many embedded contexts.
 */
function triggerFileDownload(htmlContent: string, filename: string): void {
  try {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 40px auto; padding: 0 20px; color: #171717; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 6px 0; }
    hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
    @media print { body { margin: 20px auto; } }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Clean up after a short delay to allow the download to start
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (err) {
    // If Blob/download approach fails, surface the error visibly
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Export failed: ${message}`);
  }
}

export function exportSimulatorToPdf(analysis: SavedSimulatorAnalysis, currency: string): void {
  const productName = analysis.inputs.productName || 'Untitled Analysis';
  const dateStr = new Date(analysis.createdAt).toLocaleDateString();

  const metricsRows = [
    ['Verdict', analysis.verdict],
    ['Revenue', formatCurrency(analysis.results.revenue, currency)],
    ['Profit/Loss', formatCurrency(analysis.results.campaignProfitLoss, currency)],
    ['ROAS', analysis.results.roas !== null ? formatMultiplier(analysis.results.roas) : 'N/A'],
    ['Break-Even ROAS', analysis.results.breakEvenRoas !== null ? formatMultiplier(analysis.results.breakEvenRoas) : 'N/A'],
    ['Break-Even Orders', analysis.results.breakEvenOrders !== null ? String(analysis.results.breakEvenOrders) : 'N/A'],
    ['Contribution Margin', analysis.results.contributionMarginPercent !== null ? formatPercentage(analysis.results.contributionMarginPercent) : 'N/A'],
  ];

  const inputRows = [
    ['Selling Price', formatCurrency(analysis.inputs.sellingPrice, currency)],
    ['Product Cost', formatCurrency(analysis.inputs.productCost, currency)],
    ['Delivery Cost', formatCurrency(analysis.inputs.deliveryCost, currency)],
    ['RTO Shipping Cost', formatCurrency(analysis.inputs.rtoShippingCost ?? 200, currency)],
    ['Other Variable Costs', formatCurrency(analysis.inputs.otherVariableCosts, currency)],
    ['Advertising Budget', formatCurrency(analysis.inputs.advertisingBudget, currency)],
    ['Expected Orders', String(analysis.inputs.expectedOrders)],
  ];

  const html = `
    <h1 style="font-size:24px;margin-bottom:4px;color:#171717;">Launch Analysis Report</h1>
    <p style="font-size:16px;color:#444;margin-bottom:2px;"><strong>Product:</strong> ${escapeHtml(productName)}</p>
    <p style="font-size:12px;color:#888;margin-bottom:16px;">Generated: ${dateStr} &middot; Currency: ${escapeHtml(currency)}</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:12px 0;" />
    <h2 style="font-size:18px;margin:16px 0 8px;color:#171717;">Key Metrics</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${metricsRows.map(([label, value]) => `
        <tr>
          <td style="padding:6px 0;color:#666;width:50%;">${escapeHtml(label)}</td>
          <td style="padding:6px 0;font-weight:600;color:#171717;text-align:right;">${escapeHtml(value)}</td>
        </tr>
      `).join('')}
    </table>
    <h2 style="font-size:18px;margin:20px 0 8px;color:#171717;">Input Details</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      ${inputRows.map(([label, value]) => `
        <tr>
          <td style="padding:5px 0;color:#666;width:50%;">${escapeHtml(label)}</td>
          <td style="padding:5px 0;font-weight:600;color:#171717;text-align:right;">${escapeHtml(value)}</td>
        </tr>
      `).join('')}
    </table>
    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
    <p style="font-size:11px;color:#999;font-style:italic;">Figures are estimates from your own inputs, not a profit guarantee. Actual results may vary based on market conditions and execution.</p>
  `;

  triggerFileDownload(html, 'launch-analysis.html');
}

export function exportDecisionEngineToPdf(
  analysis: SavedCodAnalysis,
  currency: string
): void {
  const productName = analysis.inputs.productName || 'Untitled Analysis';
  const dateStr = new Date(analysis.inputs.createdAt).toLocaleDateString();

  const metricsRows = [
    ['Contribution per Delivered Order', formatCurrency(analysis.calculations.contributionPerDeliveredOrder, currency)],
    ['Expected Contribution per Order', formatCurrency(analysis.calculations.expectedContributionPerPlacedOrder, currency)],
    ['Break-Even CPA', formatCurrency(analysis.calculations.maxBreakEvenAdCostPerOrder, currency)],
    ['Break-Even ROAS', analysis.calculations.breakEvenRoas === Infinity ? 'N/A' : `${analysis.calculations.breakEvenRoas.toFixed(2)}x`],
    ['Break-Even Orders', analysis.calculations.breakEvenOrderCount === Infinity ? 'N/A' : String(Math.ceil(analysis.calculations.breakEvenOrderCount))],
  ];

  const reasonsHtml = analysis.decision.reasons.length > 0
    ? `<h2 style="font-size:18px;margin:20px 0 8px;color:#171717;">Key Reasoning</h2>
       <ul style="font-size:13px;color:#444;padding-left:20px;line-height:1.6;">
         ${analysis.decision.reasons.map(r => `<li style="margin-bottom:4px;">${escapeHtml(r)}</li>`).join('')}
       </ul>`
    : '';

  const html = `
    <h1 style="font-size:24px;margin-bottom:4px;color:#171717;">Launch Decision Report</h1>
    <p style="font-size:16px;color:#444;margin-bottom:2px;"><strong>Product:</strong> ${escapeHtml(productName)}</p>
    <p style="font-size:12px;color:#888;margin-bottom:16px;">Generated: ${dateStr} &middot; Currency: ${escapeHtml(currency)}</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:12px 0;" />
    <h2 style="font-size:20px;margin:16px 0 12px;color:#171717;">Verdict: ${escapeHtml(analysis.decision.decision)}</h2>
    <h2 style="font-size:18px;margin:16px 0 8px;color:#171717;">Key Metrics</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${metricsRows.map(([label, value]) => `
        <tr>
          <td style="padding:6px 0;color:#666;width:55%;">${escapeHtml(label)}</td>
          <td style="padding:6px 0;font-weight:600;color:#171717;text-align:right;">${escapeHtml(value)}</td>
        </tr>
      `).join('')}
    </table>
    ${reasonsHtml}
    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
    <p style="font-size:11px;color:#999;font-style:italic;">Figures are estimates from your own inputs, not a profit guarantee. Actual results may vary based on market conditions and execution.</p>
  `;

  triggerFileDownload(html, 'launch-decision-report.html');
}

export function exportScenariosToHtml(analysis: SavedScenarioAnalysis, currency: string): void {
  const dateStr = new Date(analysis.createdAt).toLocaleDateString();

  const scenarioRows = analysis.results.map((r, i) => {
    const s = analysis.scenarios[i];
    return `
      <tr>
        <td style="padding:6px 0;font-weight:600;color:#171717;">${escapeHtml(r.scenarioName)}</td>
        <td style="padding:6px 0;text-align:right;color:#171717;">${formatCurrency(s?.advertisingBudget ?? 0, currency)}</td>
        <td style="padding:6px 0;text-align:right;color:#171717;">${s?.expectedOrders ?? 0}</td>
        <td style="padding:6px 0;text-align:right;color:#171717;">${formatCurrency(r.revenue, currency)}</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;color:${r.campaignProfitLoss >= 0 ? '#2e7d32' : '#c62828'};">${formatCurrency(r.campaignProfitLoss, currency)}</td>
        <td style="padding:6px 0;text-align:right;color:#171717;">${r.roas !== null ? formatMultiplier(r.roas) : 'N/A'}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <h1 style="font-size:24px;margin-bottom:4px;color:#171717;">Scenario Comparison Report</h1>
    <p style="font-size:16px;color:#444;margin-bottom:2px;"><strong>Product:</strong> ${escapeHtml(analysis.productName || 'Untitled')}</p>
    <p style="font-size:12px;color:#888;margin-bottom:16px;">Generated: ${dateStr} &middot; Currency: ${escapeHtml(currency)}</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:12px 0;" />
    <h2 style="font-size:18px;margin:16px 0 8px;color:#171717;">Side-by-Side Comparison</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="border-bottom:2px solid #ddd;">
          <th style="padding:8px 0;text-align:left;color:#666;">Scenario</th>
          <th style="padding:8px 0;text-align:right;color:#666;">Ad Budget</th>
          <th style="padding:8px 0;text-align:right;color:#666;">Orders</th>
          <th style="padding:8px 0;text-align:right;color:#666;">Revenue</th>
          <th style="padding:8px 0;text-align:right;color:#666;">Profit/Loss</th>
          <th style="padding:8px 0;text-align:right;color:#666;">ROAS</th>
        </tr>
      </thead>
      <tbody>
        ${scenarioRows}
      </tbody>
    </table>
    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
    <p style="font-size:11px;color:#999;font-style:italic;">All scenarios use illustrative assumptions based on your product economics. Results are hypothetical projections only.</p>
  `;

  triggerFileDownload(html, 'scenario-comparison-report.html');
}

/** Simple HTML entity escaper for user-provided strings */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Export to WhatsApp Text ─────────────────────────────────────────────

export function generateWhatsAppSummary(analysis: SavedSimulatorAnalysis, currency: string): string {
  const lines = [
    `[Launch Analysis: ${analysis.name || 'Untitled'}]`,
    '',
    `*Verdict:* ${analysis.verdict === 'Profitable' ? 'PROFITABLE' : 'LOSS-MAKING'}`,
    `*Revenue:* ${formatCurrency(analysis.results.revenue, currency)}`,
    `*Profit/Loss:* ${formatCurrency(analysis.results.campaignProfitLoss, currency)}`,
    `*ROAS:* ${analysis.results.roas !== null ? formatMultiplier(analysis.results.roas) : 'N/A'}`,
    `*Break-Even ROAS:* ${analysis.results.breakEvenRoas !== null ? formatMultiplier(analysis.results.breakEvenRoas) : 'N/A'}`,
    `*Break-Even Orders:* ${analysis.results.breakEvenOrders !== null ? String(analysis.results.breakEvenOrders) : 'N/A'}`,
    '',
    '_Figures are estimates from your own inputs, not a profit guarantee._',
  ];
  return lines.join('\n');
}

export function generateDecisionEngineWhatsAppSummary(analysis: SavedCodAnalysis, currency: string): string {
  const lines = [
    `[Launch Decision: ${analysis.inputs.productName || 'Untitled'}]`,
    '',
    `*Verdict:* ${analysis.decision.decision === 'GO' ? 'GO' : analysis.decision.decision === 'TEST FIRST' ? 'TEST FIRST' : 'NO-GO'}`,
    `*Expected Contribution/Order:* ${formatCurrency(analysis.calculations.expectedContributionPerPlacedOrder, currency)}`,
    `*Break-Even CPA:* ${formatCurrency(analysis.calculations.maxBreakEvenAdCostPerOrder, currency)}`,
    `*Break-Even ROAS:* ${analysis.calculations.breakEvenRoas === Infinity ? 'N/A' : `${analysis.calculations.breakEvenRoas.toFixed(2)}x`}`,
    `*Break-Even Orders:* ${analysis.calculations.breakEvenOrderCount === Infinity ? 'N/A' : String(Math.ceil(analysis.calculations.breakEvenOrderCount))}`,
    '',
    '_Figures are estimates from your own inputs, not a profit guarantee._',
  ];
  return lines.join('\n');
}

export function shareOnWhatsApp(text: string): void {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}
