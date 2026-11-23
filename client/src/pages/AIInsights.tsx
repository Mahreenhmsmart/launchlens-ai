import { useState, useCallback } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, WifiOff, TrendingUp, MessageSquare, Download, Lock, Copy, Check } from 'lucide-react';
import { Card, Button, Spinner, Alert } from '@/components/ui';
import type { CardVariant } from '@/components/ui';
import { fetchAIInsights, type AIInsightsContext, type AIInsightsResponse } from '@/services/apiClient';
import { formatCurrency, formatPercentage, formatMultiplier } from '@/utils/currency';
import type { SimulationInputs, SimulationResults } from '@/utils/calculations';
import type { ChecklistItemState } from '@/services/apiClient';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ChatInterface from '@/components/ChatInterface';
import { usePlanGating } from '@/hooks/usePlanGating';
import UpgradePrompt from '@/components/UpgradePrompt';
import { useTranslation } from '@/utils/i18n';

interface AIInsightsProps {
  currency: string;
  simulatorInputs: SimulationInputs;
  simulationResults: SimulationResults;
  checklistCompletion: number;
  incompleteChecklistItems: string[];
  checklistItems?: ChecklistItemState[];
}

/**
 * Generate local rule-based fallback when the server is unreachable.
 */
function generateLocalFallback(
  inputs: SimulationInputs,
  results: SimulationResults,
  currency: string,
  checklistCompletion: number,
  incompleteItems: string[],
): string {
  const lines: string[] = [];
  const fmt = (v: number) => formatCurrency(v, currency, { showSymbol: true });

  lines.push('## Product Economics Concerns\n');
  if (results.contributionPerOrder <= 0) {
    lines.push('- **Critical:** Contribution per order is zero or negative. Every sale loses money before advertising. Reduce costs or increase price before launching.');
  } else if (results.contributionMarginPercent !== null && results.contributionMarginPercent < 30) {
    lines.push(`- **Warning:** Contribution margin is ${results.contributionMarginPercent.toFixed(1)}%, below the recommended 30% threshold.`);
  } else {
    lines.push(`- Contribution margin of ${results.contributionMarginPercent?.toFixed(1) ?? 'N/A'}% is healthy.`);
  }
  lines.push('');

  lines.push('## Pricing and Offer Ideas\n');
  if (results.contributionMarginPercent !== null && results.contributionMarginPercent < 40) {
    lines.push('- Consider increasing selling price or negotiating lower product costs.');
    lines.push('- Explore bundling to increase average order value.');
  } else {
    lines.push('- Margins are solid. Test premium tiers or add-on upsells.');
  }
  lines.push('');

  lines.push('## Advertising Creative Testing Ideas\n');
  lines.push(`- With ${fmt(inputs.advertisingBudget)} budget, start with 3-5 creative variations.`);
  lines.push('- Allocate 60% of budget to best performers after initial testing (3-5 days).');
  lines.push('');

  lines.push('## Audience and Campaign Testing Suggestions\n');
  if (results.breakEvenRoas !== null) {
    lines.push(`- Break-even ROAS is ${formatMultiplier(results.breakEvenRoas)}. Campaigns must exceed this.`);
  }
  if (results.breakEvenOrders !== null && inputs.expectedOrders < results.breakEvenOrders) {
    lines.push(`- **Alert:** Expected ${inputs.expectedOrders} orders but need ${results.breakEvenOrders} to break even.`);
  }
  lines.push('');

  lines.push('## Launch Risks and Missing Information\n');
  if (checklistCompletion < 50) {
    lines.push(`- **High Risk:** Only ${checklistCompletion}% readiness. Delay launch.`);
  }
  if (incompleteItems.length > 0) {
    lines.push('- Incomplete items:');
    for (const item of incompleteItems) {
      lines.push(`  - ${item}`);
    }
  }
  if (results.campaignProfitLoss < 0) {
    lines.push(`- Projected loss of ${fmt(Math.abs(results.campaignProfitLoss))}.`);
  }
  lines.push('');

  lines.push('## Three Prioritized Next Actions\n');
  const actions: string[] = [];
  if (results.contributionPerOrder <= 0) {
    actions.push('1. Fix unit economics — renegotiate costs or raise price.');
  }
  if (checklistCompletion < 80) {
    actions.push(`${actions.length + 1}. Complete launch readiness checklist.`);
  }
  if (results.campaignProfitLoss < 0) {
    actions.push(`${actions.length + 1}. Reduce ad budget or improve conversion rate.`);
  }
  if (actions.length < 3) actions.push(`${actions.length + 1}. Prepare 3-5 ad creative variations.`);
  if (actions.length < 3) actions.push(`${actions.length + 1}. Set up tracking and analytics.`);
  if (actions.length < 3) actions.push(`${actions.length + 1}. Define KPI targets and stop-loss thresholds.`);
  lines.push(actions.slice(0, 3).join('\n'));

  return lines.join('\n');
}

export default function AIInsights({
  currency,
  simulatorInputs,
  simulationResults,
  checklistCompletion,
  incompleteChecklistItems,
  checklistItems,
}: AIInsightsProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [copiedAdvice, setCopiedAdvice] = useState(false);

  // Plan gating
  const { canAccessFeature, getUpgradePrompt } = usePlanGating();
  const { t } = useTranslation();
  const canGenerateAI = canAccessFeature('advancedAIAnalysis');
  const canExport = canAccessFeature('exportReports');
  const aiUpgradeMessage = getUpgradePrompt('advancedAIAnalysis');
  const exportUpgradeMessage = getUpgradePrompt('exportReports');

  const handleGenerate = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setAdvice(null);
    setIsFallback(false);
    setFallbackReason(null);
    setIsOfflineFallback(false);

    const context: AIInsightsContext = {
      productName: simulatorInputs.productName,
      currency,
      sellingPrice: simulatorInputs.sellingPrice,
      productCost: simulatorInputs.productCost,
      deliveryCost: simulatorInputs.deliveryCost,
      otherVariableCosts: simulatorInputs.otherVariableCosts,
      advertisingBudget: simulatorInputs.advertisingBudget,
      expectedOrders: simulatorInputs.expectedOrders,
      revenue: simulationResults.revenue,
      variableCosts: simulationResults.variableCosts,
      contributionPerOrder: simulationResults.contributionPerOrder,
      contributionBeforeAdvertising: simulationResults.contributionBeforeAdvertising,
      campaignProfitLoss: simulationResults.campaignProfitLoss,
      roas: simulationResults.roas,
      contributionMarginPercent: simulationResults.contributionMarginPercent,
      breakEvenRoas: simulationResults.breakEvenRoas,
      breakEvenOrders: simulationResults.breakEvenOrders,
      checklistCompletionPercent: checklistCompletion,
      incompleteChecklistItems,
      checklistItems,
    };

    try {
      const response: AIInsightsResponse = await fetchAIInsights(context);

      if (response.success && response.data) {
        setAdvice(response.data.advice);
        setIsFallback(response.data.isFallback);
        setFallbackReason(response.data.reason || null);
      } else {
        // Server returned an error — use offline fallback
        const localAdvice = generateLocalFallback(
          simulatorInputs,
          simulationResults,
          currency,
          checklistCompletion,
          incompleteChecklistItems,
        );
        setAdvice(localAdvice);
        setIsOfflineFallback(true);
        setError(response.error || 'Failed to generate insights.');
      }
    } catch {
      // Network failure — use offline fallback
      const localAdvice = generateLocalFallback(
        simulatorInputs,
        simulationResults,
        currency,
        checklistCompletion,
        incompleteChecklistItems,
      );
      setAdvice(localAdvice);
      setIsOfflineFallback(true);
      setError('Unable to reach the server. Showing offline rule-based insights.');
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    simulatorInputs,
    simulationResults,
    currency,
    checklistCompletion,
    incompleteChecklistItems,
  ]);

  const fmt = (v: number) => formatCurrency(v, currency, { showSymbol: true });

  const handleCopyAdvice = useCallback(async () => {
    if (!advice) return;
    try {
      await navigator.clipboard.writeText(advice);
      setCopiedAdvice(true);
      setTimeout(() => setCopiedAdvice(false), 2000);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = advice;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedAdvice(true);
      setTimeout(() => setCopiedAdvice(false), 2000);
    }
  }, [advice]);

  const handleExportAdvice = useCallback(() => {
    if (!advice) return;
    const productName = simulatorInputs.productName || 'product';
    const dateStr = new Date().toLocaleDateString();
    const escapedAdvice = advice
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName} - AI Advice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 40px auto; padding: 0 20px; color: #171717; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    p.meta { font-size: 12px; color: #888; margin-bottom: 16px; }
    hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>AI Launch Advice</h1>
  <p class="meta"><strong>Product:</strong> ${productName.replace(/</g, '&lt;')} &middot; Generated: ${dateStr}</p>
  <hr />
  <pre>${escapedAdvice}</pre>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${productName}-ai-advice.html`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }, [advice, simulatorInputs.productName]);

  const summaryMetrics = [
    { label: 'Selling Price', value: fmt(simulatorInputs.sellingPrice) },
    { label: 'Product Cost', value: fmt(simulatorInputs.productCost) },
    { label: 'Delivery Cost', value: fmt(simulatorInputs.deliveryCost) },
    { label: 'Other Costs', value: fmt(simulatorInputs.otherVariableCosts) },
    { label: 'Ad Budget', value: fmt(simulatorInputs.advertisingBudget) },
    { label: 'Expected Orders', value: String(simulatorInputs.expectedOrders) },
    { label: 'Revenue', value: fmt(simulationResults.revenue) },
    { label: 'Contribution/Order', value: fmt(simulationResults.contributionPerOrder) },
    {
      label: 'Campaign P/L',
      value: fmt(simulationResults.campaignProfitLoss),
      color: simulationResults.campaignProfitLoss >= 0 ? 'text-success' : 'text-destructive',
    },
    {
      label: 'ROAS',
      value: simulationResults.roas !== null ? formatMultiplier(simulationResults.roas) : 'N/A',
    },
    {
      label: 'Contribution Margin',
      value: simulationResults.contributionMarginPercent !== null
        ? formatPercentage(simulationResults.contributionMarginPercent, 1)
        : 'N/A',
    },
    {
      label: 'Readiness',
      value: `${checklistCompletion}%`,
      color: checklistCompletion >= 80 ? 'text-success' : checklistCompletion >= 50 ? 'text-warning' : 'text-destructive',
    },
  ];

  return (
    <div
      className="space-y-6"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_aiinsights_tsx_71ce">
      {/* Page Header */}
      <div className="space-y-2" data-icod-id="src_pages_aiinsights_tsx_63b9">
        <h1
          className="text-3xl font-bold text-[#171717]"
          data-icod-id="src_pages_aiinsights_tsx_cab3">{t('Your AI Launch Advisor')}</h1>
        <p
          className="text-muted-foreground"
          data-icod-id="src_pages_aiinsights_tsx_63f8">
          {t('Turn your product numbers into a smarter launch strategy.')}
        </p>
      </div>
      {/* Summary Card */}
      <Card variant="lavender" className="p-6" data-icod-id="src_pages_aiinsights_tsx_81d7">
        <div
          className="mb-4 flex items-center gap-2"
          data-icod-id="src_pages_aiinsights_tsx_93dc">
          <TrendingUp
            className="h-5 w-5 text-[#C9D0FC]"
            data-icod-id="src_pages_aiinsights_tsx_81a3" />
          <h2
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_aiinsights_tsx_d662">
            Current Simulation: {simulatorInputs.productName || 'Unnamed Product'}
          </h2>
        </div>
        <div
          className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4"
          data-icod-id="src_pages_aiinsights_tsx_2301">
          {summaryMetrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col"
              data-icod-id={`src_pages_aiinsights_tsx_2106_${metric.label}`}>
              <span
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                data-icod-id={`src_pages_aiinsights_tsx_6a5b_${metric.label}`}>
                {metric.label}
              </span>
              <span
                className={`text-sm font-semibold ${metric.color || 'text-foreground'}`}
                data-icod-id={`src_pages_aiinsights_tsx_cc74_${metric.label}`}>
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </Card>
      {/* Generate Button */}
      <div
        className="flex items-center gap-4"
        data-icod-id="src_pages_aiinsights_tsx_b703">
        {canGenerateAI ? (
          <>
            <Button
              size="lg"
              onClick={handleGenerate}
              loading={loading}
              disabled={loading}
              data-icod-id="src_pages_aiinsights_tsx_72d5">
              {!loading && <Sparkles className="h-5 w-5" data-icod-id="src_pages_aiinsights_tsx_4b2a" />}
              {loading ? 'Analyzing...' : 'Generate AI Advice'}
            </Button>
            {advice && !loading && (
              <Button
                variant="outline"
                size="md"
                onClick={handleGenerate}
                data-icod-id="src_pages_aiinsights_tsx_5a45">
                <RefreshCw className="h-4 w-4" data-icod-id="src_pages_aiinsights_tsx_4f43" />
                Regenerate
              </Button>
            )}
            {advice && !loading && canExport && (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  if (!advice) return;
                  const blob = new Blob([advice], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${simulatorInputs.productName || 'product'}-ai-advice.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                data-icod-id="src_pages_aiinsights_tsx_export_btn">
                <Download className="h-4 w-4" data-icod-id="src_pages_aiinsights_tsx_export_icon" />
                Export Report
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 w-full" data-icod-id="src_pages_aiinsights_tsx_gated_ai">
            <Button
              size="lg"
              disabled
              className="gap-2 opacity-60"
              data-icod-id="src_pages_aiinsights_tsx_locked_generate">
              <Lock className="h-4 w-4" data-icod-id="src_pages_aiinsights_tsx_lock_icon_generate" />
              Generate AI Advice
              <span className="ml-1 rounded bg-[#8B72E8]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8B72E8]" data-icod-id="src_pages_aiinsights_tsx_pro_badge_generate">Pro</span>
            </Button>
            <UpgradePrompt
              message={aiUpgradeMessage || 'Advanced AI analysis requires Standard or Business plan with confirmed payment'}
              className="w-full"
              data-icod-id="src_pages_aiinsights_tsx_f2e4" />
          </div>
        )}
      </div>
      {/* Export gating notice when user has AI access but not export */}
      {canGenerateAI && !canExport && advice && !loading && (
        <div className="mt-2" data-icod-id="src_pages_aiinsights_tsx_56f1">
          <div className="flex items-center gap-2 mb-1" data-icod-id="src_pages_aiinsights_tsx_export_locked_row">
            <Lock className="h-3.5 w-3.5 text-[#D8B779]" data-icod-id="src_pages_aiinsights_tsx_lock_icon_export" />
            <span className="text-xs font-semibold text-[#555]" data-icod-id="src_pages_aiinsights_tsx_export_locked_label">Export Report locked</span>
            <span className="rounded bg-[#8B72E8]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8B72E8]" data-icod-id="src_pages_aiinsights_tsx_pro_badge_export">Pro</span>
          </div>
          <UpgradePrompt
            message={exportUpgradeMessage || 'Report exports require Standard or Business plan with confirmed payment'}
            className="w-full"
            data-icod-id="src_pages_aiinsights_tsx_8d50" />
        </div>
      )}
      {/* Loading State */}
      {loading && (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-icod-id="src_pages_aiinsights_tsx_142c">
          <Spinner size="lg" data-icod-id="src_pages_aiinsights_tsx_b20c" />
          <p
            className="mt-4 text-sm font-medium text-muted-foreground"
            data-icod-id="src_pages_aiinsights_tsx_6819">
            Analyzing your launch data...
          </p>
        </div>
      )}
      {/* Error Display */}
      {error && !isOfflineFallback && !advice && (
        <Alert variant="error" data-icod-id="src_pages_aiinsights_tsx_20fb">
          <div
            className="flex flex-col gap-2"
            data-icod-id="src_pages_aiinsights_tsx_a1d6">
            <p data-icod-id="src_pages_aiinsights_tsx_ed0a">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              className="self-start"
              data-icod-id="src_pages_aiinsights_tsx_c534">
              <RefreshCw className="h-3 w-3" data-icod-id="src_pages_aiinsights_tsx_abd6" />
              Retry
            </Button>
          </div>
        </Alert>
      )}
      {/* Offline Fallback Banner */}
      {isOfflineFallback && (
        <Alert variant="warning" data-icod-id="src_pages_aiinsights_tsx_07fd">
          <div
            className="flex items-start gap-2"
            data-icod-id="src_pages_aiinsights_tsx_048c">
            <WifiOff
              className="mt-0.5 h-4 w-4 shrink-0"
              data-icod-id="src_pages_aiinsights_tsx_3c3b" />
            <div data-icod-id="src_pages_aiinsights_tsx_8b09">
              <p className="font-semibold" data-icod-id="src_pages_aiinsights_tsx_189d">Offline Insights — Rule-Based</p>
              <p
                className="mt-1 text-xs opacity-80"
                data-icod-id="src_pages_aiinsights_tsx_8733">
                The server is unreachable. These insights are generated locally from your
                simulation data using deterministic rules, not AI.
              </p>
            </div>
          </div>
        </Alert>
      )}
      {/* Fallback Banner (server responded but AI unavailable) */}
      {isFallback && !isOfflineFallback && advice && (
        <Alert variant="warning" data-icod-id="src_pages_aiinsights_tsx_b8a7">
          <div
            className="flex items-start gap-2"
            data-icod-id="src_pages_aiinsights_tsx_1f49">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0"
              data-icod-id="src_pages_aiinsights_tsx_d53d" />
            <div data-icod-id="src_pages_aiinsights_tsx_c032">
              <p className="font-semibold" data-icod-id="src_pages_aiinsights_tsx_4891">Rule-Based Insights</p>
              <p
                className="mt-1 text-xs opacity-80"
                data-icod-id="src_pages_aiinsights_tsx_9d97">
                {fallbackReason || 'Live AI is not connected. These insights are generated using deterministic rules based on your simulation data.'}
              </p>
            </div>
          </div>
        </Alert>
      )}
      {/* Advice Sections - Now using MarkdownRenderer for rich formatting */}
      {advice && !loading && (
        <Card variant="mint" className="overflow-hidden p-0" data-icod-id="src_pages_aiinsights_tsx_be37">
          <div
            className="border-l-4 border-l-[#C9D0FC] p-6"
            data-icod-id="src_pages_aiinsights_tsx_e660">
            <MarkdownRenderer content={advice} data-icod-id="src_pages_aiinsights_tsx_dea8" />
          </div>
          <div className="flex items-center gap-2 border-t border-border/40 bg-muted/30 px-6 py-3" data-icod-id="src_pages_aiinsights_tsx_advice_actions">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAdvice}
              data-icod-id="src_pages_aiinsights_tsx_copy_advice_btn">
              {copiedAdvice ? (
                <>
                  <Check className="h-4 w-4" data-icod-id="src_pages_aiinsights_tsx_copied_check" />
                  {t('Copied!')}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" data-icod-id="src_pages_aiinsights_tsx_copy_icon" />
                  {t('Copy Advice')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAdvice}
              data-icod-id="src_pages_aiinsights_tsx_export_advice_btn">
              <Download className="h-4 w-4" data-icod-id="src_pages_aiinsights_tsx_export_advice_icon" />
              {t('Export Advice')}
            </Button>
          </div>
        </Card>
      )}
      {/* Empty State — no advice yet */}
      {!advice && !loading && !error && (
        <Card
          variant="cream"
          className="border-dashed p-8 text-center"
          data-icod-id="src_pages_aiinsights_tsx_02ff">
          <Sparkles
            className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40"
            data-icod-id="src_pages_aiinsights_tsx_ca04" />
          <p
            className="text-sm font-medium text-muted-foreground"
            data-icod-id="src_pages_aiinsights_tsx_ac1b">
            Click "Generate AI Advice" to analyze your launch data and receive personalized recommendations.
          </p>
        </Card>
      )}
      {/* Chat Section */}
      <div className="mt-12 border-t border-border pt-8" data-icod-id="src_pages_aiinsights_tsx_chat_section">
        <div className="mb-6 space-y-2" data-icod-id="src_pages_aiinsights_tsx_chat_header">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_aiinsights_tsx_0c2f">
            <MessageSquare
              className="h-6 w-6 text-[#C9D0FC]"
              data-icod-id="src_pages_aiinsights_tsx_6efa" />
            <h2
              className="text-2xl font-bold text-[#171717]"
              data-icod-id="src_pages_aiinsights_tsx_b113">
              {t('Ask LaunchLens — Your Business Growth Advisor')}
            </h2>
          </div>
          <p
            className="text-muted-foreground"
            data-icod-id="src_pages_aiinsights_tsx_91af">
            {t('Have specific questions about your product, profit margins, advertising strategy, or growth plans? Chat with LaunchLens for personalized, actionable advice based on your simulation data.')}
          </p>
        </div>

        <ChatInterface
          simulationContext={{
            productName: simulatorInputs.productName,
            currency,
            sellingPrice: simulatorInputs.sellingPrice,
            productCost: simulatorInputs.productCost,
            deliveryCost: simulatorInputs.deliveryCost,
            otherVariableCosts: simulatorInputs.otherVariableCosts,
            advertisingBudget: simulatorInputs.advertisingBudget,
            expectedOrders: simulatorInputs.expectedOrders,
            revenue: simulationResults.revenue,
            variableCosts: simulationResults.variableCosts,
            contributionPerOrder: simulationResults.contributionPerOrder,
            contributionBeforeAdvertising: simulationResults.contributionBeforeAdvertising,
            campaignProfitLoss: simulationResults.campaignProfitLoss,
            roas: simulationResults.roas,
            contributionMarginPercent: simulationResults.contributionMarginPercent,
            breakEvenRoas: simulationResults.breakEvenRoas,
            breakEvenOrders: simulationResults.breakEvenOrders,
            checklistCompletionPercent: checklistCompletion,
            incompleteChecklistItems,
            checklistItems,
          }}
          data-icod-id="src_pages_aiinsights_tsx_f978" />
      </div>
    </div>
  );
}
