import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Save,
  Trash2,
  FolderOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowRightLeft,
  Info,
  Plus,
  Play,
  Printer,
  Download,
  Share2,
  Lock,
  MessageCircle,
} from 'lucide-react';
import { Card, Button, Input, Field, Alert, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/utils/i18n';
import { formatCurrency as formatCurrencyGlobal, convertAmount, DEFAULT_CURRENCY, getExchangeRateLabel, roundTwo } from '@/utils/currency';
import type {
  CodProductInputs,
  CodCalculations,
  LaunchDecisionResult,
  CodScenario,
  CodScenarioResult,
  ActualCampaignResults,
  PredictionVsActual,
  SavedCodAnalysis,
} from '@/types';
import { exportDecisionEngineToPdf, generateDecisionEngineWhatsAppSummary, shareOnWhatsApp } from '@/utils/saveExport';
import { STORAGE_KEYS, scopedGetItem, scopedSetItem } from '@/utils/scopedStorage';
import { useAppSelector } from '@/store/hooks';
import ProductSwitcher from '@/components/ProductSwitcher';
import { usePlanGating } from '@/hooks/usePlanGating';
import UpgradePrompt from '@/components/UpgradePrompt';
import {
  DEFAULT_COURIER_RATES,
  COURIER_IDS,
  calculateAllCouriers,
  type CourierRatesConfig,
} from '@/utils/courierEngine';
import VerdictCard from '@/components/VerdictCard';
import { useDecisionEngineVerdictShare } from '@/hooks/useVerdictShare';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Wrapper to use global formatCurrency with proper signature
function formatCurrency(amount: number, currency: string): string {
  return formatCurrencyGlobal(amount, currency);
}

// ─── Calculation Functions ────────────────────────────────────────────────

function calculateCod(inputs: CodProductInputs): CodCalculations {
  const deliveryRate = inputs.deliverySuccessRate / 100;
  const rtoRate = 1 - deliveryRate;

  // Contribution per successfully delivered order (before advertising)
  const contributionPerDeliveredOrder =
    inputs.sellingPrice - inputs.productCost - inputs.deliveryCost - inputs.packagingCost;

  // Expected contribution per placed COD order (after RTO)
  // On delivered orders: we earn the contribution
  // On RTO orders: we lose the RTO shipping cost + non-recoverable product loss
  const expectedContributionPerPlacedOrder =
    deliveryRate * contributionPerDeliveredOrder -
    rtoRate * inputs.rtoShippingCost -
    rtoRate * inputs.nonRecoverableLoss;

  // Max break-even ad cost per placed order
  const maxBreakEvenAdCostPerOrder = expectedContributionPerPlacedOrder;

  // Break-even ROAS
  // Expected revenue per placed order = deliveryRate * sellingPrice
  const expectedRevenuePerPlacedOrder = deliveryRate * inputs.sellingPrice;
  const breakEvenRoas =
    expectedContributionPerPlacedOrder > 0
      ? expectedRevenuePerPlacedOrder / expectedContributionPerPlacedOrder
      : Infinity;

  // Break-even number of placed orders
  const breakEvenOrderCount =
    expectedContributionPerPlacedOrder > 0
      ? inputs.adBudget / expectedContributionPerPlacedOrder
      : Infinity;

  // Profit at volume function
  const profitAtVolume = (volume: number): number =>
    volume * expectedContributionPerPlacedOrder - inputs.adBudget;

  return {
    contributionPerDeliveredOrder,
    expectedContributionPerPlacedOrder,
    maxBreakEvenAdCostPerOrder,
    breakEvenRoas,
    breakEvenOrderCount,
    profitAtVolume,
  };
}

function determineDecision(
  inputs: CodProductInputs,
  calcs: CodCalculations,
  currency: string
): LaunchDecisionResult {
  const reasons: string[] = [];

  // NO-GO conditions
  if (calcs.expectedContributionPerPlacedOrder <= 0) {
    reasons.push(
      `Expected contribution per order is ${formatCurrency(calcs.expectedContributionPerPlacedOrder, currency)} (negative or zero). You lose money on every order placed.`
    );
    return { decision: 'NO-GO', reasons };
  }

  if (calcs.breakEvenOrderCount === Infinity) {
    reasons.push('Break-even requires infinite orders — margins cannot cover ad spend.');
    return { decision: 'NO-GO', reasons };
  }

  if (calcs.breakEvenOrderCount > 500) {
    reasons.push(
      `Break-even requires ${Math.ceil(calcs.breakEvenOrderCount)} orders, which is unrealistic for most new launches.`
    );
    return { decision: 'NO-GO', reasons };
  }

  // TEST FIRST conditions
  const isThinMargin = calcs.expectedContributionPerPlacedOrder < inputs.sellingPrice * 0.1;
  const isHighRoas = calcs.breakEvenRoas > 3 && calcs.breakEvenRoas <= 5;
  const isLowDeliveryRate = inputs.deliverySuccessRate < 70;

  if (isThinMargin) {
    reasons.push(
      `Margins are thin: expected contribution (${formatCurrency(calcs.expectedContributionPerPlacedOrder, currency)}) is less than 10% of selling price.`
    );
  }
  if (isHighRoas) {
    reasons.push(
      `Break-even ROAS is ${calcs.breakEvenRoas.toFixed(2)}, which is high and may be difficult to achieve consistently.`
    );
  }
  if (isLowDeliveryRate) {
    reasons.push(
      `Delivery success rate is ${inputs.deliverySuccessRate}%, below the 70% threshold. High RTO erodes profits significantly.`
    );
  }

  if (reasons.length > 0) {
    return { decision: 'TEST FIRST', reasons };
  }

  // GO conditions
  if (
    calcs.expectedContributionPerPlacedOrder > 0 &&
    calcs.breakEvenRoas < 3 &&
    calcs.profitAtVolume(Math.ceil(calcs.breakEvenOrderCount * 1.5)) > 0
  ) {
    reasons.push(
      `Positive expected contribution of ${formatCurrency(calcs.expectedContributionPerPlacedOrder, currency)} per order.`
    );
    reasons.push(`Reasonable break-even ROAS of ${calcs.breakEvenRoas.toFixed(2)}.`);
    reasons.push(
      `Profit achievable at ${Math.ceil(calcs.breakEvenOrderCount * 1.5)} orders (${formatCurrency(calcs.profitAtVolume(Math.ceil(calcs.breakEvenOrderCount * 1.5)), currency)}).`
    );
    return { decision: 'GO', reasons };
  }

  // Fallback to TEST FIRST if not clearly GO
  reasons.push('Metrics are borderline. Test with a small budget before scaling.');
  return { decision: 'TEST FIRST', reasons };
}

function calculateScenarios(
  baseInputs: CodProductInputs,
  scenarios: CodScenario[]
): CodScenarioResult[] {
  return scenarios.map((scenario) => {
    const deliveryRate = scenario.deliverySuccessRate / 100;
    const rtoRate = 1 - deliveryRate;

    const contributionPerDeliveredOrder =
      baseInputs.sellingPrice -
      baseInputs.productCost -
      baseInputs.deliveryCost -
      baseInputs.packagingCost;

    const expectedContributionPerPlacedOrder =
      deliveryRate * contributionPerDeliveredOrder -
      rtoRate * baseInputs.rtoShippingCost -
      rtoRate * baseInputs.nonRecoverableLoss;

    const expectedDeliveredOrders = Math.round(scenario.expectedOrderVolume * deliveryRate);
    const expectedRtoOrders = scenario.expectedOrderVolume - expectedDeliveredOrders;
    const expectedRevenue = expectedDeliveredOrders * baseInputs.sellingPrice;
    // Use rounded delivered orders for profit to match displayed count
    const expectedProfit =
      expectedDeliveredOrders * contributionPerDeliveredOrder -
      expectedRtoOrders * (baseInputs.rtoShippingCost + baseInputs.nonRecoverableLoss) -
      scenario.adBudget;

    return {
      ...scenario,
      expectedProfit,
      expectedRevenue,
      expectedDeliveredOrders,
      expectedRtoOrders,
    };
  });
}

function comparePredictionVsActual(
  inputs: CodProductInputs,
  calcs: CodCalculations,
  actual: ActualCampaignResults,
  currency: string
): PredictionVsActual {
  // Use the tracker's own actual ad spend for the predicted profit calculation
  // so the comparison is apples-to-apples (same ad spend on both sides)
  const predictedProfit =
    actual.ordersPlaced * calcs.expectedContributionPerPlacedOrder - actual.actualAdSpend;
  const actualProfit =
    actual.actualRevenue -
    actual.actualAdSpend -
    actual.deliveredOrders * (inputs.productCost + inputs.deliveryCost + inputs.packagingCost) -
    actual.rtoOrders * (inputs.rtoShippingCost + inputs.nonRecoverableLoss) -
    actual.additionalExpenses;

  const predictedDeliveryRate = inputs.deliverySuccessRate;
  const actualDeliveryRate =
    actual.ordersPlaced > 0 ? (actual.deliveredOrders / actual.ordersPlaced) * 100 : 0;

  const mainLossSources: string[] = [];
  if (actualDeliveryRate < predictedDeliveryRate - 5) {
    mainLossSources.push(
      `Higher RTO than expected: ${actualDeliveryRate.toFixed(1)}% vs ${predictedDeliveryRate}% predicted`
    );
  }
  if (actual.actualAdSpend > inputs.adBudget * 1.1) {
    mainLossSources.push(
      `Ad overspend: ${formatCurrency(actual.actualAdSpend, currency)} vs ${formatCurrency(inputs.adBudget, currency)} budgeted`
    );
  }
  if (actual.additionalExpenses > 0) {
    mainLossSources.push(
      `Additional expenses of ${formatCurrency(actual.additionalExpenses, currency)} not in original plan`
    );
  }
  if (mainLossSources.length === 0 && actualProfit < predictedProfit) {
    mainLossSources.push('Minor variance in costs or delivery rates');
  }

  const suggestions: string[] = [];
  if (actualDeliveryRate < predictedDeliveryRate - 5) {
    suggestions.push('Investigate delivery partner performance or address quality issues causing returns.');
  }
  if (actual.actualAdSpend > inputs.adBudget * 1.1) {
    suggestions.push('Review ad targeting and creative effectiveness to reduce cost per acquisition.');
  }
  if (actualProfit > predictedProfit) {
    suggestions.push('Results exceeded expectations. Consider scaling ad budget gradually.');
  }
  if (actualProfit < 0 && predictedProfit > 0) {
    suggestions.push('Re-evaluate pricing or reduce costs before the next campaign.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Continue monitoring metrics and adjust based on trends.');
  }

  return {
    predictedProfit,
    actualProfit,
    profitDifference: actualProfit - predictedProfit,
    predictedDeliveryRate,
    actualDeliveryRate,
    deliveryRateDifference: actualDeliveryRate - predictedDeliveryRate,
    mainLossSources,
    suggestions,
  };
}

// ─── Default Inputs ──────────────────────────────────────────────────────

const DEFAULT_INPUTS: CodProductInputs = {
  id: '',
  productName: '',
  sellingPrice: 3500,
  productCost: 800,
  deliveryCost: 250,
  packagingCost: 50,
  adBudget: 15000,
  deliverySuccessRate: 75,
  rtoShippingCost: 200,
  nonRecoverableLoss: 0,
  createdAt: '',
};

const DEMO_INPUTS: CodProductInputs = {
  id: '',
  productName: 'Wireless Bluetooth Earbuds',
  sellingPrice: 2500,
  productCost: 1100,
  deliveryCost: 250,
  packagingCost: 75,
  adBudget: 15000,
  deliverySuccessRate: 75,
  rtoShippingCost: 180,
  nonRecoverableLoss: 0,
  createdAt: '',
};

const DEFAULT_SCENARIOS: CodScenario[] = [
  { label: 'Low Budget', adBudget: 10000, expectedOrderVolume: 50, deliverySuccessRate: 70 },
  { label: 'Medium Budget', adBudget: 25000, expectedOrderVolume: 150, deliverySuccessRate: 75 },
  { label: 'High Budget', adBudget: 50000, expectedOrderVolume: 350, deliverySuccessRate: 80 },
];

// ─── Component ───────────────────────────────────────────────────────────

interface LaunchDecisionEngineProps {
  currency: string;
  className?: string;
}

export default function LaunchDecisionEngine({ currency, className }: LaunchDecisionEngineProps) {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items: products, activeProductId } = useAppSelector((s) => s.products);
  const [inputs, setInputs] = useState<CodProductInputs>({ ...DEFAULT_INPUTS });
  const [scenarios, setScenarios] = useState<CodScenario[]>([...DEFAULT_SCENARIOS]);
  const [showFormulas, setShowFormulas] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedCodAnalysis[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showExportUpgradePrompt, setShowExportUpgradePrompt] = useState(false);

  // Plan gating for export reports
  const { canAccessFeature, getUpgradePrompt } = usePlanGating();
  const canExport = canAccessFeature('exportReports');
  const exportUpgradeMessage = getUpgradePrompt('exportReports');
  const [actualResults, setActualResults] = useState<ActualCampaignResults[]>([]);
  const [showActualForm, setShowActualForm] = useState(false);
  const [newActual, setNewActual] = useState<Partial<ActualCampaignResults>>({});

  // Derive active product from the shared store
  const activeProduct = useMemo(
    () => products.find((p) => p._id === activeProductId) || null,
    [products, activeProductId]
  );

  // Sync Decision Engine inputs from the active shared product whenever it changes
  useEffect(() => {
    if (!activeProduct) return;
    setInputs((prev) => ({
      ...prev,
      id: activeProduct._id,
      productName: activeProduct.name,
      sellingPrice: activeProduct.sellingPrice,
      productCost: activeProduct.productCost,
      deliveryCost: activeProduct.deliveryCost,
      packagingCost: activeProduct.otherCosts,
      adBudget: activeProduct.adBudget,
    }));
  }, [activeProduct]);

  // Load saved analyses on mount and when user changes
  useEffect(() => {
    if (!userId) return;
    setSavedAnalyses(
      scopedGetItem<SavedCodAnalysis[]>(STORAGE_KEYS.COD_ANALYSES, userId, [])
    );
    setActualResults(
      scopedGetItem<ActualCampaignResults[]>(STORAGE_KEYS.COD_ACTUAL_RESULTS, userId, [])
    );
  }, [userId]);

  // Persist saved analyses
  const persistAnalyses = useCallback((analyses: SavedCodAnalysis[]) => {
    setSavedAnalyses(analyses);
    scopedSetItem(STORAGE_KEYS.COD_ANALYSES, userId, analyses);
  }, [userId]);

  // Persist actual results
  const persistActualResults = useCallback((results: ActualCampaignResults[]) => {
    setActualResults(results);
    scopedSetItem(STORAGE_KEYS.COD_ACTUAL_RESULTS, userId, results);
  }, [userId]);

  // Calculations
  const calcs = useMemo(() => calculateCod(inputs), [inputs]);
  const decision = useMemo(() => determineDecision(inputs, calcs, currency), [inputs, calcs, currency]);
  const scenarioResults = useMemo(
    () => calculateScenarios(inputs, scenarios),
    [inputs, scenarios]
  );

  // Compute revenue and profit for verdict share from base inputs
  // Revenue ≈ deliveryRate × expectedOrders × sellingPrice (use break-even orders as proxy)
  const deRevenue = useMemo(() => {
    const deliveryRate = inputs.deliverySuccessRate / 100;
    const orderCount = calcs.breakEvenOrderCount !== Infinity && calcs.breakEvenOrderCount > 0
      ? Math.ceil(calcs.breakEvenOrderCount * 1.5)
      : 100;
    return deliveryRate * orderCount * inputs.sellingPrice;
  }, [inputs, calcs]);

  const deProfit = useMemo(() => {
    if (calcs.breakEvenOrderCount === Infinity) return 0;
    return calcs.profitAtVolume(Math.ceil(calcs.breakEvenOrderCount * 1.5));
  }, [calcs]);

  // ROAS for Decision Engine: revenue / adBudget
  const deRoas = useMemo(() => {
    if (inputs.adBudget <= 0 || deRevenue <= 0) return null;
    return deRevenue / inputs.adBudget;
  }, [deRevenue, inputs.adBudget]);

  // Verdict share — reactive to inputs/calcs changes
  const { cardData: deCardData, openWhatsApp: openDeVerdictWhatsApp } = useDecisionEngineVerdictShare({
    productName: inputs.productName,
    decision: decision.decision,
    revenue: deRevenue,
    profit: deProfit,
    roas: deRoas,
    breakEvenRoas: calcs.breakEvenRoas === Infinity ? null : calcs.breakEvenRoas,
    deliveryRate: inputs.deliverySuccessRate,
    currency,
  });

  // Monetary fields that need currency conversion (stored in PKR internally)
  const monetaryFields = new Set<string>([
    'sellingPrice', 'productCost', 'deliveryCost', 'packagingCost',
    'adBudget', 'rtoShippingCost', 'nonRecoverableLoss',
  ]);

  // Update input handler — converts monetary values from display currency to PKR
  const updateInput = (field: keyof CodProductInputs, value: number | string) => {
    if (field === 'productName' || field === 'id' || field === 'createdAt') {
      setInputs((prev) => ({ ...prev, [field]: value as string }));
      return;
    }
    if (field === 'deliverySuccessRate') {
      const rawRate = typeof value === 'string' ? parseFloat(value) : value;
      setInputs((prev) => ({ ...prev, [field]: roundTwo(rawRate) }));
      return;
    }
    // Monetary field: use roundTwo (exponential-notation trick) to avoid
    // IEEE 754 float64 multiplication artefacts.
    const rawVal = typeof value === 'string' ? parseFloat(value) : value;
    const numVal = roundTwo(rawVal);
    const pkrValue = roundTwo(convertAmount(numVal, currency, DEFAULT_CURRENCY));
    setInputs((prev) => ({ ...prev, [field]: pkrValue }));
  };

  // Demo mode handler - pre-fills form with sample data
  const handleExploreDemo = () => {
    setInputs({ ...DEMO_INPUTS });
  };

  // Print report handler
  const handlePrintReport = () => {
    window.print();
  };

  // Export to downloadable HTML report
  const handleExportReport = () => {
    try {
      const analysis: SavedCodAnalysis = {
        inputs: { ...inputs, id: inputs.id || generateId(), createdAt: inputs.createdAt || new Date().toISOString() },
        calculations: {
          contributionPerDeliveredOrder: calcs.contributionPerDeliveredOrder,
          expectedContributionPerPlacedOrder: calcs.expectedContributionPerPlacedOrder,
          maxBreakEvenAdCostPerOrder: calcs.maxBreakEvenAdCostPerOrder,
          breakEvenRoas: calcs.breakEvenRoas,
          breakEvenOrderCount: calcs.breakEvenOrderCount,
        },
        decision,
        scenarios: scenarioResults,
        actualResults: actualResults.length > 0 ? actualResults : undefined,
      };
      exportDecisionEngineToPdf(analysis, currency);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Export failed: ' + message);
    }
  };

  // WhatsApp share handler
  const handleWhatsAppShare = () => {
    const analysis: SavedCodAnalysis = {
      inputs: { ...inputs, id: inputs.id || generateId(), createdAt: inputs.createdAt || new Date().toISOString() },
      calculations: {
        contributionPerDeliveredOrder: calcs.contributionPerDeliveredOrder,
        expectedContributionPerPlacedOrder: calcs.expectedContributionPerPlacedOrder,
        maxBreakEvenAdCostPerOrder: calcs.maxBreakEvenAdCostPerOrder,
        breakEvenRoas: calcs.breakEvenRoas,
        breakEvenOrderCount: calcs.breakEvenOrderCount,
      },
      decision,
      scenarios: scenarioResults,
      actualResults: actualResults.length > 0 ? actualResults : undefined,
    };
    const text = generateDecisionEngineWhatsAppSummary(analysis, currency);
    shareOnWhatsApp(text);
  };

  // Save analysis
  const handleSave = () => {
    if (!saveName.trim()) return;
    const analysis: SavedCodAnalysis = {
      inputs: { ...inputs, productName: saveName.trim(), id: generateId(), createdAt: new Date().toISOString() },
      calculations: {
        contributionPerDeliveredOrder: calcs.contributionPerDeliveredOrder,
        expectedContributionPerPlacedOrder: calcs.expectedContributionPerPlacedOrder,
        maxBreakEvenAdCostPerOrder: calcs.maxBreakEvenAdCostPerOrder,
        breakEvenRoas: calcs.breakEvenRoas,
        breakEvenOrderCount: calcs.breakEvenOrderCount,
      },
      decision,
      scenarios: scenarioResults,
      actualResults: actualResults.length > 0 ? actualResults : undefined,
    };
    persistAnalyses([...savedAnalyses, analysis]);
    setSaveName('');
    setShowSaveModal(false);
  };

  // Load analysis
  const handleLoad = (analysis: SavedCodAnalysis) => {
    setInputs(analysis.inputs);
    if (analysis.actualResults && analysis.actualResults.length > 0) {
      persistActualResults(analysis.actualResults);
    }
    setShowSavedList(false);
  };

  // Delete analysis
  const handleDelete = (index: number) => {
    const updated = savedAnalyses.filter((_, i) => i !== index);
    persistAnalyses(updated);
  };

  // Add actual results
  const handleAddActual = () => {
    if (
      newActual.actualAdSpend == null ||
      newActual.ordersPlaced == null ||
      newActual.deliveredOrders == null ||
      newActual.actualRevenue == null
    ) {
      return;
    }
    const result: ActualCampaignResults = {
      id: generateId(),
      analysisId: inputs.id || 'current',
      dateRecorded: new Date().toISOString(),
      actualAdSpend: newActual.actualAdSpend,
      ordersPlaced: newActual.ordersPlaced,
      deliveredOrders: newActual.deliveredOrders ?? 0,
      rtoOrders: newActual.rtoOrders ?? (newActual.ordersPlaced - (newActual.deliveredOrders ?? 0)),
      actualRevenue: newActual.actualRevenue,
      additionalExpenses: newActual.additionalExpenses ?? 0,
    };
    persistActualResults([...actualResults, result]);
    setNewActual({});
    setShowActualForm(false);
  };

  // Decision badge styling
  const decisionColors = {
    GO: 'bg-[#9DD37D]/20 text-green-800 border-[#9DD37D]',
    'TEST FIRST': 'bg-[#FFF5D2] text-amber-800 border-amber-300',
    'NO-GO': 'bg-red-100 text-red-800 border-red-300',
  };

  const decisionIcons = {
    GO: CheckCircle2,
    'TEST FIRST': AlertTriangle,
    'NO-GO': XCircle,
  };

  const DecisionIcon = decisionIcons[decision.decision];

  return (
    <div className={cn('space-y-6', className)} data-icod-id="src_pages_launchdecisionengine_tsx_root">
      {/* Page Header */}
      <div className="space-y-1" data-icod-id="src_pages_launchdecisionengine_tsx_header">
        <h1
          className="text-2xl font-bold text-foreground sm:text-3xl"
          data-icod-id="src_pages_launchdecisionengine_tsx_5883">{t('Launch Decision Engine')}</h1>
        <p
          className="text-sm text-muted-foreground sm:text-base"
          data-icod-id="src_pages_launchdecisionengine_tsx_a3f8">
          {t('Know your numbers before you spend your money.')}
        </p>
      </div>
      {/* Product Switcher */}
      <div className="max-w-sm" data-icod-id="src_pages_launchdecisionengine_tsx_product_switcher">
        <ProductSwitcher data-icod-id="src_pages_launchdecisionengine_tsx_switcher" />
      </div>
      {/* Exchange rate info when using non-PKR currency */}
      {currency !== 'PKR' && (
        <p className="text-xs text-muted-foreground" data-icod-id="src_pages_launchdecisionengine_tsx_exchange_rate_label">
          {getExchangeRateLabel()}
        </p>
      )}
      {/* Demo Mode Section - hidden in print */}
      <div className="flex flex-col gap-2 print:hidden sm:flex-row sm:items-center" data-icod-id="src_pages_launchdecisionengine_tsx_demo_section">
        <Button
          onClick={handleExploreDemo}
          variant="secondary"
          size="sm"
          className="gap-1.5"
          data-icod-id="src_pages_launchdecisionengine_tsx_demo_btn">
          <Play className="h-4 w-4" data-icod-id="src_pages_launchdecisionengine_tsx_demo_icon" />
          {t('Explore Demo')}
        </Button>
        <span className="text-xs text-muted-foreground" data-icod-id="src_pages_launchdecisionengine_tsx_demo_note">
          {t('Sample data pre-filled. Edit any value and recalculate to see updated results.')}
        </span>
      </div>
      {/* Promotional Banner — Your Product's Success Predictor (Slide 2) */}
      <div className="space-y-4 print:hidden" data-icod-id="src_pages_launchdecisionengine_tsx_promo_banner_3">
        <div
          className="mx-auto max-w-full overflow-hidden rounded-2xl shadow-lg"
          style={{ maxWidth: '64rem' }}
          data-icod-id="src_pages_launchdecisionengine_tsx_9ac1">
          <img
            src="/assets/1795052680489_slide-2-1920x1080-upload.webp"
            alt="Your Product's Success Predictor"
            className="h-auto w-full max-w-full object-contain"
            loading="lazy"
            data-icod-id="src_pages_launchdecisionengine_tsx_promo_banner_3_img"
          />
        </div>
        <div className="flex justify-center" data-icod-id="src_pages_launchdecisionengine_tsx_promo_banner_3_cta">
          <Button
            onClick={() => {
              const el = document.getElementById('productName');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
              }
            }}
            size="lg"
            className="gap-2 bg-[#171717] text-white hover:bg-[#171717]/90"
            data-icod-id="src_pages_launchdecisionengine_tsx_promo_banner_3_btn">
            {t('Try Now')}
            <ArrowRightLeft className="h-5 w-5" data-icod-id="src_pages_launchdecisionengine_tsx_promo_banner_3_icon" />
          </Button>
        </div>
      </div>
      {/* Top action bar - hidden in print */}
      <div className="flex flex-wrap gap-2 print:hidden" data-icod-id="src_pages_launchdecisionengine_tsx_actions">
        <Button
          onClick={() => setShowSaveModal(true)}
          variant="primary"
          size="sm"
          className="gap-1.5"
          data-icod-id="src_pages_launchdecisionengine_tsx_63bc">
          <Save
            className="h-4 w-4"
            data-icod-id="src_pages_launchdecisionengine_tsx_cfa6" />
          {t('Save Analysis')}
        </Button>
        <Button
          onClick={() => setShowSavedList(!showSavedList)}
          variant="outline"
          size="sm"
          className="gap-1.5"
          data-icod-id="src_pages_launchdecisionengine_tsx_3468">
          <FolderOpen
            className="h-4 w-4"
            data-icod-id="src_pages_launchdecisionengine_tsx_75a8" />
          {t('Saved')} ({savedAnalyses.length})
        </Button>
        {canExport ? (
          <Button
            onClick={handleExportReport}
            variant="outline"
            size="sm"
            className="gap-1.5"
            data-icod-id="src_pages_launchdecisionengine_tsx_export_pdf_btn">
            <Download
              className="h-4 w-4"
              data-icod-id="src_pages_launchdecisionengine_tsx_export_pdf_icon" />
            {t('Export Report')}
          </Button>
        ) : (
          <div className="flex items-center gap-2" data-icod-id="src_pages_launchdecisionengine_tsx_export_locked_wrap">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-1.5 opacity-60"
              onClick={() => setShowExportUpgradePrompt(true)}
              data-icod-id="src_pages_launchdecisionengine_tsx_export_pdf_btn_locked">
              <Lock
                className="h-4 w-4"
                data-icod-id="src_pages_launchdecisionengine_tsx_export_lock_icon" />
              {t('Export Report')}
              <span className="ml-1 rounded bg-[#8B72E8]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8B72E8]" data-icod-id="src_pages_launchdecisionengine_tsx_pro_badge">Pro</span>
            </Button>
            <span className="text-xs text-muted-foreground" data-icod-id="src_pages_launchdecisionengine_tsx_export_hint">
              {t('requires Standard or Business plan')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pricing')}
              data-icod-id="src_pages_launchdecisionengine_tsx_view_plans_btn">
              {t('View Plans')}
            </Button>
          </div>
        )}
        <Button
          onClick={handleWhatsAppShare}
          variant="outline"
          size="sm"
          className="gap-1.5"
          data-icod-id="src_pages_launchdecisionengine_tsx_whatsapp_btn">
          <Share2
            className="h-4 w-4"
            data-icod-id="src_pages_launchdecisionengine_tsx_whatsapp_icon" />
          {t('Share')}
        </Button>
        <Button
          onClick={() => setShowActualForm(!showActualForm)}
          variant="secondary"
          size="sm"
          className="gap-1.5"
          data-icod-id="src_pages_launchdecisionengine_tsx_3c78">
          <ArrowRightLeft
            className="h-4 w-4"
            data-icod-id="src_pages_launchdecisionengine_tsx_fe5c" />
          {t('Track Actuals')}
        </Button>
        <Button
          onClick={handlePrintReport}
          variant="outline"
          size="sm"
          className="gap-1.5 print:hidden"
          data-icod-id="src_pages_launchdecisionengine_tsx_print_btn">
          <Printer
            className="h-4 w-4"
            data-icod-id="src_pages_launchdecisionengine_tsx_print_icon" />
          {t('Print Report')}
        </Button>
      </div>
      {/* Export gating notice when user cannot export */}
      {!canExport && showExportUpgradePrompt && (
        <div className="mt-2" data-icod-id="src_pages_launchdecisionengine_tsx_export_gated">
          <UpgradePrompt
            message={exportUpgradeMessage || t('Report exports require Standard or Business plan with confirmed payment')}
            className="w-full"
            data-icod-id="src_pages_launchdecisionengine_tsx_export_upgrade_prompt" />
        </div>
      )}
      {/* Saved analyses list - hidden in print */}
      {showSavedList && savedAnalyses.length > 0 && (
        <Card className="p-4 print:hidden" data-icod-id="src_pages_launchdecisionengine_tsx_saved_list">
          <h3
            className="mb-3 text-sm font-semibold text-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_d64a">{t('Saved Analyses')}</h3>
          <div
            className="space-y-2"
            data-icod-id="src_pages_launchdecisionengine_tsx_93ee">
            {savedAnalyses.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                data-icod-id={`src_pages_launchdecisionengine_tsx_55ff_${i}`}>
                <div
                  className="min-w-0 flex-1"
                  data-icod-id={`src_pages_launchdecisionengine_tsx_b7a5_${i}`}>
                  <p
                    className="truncate text-sm font-medium text-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_11da_${i}`}>{a.inputs.productName}</p>
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_b033_${i}`}>
                    {a.decision.decision} &middot; {new Date(a.inputs.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className="ml-2 flex gap-1"
                  data-icod-id={`src_pages_launchdecisionengine_tsx_55ec_${i}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLoad(a)}
                    data-icod-id={`src_pages_launchdecisionengine_tsx_ed3f_${i}`}>
                    <FolderOpen
                      className="h-4 w-4"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_e771_${i}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(i)}
                    data-icod-id={`src_pages_launchdecisionengine_tsx_ec40_${i}`}>
                    <Trash2
                      className="h-4 w-4 text-destructive"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_5fed_${i}`} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {showSavedList && savedAnalyses.length === 0 && (
        <Alert variant="info" className="print:hidden" data-icod-id="src_pages_launchdecisionengine_tsx_d30d">{t('No saved analyses yet. Fill in the form and save your first analysis.')}</Alert>
      )}
      {/* Section A: Product and Cost Inputs - hidden in print */}
      <Card className="p-5 print:hidden" data-icod-id="src_pages_launchdecisionengine_tsx_inputs">
        <div
          className="mb-4 flex items-center gap-2"
          data-icod-id="src_pages_launchdecisionengine_tsx_629f">
          <Calculator
            className="h-5 w-5 text-accent-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_ffd8" />
          <h2
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_7d71">{t('Product & Cost Inputs')}</h2>
        </div>

        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-icod-id="src_pages_launchdecisionengine_tsx_3fbc">
          <Field
            label={t('Product Name')}
            htmlFor="productName"
            data-icod-id="src_pages_launchdecisionengine_tsx_565d">
            <Input
              id="productName"
              value={inputs.productName}
              onChange={(e) => updateInput('productName', e.target.value)}
              placeholder={t('e.g. Wireless Earbuds Pro')}
              data-icod-id="src_pages_launchdecisionengine_tsx_cb8a" />
          </Field>

          <Field
            label={`${t('Selling Price')} (${currency})`}
            htmlFor="sellingPrice"
            data-icod-id="src_pages_launchdecisionengine_tsx_c720">
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="1"
              value={roundTwo(convertAmount(inputs.sellingPrice, DEFAULT_CURRENCY, currency)) || ''}
              onChange={(e) => updateInput('sellingPrice', e.target.value)}
              data-icod-id="src_pages_launchdecisionengine_tsx_74f8" />
          </Field>

          <Field
            label={`${t('Product Purchase Cost')} (${currency})`}
            htmlFor="productCost"
            data-icod-id="src_pages_launchdecisionengine_tsx_b668">
            <Input
              id="productCost"
              type="number"
              min="0"
              step="1"
              value={roundTwo(convertAmount(inputs.productCost, DEFAULT_CURRENCY, currency)) || ''}
              onChange={(e) => updateInput('productCost', e.target.value)}
              data-icod-id="src_pages_launchdecisionengine_tsx_b55a" />
          </Field>

          <Field
            label={`${t('Delivery Cost')} (${currency})`}
            htmlFor="deliveryCost"
            hint={t('Cost for successful deliveries')}
            data-icod-id="src_pages_launchdecisionengine_tsx_83ea">
            <Input
              id="deliveryCost"
              type="number"
              min="0"
              step="1"
              value={roundTwo(convertAmount(inputs.deliveryCost, DEFAULT_CURRENCY, currency)) || ''}
              onChange={(e) => updateInput('deliveryCost', e.target.value)}
              data-icod-id="src_pages_launchdecisionengine_tsx_d395" />
          </Field>

          <Field
            label={`${t('Packaging & Other Costs')} (${currency})`}
            htmlFor="packagingCost"
            data-icod-id="src_pages_launchdecisionengine_tsx_67a0">
            <Input
              id="packagingCost"
              type="number"
              min="0"
              step="1"
              value={roundTwo(convertAmount(inputs.packagingCost, DEFAULT_CURRENCY, currency)) || ''}
              onChange={(e) => updateInput('packagingCost', e.target.value)}
              data-icod-id="src_pages_launchdecisionengine_tsx_d0d1" />
          </Field>

          <Field
            label={`${t('Advertising Budget')} (${currency})`}
            htmlFor="adBudget"
            data-icod-id="src_pages_launchdecisionengine_tsx_624b">
            <Input
              id="adBudget"
              type="number"
              min="0"
              step="100"
              value={roundTwo(convertAmount(inputs.adBudget, DEFAULT_CURRENCY, currency)) || ''}
              onChange={(e) => updateInput('adBudget', e.target.value)}
              data-icod-id="src_pages_launchdecisionengine_tsx_1fef" />
          </Field>

          <Field
            label={`${t('COD Delivery Success Rate')} (%)`}
            htmlFor="deliverySuccessRate"
            hint={`${inputs.deliverySuccessRate}% ${t('success')}, ${(100 - inputs.deliverySuccessRate).toFixed(0)}% RTO`}
            data-icod-id="src_pages_launchdecisionengine_tsx_f03d">
            <Input
              id="deliverySuccessRate"
              type="number"
              min="0"
              max="100"
              step="1"
              value={inputs.deliverySuccessRate || ''}
              onChange={(e) => updateInput('deliverySuccessRate', e.target.value)}
              data-icod-id="src_pages_launchdecisionengine_tsx_b5bd" />
          </Field>

          <Field
            label={`${t('RTO Shipping Cost')} (${currency})`}
            htmlFor="rtoShippingCost"
            hint={t('Cost when order is returned')}
            data-icod-id="src_pages_launchdecisionengine_tsx_db2c">
            <Input
              id="rtoShippingCost"
              type="number"
              min="0"
              step="1"
              value={roundTwo(convertAmount(inputs.rtoShippingCost, DEFAULT_CURRENCY, currency)) || ''}
              onChange={(e) => updateInput('rtoShippingCost', e.target.value)}
              data-icod-id="src_pages_launchdecisionengine_tsx_b3c4" />
          </Field>

          <Field
            label={`${t('Non-Recoverable Loss')} (${currency})`}
            htmlFor="nonRecoverableLoss"
            hint={t('Product value lost per failed delivery (optional)')}
            data-icod-id="src_pages_launchdecisionengine_tsx_f0c8">
            <Input
              id="nonRecoverableLoss"
              type="number"
              min="0"
              step="1"
              value={roundTwo(convertAmount(inputs.nonRecoverableLoss, DEFAULT_CURRENCY, currency)) || ''}
              onChange={(e) => updateInput('nonRecoverableLoss', e.target.value)}
              data-icod-id="src_pages_launchdecisionengine_tsx_7d1e" />
          </Field>
        </div>
      </Card>
      {/* Section B: Real Financial Calculations */}
      <Card className="p-5" data-icod-id="src_pages_launchdecisionengine_tsx_calcs">
        {/* Print-only report header */}
        <div className="mb-6 hidden print:block" data-icod-id="src_pages_launchdecisionengine_tsx_print_header">
          <h1
            className="text-2xl font-bold text-black"
            data-icod-id="src_pages_launchdecisionengine_tsx_8c81">{t('Launch Decision Report')}</h1>
          {inputs.productName && (
            <p
              className="mt-1 text-lg text-gray-700"
              data-icod-id="src_pages_launchdecisionengine_tsx_9d4d">{inputs.productName}</p>
          )}
          <p
            className="mt-2 text-xs text-gray-500"
            data-icod-id="src_pages_launchdecisionengine_tsx_9ecd">{t('Generated on')} {new Date().toLocaleDateString()}</p>
        </div>
        <div
          className="mb-4 flex items-center justify-between"
          data-icod-id="src_pages_launchdecisionengine_tsx_4ebf">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_launchdecisionengine_tsx_8e31">
            <BarChart3
              className="h-5 w-5 text-accent-foreground"
              data-icod-id="src_pages_launchdecisionengine_tsx_ff78" />
            <h2
              className="text-lg font-semibold text-foreground"
              data-icod-id="src_pages_launchdecisionengine_tsx_3ba9">{t('Financial Summary')}</h2>
          </div>
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground print:hidden"
            data-icod-id="src_pages_launchdecisionengine_tsx_e0ea">
            <Info
              className="h-3.5 w-3.5"
              data-icod-id="src_pages_launchdecisionengine_tsx_28d9" />
            {showFormulas ? t('Hide Formulas') : t('How These Numbers Were Calculated')}
            {showFormulas ? <ChevronUp
              className="h-3 w-3"
              data-icod-id="src_pages_launchdecisionengine_tsx_46e5" /> : <ChevronDown
              className="h-3 w-3"
              data-icod-id="src_pages_launchdecisionengine_tsx_2b3b" />}
          </button>
        </div>

        {/* Product Overview */}
        {inputs.productName && (
          <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4" data-icod-id="src_pages_launchdecisionengine_tsx_product_overview">
            <h3 className="text-base font-semibold text-foreground" data-icod-id="src_pages_launchdecisionengine_tsx_product_name">{inputs.productName}</h3>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground" data-icod-id="src_pages_launchdecisionengine_tsx_product_summary">
              <span data-icod-id="src_pages_launchdecisionengine_tsx_7c73">{t('Selling Price')}: {formatCurrency(inputs.sellingPrice, currency)}</span>
              <span data-icod-id="src_pages_launchdecisionengine_tsx_10df">{t('Cost')}: {formatCurrency(inputs.productCost, currency)}</span>
              <span data-icod-id="src_pages_launchdecisionengine_tsx_4e49">{t('Delivery Rate')}: {inputs.deliverySuccessRate}%</span>
              <span data-icod-id="src_pages_launchdecisionengine_tsx_0e39">{t('Ad Budget')}: {formatCurrency(inputs.adBudget, currency)}</span>
            </div>
          </div>
        )}

        {/* Unit Economics Section */}
        <div className="mb-6" data-icod-id="src_pages_launchdecisionengine_tsx_unit_economics">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground" data-icod-id="src_pages_launchdecisionengine_tsx_unit_header">{t('Unit Economics')}</h3>
          <div
            className="grid gap-4 sm:grid-cols-2"
            data-icod-id="src_pages_launchdecisionengine_tsx_dd0f">
            {/* Contribution per delivered order */}
            <div
              className="rounded-lg border border-border bg-background p-4"
              data-icod-id="src_pages_launchdecisionengine_tsx_c130">
              <p
                className="text-xs font-medium text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_13fe">{t('Contribution per Delivered Order')}</p>
              <p
                className="mt-1 text-xl font-bold text-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_3e99">
                {formatCurrency(calcs.contributionPerDeliveredOrder, currency)}
              </p>
              <p
                className="mt-1 text-xs text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_9f2a">{t('Before advertising costs')}</p>
            </div>

            {/* Expected contribution per placed order */}
            <div
              className={cn(
                'rounded-lg border p-4',
                calcs.expectedContributionPerPlacedOrder > 0
                  ? 'border-[#9DD37D] bg-[#9DD37D]/10'
                  : 'border-red-300 bg-red-50'
              )}
              data-icod-id="src_pages_launchdecisionengine_tsx_6113">
              <p
                className="text-xs font-medium text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_356e">{t('Expected Contribution per Placed Order')}</p>
              <p
                className={cn(
                  'mt-1 text-xl font-bold',
                  calcs.expectedContributionPerPlacedOrder > 0 ? 'text-green-800' : 'text-red-800'
                )}
                data-icod-id="src_pages_launchdecisionengine_tsx_e33c">
                {formatCurrency(calcs.expectedContributionPerPlacedOrder, currency)}
              </p>
              <p
                className="mt-1 text-xs text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_84be">{t('After accounting for RTO losses')}</p>
            </div>
          </div>
        </div>

        {/* Break-Even Analysis Section */}
        <div className="mb-6" data-icod-id="src_pages_launchdecisionengine_tsx_breakeven_section">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground" data-icod-id="src_pages_launchdecisionengine_tsx_breakeven_header">{t('Break-Even Analysis')}</h3>
          <div
            className="grid gap-4 sm:grid-cols-3"
            data-icod-id="src_pages_launchdecisionengine_tsx_0546">
            {/* Max break-even ad cost */}
            <div
              className="rounded-lg border border-border bg-background p-4"
              data-icod-id="src_pages_launchdecisionengine_tsx_b106">
              <p
                className="text-xs font-medium text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_b363">{t('Break-Even CPA')}</p>
              <p
                className="mt-1 text-xl font-bold text-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_fd32">
                {formatCurrency(calcs.maxBreakEvenAdCostPerOrder, currency)}
              </p>
              <p
                className="mt-1 text-xs text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_4362">{t('Maximum cost per acquisition')}</p>
            </div>

            {/* Break-even ROAS */}
            <div
              className="rounded-lg border border-border bg-background p-4"
              data-icod-id="src_pages_launchdecisionengine_tsx_900b">
              <p
                className="text-xs font-medium text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_b210">{t('Break-Even ROAS')}</p>
              <p
                className={cn(
                  'mt-1 text-xl font-bold',
                  calcs.breakEvenRoas < 3
                    ? 'text-green-700'
                    : calcs.breakEvenRoas < 5
                      ? 'text-amber-700'
                      : 'text-red-700'
                )}
                data-icod-id="src_pages_launchdecisionengine_tsx_2073">
                {calcs.breakEvenRoas === Infinity ? 'N/A' : `${calcs.breakEvenRoas.toFixed(2)}x`}
              </p>
              <p
                className="mt-1 text-[10px] leading-tight text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_b759">
                = (Delivery Rate &times; Selling Price) / Expected Contribution per Placed Order
              </p>
            </div>

            {/* Break-even order count */}
            <div
              className="rounded-lg border border-border bg-background p-4"
              data-icod-id="src_pages_launchdecisionengine_tsx_ebac">
              <p
                className="text-xs font-medium text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_a1f4">{t('Break-Even Orders')}</p>
              <p
                className="mt-1 text-xl font-bold text-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_6ec7">
                {calcs.breakEvenOrderCount === Infinity ? 'N/A' : Math.ceil(calcs.breakEvenOrderCount)}
              </p>
              <p
                className="mt-1 text-xs text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_ea63">{t('To recover ad budget')}</p>
            </div>
          </div>
        </div>

        {/* Profit Projection Section */}
        <div data-icod-id="src_pages_launchdecisionengine_tsx_profit_section">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground" data-icod-id="src_pages_launchdecisionengine_tsx_profit_header">{t('Profit Projection')}</h3>
          <div
            className="grid gap-4 sm:grid-cols-2"
            data-icod-id="src_pages_launchdecisionengine_tsx_518e">
            {/* Profit at 1.5x break-even */}
            <div
              className="rounded-lg border border-border bg-background p-4"
              data-icod-id="src_pages_launchdecisionengine_tsx_profit_1_5x">
              <p
                className="text-xs font-medium text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_profit_1_5x_label">
                {t('Profit at')}{' '}
                {calcs.breakEvenOrderCount === Infinity
                  ? '150'
                  : Math.ceil(calcs.breakEvenOrderCount * 1.5)}{' '}
                {t('Orders')}
              </p>
              <p
                className={cn(
                  'mt-1 text-xl font-bold',
                  calcs.breakEvenOrderCount !== Infinity &&
                    calcs.profitAtVolume(Math.ceil(calcs.breakEvenOrderCount * 1.5)) > 0
                    ? 'text-green-700'
                    : 'text-red-700'
                )}
                data-icod-id="src_pages_launchdecisionengine_tsx_profit_1_5x_value">
                {calcs.breakEvenOrderCount === Infinity
                  ? 'N/A'
                  : formatCurrency(calcs.profitAtVolume(Math.ceil(calcs.breakEvenOrderCount * 1.5)), currency)}
              </p>
              <p
                className="mt-1 text-xs text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_profit_1_5x_note">{t('Moderate scale projection')}</p>
            </div>

            {/* Profit at 2x break-even */}
            <div
              className="rounded-lg border border-border bg-background p-4"
              data-icod-id="src_pages_launchdecisionengine_tsx_74dd">
              <p
                className="text-xs font-medium text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_96ae">
                {t('Profit at')}{' '}
                {calcs.breakEvenOrderCount === Infinity
                  ? '200'
                  : Math.ceil(calcs.breakEvenOrderCount * 2)}{' '}
                {t('Orders')}
              </p>
              <p
                className={cn(
                  'mt-1 text-xl font-bold',
                  calcs.breakEvenOrderCount !== Infinity &&
                    calcs.profitAtVolume(Math.ceil(calcs.breakEvenOrderCount * 2)) > 0
                    ? 'text-green-700'
                    : 'text-red-700'
                )}
                data-icod-id="src_pages_launchdecisionengine_tsx_464c">
                {calcs.breakEvenOrderCount === Infinity
                  ? 'N/A'
                  : formatCurrency(calcs.profitAtVolume(Math.ceil(calcs.breakEvenOrderCount * 2)), currency)}
              </p>
              <p
                className="mt-1 text-xs text-muted-foreground"
                data-icod-id="src_pages_launchdecisionengine_tsx_fd54">{t('Estimated at scale')}</p>
            </div>
          </div>
        </div>

        {/* Collapsible formulas */}
        {showFormulas && (
          <div
            className="mt-6 rounded-lg border border-border/60 bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_formulas"
          >
            <h4
              className="mb-2 font-semibold text-foreground"
              data-icod-id="src_pages_launchdecisionengine_tsx_a13d">{t('How These Numbers Were Calculated')}</h4>
            <ul
              className="space-y-1.5"
              data-icod-id="src_pages_launchdecisionengine_tsx_56bb">
              <li data-icod-id="src_pages_launchdecisionengine_tsx_3746">
                <strong data-icod-id="src_pages_launchdecisionengine_tsx_facb">{t('Contribution per delivered order')}</strong> = {t('Selling Price')} - {t('Product Cost')} - {t('Delivery Cost')} - {t('Packaging')}
                <br data-icod-id="src_pages_launchdecisionengine_tsx_6a76" />
                <span
                  className="italic opacity-75"
                  data-icod-id="src_pages_launchdecisionengine_tsx_465a">= {formatCurrency(inputs.sellingPrice, currency)} - {formatCurrency(inputs.productCost, currency)} - {formatCurrency(inputs.deliveryCost, currency)} - {formatCurrency(inputs.packagingCost, currency)} = {formatCurrency(calcs.contributionPerDeliveredOrder, currency)}</span>
              </li>
              <li data-icod-id="src_pages_launchdecisionengine_tsx_2e79">
                <strong data-icod-id="src_pages_launchdecisionengine_tsx_745a">{t('Expected contribution per placed order')}</strong> = ({t('Delivery Rate')} &times; {t('Contribution per delivered')}) - (RTO Rate &times; RTO Shipping) - (RTO Rate &times; {t('Non-Recoverable Loss')})
                <br data-icod-id="src_pages_launchdecisionengine_tsx_bcf2" />
                <span
                  className="italic opacity-75"
                  data-icod-id="src_pages_launchdecisionengine_tsx_92e1">= ({inputs.deliverySuccessRate}% &times; {formatCurrency(calcs.contributionPerDeliveredOrder, currency)}) - ({(100 - inputs.deliverySuccessRate).toFixed(0)}% &times; {formatCurrency(inputs.rtoShippingCost, currency)}) - ({(100 - inputs.deliverySuccessRate).toFixed(0)}% &times; {formatCurrency(inputs.nonRecoverableLoss, currency)}) = {formatCurrency(calcs.expectedContributionPerPlacedOrder, currency)}</span>
              </li>
              <li data-icod-id="src_pages_launchdecisionengine_tsx_33c7">
                <strong data-icod-id="src_pages_launchdecisionengine_tsx_1b7f">{t('Break-Even CPA')}</strong> = {t('Expected contribution per placed order')}
                <br data-icod-id="src_pages_launchdecisionengine_tsx_8db2" />
                <span
                  className="italic opacity-75"
                  data-icod-id="src_pages_launchdecisionengine_tsx_ad52">= {formatCurrency(calcs.maxBreakEvenAdCostPerOrder, currency)}</span>
              </li>
              <li data-icod-id="src_pages_launchdecisionengine_tsx_a458">
                <strong data-icod-id="src_pages_launchdecisionengine_tsx_f89b">{t('Break-Even ROAS')}</strong> = ({t('Delivery Rate')} &times; {t('Selling Price')}) / {t('Expected contribution per placed order')}
                <br data-icod-id="src_pages_launchdecisionengine_tsx_fdfe" />
                <span
                  className="italic opacity-75"
                  data-icod-id="src_pages_launchdecisionengine_tsx_cca4">= ({inputs.deliverySuccessRate}% &times; {formatCurrency(inputs.sellingPrice, currency)}) / {formatCurrency(calcs.expectedContributionPerPlacedOrder, currency)} = {calcs.breakEvenRoas === Infinity ? 'N/A' : `${calcs.breakEvenRoas.toFixed(2)}x`}</span>
              </li>
              <li data-icod-id="src_pages_launchdecisionengine_tsx_cd05">
                <strong data-icod-id="src_pages_launchdecisionengine_tsx_eef8">{t('Break-even orders')}</strong> = {t('Ad Budget')} / {t('Expected contribution per placed order')}
                <br data-icod-id="src_pages_launchdecisionengine_tsx_e8eb" />
                <span
                  className="italic opacity-75"
                  data-icod-id="src_pages_launchdecisionengine_tsx_93e2">= {formatCurrency(inputs.adBudget, currency)} / {formatCurrency(calcs.expectedContributionPerPlacedOrder, currency)} = {calcs.breakEvenOrderCount === Infinity ? 'N/A' : Math.ceil(calcs.breakEvenOrderCount)}</span>
              </li>
              <li data-icod-id="src_pages_launchdecisionengine_tsx_b444">
                <strong data-icod-id="src_pages_launchdecisionengine_tsx_d90b">{t('Profit at volume V')}</strong> = (V &times; {t('Expected contribution per placed order')}) - {t('Ad Budget')}
              </li>
            </ul>
            <p
              className="mt-2 italic"
              data-icod-id="src_pages_launchdecisionengine_tsx_b4d8">
              {t('Note: Returned inventory is treated as recoverable unless non-recoverable loss is specified.')}
              {t('Costs are not double-counted on returned orders. Break-even ROAS accounts for delivery success rate — only revenue from successfully delivered orders counts toward ad spend recovery.')}
            </p>
          </div>
        )}
      </Card>
      {/* Courier Cost Analysis Section */}
      <Card className="p-5" data-icod-id="src_pages_launchdecisionengine_tsx_courier_analysis">
        <div
          className="mb-4 flex items-center gap-2"
          data-icod-id="src_pages_launchdecisionengine_tsx_23bf">
          <BarChart3
            className="h-5 w-5 text-accent-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_77d0" />
          <h2
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_f82d">{t('Courier Cost Analysis')}</h2>
        </div>
        <p
          className="mb-4 text-xs text-muted-foreground"
          data-icod-id="src_pages_launchdecisionengine_tsx_70d1">
          {t('Side-by-side comparison using current product parameters. Indicative rates, researched Nov 2026.')}
        </p>
        <div
          className="grid gap-3 sm:grid-cols-3"
          data-icod-id="src_pages_launchdecisionengine_tsx_c324">
          {(() => {
            const courierResults = calculateAllCouriers(
              1, // default 1kg
              'within-city',
              inputs.sellingPrice,
              inputs.deliverySuccessRate,
              inputs.adBudget,
              DEFAULT_COURIER_RATES,
              inputs.rtoShippingCost,
              inputs.productCost,
              inputs.packagingCost
            );
            return courierResults.map((cr) => (
              <div
                key={cr.courierId}
                className={cn(
                  'rounded-lg border p-3 text-sm',
                  cr.isCheapest ? 'border-success/50 bg-success/5' : 'border-border/40'
                )}
                data-icod-id={`src_pages_launchdecisionengine_tsx_1adf_${cr.courierId}`}>
                <div
                  className="flex items-center justify-between mb-2"
                  data-icod-id={`src_pages_launchdecisionengine_tsx_d3de_${cr.courierId}`}>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_b729_${cr.courierId}`}>{cr.courierName}</span>
                  {cr.isCheapest && (
                    <span
                      className="rounded-full bg-success/20 px-1.5 py-0.5 text-[10px] font-bold text-success"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_77da_${cr.courierId}`}>
                      {t('Cheapest')}
                    </span>
                  )}
                </div>
                <div
                  className="space-y-1 text-xs"
                  data-icod-id={`src_pages_launchdecisionengine_tsx_70b3_${cr.courierId}`}>
                  <div
                    className="flex justify-between"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_ae70_${cr.courierId}`}>
                    <span
                      className="text-muted-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_c8e0_${cr.courierId}`}>{t('Delivery')}</span>
                    <span
                      className="tabular-nums text-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_67a6_${cr.courierId}`}>{formatCurrency(cr.deliveryCost, currency)}</span>
                  </div>
                  <div
                    className="flex justify-between"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_fe9a_${cr.courierId}`}>
                    <span
                      className="text-muted-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_4db4_${cr.courierId}`}>{t('COD fee')}</span>
                    <span
                      className="tabular-nums text-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_d81a_${cr.courierId}`}>{formatCurrency(cr.codFee, currency)}</span>
                  </div>
                  <div
                    className="flex justify-between"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_2d4b_${cr.courierId}`}>
                    <span
                      className="text-muted-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_a824_${cr.courierId}`}>{t('Exp. RTO')}</span>
                    <span
                      className="tabular-nums text-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_23fa_${cr.courierId}`}>{formatCurrency(cr.expectedRtoCost, currency)}</span>
                  </div>
                  <div
                    className="my-1 border-t border-border/30"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_ce6f_${cr.courierId}`} />
                  <div
                    className="flex justify-between font-medium"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_2b5a_${cr.courierId}`}>
                    <span
                      className="text-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_01ef_${cr.courierId}`}>{t('Total/order')}</span>
                    <span
                      className="tabular-nums text-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_4388_${cr.courierId}`}>{formatCurrency(cr.totalCostPerPlacedOrder, currency)}</span>
                  </div>
                  <div
                    className="flex justify-between"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_7284_${cr.courierId}`}>
                    <span
                      className="text-muted-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_b0a2_${cr.courierId}`}>{t('Contribution')}</span>
                    <span
                      className={cn('tabular-nums', cr.expectedContributionPerPlacedOrder >= 0 ? 'text-success' : 'text-destructive')}
                      data-icod-id={`src_pages_launchdecisionengine_tsx_9344_${cr.courierId}`}>
                      {formatCurrency(cr.expectedContributionPerPlacedOrder, currency)}
                    </span>
                  </div>
                  <div
                    className="flex justify-between"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_85bd_${cr.courierId}`}>
                    <span
                      className="text-muted-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_5b5a_${cr.courierId}`}>{t('BE ROAS')}</span>
                    <span
                      className="tabular-nums text-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_6130_${cr.courierId}`}>
                      {cr.breakEvenRoas !== null ? `${cr.breakEvenRoas.toFixed(2)}x` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </Card>
      {/* Section C: Launch Decision */}
      <Card className="p-5" data-icod-id="src_pages_launchdecisionengine_tsx_decision">
        <div
          className="mb-4 flex items-center gap-2"
          data-icod-id="src_pages_launchdecisionengine_tsx_3240">
          <TrendingUp
            className="h-5 w-5 text-accent-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_81b7" />
          <h2
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_ba5d">{t('Launch Recommendation')}</h2>
        </div>

        <div
          className="flex flex-col gap-6 sm:flex-row sm:items-start"
          data-icod-id="src_pages_launchdecisionengine_tsx_9bb7">
          <div
            className={cn(
              'flex shrink-0 flex-col items-center justify-center gap-2 rounded-xl border px-8 py-6 text-center',
              decisionColors[decision.decision]
            )}
            data-icod-id="src_pages_launchdecisionengine_tsx_6f6c">
            <DecisionIcon
              className="h-10 w-10"
              data-icod-id="src_pages_launchdecisionengine_tsx_aa00" />
            <div data-icod-id="src_pages_launchdecisionengine_tsx_3a9f">
              <p
                className="text-xs font-medium uppercase tracking-wide opacity-80"
                data-icod-id="src_pages_launchdecisionengine_tsx_568c">{t('Verdict')}</p>
              <p
                className="text-3xl font-bold"
                data-icod-id="src_pages_launchdecisionengine_tsx_f732">{decision.decision}</p>
            </div>
            <p className="mt-1 max-w-[180px] text-xs opacity-70" data-icod-id="src_pages_launchdecisionengine_tsx_verdict_explanation">
              {decision.decision === 'GO' && t('Financial assumptions support launching')}
              {decision.decision === 'TEST FIRST' && t('More validation or controlled testing recommended')}
              {decision.decision === 'NO-GO' && t('Current economics indicate high risk')}
            </p>
          </div>

          <div
            className="flex-1 space-y-3"
            data-icod-id="src_pages_launchdecisionengine_tsx_48ba">
            <h4 className="text-sm font-semibold text-foreground" data-icod-id="src_pages_launchdecisionengine_tsx_reasoning_header">{t('Key Reasoning:')}</h4>
            {decision.reasons.map((reason, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-foreground"
                data-icod-id={`src_pages_launchdecisionengine_tsx_e223_${i}`}>
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground"
                  data-icod-id={`src_pages_launchdecisionengine_tsx_97a6_${i}`} />
                <span data-icod-id={`src_pages_launchdecisionengine_tsx_809e_${i}`}>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      {/* Verdict Share Section */}
      <div className="max-w-full space-y-4 overflow-visible print:hidden" data-icod-id="src_pages_launchdecisionengine_tsx_verdict_share_section">
        <Button
          variant="primary"
          size="md"
          onClick={openDeVerdictWhatsApp}
          className="w-full gap-2 whitespace-normal sm:w-auto sm:whitespace-nowrap"
          style={{ backgroundColor: '#25D366', color: '#fff' }}
          data-icod-id="src_pages_launchdecisionengine_tsx_verdict_whatsapp_btn"
        >
          <MessageCircle className="h-5 w-5 shrink-0" data-icod-id="src_pages_launchdecisionengine_tsx_verdict_wa_icon" />
          <span
            className="hidden sm:inline"
            data-icod-id="src_pages_launchdecisionengine_tsx_9411">{t('Share Verdict on WhatsApp')}</span>
          <span
            className="sm:hidden"
            data-icod-id="src_pages_launchdecisionengine_tsx_da41">{t('Share on WhatsApp')}</span>
        </Button>
        <VerdictCard
          data={deCardData}
          data-icod-id="src_pages_launchdecisionengine_tsx_verdict_card"
        />
      </div>
      {/* Section D: Scenario Simulator */}
      <Card className="p-5" data-icod-id="src_pages_launchdecisionengine_tsx_scenarios">
        <div
          className="mb-4 flex items-center gap-2"
          data-icod-id="src_pages_launchdecisionengine_tsx_d4d8">
          <BarChart3
            className="h-5 w-5 text-accent-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_b99e" />
          <h2
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_931b">{t('Scenario Comparison')}</h2>
        </div>
        <p
          className="mb-4 text-xs text-muted-foreground"
          data-icod-id="src_pages_launchdecisionengine_tsx_dbf8">
          {t('Compare three budget scenarios side by side. Adjust inputs to see how different assumptions affect profitability.')}
        </p>

        <div
          className="grid gap-4 lg:grid-cols-3"
          data-icod-id="src_pages_launchdecisionengine_tsx_caf6">
          {scenarioResults.map((s, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg border p-4',
                s.expectedProfit > 0 ? 'border-[#9DD37D] bg-[#9DD37D]/5' : 'border-red-200 bg-red-50/50'
              )}
              data-icod-id={`src_pages_launchdecisionengine_tsx_9fb2_${i}`}>
              <h3
                className="mb-3 text-sm font-semibold text-foreground"
                data-icod-id={`src_pages_launchdecisionengine_tsx_b335_${i}`}>{s.label}</h3>

              {/* Editable fields */}
              <div
                className="mb-3 space-y-2"
                data-icod-id={`src_pages_launchdecisionengine_tsx_2eb3_${i}`}>
                <div data-icod-id={`src_pages_launchdecisionengine_tsx_c0dd_${i}`}>
                  <label
                    className="text-xs text-muted-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_03fc_${i}`}>{t('Ad Budget')}</label>
                  <Input
                    type="number"
                    min="0"
                    value={scenarios[i].adBudget}
                    onChange={(e) => {
                      const updated = [...scenarios];
                      updated[i] = { ...updated[i], adBudget: roundTwo(parseFloat(e.target.value) || 0) };
                      setScenarios(updated);
                    }}
                    className="mt-0.5 text-sm"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_6bdf_${i}`} />
                </div>
                <div data-icod-id={`src_pages_launchdecisionengine_tsx_a662_${i}`}>
                  <label
                    className="text-xs text-muted-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_8098_${i}`}>{t('Expected Orders')}</label>
                  <Input
                    type="number"
                    min="0"
                    value={scenarios[i].expectedOrderVolume}
                    onChange={(e) => {
                      const updated = [...scenarios];
                      updated[i] = { ...updated[i], expectedOrderVolume: Math.round(parseFloat(e.target.value) || 0) };
                      setScenarios(updated);
                    }}
                    className="mt-0.5 text-sm"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_0813_${i}`} />
                </div>
                <div data-icod-id={`src_pages_launchdecisionengine_tsx_f267_${i}`}>
                  <label
                    className="text-xs text-muted-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_6d1e_${i}`}>{t('Delivery Rate')} (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={scenarios[i].deliverySuccessRate}
                    onChange={(e) => {
                      const updated = [...scenarios];
                      updated[i] = { ...updated[i], deliverySuccessRate: roundTwo(parseFloat(e.target.value) || 0) };
                      setScenarios(updated);
                    }}
                    className="mt-0.5 text-sm"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_96cd_${i}`} />
                </div>
              </div>

              {/* Results */}
              <div
                className="space-y-1.5 border-t border-border/50 pt-3"
                data-icod-id={`src_pages_launchdecisionengine_tsx_bddb_${i}`}>
                <div
                  className="flex justify-between text-xs"
                  data-icod-id={`src_pages_launchdecisionengine_tsx_9ec1_${i}`}>
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_13a3_${i}`}>{t('Delivered')}</span>
                  <span
                    className="font-medium text-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_3f18_${i}`}>{s.expectedDeliveredOrders}</span>
                </div>
                <div
                  className="flex justify-between text-xs"
                  data-icod-id={`src_pages_launchdecisionengine_tsx_468e_${i}`}>
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_6ad9_${i}`}>RTO</span>
                  <span
                    className="font-medium text-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_9fb6_${i}`}>{s.expectedRtoOrders}</span>
                </div>
                <div
                  className="flex justify-between text-xs"
                  data-icod-id={`src_pages_launchdecisionengine_tsx_ed36_${i}`}>
                  <span
                    className="text-muted-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_e4e1_${i}`}>{t('Revenue')}</span>
                  <span
                    className="font-medium text-foreground"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_cf8f_${i}`}>{formatCurrency(s.expectedRevenue, currency)}</span>
                </div>
                <div
                  className={cn(
                    'flex justify-between text-sm font-bold',
                    s.expectedProfit > 0 ? 'text-green-700' : 'text-red-700'
                  )}
                  data-icod-id={`src_pages_launchdecisionengine_tsx_e9a3_${i}`}>
                  <span data-icod-id={`src_pages_launchdecisionengine_tsx_d0dd_${i}`}>{t('Est. Profit')}</span>
                  <span data-icod-id={`src_pages_launchdecisionengine_tsx_528f_${i}`}>{formatCurrency(s.expectedProfit, currency)}</span>
                </div>
              </div>
              <p
                className="mt-2 text-[10px] italic text-muted-foreground"
                data-icod-id={`src_pages_launchdecisionengine_tsx_360b_${i}`}>* {t('Estimate only')}</p>
            </div>
          ))}
        </div>
      </Card>
      {/* Section E: Prediction vs Actual Tracker */}
      <Card className="p-5" data-icod-id="src_pages_launchdecisionengine_tsx_tracker">
        <div
          className="mb-4 flex items-center justify-between"
          data-icod-id="src_pages_launchdecisionengine_tsx_c6f2">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_launchdecisionengine_tsx_8f52">
            <ArrowRightLeft
              className="h-5 w-5 text-accent-foreground"
              data-icod-id="src_pages_launchdecisionengine_tsx_dd2d" />
            <h2
              className="text-lg font-semibold text-foreground"
              data-icod-id="src_pages_launchdecisionengine_tsx_8723">{t('Prediction vs Actual Tracker')}</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActualForm(!showActualForm)}
            className="gap-1 print:hidden"
            data-icod-id="src_pages_launchdecisionengine_tsx_616b">
            <Plus
              className="h-3.5 w-3.5"
              data-icod-id="src_pages_launchdecisionengine_tsx_9486" />
            {t('Add Result')}
          </Button>
        </div>

        {/* Add actual result form - hidden in print */}
        {showActualForm && (
          <div
            className="mb-4 rounded-lg border border-border bg-muted/30 p-4 print:hidden"
            data-icod-id="src_pages_launchdecisionengine_tsx_9685">
            <h3
              className="mb-3 text-sm font-semibold text-foreground"
              data-icod-id="src_pages_launchdecisionengine_tsx_cb1f">{t('Record Campaign Results')}</h3>
            <div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              data-icod-id="src_pages_launchdecisionengine_tsx_6e44">
              <Field
                label={`${t('Actual Ad Spend')} (${currency})`}
                data-icod-id="src_pages_launchdecisionengine_tsx_941b">
                <Input
                  type="number"
                  min="0"
                  value={newActual.actualAdSpend ?? ''}
                  onChange={(e) =>
                    setNewActual((prev) => ({ ...prev, actualAdSpend: roundTwo(parseFloat(e.target.value) || 0) }))
                  }
                  data-icod-id="src_pages_launchdecisionengine_tsx_2ae7" />
              </Field>
              <Field
                label={t('Orders Placed')}
                data-icod-id="src_pages_launchdecisionengine_tsx_b0e3">
                <Input
                  type="number"
                  min="0"
                  value={newActual.ordersPlaced ?? ''}
                  onChange={(e) =>
                    setNewActual((prev) => ({ ...prev, ordersPlaced: Math.round(parseFloat(e.target.value) || 0) }))
                  }
                  data-icod-id="src_pages_launchdecisionengine_tsx_c3e0" />
              </Field>
              <Field
                label={t('Delivered Orders')}
                data-icod-id="src_pages_launchdecisionengine_tsx_8c65">
                <Input
                  type="number"
                  min="0"
                  value={newActual.deliveredOrders ?? ''}
                  onChange={(e) =>
                    setNewActual((prev) => ({ ...prev, deliveredOrders: Math.round(parseFloat(e.target.value) || 0) }))
                  }
                  data-icod-id="src_pages_launchdecisionengine_tsx_9aed" />
              </Field>
              <Field label={t('RTO Orders')} data-icod-id="src_pages_launchdecisionengine_tsx_e753">
                <Input
                  type="number"
                  min="0"
                  value={newActual.rtoOrders ?? ''}
                  onChange={(e) =>
                    setNewActual((prev) => ({ ...prev, rtoOrders: Math.round(parseFloat(e.target.value) || 0) }))
                  }
                  data-icod-id="src_pages_launchdecisionengine_tsx_d4c9" />
              </Field>
              <Field
                label={`${t('Actual Revenue')} (${currency})`}
                data-icod-id="src_pages_launchdecisionengine_tsx_6889">
                <Input
                  type="number"
                  min="0"
                  value={newActual.actualRevenue ?? ''}
                  onChange={(e) =>
                    setNewActual((prev) => ({ ...prev, actualRevenue: roundTwo(parseFloat(e.target.value) || 0) }))
                  }
                  data-icod-id="src_pages_launchdecisionengine_tsx_7a3c" />
              </Field>
              <Field
                label={`${t('Additional Expenses')} (${currency})`}
                data-icod-id="src_pages_launchdecisionengine_tsx_be88">
                <Input
                  type="number"
                  min="0"
                  value={newActual.additionalExpenses ?? ''}
                  onChange={(e) =>
                    setNewActual((prev) => ({ ...prev, additionalExpenses: roundTwo(parseFloat(e.target.value) || 0) }))
                  }
                  data-icod-id="src_pages_launchdecisionengine_tsx_88d8" />
              </Field>
            </div>
            <div
              className="mt-3 flex gap-2"
              data-icod-id="src_pages_launchdecisionengine_tsx_59dd">
              <Button
                size="sm"
                onClick={handleAddActual}
                data-icod-id="src_pages_launchdecisionengine_tsx_66b2">{t('Save Result')}</Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowActualForm(false)}
                data-icod-id="src_pages_launchdecisionengine_tsx_8943">{t('Cancel')}</Button>
            </div>
          </div>
        )}

        {/* Comparison cards */}
        {actualResults.length > 0 ? (
          <div
            className="space-y-4"
            data-icod-id="src_pages_launchdecisionengine_tsx_cfae">
            {actualResults.map((actual, idx) => {
              const comparison = comparePredictionVsActual(inputs, calcs, actual, currency);
              return (
                <div
                  key={actual.id}
                  className="rounded-lg border border-border bg-background p-4"
                  data-icod-id={`src_pages_launchdecisionengine_tsx_23f4_${actual.id}`}>
                  <div
                    className="mb-3 flex items-center justify-between"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_09be_${actual.id}`}>
                    <h4
                      className="text-sm font-semibold text-foreground"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_ebe7_${actual.id}`}>
                      Campaign #{idx + 1} — {new Date(actual.dateRecorded).toLocaleDateString()}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => persistActualResults(actualResults.filter((r) => r.id !== actual.id))}
                      className="print:hidden"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_31f1_${actual.id}`}>
                      <Trash2
                        className="h-3.5 w-3.5 text-destructive"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_8861_${actual.id}`} />
                    </Button>
                  </div>
                  <div
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    data-icod-id={`src_pages_launchdecisionengine_tsx_baed_${actual.id}`}>
                    <div data-icod-id={`src_pages_launchdecisionengine_tsx_c24c_${actual.id}`}>
                      <p
                        className="text-xs text-muted-foreground"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_0285_${actual.id}`}>{t('Predicted Profit')}</p>
                      <p
                        className="font-semibold text-foreground"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_5c8a_${actual.id}`}>{formatCurrency(comparison.predictedProfit, currency)}</p>
                    </div>
                    <div data-icod-id={`src_pages_launchdecisionengine_tsx_d46d_${actual.id}`}>
                      <p
                        className="text-xs text-muted-foreground"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_08dc_${actual.id}`}>{t('Actual Profit')}</p>
                      <p
                        className={cn(
                          'font-semibold',
                          comparison.actualProfit >= 0 ? 'text-green-700' : 'text-red-700'
                        )}
                        data-icod-id={`src_pages_launchdecisionengine_tsx_04ff_${actual.id}`}>
                        {formatCurrency(comparison.actualProfit, currency)}
                      </p>
                    </div>
                    <div data-icod-id={`src_pages_launchdecisionengine_tsx_449f_${actual.id}`}>
                      <p
                        className="text-xs text-muted-foreground"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_a2f6_${actual.id}`}>{t('Difference')}</p>
                      <p
                        className={cn(
                          'font-semibold',
                          comparison.profitDifference >= 0 ? 'text-green-700' : 'text-red-700'
                        )}
                        data-icod-id={`src_pages_launchdecisionengine_tsx_8bf7_${actual.id}`}>
                        {comparison.profitDifference >= 0 ? '+' : ''}
                        {formatCurrency(comparison.profitDifference, currency)}
                      </p>
                    </div>
                    <div data-icod-id={`src_pages_launchdecisionengine_tsx_09af_${actual.id}`}>
                      <p
                        className="text-xs text-muted-foreground"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_6d47_${actual.id}`}>{t('Delivery Rate')}</p>
                      <p
                        className="font-semibold text-foreground"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_65c2_${actual.id}`}>
                        {comparison.actualDeliveryRate.toFixed(1)}%
                        <span
                          className="ml-1 text-xs font-normal text-muted-foreground"
                          data-icod-id={`src_pages_launchdecisionengine_tsx_d926_${actual.id}`}>
                          (vs {comparison.predictedDeliveryRate}%)
                        </span>
                      </p>
                    </div>
                  </div>
                  {comparison.mainLossSources.length > 0 && (
                    <div
                      className="mt-3"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_e143_${actual.id}`}>
                      <p
                        className="text-xs font-medium text-muted-foreground"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_910b_${actual.id}`}>{t('Key Variance Sources:')}</p>
                      <ul
                        className="mt-1 space-y-0.5"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_a9ad_${actual.id}`}>
                        {comparison.mainLossSources.map((src, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-xs text-foreground"
                            data-icod-id={`src_pages_launchdecisionengine_tsx_87f4_${actual.id}_${i}`}>
                            <span
                              className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400"
                              data-icod-id={`src_pages_launchdecisionengine_tsx_86fa_${actual.id}_${i}`} />
                            {src}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {comparison.suggestions.length > 0 && (
                    <div
                      className="mt-3 rounded-md bg-accent/30 p-3"
                      data-icod-id={`src_pages_launchdecisionengine_tsx_3706_${actual.id}`}>
                      <p
                        className="text-xs font-medium text-accent-foreground"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_5ef6_${actual.id}`}>{t('Suggestions for Next Campaign:')}</p>
                      <ul
                        className="mt-1 space-y-0.5"
                        data-icod-id={`src_pages_launchdecisionengine_tsx_3778_${actual.id}`}>
                        {comparison.suggestions.map((sug, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-xs text-foreground"
                            data-icod-id={`src_pages_launchdecisionengine_tsx_da14_${actual.id}_${i}`}>
                            <span
                              className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent-foreground"
                              data-icod-id={`src_pages_launchdecisionengine_tsx_bec2_${actual.id}_${i}`} />
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_launchdecisionengine_tsx_05a9">
            {t('No actual campaign results recorded yet. Click "Add Result" to track your real campaign performance against predictions.')}
          </p>
        )}
      </Card>
      {/* Save Modal */}
      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title={t('Save Analysis')}
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_launchdecisionengine_tsx_e2e0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveModal(false)}
              data-icod-id="src_pages_launchdecisionengine_tsx_6a38">{t('Cancel')}</Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!saveName.trim()}
              data-icod-id="src_pages_launchdecisionengine_tsx_ad54">{t('Save')}</Button>
          </div>
        }
        data-icod-id="src_pages_launchdecisionengine_tsx_6c94">
        <Field
          label={t('Analysis Name')}
          htmlFor="saveName"
          data-icod-id="src_pages_launchdecisionengine_tsx_0f52">
          <Input
            id="saveName"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder={t('e.g. Wireless Earbuds - March Launch')}
            autoFocus
            data-icod-id="src_pages_launchdecisionengine_tsx_6b08" />
        </Field>
      </Modal>
    </div>
  );
}
