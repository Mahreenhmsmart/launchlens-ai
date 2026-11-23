import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  RotateCcw, 
  Trash2, 
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Package,
  Target,
  AlertCircle,
  Info,
  Save,
  Download,
  Share2,
  Lock,
  IndianRupee,
  Truck,
  MessageCircle,
} from 'lucide-react';
import { Button, Card, Field, Input, Alert, Modal, type CardVariant } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, formatPercentage, formatMultiplier, convertAmount, DEFAULT_CURRENCY, getExchangeRateLabel, roundTwo } from '@/utils/currency';
import { 
  calculateSimulation, 
  generateResultSummary,
  isProfitable,
  getProfitColor,
  DEFAULT_SIMULATION_INPUTS,
  type SimulationInputs,
  type SimulationResults
} from '@/utils/calculations';
import type { PageId } from '@/components/Sidebar';
import { saveSimulatorAnalysis, exportSimulatorToPdf, generateWhatsAppSummary, shareOnWhatsApp } from '@/utils/saveExport';
import { useAppSelector } from '@/store/hooks';
import type { SavedSimulatorAnalysis } from '@/types';
import ProductSwitcher from '@/components/ProductSwitcher';
import { usePlanGating } from '@/hooks/usePlanGating';
import UpgradePrompt from '@/components/UpgradePrompt';
import {
  DEFAULT_COURIER_RATES,
  COURIER_IDS,
  ZONE_LABELS,
  calculateDeliveryCost,
  calculateCodFee,
  sanitizeCourierRates,
  type CourierId,
  type Zone,
  type CourierRatesConfig,
} from '@/utils/courierEngine';
import { STORAGE_KEYS, scopedGetItem } from '@/utils/scopedStorage';
import { useTranslation } from '@/utils/i18n';
import VerdictCard from '@/components/VerdictCard';
import { useSimulatorVerdictShare } from '@/hooks/useVerdictShare';

interface LaunchSimulatorProps {
  currency: string;
  onNavigate: (page: PageId) => void;
  inputs: SimulationInputs;
  onInputsChange: (inputs: SimulationInputs) => void;
}

type AccentColor = 'violet' | 'green' | 'coral' | 'indigo';

interface ResultCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  accentColor: AccentColor;
  subtitle?: string;
  cardVariant?: CardVariant;
}

const accentStyles: Record<AccentColor, { border: string; bg: string; text: string }> = {
  violet: {
    border: 'border-l-[#C9D0FC]',
    bg: 'bg-[#C9D0FC]/10',
    text: 'text-[#C9D0FC]',
  },
  green: {
    border: 'border-l-[#9DD37D]',
    bg: 'bg-[#9DD37D]/20',
    text: 'text-[#9DD37D]',
  },
  coral: {
    border: 'border-l-[#E88B9E]',
    bg: 'bg-[#E88B9E]/10',
    text: 'text-[#E88B9E]',
  },
  indigo: {
    border: 'border-l-[#171717]',
    bg: 'bg-[#171717]/10',
    text: 'text-[#171717]',
  },
};

function ResultCard({ title, value, icon: Icon, accentColor, subtitle, cardVariant = 'default' }: ResultCardProps) {
  const styles = accentStyles[accentColor];
  
  return (
    <Card
      variant={cardVariant}
      className={cn(
        'group relative min-w-0 overflow-hidden border-l-4 p-6 transition-all duration-200 ease-in-out',
        styles.border,
        'hover:-translate-y-1 hover:shadow-lg'
      )}
      data-icod-id="src_pages_launchsimulator_tsx_result_card">
      <div
        className="flex items-start justify-between"
        data-icod-id="src_pages_launchsimulator_tsx_result_header">
        <div className="space-y-2" data-icod-id="src_pages_launchsimulator_tsx_result_content">
          <p
            className="text-sm font-medium text-muted-foreground"
            data-icod-id="src_pages_launchsimulator_tsx_result_title">{title}</p>
          <div
            className="flex items-baseline gap-2"
            data-icod-id="src_pages_launchsimulator_tsx_result_value_wrap">
            <p
              className="text-3xl font-bold text-foreground"
              data-icod-id="src_pages_launchsimulator_tsx_result_value">{value}</p>
          </div>
          {subtitle && (
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_pages_launchsimulator_tsx_result_subtitle">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'rounded-xl p-3 transition-colors duration-200',
            styles.bg,
            styles.text
          )}
          data-icod-id="src_pages_launchsimulator_tsx_result_icon_wrap">
          <Icon className="h-6 w-6" data-icod-id="src_pages_launchsimulator_tsx_result_icon" />
        </div>
      </div>
    </Card>
  );
}

export default function LaunchSimulator({ currency, onNavigate, inputs, onInputsChange }: LaunchSimulatorProps) {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showExportUpgradePrompt, setShowExportUpgradePrompt] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ─── Courier Engine State ──────────────────────────────────────────────
  const [courierMode, setCourierMode] = useState<CourierId | 'manual'>('manual');
  const [courierWeight, setCourierWeight] = useState(1);
  const [courierZone, setCourierZone] = useState<Zone>('within-city');
  const [ratesConfig, setRatesConfig] = useState<CourierRatesConfig>(DEFAULT_COURIER_RATES);
  const savedManualDeliveryCost = useRef<number>(0);

  // Load persisted courier rates
  useEffect(() => {
    if (userId) {
      const stored = scopedGetItem<CourierRatesConfig>(STORAGE_KEYS.COURIER_RATES, userId, null as unknown as CourierRatesConfig);
      if (stored && stored.couriers) {
        setRatesConfig(sanitizeCourierRates(stored));
      }
    }
  }, [userId]);

  // Auto-calculate delivery cost when courier mode is active
  const courierDeliveryCost = useMemo(() => {
    if (courierMode === 'manual') return null;
    return calculateDeliveryCost(ratesConfig.couriers[courierMode], courierWeight, courierZone, ratesConfig);
  }, [courierMode, courierWeight, courierZone, ratesConfig]);

  // Apply courier-calculated delivery cost to inputs when in courier mode
  useEffect(() => {
    if (courierMode !== 'manual' && courierDeliveryCost !== null) {
      const newLocal = { ...localInputs, deliveryCost: courierDeliveryCost };
      setLocalInputs(newLocal);
      scheduleSync(newLocal);
    }
  }, [courierDeliveryCost, courierMode]);

  // Pick a currency-appropriate icon for revenue display
  const CurrencyIcon = useMemo(() => {
    if (currency === 'PKR' || currency === 'INR' || currency === 'NPR' || currency === 'LKR') return IndianRupee;
    return DollarSign;
  }, [currency]);

  // Plan gating for export reports
  const { canAccessFeature, getUpgradePrompt } = usePlanGating();
  const canExport = canAccessFeature('exportReports');
  const exportUpgradeMessage = getUpgradePrompt('exportReports');

  // Local display state for inputs to prevent keystroke dropping.
  // We sync from props → local on mount / when product changes externally,
  // and debounce local → props so Redux doesn't fire on every keystroke.
  const [localInputs, setLocalInputs] = useState<SimulationInputs>(inputs);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local ← props when the parent pushes new values (e.g., product switch)
  useEffect(() => {
    setLocalInputs(inputs);
  }, [inputs]);

  // Debounced push from local → parent (500ms after last keystroke)
  const scheduleSync = (newLocal: SimulationInputs) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onInputsChange(newLocal);
    }, 500);
  };

  // Calculate results whenever local inputs change
  const results = useMemo(() => calculateSimulation(localInputs), [localInputs]);

  // Generate summary
  const summary = useMemo(() => generateResultSummary(localInputs, results, currency, t), [localInputs, results, currency, t]);

  // Verdict share — reactive to inputs/results changes
  const { verdict, cardData, openWhatsApp: openVerdictWhatsApp } = useSimulatorVerdictShare({
    productName: localInputs.productName,
    revenue: results.revenue,
    profit: results.campaignProfitLoss,
    roas: results.roas,
    breakEvenRoas: results.breakEvenRoas,
    deliveryRate: localInputs.deliverySuccessRate,
    currency,
  });

  // Handle save analysis
  const handleSaveAnalysis = () => {
    if (!saveName.trim()) return;

    const analysis: SavedSimulatorAnalysis = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: saveName.trim(),
      createdAt: new Date().toISOString(),
      currency,
      inputs: { ...localInputs },
      results: {
        revenue: results.revenue,
        variableCosts: results.variableCosts,
        contributionPerOrder: results.contributionPerOrder,
        contributionBeforeAdvertising: results.contributionBeforeAdvertising,
        campaignProfitLoss: results.campaignProfitLoss,
        roas: results.roas,
        contributionMarginPercent: results.contributionMarginPercent,
        breakEvenRoas: results.breakEvenRoas,
        breakEvenOrders: results.breakEvenOrders,
      },
      verdict: isProfitable(results) ? 'Profitable' : 'Loss-making',
    };

    saveSimulatorAnalysis(analysis, userId);
    setSaveName('');
    setShowSaveModal(false);
  };

  // Handle export to downloadable HTML report
  const handleExportReport = () => {
    try {
      const analysis: SavedSimulatorAnalysis = {
        id: `${Date.now()}`,
        name: localInputs.productName || 'Untitled Analysis',
        createdAt: new Date().toISOString(),
        currency,
        inputs: { ...localInputs },
        results: {
          revenue: results.revenue,
          variableCosts: results.variableCosts,
          contributionPerOrder: results.contributionPerOrder,
          contributionBeforeAdvertising: results.contributionBeforeAdvertising,
          campaignProfitLoss: results.campaignProfitLoss,
          roas: results.roas,
          contributionMarginPercent: results.contributionMarginPercent,
          breakEvenRoas: results.breakEvenRoas,
          breakEvenOrders: results.breakEvenOrders,
        },
        verdict: isProfitable(results) ? 'Profitable' : 'Loss-making',
      };
      exportSimulatorToPdf(analysis, currency);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Export failed: ' + message);
    }
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = () => {
    const analysis: SavedSimulatorAnalysis = {
      id: `${Date.now()}`,
      name: localInputs.productName || 'Untitled Analysis',
      createdAt: new Date().toISOString(),
      currency,
      inputs: { ...localInputs },
      results: {
        revenue: results.revenue,
        variableCosts: results.variableCosts,
        contributionPerOrder: results.contributionPerOrder,
        contributionBeforeAdvertising: results.contributionBeforeAdvertising,
        campaignProfitLoss: results.campaignProfitLoss,
        roas: results.roas,
        contributionMarginPercent: results.contributionMarginPercent,
        breakEvenRoas: results.breakEvenRoas,
        breakEvenOrders: results.breakEvenOrders,
      },
      verdict: isProfitable(results) ? 'Profitable' : 'Loss-making',
    };
    const text = generateWhatsAppSummary(analysis, currency);
    shareOnWhatsApp(text);
  };

  // Validate and update input — values entered in the selected currency are converted to PKR for storage
  const handleInputChange = (field: keyof SimulationInputs, value: string) => {
    if (field === 'productName') {
      const newLocal = { ...localInputs, productName: value };
      setLocalInputs(newLocal);
      scheduleSync(newLocal);
      return;
    }

    // Delivery success rate is a percentage, not a monetary field
    if (field === 'deliverySuccessRate') {
      const numericValue = parseFloat(value);
      if (value === '') {
        const newLocal = { ...localInputs, deliverySuccessRate: 0 };
        setLocalInputs(newLocal);
        scheduleSync(newLocal);
        return;
      }
      if (isNaN(numericValue)) {
        setErrors((prev) => ({ ...prev, [field]: 'Please enter a valid number' }));
        return;
      }
      const clamped = Math.min(100, Math.max(0, roundTwo(numericValue)));
      setErrors((prev) => ({ ...prev, [field]: '' }));
      const newLocal = { ...localInputs, deliverySuccessRate: clamped };
      setLocalInputs(newLocal);
      scheduleSync(newLocal);
      return;
    }

    // Expected orders is an integer, not monetary
    if (field === 'expectedOrders') {
      const numericValue = parseFloat(value);
      if (value === '') {
        const newLocal = { ...localInputs, expectedOrders: 0 };
        setLocalInputs(newLocal);
        scheduleSync(newLocal);
        setErrors((prev) => ({ ...prev, [field]: '' }));
        return;
      }
      if (isNaN(numericValue)) {
        setErrors((prev) => ({ ...prev, [field]: 'Please enter a valid number' }));
        return;
      }
      if (numericValue < 0) {
        setErrors((prev) => ({ ...prev, [field]: 'Value cannot be negative' }));
        return;
      }
      setErrors((prev) => ({ ...prev, [field]: '' }));
      const newLocal = { ...localInputs, expectedOrders: Math.round(numericValue) };
      setLocalInputs(newLocal);
      scheduleSync(newLocal);
      return;
    }

    const rawValue = parseFloat(value);

    // Allow empty string for clearing
    if (value === '') {
      const newLocal = { ...localInputs, [field]: 0 };
      setLocalInputs(newLocal);
      scheduleSync(newLocal);
      setErrors((prev) => ({ ...prev, [field]: '' }));
      return;
    }

    // Validate numeric values
    if (isNaN(rawValue)) {
      setErrors((prev) => ({ ...prev, [field]: 'Please enter a valid number' }));
      return;
    }

    if (rawValue < 0) {
      setErrors((prev) => ({ ...prev, [field]: 'Value cannot be negative' }));
      return;
    }

    setErrors((prev) => ({ ...prev, [field]: '' }));
    // Use roundTwo (exponential-notation trick) to avoid IEEE 754 float64
    // multiplication artefacts (e.g. 1500.555*100 = 150055.49999999997).
    const numericValue = roundTwo(rawValue);
    // Convert from display currency back to PKR for internal storage, then round
    const pkrValue = roundTwo(convertAmount(numericValue, currency, DEFAULT_CURRENCY));
    const newLocal = { ...localInputs, [field]: pkrValue };
    setLocalInputs(newLocal);
    scheduleSync(newLocal);
  };

  // Reset to demo values
  const handleReset = () => {
    // When auto-calc is active, override the hardcoded demo deliveryCost with
    // the computed courier rate so the value matches the auto-calc label.
    const effectiveDeliveryCost =
      courierMode !== 'manual'
        ? calculateDeliveryCost(ratesConfig.couriers[courierMode], courierWeight, courierZone, ratesConfig)
        : DEFAULT_SIMULATION_INPUTS.deliveryCost;

    const resetInputs: SimulationInputs = {
      ...DEFAULT_SIMULATION_INPUTS,
      deliveryCost: effectiveDeliveryCost,
    };

    setLocalInputs(resetInputs);
    onInputsChange(resetInputs);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setErrors({});
  };

  // Clear all inputs
  const handleClear = () => {
    // When auto-calc is active, use the computed courier rate instead of 0
    // so the delivery cost matches the auto-calc label.
    const effectiveDeliveryCost =
      courierMode !== 'manual'
        ? calculateDeliveryCost(ratesConfig.couriers[courierMode], courierWeight, courierZone, ratesConfig)
        : 0;

    const cleared: SimulationInputs = {
      productName: '',
      sellingPrice: 0,
      productCost: 0,
      deliveryCost: effectiveDeliveryCost,
      rtoShippingCost: 0,
      otherVariableCosts: 0,
      advertisingBudget: 0,
      expectedOrders: 0,
      deliverySuccessRate: 75,
    };
    setLocalInputs(cleared);
    onInputsChange(cleared);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setErrors({});
  };

  // Determine profit/loss color
  const profitColor = getProfitColor(results.campaignProfitLoss);

  return (
    <div
      className="min-w-0 space-y-6 overflow-hidden"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_launchsimulator_tsx_b79e">
      {/* Page Header */}
      <div className="space-y-2" data-icod-id="src_pages_launchsimulator_tsx_f8dd">
        <div className="flex flex-wrap items-center gap-4" data-icod-id="src_pages_launchsimulator_tsx_header_row">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('overview')}
            data-icod-id="src_pages_launchsimulator_tsx_back_btn">
            <ArrowLeft className="h-5 w-5" data-icod-id="src_pages_launchsimulator_tsx_back_icon" />
          </Button>
          <div className="flex-1" data-icod-id="src_pages_launchsimulator_tsx_header_text">
            <h1
              className="text-3xl font-bold text-[#171717]"
              data-icod-id="src_pages_launchsimulator_tsx_83a9">{t('Launch Simulator')}</h1>
            <p
              className="text-muted-foreground"
              data-icod-id="src_pages_launchsimulator_tsx_aaf0">
              {t('Model your product economics and predict campaign profitability.')}
            </p>
          </div>
          {/* Save/Export Actions */}
          <div className="flex flex-wrap gap-2" data-icod-id="src_pages_launchsimulator_tsx_save_actions">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSaveModal(true)}
              className="gap-2"
              data-icod-id="src_pages_launchsimulator_tsx_save_btn">
              <Save className="h-4 w-4" data-icod-id="src_pages_launchsimulator_tsx_save_icon" />
              {t('Save')}
            </Button>
            {canExport ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportReport}
                className="gap-2"
                data-icod-id="src_pages_launchsimulator_tsx_export_pdf_btn">
                <Download className="h-4 w-4" data-icod-id="src_pages_launchsimulator_tsx_export_pdf_icon" />
                {t('Export Report')}
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2" data-icod-id="src_pages_launchsimulator_tsx_export_locked_wrap">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="gap-2 opacity-60"
                  onClick={() => setShowExportUpgradePrompt(true)}
                  data-icod-id="src_pages_launchsimulator_tsx_export_pdf_btn_locked">
                  <Lock className="h-4 w-4" data-icod-id="src_pages_launchsimulator_tsx_export_lock_icon" />
                  {t('Export Report')}
                  <span className="ml-1 rounded bg-[#8B72E8]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8B72E8]" data-icod-id="src_pages_launchsimulator_tsx_pro_badge">Pro</span>
                </Button>
                <span className="text-xs text-muted-foreground" data-icod-id="src_pages_launchsimulator_tsx_export_hint">
                  {t('requires Standard or Business plan')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/pricing')}
                  data-icod-id="src_pages_launchsimulator_tsx_view_plans_btn">
                  {t('View Plans')}
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppShare}
              className="gap-2"
              data-icod-id="src_pages_launchsimulator_tsx_whatsapp_btn">
              <Share2 className="h-4 w-4" data-icod-id="src_pages_launchsimulator_tsx_whatsapp_icon" />
              {t('Share')}
            </Button>
          </div>
        </div>
        {/* Export gating notice when user cannot export */}
        {!canExport && showExportUpgradePrompt && (
          <div className="mt-2" data-icod-id="src_pages_launchsimulator_tsx_export_gated">
            <UpgradePrompt
              message={exportUpgradeMessage || 'Report exports require Standard or Business plan with confirmed payment'}
              className="w-full"
              data-icod-id="src_pages_launchsimulator_tsx_export_upgrade_prompt" />
          </div>
        )}
        {/* Product Switcher */}
        <div
          className="max-w-sm pt-2"
          data-icod-id="src_pages_launchsimulator_tsx_691f">
          <ProductSwitcher data-icod-id="src_pages_launchsimulator_tsx_40ae" />
        </div>
      </div>
      {/* Currency disclaimer */}
      <Alert variant="info" data-icod-id="src_pages_launchsimulator_tsx_currency_disclaimer">
        <div className="flex items-start gap-2" data-icod-id="src_pages_launchsimulator_tsx_disclaimer_content">
          <Info className="h-4 w-4 shrink-0 mt-0.5" data-icod-id="src_pages_launchsimulator_tsx_info_icon" />
          <div data-icod-id="src_pages_launchsimulator_tsx_disclaimer_text_wrap">
            <span data-icod-id="src_pages_launchsimulator_tsx_disclaimer_text">
              {t('Values are automatically converted when you change currency. Enter amounts in your selected currency.')}
            </span>
            {currency !== 'PKR' && (
              <p className="mt-1 text-xs opacity-80" data-icod-id="src_pages_launchsimulator_tsx_exchange_rate_label">
                {getExchangeRateLabel()}
              </p>
            )}
          </div>
        </div>
      </Alert>
      {/* Promotional Banner — COD Profitability Calculator (Slide 3) */}
      <div className="space-y-4" data-icod-id="src_pages_launchsimulator_tsx_promo_banner_2">
        <div
          className="mx-auto max-w-full rounded-2xl shadow-lg"
          style={{ maxWidth: '64rem' }}
          data-icod-id="src_pages_launchsimulator_tsx_7d8b">
          <img
            src="/assets/1795053088411_slide-3-1920x1080-upload.webp"
            alt="COD Profitability Calculator"
            className="h-auto w-full max-w-full object-contain"
            loading="lazy"
            data-icod-id="src_pages_launchsimulator_tsx_promo_banner_2_img"
          />
        </div>
        <div className="flex justify-center" data-icod-id="src_pages_launchsimulator_tsx_promo_banner_2_cta">
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
            data-icod-id="src_pages_launchsimulator_tsx_promo_banner_2_btn">
            {t('Calculate Now')}
            <Calculator className="h-5 w-5" data-icod-id="src_pages_launchsimulator_tsx_promo_banner_2_icon" />
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-icod-id="src_pages_launchsimulator_tsx_main_grid">
        {/* Input Section */}
        <Card variant="lavender" className="min-w-0 p-6" data-icod-id="src_pages_launchsimulator_tsx_inputs_card">
          <div className="mb-6 flex items-center justify-between" data-icod-id="src_pages_launchsimulator_tsx_inputs_header">
            <h2 className="text-xl font-semibold text-foreground" data-icod-id="src_pages_launchsimulator_tsx_inputs_title">
              {t('Simulation Inputs')}
            </h2>
            <div className="flex gap-2" data-icod-id="src_pages_launchsimulator_tsx_actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="gap-2"
                data-icod-id="src_pages_launchsimulator_tsx_clear_btn">
                <Trash2 className="h-4 w-4" data-icod-id="src_pages_launchsimulator_tsx_clear_icon" />
                {t('Clear')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="gap-2 whitespace-nowrap"
                data-icod-id="src_pages_launchsimulator_tsx_reset_btn">
                <RotateCcw className="h-4 w-4" data-icod-id="src_pages_launchsimulator_tsx_reset_icon" />
                <span
                  className="hidden sm:inline"
                  data-icod-id="src_pages_launchsimulator_tsx_6a95">{t('Reset to Demo')}</span>
                <span className="sm:hidden" data-icod-id="src_pages_launchsimulator_tsx_8b4d">{t('Reset')}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4" data-icod-id="src_pages_launchsimulator_tsx_form_fields">
            <Field label={t('Product Name')} htmlFor="productName" data-icod-id="src_pages_launchsimulator_tsx_field_product">
              <Input
                id="productName"
                value={localInputs.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder={t('Enter product name')}
                data-icod-id="src_pages_launchsimulator_tsx_input_product" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-icod-id="src_pages_launchsimulator_tsx_pricing_grid">
              <Field 
                label={`${t('Selling Price')} (${currency})`} 
                htmlFor="sellingPrice" 
                error={errors.sellingPrice}
                required
                data-icod-id="src_pages_launchsimulator_tsx_field_price">
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={roundTwo(convertAmount(localInputs.sellingPrice, DEFAULT_CURRENCY, currency)) || ''}
                  onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                  placeholder="0"
                  data-icod-id="src_pages_launchsimulator_tsx_input_price" />
              </Field>

              <Field 
                label={`${t('Product Cost')} (${currency})`} 
                htmlFor="productCost" 
                error={errors.productCost}
                required
                data-icod-id="src_pages_launchsimulator_tsx_field_cost">
                <Input
                  id="productCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={roundTwo(convertAmount(localInputs.productCost, DEFAULT_CURRENCY, currency)) || ''}
                  onChange={(e) => handleInputChange('productCost', e.target.value)}
                  placeholder="0"
                  data-icod-id="src_pages_launchsimulator_tsx_input_cost" />
              </Field>
            </div>

            {/* Courier Cost Calculator */}
            <div
              className="rounded-lg border border-border/40 bg-muted/30 p-4 space-y-3"
              data-icod-id="src_pages_launchsimulator_tsx_603b">
              <div
                className="flex items-center justify-between"
                data-icod-id="src_pages_launchsimulator_tsx_840d">
                <label
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                  data-icod-id="src_pages_launchsimulator_tsx_7b65">
                  <Truck
                    className="h-4 w-4 text-muted-foreground"
                    data-icod-id="src_pages_launchsimulator_tsx_23da" />
                  {t('Courier Cost Calculator')}
                </label>
                <button
                  onClick={() => {
                    if (courierMode === 'manual') {
                      // Switching from manual → auto-calc: save current manual delivery cost
                      savedManualDeliveryCost.current = localInputs.deliveryCost;
                      setCourierMode('tcs');
                    } else {
                      // Switching from auto-calc → manual: restore previous manual delivery cost
                      const restored = savedManualDeliveryCost.current;
                      const newLocal = { ...localInputs, deliveryCost: restored };
                      setLocalInputs(newLocal);
                      scheduleSync(newLocal);
                      setCourierMode('manual');
                    }
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                  data-icod-id="src_pages_launchsimulator_tsx_f251">
                  {courierMode === 'manual' ? t('Enable auto-calc') : t('Manual override')}
                </button>
              </div>
              {courierMode !== 'manual' && (
                <div
                  className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]"
                  data-icod-id="src_pages_launchsimulator_tsx_389a">
                  <div data-icod-id="src_pages_launchsimulator_tsx_3d7c">
                    <label
                      className="mb-1 block text-xs text-muted-foreground"
                      data-icod-id="src_pages_launchsimulator_tsx_9ee5">{t('Courier')}</label>
                    <div className="flex gap-1" data-icod-id="src_pages_launchsimulator_tsx_2d12">
                      {COURIER_IDS.map((cid) => (
                        <button
                          key={cid}
                          onClick={() => setCourierMode(cid)}
                          className={cn(
                            'flex-1 rounded border px-2 py-1.5 text-xs font-medium transition-all',
                            courierMode === cid
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border/60 bg-background text-muted-foreground hover:border-border'
                          )}
                          data-icod-id={`src_pages_launchsimulator_tsx_0cc1_${cid}`}>
                          {ratesConfig.couriers[cid].name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div data-icod-id="src_pages_launchsimulator_tsx_b396">
                    <label
                      className="mb-1 block text-xs text-muted-foreground"
                      data-icod-id="src_pages_launchsimulator_tsx_7aa1">{t('Weight (kg)')}</label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={courierWeight}
                      onChange={(e) => setCourierWeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      data-icod-id="src_pages_launchsimulator_tsx_2c51" />
                  </div>
                  <div data-icod-id="src_pages_launchsimulator_tsx_b2fc">
                    <label
                      className="mb-1 block text-xs text-muted-foreground"
                      data-icod-id="src_pages_launchsimulator_tsx_2964">{t('Zone')}</label>
                    <select
                      value={courierZone}
                      onChange={(e) => setCourierZone(e.target.value as Zone)}
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                      data-icod-id="src_pages_launchsimulator_tsx_4a26">
                      {(Object.entries(ZONE_LABELS) as [Zone, string][]).map(([val, label]) => (
                        <option
                          key={val}
                          value={val}
                          data-icod-id={`src_pages_launchsimulator_tsx_0ef8_${val}`}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {courierMode !== 'manual' && courierDeliveryCost !== null && (
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_pages_launchsimulator_tsx_83b3">
                  {t('Auto-calculated:')} {formatCurrency(courierDeliveryCost, currency)} {t('delivery cost')} ({ratesConfig.couriers[courierMode].name}, {courierWeight}kg, {ZONE_LABELS[courierZone]})
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-icod-id="src_pages_launchsimulator_tsx_costs_grid">
              <Field 
                label={`${t('Delivery Cost')} (${currency})`} 
                htmlFor="deliveryCost" 
                error={errors.deliveryCost}
                data-icod-id="src_pages_launchsimulator_tsx_field_delivery">
                <Input
                  id="deliveryCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={roundTwo(convertAmount(localInputs.deliveryCost, DEFAULT_CURRENCY, currency)) || ''}
                  onChange={(e) => handleInputChange('deliveryCost', e.target.value)}
                  placeholder="0"
                  data-icod-id="src_pages_launchsimulator_tsx_input_delivery" />
              </Field>

              <Field 
                label={`${t('RTO Shipping Cost')} (${currency})`} 
                htmlFor="rtoShippingCost" 
                error={errors.rtoShippingCost}
                hint={t('Cost per returned order (used for break-even)')}
                data-icod-id="src_pages_launchsimulator_tsx_field_rto_cost">
                <Input
                  id="rtoShippingCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={roundTwo(convertAmount(localInputs.rtoShippingCost, DEFAULT_CURRENCY, currency)) || ''}
                  onChange={(e) => handleInputChange('rtoShippingCost', e.target.value)}
                  placeholder="0"
                  data-icod-id="src_pages_launchsimulator_tsx_input_rto_cost" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-icod-id="src_pages_launchsimulator_tsx_other_costs_grid">
              <Field 
                label={`${t('Other Variable Costs')} (${currency})`} 
                htmlFor="otherVariableCosts" 
                error={errors.otherVariableCosts}
                data-icod-id="src_pages_launchsimulator_tsx_field_other">
                <Input
                  id="otherVariableCosts"
                  type="number"
                  min="0"
                  step="0.01"
                  value={roundTwo(convertAmount(localInputs.otherVariableCosts, DEFAULT_CURRENCY, currency)) || ''}
                  onChange={(e) => handleInputChange('otherVariableCosts', e.target.value)}
                  placeholder="0"
                  data-icod-id="src_pages_launchsimulator_tsx_input_other" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-icod-id="src_pages_launchsimulator_tsx_campaign_grid">
              <Field 
                label={`${t('Advertising Budget')} (${currency})`} 
                htmlFor="advertisingBudget" 
                error={errors.advertisingBudget}
                required
                data-icod-id="src_pages_launchsimulator_tsx_field_adbudget">
                <Input
                  id="advertisingBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={roundTwo(convertAmount(localInputs.advertisingBudget, DEFAULT_CURRENCY, currency)) || ''}
                  onChange={(e) => handleInputChange('advertisingBudget', e.target.value)}
                  placeholder="0"
                  data-icod-id="src_pages_launchsimulator_tsx_input_adbudget" />
              </Field>

              <Field 
                label={t('Expected Orders')} 
                htmlFor="expectedOrders" 
                error={errors.expectedOrders}
                required
                data-icod-id="src_pages_launchsimulator_tsx_field_orders">
                <Input
                  id="expectedOrders"
                  type="number"
                  min="0"
                  step="1"
                  value={localInputs.expectedOrders || ''}
                  onChange={(e) => handleInputChange('expectedOrders', e.target.value)}
                  placeholder="0"
                  data-icod-id="src_pages_launchsimulator_tsx_input_orders" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-icod-id="src_pages_launchsimulator_tsx_delivery_grid">
              <Field
                label={t('Delivery Success Rate (%)')}
                htmlFor="deliverySuccessRate"
                hint={`${localInputs.deliverySuccessRate}% ${t('success,')} ${(100 - localInputs.deliverySuccessRate).toFixed(0)}% ${t('RTO')}`}
                data-icod-id="src_pages_launchsimulator_tsx_field_delivery_rate">
                <Input
                  id="deliverySuccessRate"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={localInputs.deliverySuccessRate ?? 75}
                  onChange={(e) => handleInputChange('deliverySuccessRate', e.target.value)}
                  placeholder="75"
                  data-icod-id="src_pages_launchsimulator_tsx_input_delivery_rate" />
              </Field>
            </div>
          </div>
        </Card>

        {/* Results Section */}
        <div className="min-w-0 space-y-6" data-icod-id="src_pages_launchsimulator_tsx_results_section">
          {/* Warnings */}
          {results.warnings.length > 0 && (
            <div className="space-y-2" data-icod-id="src_pages_launchsimulator_tsx_warnings">
              {results.warnings.map((warning, index) => (
                <Alert key={index} variant="warning" data-icod-id={`src_pages_launchsimulator_tsx_warning_${index}`}>
                  <div className="flex items-start gap-2" data-icod-id="src_pages_launchsimulator_tsx_warning_content">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" data-icod-id="src_pages_launchsimulator_tsx_warning_icon" />
                    <span data-icod-id="src_pages_launchsimulator_tsx_warning_text">{warning}</span>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-icod-id="src_pages_launchsimulator_tsx_kpi_grid">
            <ResultCard
              title={t('Estimated Revenue')}
              value={formatCurrency(results.revenue, currency)}
              icon={CurrencyIcon}
              accentColor="violet"
              subtitle={`${localInputs.expectedOrders} orders × ${formatCurrency(localInputs.sellingPrice, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              cardVariant="lavender"
              data-icod-id="src_pages_launchsimulator_tsx_kpi_revenue" />
            
            <ResultCard
              title={t('Campaign Profit/Loss')}
              value={formatCurrency(results.campaignProfitLoss, currency)}
              icon={isProfitable(results) ? TrendingUp : AlertCircle}
              accentColor={profitColor}
              subtitle={isProfitable(results) ? t('Profitable campaign') : t('Loss-making campaign')}
              cardVariant="mint"
              data-icod-id="src_pages_launchsimulator_tsx_kpi_profit" />
            
            <ResultCard
              title={t('Contribution Per Order')}
              value={formatCurrency(results.contributionPerOrder, currency)}
              icon={Package}
              accentColor="violet"
              subtitle={results.contributionMarginPercent !== null 
                ? `${formatPercentage(results.contributionMarginPercent)} margin` 
                : 'N/A'}
              cardVariant="cream"
              data-icod-id="src_pages_launchsimulator_tsx_kpi_contribution" />
            
            <ResultCard
              title={t('Break-Even ROAS')}
              value={results.breakEvenRoas !== null ? formatMultiplier(results.breakEvenRoas) : 'N/A'}
              icon={Target}
              accentColor="indigo"
              subtitle="(Delivery Rate × Selling Price) / Expected Contribution per Placed Order"
              cardVariant="lavender"
              data-icod-id="src_pages_launchsimulator_tsx_kpi_breakeven" />
          </div>

          {/* Additional Metrics */}
          <Card variant="cream" className="p-6" data-icod-id="src_pages_launchsimulator_tsx_metrics_card">
            <h3 className="mb-4 text-lg font-semibold text-foreground" data-icod-id="src_pages_launchsimulator_tsx_metrics_title">
              {t('Detailed Breakdown')}
            </h3>
            <div className="space-y-3" data-icod-id="src_pages_launchsimulator_tsx_metrics_list">
              <div className="flex justify-between py-2 border-b border-border/50" data-icod-id="src_pages_launchsimulator_tsx_metric_variable">
                <span className="text-muted-foreground" data-icod-id="src_pages_launchsimulator_tsx_metric_label">{t('Total Variable Costs')}</span>
                <span className="font-semibold text-foreground" data-icod-id="src_pages_launchsimulator_tsx_metric_value">
                  {formatCurrency(results.variableCosts, currency)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50" data-icod-id="src_pages_launchsimulator_tsx_metric_contribution">
                <span className="text-muted-foreground" data-icod-id="src_pages_launchsimulator_tsx_metric_label">{t('Contribution Before Advertising')}</span>
                <span className="font-semibold text-foreground" data-icod-id="src_pages_launchsimulator_tsx_metric_value">
                  {formatCurrency(results.contributionBeforeAdvertising, currency)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50" data-icod-id="src_pages_launchsimulator_tsx_metric_roas">
                <span className="text-muted-foreground" data-icod-id="src_pages_launchsimulator_tsx_metric_label">ROAS</span>
                <span className="font-semibold text-foreground" data-icod-id="src_pages_launchsimulator_tsx_metric_value">
                  {results.roas !== null ? formatMultiplier(results.roas) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2" data-icod-id="src_pages_launchsimulator_tsx_metric_margin">
                <span className="text-muted-foreground" data-icod-id="src_pages_launchsimulator_tsx_metric_label">{t('Contribution Margin')}</span>
                <span className="font-semibold text-foreground" data-icod-id="src_pages_launchsimulator_tsx_metric_value">
                  {results.contributionMarginPercent !== null ? formatPercentage(results.contributionMarginPercent) : 'N/A'}
                </span>
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card className={cn(
            "p-6",
            isProfitable(results) ? "bg-[#9DD37D]/10 border-[#9DD37D]" : "bg-[#E88B9E]/10 border-[#E88B9E]"
          )} data-icod-id="src_pages_launchsimulator_tsx_summary_card">
            <div className="flex items-start gap-3" data-icod-id="src_pages_launchsimulator_tsx_summary_content">
              <div className={cn(
                "rounded-full p-2",
                isProfitable(results) ? "bg-[#9DD37D] text-[#171717]" : "bg-[#E88B9E] text-white"
              )} data-icod-id="src_pages_launchsimulator_tsx_summary_icon_wrap">
                {isProfitable(results) ? (
                  <TrendingUp className="h-5 w-5" data-icod-id="src_pages_launchsimulator_tsx_summary_icon_up" />
                ) : (
                  <AlertCircle className="h-5 w-5" data-icod-id="src_pages_launchsimulator_tsx_summary_icon_alert" />
                )}
              </div>
              <div className="space-y-2" data-icod-id="src_pages_launchsimulator_tsx_summary_text_wrap">
                <h3 className="font-semibold text-foreground" data-icod-id="src_pages_launchsimulator_tsx_summary_title">
                  {isProfitable(results) ? t('Campaign Outlook: Positive') : t('Campaign Outlook: Negative')}
                </h3>
                <p className="text-sm text-foreground" data-icod-id="src_pages_launchsimulator_tsx_summary_text">
                  {summary}
                </p>
              </div>
            </div>
          </Card>

          {/* Verdict Share Section */}
          <div className="max-w-full space-y-4 overflow-hidden" data-icod-id="src_pages_launchsimulator_tsx_verdict_share_section">
            <Button
              variant="primary"
              size="md"
              onClick={openVerdictWhatsApp}
              className="w-full gap-2 whitespace-normal sm:w-auto sm:whitespace-nowrap"
              style={{ backgroundColor: '#25D366', color: '#fff' }}
              data-icod-id="src_pages_launchsimulator_tsx_verdict_whatsapp_btn"
            >
              <MessageCircle className="h-5 w-5 shrink-0" data-icod-id="src_pages_launchsimulator_tsx_verdict_wa_icon" />
              <span
                className="hidden sm:inline"
                data-icod-id="src_pages_launchsimulator_tsx_04ed">{t('Share Verdict on WhatsApp')}</span>
              <span className="sm:hidden" data-icod-id="src_pages_launchsimulator_tsx_c28e">{t('Share on WhatsApp')}</span>
            </Button>
            <VerdictCard
              data={cardData}
              data-icod-id="src_pages_launchsimulator_tsx_verdict_card"
            />
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs italic text-muted-foreground" data-icod-id="src_pages_launchsimulator_tsx_disclaimer">
            {t('Results are estimates based on your provided assumptions. Actual results may vary.')}
          </p>
        </div>
      </div>
      {/* Save Analysis Modal */}
      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title={t('Save Analysis')}
        footer={
          <div className="flex justify-end gap-2" data-icod-id="src_pages_launchsimulator_tsx_save_modal_footer">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveModal(false)}
              data-icod-id="src_pages_launchsimulator_tsx_save_modal_cancel">{t('Cancel')}</Button>
            <Button
              size="sm"
              onClick={handleSaveAnalysis}
              disabled={!saveName.trim()}
              data-icod-id="src_pages_launchsimulator_tsx_save_modal_save">{t('Save')}</Button>
          </div>
        }
        data-icod-id="src_pages_launchsimulator_tsx_save_modal">
        <Field
          label={t('Analysis Name')}
          htmlFor="analysisName"
          data-icod-id="src_pages_launchsimulator_tsx_save_modal_field">
          <Input
            id="analysisName"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder={t('e.g. Skincare Serum - March Launch')}
            autoFocus
            data-icod-id="src_pages_launchsimulator_tsx_save_modal_input" />
        </Field>
      </Modal>
      {/* Reset to Demo Confirmation Modal */}
      <Modal
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title={t('Reset to Demo Values')}
        footer={
          <div className="flex gap-2" data-icod-id="src_pages_launchsimulator_tsx_reset_confirm_footer">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResetConfirm(false)}
              data-icod-id="src_pages_launchsimulator_tsx_reset_confirm_cancel">{t('Cancel')}</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setShowResetConfirm(false);
                handleReset();
              }}
              data-icod-id="src_pages_launchsimulator_tsx_reset_confirm_btn">{t('Reset')}</Button>
          </div>
        }
        data-icod-id="src_pages_launchsimulator_tsx_reset_confirm_modal">
        <p className="text-sm text-muted-foreground" data-icod-id="src_pages_launchsimulator_tsx_reset_confirm_text">
          {t('This will replace all current values with the demo product values (Premium Skincare Serum). Any changes you have made will be lost.')}
        </p>
      </Modal>
      {/* Clear All Fields Confirmation Modal */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title={t('Clear All Fields')}
        footer={
          <div className="flex gap-2" data-icod-id="src_pages_launchsimulator_tsx_clear_confirm_footer">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearConfirm(false)}
              data-icod-id="src_pages_launchsimulator_tsx_clear_confirm_cancel">{t('Cancel')}</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setShowClearConfirm(false);
                handleClear();
              }}
              data-icod-id="src_pages_launchsimulator_tsx_clear_confirm_btn">{t('Clear')}</Button>
          </div>
        }
        data-icod-id="src_pages_launchsimulator_tsx_clear_confirm_modal">
        <p className="text-sm text-muted-foreground" data-icod-id="src_pages_launchsimulator_tsx_clear_confirm_text">
          {t('This will zero out all fields except the delivery success rate (which will remain at 75%). Any changes you have made will be lost.')}
        </p>
      </Modal>
    </div>
  );
}
