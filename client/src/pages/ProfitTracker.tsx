import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Trash2, TrendingUp, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Button, Card, EmptyState, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, formatMultiplier } from '@/utils/currency';
import type { PageId } from '@/components/Sidebar';
import type { SavedSimulatorAnalysis, ProfitActualEntry, ImportedOrder } from '@/types';
import { getSavedSimulatorAnalyses } from '@/utils/saveExport';
import { STORAGE_KEYS, scopedGetItem, scopedSetItem } from '@/utils/scopedStorage';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/utils/i18n';
import CsvImportModal from '@/components/CsvImportModal';
import CsvComparison from '@/components/CsvComparison';

interface ProfitTrackerProps {
  currency: string;
  onNavigate: (page: PageId) => void;
}

/** Combines a saved analysis with its logged actual for display. */
interface TrackerEntry {
  actual: ProfitActualEntry;
  analysis: SavedSimulatorAnalysis;
}

export default function ProfitTracker({ currency, onNavigate }: ProfitTrackerProps) {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const { t } = useTranslation();

  const [actuals, setActuals] = useState<ProfitActualEntry[]>([]);
  const [analyses, setAnalyses] = useState<SavedSimulatorAnalysis[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvImports, setCsvImports] = useState<{ analysisId: string; orders: ImportedOrder[] }[]>([]);

  // Load data on mount and when user changes
  useEffect(() => {
    setActuals(scopedGetItem<ProfitActualEntry[]>(STORAGE_KEYS.PROFIT_ACTUALS, userId, []));
    setAnalyses(getSavedSimulatorAnalyses(userId));
    setCsvImports(scopedGetItem<{ analysisId: string; orders: ImportedOrder[] }[]>(STORAGE_KEYS.CSV_IMPORTS, userId, []));
  }, [userId]);

  const refreshData = () => {
    setActuals(scopedGetItem<ProfitActualEntry[]>(STORAGE_KEYS.PROFIT_ACTUALS, userId, []));
    setAnalyses(getSavedSimulatorAnalyses(userId));
    setCsvImports(scopedGetItem<{ analysisId: string; orders: ImportedOrder[] }[]>(STORAGE_KEYS.CSV_IMPORTS, userId, []));
  };

  // Build tracker entries by joining actuals with their analyses
  const trackerEntries = useMemo<TrackerEntry[]>(() => {
    const entries: TrackerEntry[] = [];
    for (const actual of actuals) {
      const analysis = analyses.find((a) => a.id === actual.analysisId);
      if (analysis) {
        entries.push({ actual, analysis });
      }
    }
    // Sort by date logged, newest first
    entries.sort((a, b) => new Date(b.actual.dateLogged).getTime() - new Date(a.actual.dateLogged).getTime());
    return entries;
  }, [actuals, analyses]);

  // Summary totals
  const summary = useMemo(() => {
    let totalPredictedProfit = 0;
    let totalActualProfit = 0;
    for (const entry of trackerEntries) {
      totalPredictedProfit += entry.analysis.results.campaignProfitLoss;
      totalActualProfit += entry.actual.actualProfit;
    }
    return {
      totalPredictedProfit,
      totalActualProfit,
      totalVariance: totalActualProfit - totalPredictedProfit,
    };
  }, [trackerEntries]);

  // Delete handler
  const handleDelete = () => {
    if (!deleteConfirmId) return;
    const updated = actuals.filter((a) => a.id !== deleteConfirmId);
    scopedSetItem(STORAGE_KEYS.PROFIT_ACTUALS, userId, updated);
    setDeleteConfirmId(null);
    refreshData();
  };

  // CSV import handler
  const handleCsvImport = (orders: ImportedOrder[], analysisId: string) => {
    const newImport = { analysisId, orders };
    const updated = [...csvImports, newImport];
    scopedSetItem(STORAGE_KEYS.CSV_IMPORTS, userId, updated);
    setCsvImports(updated);
  };

  // Delete a CSV import
  const handleDeleteCsvImport = (index: number) => {
    const updated = csvImports.filter((_, i) => i !== index);
    scopedSetItem(STORAGE_KEYS.CSV_IMPORTS, userId, updated);
    setCsvImports(updated);
  };

  /** Format variance: positive is green, negative is coral/red */
  const VarianceValue = ({ value, isPercentage = false, isRatio = false }: { value: number; isPercentage?: boolean; isRatio?: boolean }) => {
    const sign = value >= 0 ? '+' : '';
    const colorClass = value >= 0 ? 'text-[#9DD37D]' : 'text-[#E88B9E]';
    const formatted = isRatio
      ? `${sign}${value.toFixed(2)}x`
      : isPercentage
        ? `${sign}${value.toFixed(1)}%`
        : formatCurrency(value, currency, { baseCurrency: 'PKR' });
    return (
      <span
        className={cn('font-medium', colorClass)}
        data-icod-id="src_pages_profittracker_tsx_0f4e">{formatted}</span>
    );
  };

  return (
    <div className="space-y-6" data-icod-id="src_pages_profittracker_tsx_7032">
      {/* Header */}
      <div className="space-y-2" data-icod-id="src_pages_profittracker_tsx_4dc3">
        <div
          className="flex items-center justify-between"
          data-icod-id="src_pages_profittracker_tsx_8441">
          <div
            className="flex items-center gap-4"
            data-icod-id="src_pages_profittracker_tsx_a0fb">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('saved-analyses')}
              data-icod-id="src_pages_profittracker_tsx_0689">
              <ArrowLeft className="h-5 w-5" data-icod-id="src_pages_profittracker_tsx_0449" />
            </Button>
            <div data-icod-id="src_pages_profittracker_tsx_ad8e">
              <h1
                className="text-3xl font-bold text-[#171717]"
                data-icod-id="src_pages_profittracker_tsx_92d5">{t('Profit Tracker')}</h1>
              <p
                className="text-muted-foreground"
                data-icod-id="src_pages_profittracker_tsx_0bfb">
                {t('Prediction vs Actual Tracker')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCsvImportOpen(true)}
            data-icod-id="src_pages_profittracker_tsx_c14b">
            <FileSpreadsheet
              className="mr-1.5 h-4 w-4"
              data-icod-id="src_pages_profittracker_tsx_5658" />
            {t('Import Orders')}
          </Button>
        </div>
      </div>
      {/* Summary Cards */}
      {trackerEntries.length > 0 && (
        <div
          className="grid gap-4 sm:grid-cols-3"
          data-icod-id="src_pages_profittracker_tsx_62f6">
          <Card className="p-5" data-icod-id="src_pages_profittracker_tsx_b025">
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_profittracker_tsx_463e">{t('Total Predicted Profit')}</p>
            <p
              className={cn('mt-1 text-2xl font-bold', summary.totalPredictedProfit >= 0 ? 'text-[#9DD37D]' : 'text-[#E88B9E]')}
              data-icod-id="src_pages_profittracker_tsx_d0bd">
              {formatCurrency(summary.totalPredictedProfit, currency, { baseCurrency: 'PKR' })}
            </p>
          </Card>
          <Card className="p-5" data-icod-id="src_pages_profittracker_tsx_56d6">
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_profittracker_tsx_c1ee">{t('Total Actual Profit')}</p>
            <p
              className={cn('mt-1 text-2xl font-bold', summary.totalActualProfit >= 0 ? 'text-[#9DD37D]' : 'text-[#E88B9E]')}
              data-icod-id="src_pages_profittracker_tsx_997f">
              {formatCurrency(summary.totalActualProfit, currency, { baseCurrency: 'PKR' })}
            </p>
          </Card>
          <Card className="p-5" data-icod-id="src_pages_profittracker_tsx_0828">
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_profittracker_tsx_64e6">{t('Total Variance')}</p>
            <p
              className="mt-1 text-2xl font-bold"
              data-icod-id="src_pages_profittracker_tsx_85e8">
              <VarianceValue
                value={summary.totalVariance}
                data-icod-id="src_pages_profittracker_tsx_9aa4" />
            </p>
          </Card>
        </div>
      )}
      {/* Tracker Entries */}
      {trackerEntries.length === 0 ? (
        <Card className="p-8" data-icod-id="src_pages_profittracker_tsx_4824">
          <EmptyState
            icon={TrendingUp}
            title={t('No tracked results yet')}
            description={t('Log actual results for your saved analyses to compare predicted vs actual performance.')}
            action={
              <Button
                variant="primary"
                onClick={() => onNavigate('saved-analyses')}
                data-icod-id="src_pages_profittracker_tsx_07aa">
                {t('Saved Analyses')}
              </Button>
            }
            data-icod-id="src_pages_profittracker_tsx_3aba" />
        </Card>
      ) : (
        <div className="space-y-4" data-icod-id="src_pages_profittracker_tsx_be35">
          {trackerEntries.map(({ actual, analysis }) => {
            const predictedRevenue = analysis.results.revenue;
            const actualRevenue = actual.revenueReceived;
            const predictedProfit = analysis.results.campaignProfitLoss;
            const actualProfit = actual.actualProfit;
            const predictedRoas = analysis.results.roas;
            const actualRoas = actual.actualRoas;
            const predictedDeliveryRate = analysis.inputs.deliverySuccessRate ?? 75;
            const actualDeliveryRate = actual.actualDeliveryRate;

            return (
              <Card
                key={actual.id}
                className="overflow-hidden p-0"
                data-icod-id={`src_pages_profittracker_tsx_854b_${actual.id}`}>
                {/* Entry header */}
                <div
                  className="flex items-start justify-between border-b border-border/50 bg-muted/30 px-5 py-4"
                  data-icod-id={`src_pages_profittracker_tsx_9305_${actual.id}`}>
                  <div data-icod-id={`src_pages_profittracker_tsx_db73_${actual.id}`}>
                    <h3
                      className="font-semibold text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_25f3_${actual.id}`}>
                      {analysis.name || 'Untitled'}
                    </h3>
                    <p
                      className="text-xs text-muted-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_2550_${actual.id}`}>
                      {t('Date Logged')}: {new Date(actual.dateLogged).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirmId(actual.id)}
                    title={t('Delete')}
                    data-icod-id={`src_pages_profittracker_tsx_991b_${actual.id}`}>
                    <Trash2
                      className="h-4 w-4 text-destructive"
                      data-icod-id={`src_pages_profittracker_tsx_f0fd_${actual.id}`} />
                  </Button>
                </div>
                {/* Comparison table */}
                <div
                  className="px-5 py-4"
                  data-icod-id={`src_pages_profittracker_tsx_3d12_${actual.id}`}>
                  <div
                    className="grid grid-cols-4 gap-2 text-sm"
                    data-icod-id={`src_pages_profittracker_tsx_a127_${actual.id}`}>
                    {/* Header row */}
                    <div
                      className="font-medium text-muted-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_c327_${actual.id}`}>{t('Metric')}</div>
                    <div
                      className="font-medium text-muted-foreground text-right"
                      data-icod-id={`src_pages_profittracker_tsx_5891_${actual.id}`}>{t('Predicted')}</div>
                    <div
                      className="font-medium text-muted-foreground text-right"
                      data-icod-id={`src_pages_profittracker_tsx_116b_${actual.id}`}>{t('Actual')}</div>
                    <div
                      className="font-medium text-muted-foreground text-right"
                      data-icod-id={`src_pages_profittracker_tsx_db46_${actual.id}`}>{t('Variance')}</div>

                    {/* Revenue */}
                    <div
                      className="text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_0129_${actual.id}`}>{t('Revenue')}</div>
                    <div
                      className="text-right text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_c23e_${actual.id}`}>
                      {formatCurrency(predictedRevenue, currency, { baseCurrency: 'PKR' })}
                    </div>
                    <div
                      className="text-right text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_2730_${actual.id}`}>
                      {formatCurrency(actualRevenue, currency, { baseCurrency: 'PKR' })}
                    </div>
                    <div
                      className="text-right"
                      data-icod-id={`src_pages_profittracker_tsx_7a2a_${actual.id}`}>
                      <VarianceValue
                        value={actualRevenue - predictedRevenue}
                        data-icod-id={`src_pages_profittracker_tsx_4cb2_${actual.id}`} />
                    </div>

                    {/* Profit */}
                    <div
                      className="text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_1210_${actual.id}`}>{t('Profit')}</div>
                    <div
                      className={cn('text-right', predictedProfit >= 0 ? 'text-[#9DD37D]' : 'text-[#E88B9E]')}
                      data-icod-id={`src_pages_profittracker_tsx_5d00_${actual.id}`}>
                      {formatCurrency(predictedProfit, currency, { baseCurrency: 'PKR' })}
                    </div>
                    <div
                      className={cn('text-right', actualProfit >= 0 ? 'text-[#9DD37D]' : 'text-[#E88B9E]')}
                      data-icod-id={`src_pages_profittracker_tsx_1646_${actual.id}`}>
                      {formatCurrency(actualProfit, currency, { baseCurrency: 'PKR' })}
                    </div>
                    <div
                      className="text-right"
                      data-icod-id={`src_pages_profittracker_tsx_38e5_${actual.id}`}>
                      <VarianceValue
                        value={actualProfit - predictedProfit}
                        data-icod-id={`src_pages_profittracker_tsx_1d42_${actual.id}`} />
                    </div>

                    {/* ROAS */}
                    <div
                      className="text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_73ed_${actual.id}`}>ROAS</div>
                    <div
                      className="text-right text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_9170_${actual.id}`}>
                      {predictedRoas !== null ? formatMultiplier(predictedRoas) : 'N/A'}
                    </div>
                    <div
                      className="text-right text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_83e5_${actual.id}`}>
                      {actualRoas !== null ? formatMultiplier(actualRoas) : 'N/A'}
                    </div>
                    <div
                      className="text-right"
                      data-icod-id={`src_pages_profittracker_tsx_99df_${actual.id}`}>
                      {predictedRoas !== null && actualRoas !== null ? (
                        <VarianceValue
                          value={actualRoas - predictedRoas}
                          isRatio
                          data-icod-id={`src_pages_profittracker_tsx_09f6_${actual.id}`} />
                      ) : (
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_profittracker_tsx_9b0e_${actual.id}`}>—</span>
                      )}
                    </div>

                    {/* Delivery Rate */}
                    <div
                      className="text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_4806_${actual.id}`}>{t('Delivery Rate')}</div>
                    <div
                      className="text-right text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_6a8f_${actual.id}`}>
                      {predictedDeliveryRate.toFixed(1)}%
                    </div>
                    <div
                      className="text-right text-foreground"
                      data-icod-id={`src_pages_profittracker_tsx_8db3_${actual.id}`}>
                      {actualDeliveryRate.toFixed(1)}%
                    </div>
                    <div
                      className="text-right"
                      data-icod-id={`src_pages_profittracker_tsx_43f6_${actual.id}`}>
                      <VarianceValue
                        value={actualDeliveryRate - predictedDeliveryRate}
                        isPercentage
                        data-icod-id={`src_pages_profittracker_tsx_8dcf_${actual.id}`} />
                    </div>
                  </div>
                </div>
                {/* Input details footer */}
                <div
                  className="border-t border-border/50 bg-muted/20 px-5 py-3"
                  data-icod-id={`src_pages_profittracker_tsx_4e83_${actual.id}`}>
                  <div
                    className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground"
                    data-icod-id={`src_pages_profittracker_tsx_98d6_${actual.id}`}>
                    <span data-icod-id={`src_pages_profittracker_tsx_178c_${actual.id}`}>{t('Orders Delivered')}: {actual.ordersDelivered}</span>
                    <span data-icod-id={`src_pages_profittracker_tsx_43b4_${actual.id}`}>{t('Orders Returned')}: {actual.ordersReturned}</span>
                    <span data-icod-id={`src_pages_profittracker_tsx_d8eb_${actual.id}`}>{t('Ad Spend')}: {formatCurrency(actual.adSpent, currency, { baseCurrency: 'PKR' })}</span>
                    <span data-icod-id={`src_pages_profittracker_tsx_07d2_${actual.id}`}>{t('Delivery Cost Paid')}: {formatCurrency(actual.deliveryCostPaid, currency, { baseCurrency: 'PKR' })}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title={t('Delete')}
        footer={
          <div className="flex gap-2" data-icod-id="src_pages_profittracker_tsx_9ff9">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              data-icod-id="src_pages_profittracker_tsx_6971">
              {t('Cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              data-icod-id="src_pages_profittracker_tsx_6105">
              {t('Confirm')}
            </Button>
          </div>
        }
        data-icod-id="src_pages_profittracker_tsx_8ffb">
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_profittracker_tsx_d76d">
          {t('Delete this actual entry? This cannot be undone.')}
        </p>
      </Modal>
      {/* CSV Import Modal */}
      <CsvImportModal
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        analyses={analyses}
        currency={currency}
        onImport={handleCsvImport}
        data-icod-id="src_pages_profittracker_tsx_2c3e" />
      {/* CSV Import Comparisons */}
      {csvImports.length > 0 && (
        <div className="space-y-4" data-icod-id="src_pages_profittracker_tsx_0303">
          <h2
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_profittracker_tsx_6ee4">
            {t('Predicted vs Actual (CSV Import)')}
          </h2>
          {csvImports.map((imp, idx) => {
            const analysis = analyses.find((a) => a.id === imp.analysisId);
            if (!analysis) return null;
            return (
              <div
                key={idx}
                className="relative"
                data-icod-id={`src_pages_profittracker_tsx_e936_${idx}`}>
                <CsvComparison
                  analysis={analysis}
                  orders={imp.orders}
                  currency={currency}
                  data-icod-id={`src_pages_profittracker_tsx_1f10_${idx}`} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => handleDeleteCsvImport(idx)}
                  title={t('Delete')}
                  data-icod-id={`src_pages_profittracker_tsx_c6d9_${idx}`}>
                  <Trash2
                    className="h-4 w-4 text-destructive"
                    data-icod-id={`src_pages_profittracker_tsx_2c84_${idx}`} />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
