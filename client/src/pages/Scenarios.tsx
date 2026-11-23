import { useState, useEffect, useMemo } from 'react';
import {
  GitCompare,
  RotateCcw,
  TrendingUp,
  DollarSign,
  Target,
  AlertCircle,
  ArrowLeft,
  Info,
  Truck,
  Save,
  Download,
} from 'lucide-react';
import { Button, Card, Field, Input, Alert, Modal, type CardVariant } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, formatMultiplier, convertAmount, DEFAULT_CURRENCY, roundTwo } from '@/utils/currency';
import {
  calculateSimulation,
  getProfitColor,
  type SimulationInputs,
  type SimulationResults,
} from '@/utils/calculations';
import type { PageId } from '@/components/Sidebar';
import { STORAGE_KEYS, scopedGetItem, scopedSetItem } from '@/utils/scopedStorage';
import { useAppSelector } from '@/store/hooks';
import {
  DEFAULT_COURIER_RATES,
  COURIER_IDS,
  ZONE_LABELS,
  calculateDeliveryCost,
  calculateAllCouriers,
  type CourierId,
  type Zone,
  type CourierRatesConfig,
} from '@/utils/courierEngine';
import { useTranslation } from '@/utils/i18n';
import { saveScenarioAnalysis, exportScenariosToHtml } from '@/utils/saveExport';
import type { SavedScenarioAnalysis } from '@/types';

interface ScenariosProps {
  currency: string;
  simulatorInputs: SimulationInputs;
  onNavigate: (page: PageId) => void;
}

interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  advertisingBudget: number;
  expectedOrders: number;
  deliverySuccessRate: number;
  accentColor: 'indigo' | 'violet' | 'coral' | 'custom';
  cardVariant?: CardVariant;
  isCustom?: boolean;
}

const DEFAULT_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: 'Lower-bound estimates with cautious assumptions',
    advertisingBudget: 8000,
    expectedOrders: 12,
    deliverySuccessRate: 75,
    accentColor: 'indigo',
    cardVariant: 'mint',
  },
  {
    id: 'expected',
    name: 'Expected',
    description: 'Most likely outcome based on realistic targets',
    advertisingBudget: 12000,
    expectedOrders: 20,
    deliverySuccessRate: 75,
    accentColor: 'violet',
    cardVariant: 'lavender',
  },
  {
    id: 'optimistic',
    name: 'Optimistic',
    description: 'Best-case scenario with strong market fit',
    advertisingBudget: 18000,
    expectedOrders: 35,
    deliverySuccessRate: 75,
    accentColor: 'coral',
    cardVariant: 'cream',
  },
  {
    id: 'custom',
    name: 'Custom Scenario',
    description: 'Enter your own budget and order targets',
    advertisingBudget: 15000,
    expectedOrders: 25,
    deliverySuccessRate: 75,
    accentColor: 'custom',
    cardVariant: 'default',
    isCustom: true,
  },
];

const accentStyles: Record<string, { border: string; bg: string; text: string; bar: string }> = {
  indigo: {
    border: 'border-l-[#171717]',
    bg: 'bg-[#171717]/10',
    text: 'text-[#171717]',
    bar: 'bg-[#171717]',
  },
  violet: {
    border: 'border-l-[#C9D0FC]',
    bg: 'bg-[#C9D0FC]/10',
    text: 'text-[#C9D0FC]',
    bar: 'bg-[#C9D0FC]',
  },
  coral: {
    border: 'border-l-[#E88B9E]',
    bg: 'bg-[#E88B9E]/10',
    text: 'text-[#E88B9E]',
    bar: 'bg-[#E88B9E]',
  },
  custom: {
    border: 'border-l-accent-foreground',
    bg: 'bg-accent/10',
    text: 'text-accent-foreground',
    bar: 'bg-accent-foreground',
  },
};

export default function Scenarios({ currency, simulatorInputs, onNavigate }: ScenariosProps) {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const { t } = useTranslation();

  // Initialize scenarios from defaults; user-scoped data is loaded via useEffect
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>(DEFAULT_SCENARIOS);

  // ─── Courier comparison state ──────────────────────────────────────────
  const [courierZone, setCourierZone] = useState<Zone>('within-city');
  const [ratesConfig] = useState<CourierRatesConfig>(DEFAULT_COURIER_RATES);

  // Load user-scoped scenarios on mount / when userId changes
  useEffect(() => {
    if (!userId) return;
    const loaded = scopedGetItem<ScenarioConfig[]>(STORAGE_KEYS.SCENARIOS, userId, DEFAULT_SCENARIOS);
    // Migration: ensure deliverySuccessRate exists on all scenarios (stale data may lack it)
    const migrated = loaded.map((s) => ({
      ...s,
      deliverySuccessRate: s.deliverySuccessRate ?? 75,
    }));
    // Ensure custom scenario always exists (migration for stale data)
    const hasCustom = migrated.some((s) => s.id === 'custom');
    if (!hasCustom) {
      const customScenario = DEFAULT_SCENARIOS.find((s) => s.id === 'custom');
      if (customScenario) {
        setScenarios([...migrated, customScenario]);
        return;
      }
    }
    setScenarios(migrated);
  }, [userId]);

  // Persist scenarios to scoped localStorage
  useEffect(() => {
    scopedSetItem(STORAGE_KEYS.SCENARIOS, userId, scenarios);
  }, [scenarios, userId]);

  // Calculate results for each scenario by merging shared inputs with scenario-specific values
  const scenarioResults = useMemo(() => {
    return scenarios.map((scenario) => {
      const mergedInputs: SimulationInputs = {
        ...simulatorInputs,
        advertisingBudget: scenario.advertisingBudget,
        expectedOrders: scenario.expectedOrders,
        deliverySuccessRate: scenario.deliverySuccessRate,
      };
      return {
        config: scenario,
        results: calculateSimulation(mergedInputs),
      };
    });
  }, [scenarios, simulatorInputs]);

  // Find the scenario with highest profit (only when valid)
  const bestScenarioIndex = useMemo(() => {
    let bestIndex = -1;
    let bestProfit = -Infinity;
    scenarioResults.forEach((sr, index) => {
      if (sr.results.isValid && sr.results.campaignProfitLoss > bestProfit) {
        bestProfit = sr.results.campaignProfitLoss;
        bestIndex = index;
      }
    });
    return bestIndex;
  }, [scenarioResults]);

  // Handle scenario input change — converts from display currency back to PKR for storage
  const handleScenarioChange = (
    scenarioId: string,
    field: 'advertisingBudget' | 'expectedOrders' | 'deliverySuccessRate',
    value: string
  ) => {
    const rawValue = parseFloat(value);
    if (isNaN(rawValue) || rawValue < 0) return;

    // Use roundTwo (exponential-notation trick) to avoid IEEE 754 float64
    // multiplication artefacts.
    const numericValue = roundTwo(rawValue);

    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id !== scenarioId) return s;
        if (field === 'advertisingBudget') {
          // Convert from display currency to PKR for internal storage, then round
          const pkrValue = roundTwo(convertAmount(numericValue, currency, DEFAULT_CURRENCY));
          return { ...s, advertisingBudget: pkrValue };
        }
        if (field === 'deliverySuccessRate') {
          return { ...s, deliverySuccessRate: Math.min(100, Math.max(0, numericValue)) };
        }
        return { ...s, [field]: Math.round(numericValue) };
      })
    );
  };

  // Reset scenarios to defaults
  const handleReset = () => {
    setScenarios(DEFAULT_SCENARIOS);
  };

  // ─── Save & Export state ──────────────────────────────────────────────
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleSaveScenarios = () => {
    if (!saveName.trim()) return;

    const analysis: SavedScenarioAnalysis = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: saveName.trim(),
      productName: simulatorInputs.productName || 'Untitled',
      createdAt: new Date().toISOString(),
      currency,
      scenarios: scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        advertisingBudget: s.advertisingBudget,
        expectedOrders: s.expectedOrders,
        deliverySuccessRate: s.deliverySuccessRate,
      })),
      results: scenarioResults.map((sr) => ({
        scenarioName: sr.config.name,
        revenue: sr.results.revenue,
        variableCosts: sr.results.variableCosts,
        contributionBeforeAdvertising: sr.results.contributionBeforeAdvertising,
        campaignProfitLoss: sr.results.campaignProfitLoss,
        roas: sr.results.roas,
        breakEvenRoas: sr.results.breakEvenRoas,
        breakEvenOrders: sr.results.breakEvenOrders,
      })),
      simulatorInputs: {
        sellingPrice: simulatorInputs.sellingPrice,
        productCost: simulatorInputs.productCost,
        deliveryCost: simulatorInputs.deliveryCost,
        rtoShippingCost: simulatorInputs.rtoShippingCost ?? 200,
        otherVariableCosts: simulatorInputs.otherVariableCosts,
      },
    };

    saveScenarioAnalysis(analysis, userId);
    setSaveName('');
    setShowSaveModal(false);
  };

  const handleExportScenarios = () => {
    try {
      const analysis: SavedScenarioAnalysis = {
        id: `${Date.now()}`,
        name: simulatorInputs.productName || 'Scenario Comparison',
        productName: simulatorInputs.productName || 'Untitled',
        createdAt: new Date().toISOString(),
        currency,
        scenarios: scenarios.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          advertisingBudget: s.advertisingBudget,
          expectedOrders: s.expectedOrders,
          deliverySuccessRate: s.deliverySuccessRate,
        })),
        results: scenarioResults.map((sr) => ({
          scenarioName: sr.config.name,
          revenue: sr.results.revenue,
          variableCosts: sr.results.variableCosts,
          contributionBeforeAdvertising: sr.results.contributionBeforeAdvertising,
          campaignProfitLoss: sr.results.campaignProfitLoss,
          roas: sr.results.roas,
          breakEvenRoas: sr.results.breakEvenRoas,
          breakEvenOrders: sr.results.breakEvenOrders,
        })),
        simulatorInputs: {
          sellingPrice: simulatorInputs.sellingPrice,
          productCost: simulatorInputs.productCost,
          deliveryCost: simulatorInputs.deliveryCost,
          rtoShippingCost: simulatorInputs.rtoShippingCost ?? 200,
          otherVariableCosts: simulatorInputs.otherVariableCosts,
        },
      };
      exportScenariosToHtml(analysis, currency);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Export failed: ' + message);
    }
  };

  // Get max revenue for chart scaling
  const maxRevenue = Math.max(...scenarioResults.map((sr) => sr.results.revenue), 1);
  const maxAdSpend = Math.max(...scenarioResults.map((sr) => sr.config.advertisingBudget), 1);
  const maxAbsProfit = Math.max(
    ...scenarioResults.map((sr) => Math.abs(sr.results.campaignProfitLoss)),
    1
  );

  return (
    <div
      className="space-y-6"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_scenarios_tsx_cd70">
      {/* Page Header */}
      <div className="space-y-2" data-icod-id="src_pages_scenarios_tsx_ad7c">
        <div className="flex items-center gap-4" data-icod-id="src_pages_scenarios_tsx_header_row">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('overview')}
            data-icod-id="src_pages_scenarios_tsx_back_btn">
            <ArrowLeft className="h-5 w-5" data-icod-id="src_pages_scenarios_tsx_back_icon" />
          </Button>
          <div data-icod-id="src_pages_scenarios_tsx_header_text">
            <h1
              className="text-3xl font-bold text-[#171717]"
              data-icod-id="src_pages_scenarios_tsx_9ade">
              {t('Scenario Comparison')}
            </h1>
            <p
              className="text-muted-foreground"
              data-icod-id="src_pages_scenarios_tsx_91b8">
              {t('Compare different launch scenarios using hypothetical assumptions.')}
            </p>
          </div>
        </div>
      </div>
      {/* Disclaimer */}
      <Alert variant="info" data-icod-id="src_pages_scenarios_tsx_disclaimer">
        <div className="flex items-start gap-2" data-icod-id="src_pages_scenarios_tsx_disclaimer_content">
          <Info className="h-4 w-4 shrink-0 mt-0.5" data-icod-id="src_pages_scenarios_tsx_info_icon" />
          <span data-icod-id="src_pages_scenarios_tsx_disclaimer_text">
            All scenarios use illustrative assumptions based on your product economics from the Launch Simulator. Results are hypothetical projections only.
          </span>
        </div>
      </Alert>
      {/* Action Bar */}
      <div className="flex justify-end gap-2" data-icod-id="src_pages_scenarios_tsx_actions">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportScenarios}
          className="gap-2"
          data-icod-id="src_pages_scenarios_tsx_export_btn">
          <Download className="h-4 w-4" data-icod-id="src_pages_scenarios_tsx_export_icon" />
          {t('Export Scenarios')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowSaveModal(true)}
          className="gap-2"
          data-icod-id="src_pages_scenarios_tsx_save_btn">
          <Save className="h-4 w-4" data-icod-id="src_pages_scenarios_tsx_save_icon" />
          {t('Save Scenarios')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
          data-icod-id="src_pages_scenarios_tsx_reset_btn">
          <RotateCcw className="h-4 w-4" data-icod-id="src_pages_scenarios_tsx_reset_icon" />
          {t('Reset Scenarios')}
        </Button>
      </div>
      {/* Scenario Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4" data-icod-id="src_pages_scenarios_tsx_cards_grid">
        {scenarioResults.map(({ config, results }, index) => {
          const styles = accentStyles[config.accentColor];
          const isBest = index === bestScenarioIndex;
          const profitColor = getProfitColor(results.campaignProfitLoss);

          return (
            <Card
              key={config.id}
              variant={config.cardVariant || 'default'}
              className={cn(
                'relative overflow-hidden border-l-4 p-6 transition-all duration-200',
                styles.border,
                isBest && 'ring-2 ring-[#9DD37D] shadow-lg'
              )}
              data-icod-id={`src_pages_scenarios_tsx_card_${config.id}`}>
              {/* Best indicator */}
              {isBest && (
                <div
                  className="absolute right-3 top-3 rounded-full bg-[#9DD37D] px-2 py-0.5 text-[10px] font-bold text-[#171717]"
                  data-icod-id={`src_pages_scenarios_tsx_best_badge_${config.id}`}>
                  Highest Profit
                </div>
              )}
              {/* Header */}
              <div className="mb-4 flex items-center gap-3" data-icod-id={`src_pages_scenarios_tsx_card_header_${config.id}`}>
                <div
                  className={cn('rounded-lg p-2', styles.bg)}
                  data-icod-id={`src_pages_scenarios_tsx_card_icon_wrap_${config.id}`}>
                  <Target
                    className={cn('h-5 w-5', styles.text)}
                    data-icod-id={`src_pages_scenarios_tsx_card_icon_${config.id}`} />
                </div>
                <div data-icod-id={`src_pages_scenarios_tsx_card_title_wrap_${config.id}`}>
                  <h3
                    className="text-lg font-semibold text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_card_name_${config.id}`}>
                    {config.name}
                  </h3>
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_card_desc_${config.id}`}>
                    {config.description}
                  </p>
                </div>
              </div>
              {/* Editable Inputs */}
              <div className="mb-4 space-y-3 rounded-lg bg-muted/30 p-3" data-icod-id={`src_pages_scenarios_tsx_inputs_${config.id}`}>
                <Field
                  label={`Ad Budget (${currency})`}
                  htmlFor={`ad-${config.id}`}
                  data-icod-id={`src_pages_scenarios_tsx_field_ad_${config.id}`}>
                  <Input
                    id={`ad-${config.id}`}
                    type="number"
                    min="0"
                    step="100"
                    value={roundTwo(convertAmount(config.advertisingBudget, DEFAULT_CURRENCY, currency))}
                    onChange={(e) => handleScenarioChange(config.id, 'advertisingBudget', e.target.value)}
                    data-icod-id={`src_pages_scenarios_tsx_input_ad_${config.id}`} />
                </Field>
                <Field
                  label="Expected Orders"
                  htmlFor={`orders-${config.id}`}
                  data-icod-id={`src_pages_scenarios_tsx_field_orders_${config.id}`}>
                  <Input
                    id={`orders-${config.id}`}
                    type="number"
                    min="0"
                    step="1"
                    value={config.expectedOrders}
                    onChange={(e) => handleScenarioChange(config.id, 'expectedOrders', e.target.value)}
                    data-icod-id={`src_pages_scenarios_tsx_input_orders_${config.id}`} />
                </Field>
                <Field
                  label="Delivery Rate (%)"
                  htmlFor={`delivery-${config.id}`}
                  data-icod-id={`src_pages_scenarios_tsx_field_delivery_${config.id}`}>
                  <Input
                    id={`delivery-${config.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={config.deliverySuccessRate}
                    onChange={(e) => handleScenarioChange(config.id, 'deliverySuccessRate', e.target.value)}
                    data-icod-id={`src_pages_scenarios_tsx_input_delivery_${config.id}`} />
                </Field>
              </div>
              {/* Calculated Metrics */}
              <div className="space-y-2" data-icod-id={`src_pages_scenarios_tsx_metrics_${config.id}`}>
                <div className="flex justify-between text-sm" data-icod-id={`src_pages_scenarios_tsx_metric_revenue_${config.id}`}>
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_ac1d_${config.id}`}>Revenue:</span>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_951e_${config.id}`}>
                    {formatCurrency(results.revenue, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-icod-id={`src_pages_scenarios_tsx_metric_variable_${config.id}`}>
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_684e_${config.id}`}>Variable Costs:</span>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_96fc_${config.id}`}>
                    {formatCurrency(results.variableCosts, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-icod-id={`src_pages_scenarios_tsx_metric_contribution_${config.id}`}>
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_589b_${config.id}`}>Contribution Before Ad:</span>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_f3b5_${config.id}`}>
                    {formatCurrency(results.contributionBeforeAdvertising, currency)}
                  </span>
                </div>
                <div
                  className={cn(
                    'flex justify-between rounded-md px-2 py-1.5 text-sm font-semibold',
                    profitColor === 'green' ? 'bg-[#9DD37D]/30 text-[#9DD37D]' : profitColor === 'coral' ? 'bg-[#E88B9E]/20 text-[#E88B9E]' : 'bg-muted text-foreground'
                  )}
                  data-icod-id={`src_pages_scenarios_tsx_metric_profit_${config.id}`}>
                  <span data-icod-id={`src_pages_scenarios_tsx_6fd3_${config.id}`}>Profit/Loss:</span>
                  <span data-icod-id={`src_pages_scenarios_tsx_fa21_${config.id}`}>{formatCurrency(results.campaignProfitLoss, currency)}</span>
                </div>
                <div className="flex justify-between text-sm" data-icod-id={`src_pages_scenarios_tsx_metric_roas_${config.id}`}>
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_6047_${config.id}`}>ROAS:</span>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_0049_${config.id}`}>
                    {results.roas !== null ? formatMultiplier(results.roas) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-icod-id={`src_pages_scenarios_tsx_metric_breakevenroas_${config.id}`}>
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_be_roas_label_${config.id}`}>Break-Even ROAS:</span>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_be_roas_value_${config.id}`}>
                    {results.breakEvenRoas !== null ? formatMultiplier(results.breakEvenRoas) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-icod-id={`src_pages_scenarios_tsx_metric_breakeven_${config.id}`}>
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_9fc2_${config.id}`}>Break-even Orders:</span>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_7d3e_${config.id}`}>
                    {results.breakEvenOrders !== null ? results.breakEvenOrders : 'N/A'}
                  </span>
                </div>
              </div>
              {/* Hypothetical label */}
              <p
                className="mt-3 text-center text-[10px] italic text-muted-foreground"
                data-icod-id={`src_pages_scenarios_tsx_hypothetical_${config.id}`}>
                * Hypothetical / illustrative assumptions
              </p>
            </Card>
          );
        })}
      </div>
      {/* Comparison Table */}
      <Card variant="cream" className="overflow-hidden p-0" data-icod-id="src_pages_scenarios_tsx_table_card">
        <div className="p-6 pb-4" data-icod-id="src_pages_scenarios_tsx_table_header">
          <h2 className="text-xl font-semibold text-foreground" data-icod-id="src_pages_scenarios_tsx_table_title">
            {t('Side-by-Side Comparison')}
          </h2>
        </div>
        <div className="overflow-x-auto" data-icod-id="src_pages_scenarios_tsx_table_wrapper">
          <table className="w-full text-sm" data-icod-id="src_pages_scenarios_tsx_table">
            <thead data-icod-id="src_pages_scenarios_tsx_thead">
              <tr className="border-b border-border bg-muted/50" data-icod-id="src_pages_scenarios_tsx_thead_row">
                <th className="px-6 py-3 text-left font-semibold text-foreground" data-icod-id="src_pages_scenarios_tsx_th_metric">{t('Metric')}</th>
                {scenarioResults.map(({ config }) => (
                  <th
                    key={config.id}
                    className={cn('px-4 py-3 text-right font-semibold text-foreground', config.isCustom && 'bg-accent/5')}
                    data-icod-id={`src_pages_scenarios_tsx_th_${config.id}`}>
                    {config.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody data-icod-id="src_pages_scenarios_tsx_tbody">
              {[
                { label: 'Ad Budget', key: 'advertisingBudget', format: (v: number | null) => formatCurrency(v as number, currency) },
                { label: 'Expected Orders', key: 'expectedOrders', format: (v: number | null) => (v as number).toString() },
                { label: 'Revenue', key: 'revenue', format: (v: number | null) => formatCurrency(v as number, currency) },
                { label: 'Variable Costs', key: 'variableCosts', format: (v: number | null) => formatCurrency(v as number, currency) },
                { label: 'Contribution Before Advertising', key: 'contributionBeforeAdvertising', format: (v: number | null) => formatCurrency(v as number, currency) },
                { label: 'Campaign Profit/Loss', key: 'campaignProfitLoss', format: (v: number | null) => formatCurrency(v as number, currency), highlight: true },
                { label: 'ROAS', key: 'roas', format: (v: number | null) => v !== null ? formatMultiplier(v) : 'N/A' },
                { label: 'Break-Even ROAS', key: 'breakEvenRoas', format: (v: number | null) => v !== null ? formatMultiplier(v) : 'N/A' },
                { label: 'Break-even Orders', key: 'breakEvenOrders', format: (v: number | null) => v !== null ? v.toString() : 'N/A' },
              ].map((row, rowIndex) => (
                <tr
                  key={row.key}
                  className={cn(
                    'border-b border-border/50 transition-colors hover:bg-muted/30',
                    rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/10'
                  )}
                  data-icod-id={`src_pages_scenarios_tsx_row_${row.key}`}>
                  <td className="px-6 py-3 font-medium text-foreground" data-icod-id={`src_pages_scenarios_tsx_td_label_${row.key}`}>
                    {row.label}
                  </td>
                  {scenarioResults.map(({ config, results }) => {
                    const value = row.key === 'advertisingBudget' || row.key === 'expectedOrders'
                      ? config[row.key as keyof ScenarioConfig] as number
                      : results[row.key as keyof SimulationResults] as number | null;
                    const formattedValue = row.format(value);
                    const profitColor = row.highlight && typeof value === 'number' ? getProfitColor(value) : null;

                    return (
                      <td
                        key={`${row.key}-${config.id}`}
                        className={cn(
                          'px-6 py-3 text-right font-semibold',
profitColor === 'green' ? 'text-[#9DD37D]' : profitColor === 'coral' ? 'text-[#E88B9E]' : 'text-foreground'
                        )}
                        data-icod-id={`src_pages_scenarios_tsx_td_${row.key}_${config.id}`}>
                        {formattedValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* CSS Bar Chart */}
      <Card variant="mint" className="p-6" data-icod-id="src_pages_scenarios_tsx_chart_card">
        <h2 className="mb-6 text-xl font-semibold text-foreground" data-icod-id="src_pages_scenarios_tsx_chart_title">
          {t('Visual Comparison')}
        </h2>

        {/* Revenue Bars */}
        <div className="mb-6 space-y-3" data-icod-id="src_pages_scenarios_tsx_chart_revenue">
          <h3 className="text-sm font-medium text-muted-foreground" data-icod-id="src_pages_scenarios_tsx_chart_revenue_label">
            Revenue
          </h3>
          {scenarioResults.map(({ config, results }, __icodIdx0) => {
            const styles = accentStyles[config.accentColor];
            const percentage = maxRevenue > 0 ? (results.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={`rev-${config.id}`} className="space-y-1" data-icod-id={`src_pages_scenarios_tsx_bar_rev_${config.id}`}>
                <div className="flex justify-between text-xs" data-icod-id={`src_pages_scenarios_tsx_bar_rev_label_${config.id}`}>
                  <span
                    className="font-medium text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_171b_${__icodIdx0}`}>{config.name}</span>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_f7f1_${__icodIdx0}`}>{formatCurrency(results.revenue, currency)}</span>
                </div>
                <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted" data-icod-id={`src_pages_scenarios_tsx_bar_rev_track_${config.id}`}>
                  <div
                    className={cn('h-full transition-all duration-500', styles.bar)}
                    style={{ width: `${percentage}%` }}
                    data-icod-id={`src_pages_scenarios_tsx_bar_rev_fill_${config.id}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Ad Spend Bars */}
        <div className="mb-6 space-y-3" data-icod-id="src_pages_scenarios_tsx_chart_adspend">
          <h3 className="text-sm font-medium text-muted-foreground" data-icod-id="src_pages_scenarios_tsx_chart_adspend_label">
            Ad Spend
          </h3>
          {scenarioResults.map(({ config }, __icodIdx1) => {
            const styles = accentStyles[config.accentColor];
            const percentage = maxAdSpend > 0 ? (config.advertisingBudget / maxAdSpend) * 100 : 0;
            return (
              <div key={`ad-${config.id}`} className="space-y-1" data-icod-id={`src_pages_scenarios_tsx_bar_ad_${config.id}`}>
                <div className="flex justify-between text-xs" data-icod-id={`src_pages_scenarios_tsx_bar_ad_label_${config.id}`}>
                  <span
                    className="font-medium text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_0097_${__icodIdx1}`}>{config.name}</span>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_d648_${__icodIdx1}`}>{formatCurrency(config.advertisingBudget, currency)}</span>
                </div>
                <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted" data-icod-id={`src_pages_scenarios_tsx_bar_ad_track_${config.id}`}>
                  <div
                    className={cn('h-full transition-all duration-500', styles.bar)}
                    style={{ width: `${percentage}%`, opacity: 0.6 }}
                    data-icod-id={`src_pages_scenarios_tsx_bar_ad_fill_${config.id}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Profit/Loss Bars */}
        <div className="space-y-3" data-icod-id="src_pages_scenarios_tsx_chart_profit">
          <h3 className="text-sm font-medium text-muted-foreground" data-icod-id="src_pages_scenarios_tsx_chart_profit_label">
            Profit / Loss
          </h3>
          {scenarioResults.map(({ config, results }, __icodIdx2) => {
            const profitColor = getProfitColor(results.campaignProfitLoss);
            const absValue = Math.abs(results.campaignProfitLoss);
            const percentage = maxAbsProfit > 0 ? (absValue / maxAbsProfit) * 100 : 0;
            const barColor = profitColor === 'green' ? 'bg-[#9DD37D]' : profitColor === 'coral' ? 'bg-[#E88B9E]' : 'bg-muted-foreground';

            return (
              <div key={`profit-${config.id}`} className="space-y-1" data-icod-id={`src_pages_scenarios_tsx_bar_profit_${config.id}`}>
                <div className="flex justify-between text-xs" data-icod-id={`src_pages_scenarios_tsx_bar_profit_label_${config.id}`}>
                  <span
                    className="font-medium text-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_0329_${__icodIdx2}`}>{config.name}</span>
                  <span
                    className={cn('font-semibold', profitColor === 'green' ? 'text-[#9DD37D]' : profitColor === 'coral' ? 'text-[#E88B9E]' : 'text-foreground')}
                    data-icod-id={`src_pages_scenarios_tsx_7c61_${__icodIdx2}`}>
                    {formatCurrency(results.campaignProfitLoss, currency)}
                  </span>
                </div>
                <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted" data-icod-id={`src_pages_scenarios_tsx_bar_profit_track_${config.id}`}>
                  <div
                    className={cn('h-full transition-all duration-500', barColor)}
                    style={{ width: `${percentage}%` }}
                    data-icod-id={`src_pages_scenarios_tsx_bar_profit_fill_${config.id}`} />
                </div>
              </div>
            );
          })}
        </div>

        <p
          className="mt-6 text-center text-xs italic text-muted-foreground"
          data-icod-id="src_pages_scenarios_tsx_chart_disclaimer">
          Values shown are hypothetical projections based on illustrative assumptions — not actual results
        </p>
      </Card>
      {/* Courier Comparison Across Scenarios */}
      <Card className="p-6" data-icod-id="src_pages_scenarios_tsx_courier_comparison">
        <div
          className="mb-4 flex items-center justify-between"
          data-icod-id="src_pages_scenarios_tsx_bd16">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_scenarios_tsx_6441">
            <Truck
              className="h-5 w-5 text-muted-foreground"
              data-icod-id="src_pages_scenarios_tsx_1e29" />
            <h2
              className="text-xl font-semibold text-foreground"
              data-icod-id="src_pages_scenarios_tsx_bddd">{t('Courier Cost by Scenario')}</h2>
          </div>
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_scenarios_tsx_45cf">
            <label
              className="text-xs text-muted-foreground"
              data-icod-id="src_pages_scenarios_tsx_da95">Zone:</label>
            <select
              value={courierZone}
              onChange={(e) => setCourierZone(e.target.value as Zone)}
              className="rounded border border-border/60 bg-background px-2 py-1 text-xs text-foreground focus:border-ring focus:outline-none"
              data-icod-id="src_pages_scenarios_tsx_d31b">
              {(Object.entries(ZONE_LABELS) as [Zone, string][]).map(([val, label]) => (
                <option
                  key={val}
                  value={val}
                  data-icod-id={`src_pages_scenarios_tsx_b95a_${val}`}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <p
          className="mb-4 text-xs text-muted-foreground"
          data-icod-id="src_pages_scenarios_tsx_46ac">
          Compare how TCS vs Leopards vs M&P affects each scenario. 1kg parcel, indicative rates (Nov 2026).
        </p>
        <div className="overflow-x-auto" data-icod-id="src_pages_scenarios_tsx_e1c4">
          <table className="w-full text-sm" data-icod-id="src_pages_scenarios_tsx_7a6c">
            <thead data-icod-id="src_pages_scenarios_tsx_0e76">
              <tr
                className="border-b border-border/40"
                data-icod-id="src_pages_scenarios_tsx_2d8b">
                <th
                  className="pb-2 pr-4 text-left font-medium text-muted-foreground"
                  data-icod-id="src_pages_scenarios_tsx_d103">Scenario</th>
                {COURIER_IDS.map((cid) => (
                  <th
                    key={cid}
                    className="pb-2 text-right font-medium text-muted-foreground"
                    data-icod-id={`src_pages_scenarios_tsx_747a_${cid}`}>
                    {ratesConfig.couriers[cid].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody data-icod-id="src_pages_scenarios_tsx_a1d2">
              {scenarioResults.map(({ config, results }) => {
                const mergedInputs = {
                  ...simulatorInputs,
                  advertisingBudget: config.advertisingBudget,
                  expectedOrders: config.expectedOrders,
                  deliverySuccessRate: config.deliverySuccessRate,
                };
                const courierResults = calculateAllCouriers(
                  1,
                  courierZone,
                  mergedInputs.sellingPrice,
                  mergedInputs.deliverySuccessRate,
                  mergedInputs.advertisingBudget,
                  ratesConfig,
                  mergedInputs.rtoShippingCost,
                  mergedInputs.productCost,
                  mergedInputs.otherVariableCosts
                );
                return (
                  <tr
                    key={config.id}
                    className="border-b border-border/20"
                    data-icod-id={`src_pages_scenarios_tsx_db68_${config.id}`}>
                    <td
                      className="py-2 pr-4 font-medium text-foreground"
                      data-icod-id={`src_pages_scenarios_tsx_cb3f_${config.id}`}>{config.name}</td>
                    {courierResults.map((cr) => (
                      <td
                        key={cr.courierId}
                        className="py-2 text-right tabular-nums text-foreground"
                        data-icod-id={`src_pages_scenarios_tsx_e66b_${config.id}_${cr.courierId}`}>
                        <span
                          data-icod-id={`src_pages_scenarios_tsx_3665_${config.id}_${cr.courierId}`}>{formatCurrency(cr.totalCostPerPlacedOrder, currency)}</span>
                        <span
                          className="ml-1 text-[10px] text-muted-foreground"
                          data-icod-id={`src_pages_scenarios_tsx_fbc5_${config.id}_${cr.courierId}`}>
                          ({cr.breakEvenRoas !== null ? `${cr.breakEvenRoas.toFixed(2)}x` : 'N/A'})
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p
          className="mt-2 text-[10px] text-muted-foreground"
          data-icod-id="src_pages_scenarios_tsx_bee5">
          Values in parentheses show break-even ROAS per courier for each scenario
        </p>
      </Card>
      {/* Save Scenarios Modal */}
      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title={t('Save Scenarios')}
        footer={
          <div className="flex gap-2" data-icod-id="src_pages_scenarios_tsx_save_modal_footer">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveModal(false)}
              data-icod-id="src_pages_scenarios_tsx_save_cancel">
              {t('Cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveScenarios}
              disabled={!saveName.trim()}
              data-icod-id="src_pages_scenarios_tsx_save_confirm">
              {t('Save')}
            </Button>
          </div>
        }
        data-icod-id="src_pages_scenarios_tsx_save_modal">
        <div className="space-y-3" data-icod-id="src_pages_scenarios_tsx_save_modal_body">
          <Field
            label={t('Scenario Name')}
            htmlFor="scenario-save-name"
            data-icod-id="src_pages_scenarios_tsx_save_name_field">
            <Input
              id="scenario-save-name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={simulatorInputs.productName || 'e.g. Skincare Serum - Q1 Scenarios'}
              autoFocus
              data-icod-id="src_pages_scenarios_tsx_save_name_input" />
          </Field>
          <p className="text-xs text-muted-foreground" data-icod-id="src_pages_scenarios_tsx_save_hint">
            This will save all {scenarios.length} scenarios with their current figures to Saved Analyses.
          </p>
        </div>
      </Modal>
    </div>
  );
}
