import React, { useMemo } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, formatMultiplier } from '@/utils/currency';
import { useTranslation } from '@/utils/i18n';
import type { SavedSimulatorAnalysis, ImportedOrder, ComparisonMetric } from '@/types';
import { computeImportedActuals } from '@/utils/csvParser';

interface CsvComparisonProps {
  analysis: SavedSimulatorAnalysis;
  orders: ImportedOrder[];
  currency: string;
}

export default function CsvComparison({ analysis, orders, currency }: CsvComparisonProps) {
  const { t } = useTranslation();

  const metrics = useMemo<ComparisonMetric[]>(() => {
    const actuals = computeImportedActuals(orders);

    const predictedRevenue = analysis.results.revenue;
    const actualRevenue = actuals.revenue;

    const predictedProfit = analysis.results.campaignProfitLoss;
    const actualProfit = actuals.profit;

    const predictedRoas = analysis.results.roas;
    const actualRoas = actuals.roas;

    const predictedDeliveryRate = analysis.inputs.deliverySuccessRate ?? 75;
    const actualDeliveryRate = actuals.deliveryRate;

    return [
      {
        label: t('Revenue'),
        predicted: formatCurrency(predictedRevenue, currency, { baseCurrency: 'PKR' }),
        actual: formatCurrency(actualRevenue, currency, { baseCurrency: 'PKR' }),
        varianceValue: actualRevenue - predictedRevenue,
        variance: '', // computed in render
      },
      {
        label: t('Profit'),
        predicted: formatCurrency(predictedProfit, currency, { baseCurrency: 'PKR' }),
        actual: formatCurrency(actualProfit, currency, { baseCurrency: 'PKR' }),
        varianceValue: actualProfit - predictedProfit,
        variance: '',
      },
      {
        label: 'ROAS',
        predicted: predictedRoas !== null ? formatMultiplier(predictedRoas) : 'N/A',
        actual: actualRoas !== null ? formatMultiplier(actualRoas) : 'N/A',
        varianceValue: (actualRoas ?? 0) - (predictedRoas ?? 0),
        isRatio: true,
        variance: '',
      },
      {
        label: t('Delivery Rate'),
        predicted: `${predictedDeliveryRate.toFixed(1)}%`,
        actual: `${actualDeliveryRate.toFixed(1)}%`,
        varianceValue: actualDeliveryRate - predictedDeliveryRate,
        isPercentage: true,
        variance: '',
      },
    ];
  }, [analysis, orders, currency, t]);

  return (
    <Card
      className="overflow-hidden p-0"
      data-icod-id="src_components_csvcomparison_tsx_f619">
      {/* Header */}
      <div
        className="border-b border-border/50 bg-muted/30 px-5 py-4"
        data-icod-id="src_components_csvcomparison_tsx_3a15">
        <h3
          className="font-semibold text-foreground"
          data-icod-id="src_components_csvcomparison_tsx_484d">
          {t('Predicted vs Actual (CSV Import)')}
        </h3>
        <p
          className="text-xs text-muted-foreground mt-0.5"
          data-icod-id="src_components_csvcomparison_tsx_3d6b">
          {analysis.name || 'Untitled'} — {t('Delivered')}: {computeImportedActuals(orders).ordersDelivered}, {t('Returned')}: {computeImportedActuals(orders).ordersReturned}
        </p>
      </div>
      {/* Comparison grid */}
      <div
        className="px-5 py-4"
        data-icod-id="src_components_csvcomparison_tsx_dc9c">
        <div
          className="grid grid-cols-4 gap-2 text-sm"
          data-icod-id="src_components_csvcomparison_tsx_d0f8">
          {/* Column headers */}
          <div
            className="font-medium text-muted-foreground"
            data-icod-id="src_components_csvcomparison_tsx_e2da">{t('Metric')}</div>
          <div
            className="font-medium text-muted-foreground text-right"
            data-icod-id="src_components_csvcomparison_tsx_14a8">{t('Predicted')}</div>
          <div
            className="font-medium text-muted-foreground text-right"
            data-icod-id="src_components_csvcomparison_tsx_e159">{t('Actual')}</div>
          <div
            className="font-medium text-muted-foreground text-right"
            data-icod-id="src_components_csvcomparison_tsx_d924">{t('Variance')}</div>

          {/* Metric rows */}
          {metrics.map((m) => {
            const sign = m.varianceValue >= 0 ? '+' : '';
            const colorClass = m.varianceValue >= 0 ? 'text-[#9DD37D]' : 'text-[#E88B9E]';
            const formattedVariance = m.isRatio
              ? `${sign}${m.varianceValue.toFixed(2)}x`
              : m.isPercentage
                ? `${sign}${m.varianceValue.toFixed(1)}%`
                : formatCurrency(m.varianceValue, currency, { baseCurrency: 'PKR' });

            return (
              <React.Fragment key={m.label}>
                <div
                  className="text-foreground"
                  data-icod-id={`src_components_csvcomparison_tsx_7344_${m.label}`}>{m.label}</div>
                <div
                  className="text-right text-foreground"
                  data-icod-id={`src_components_csvcomparison_tsx_cc7e_${m.label}`}>{m.predicted}</div>
                <div
                  className="text-right text-foreground"
                  data-icod-id={`src_components_csvcomparison_tsx_a7a0_${m.label}`}>{m.actual}</div>
                <div
                  className={cn('text-right font-medium', colorClass)}
                  data-icod-id={`src_components_csvcomparison_tsx_5556_${m.label}`}>
                  {formattedVariance}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
