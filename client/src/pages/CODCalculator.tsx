import { useState, useMemo, useEffect } from 'react';
import {
  Truck,
  Calculator,
  MapPin,
  Weight,
  DollarSign,
  Percent,
  TrendingUp,
  Settings2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Award,
  Info,
  Building2,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Button, Card, Field, Input, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/currency';
import { useAppSelector } from '@/store/hooks';
import type { PageId } from '@/components/Sidebar';
import { useTranslation } from '@/utils/i18n';
import { useCourierRates } from '@/hooks/useCourierRates';
import {
  DEFAULT_COURIER_RATES,
  ZONE_LABELS,
  COURIER_IDS,
  CITY_DELIVERY_SUCCESS_RATES,
  ALL_CITIES,
  calculateAllCouriers,
  calculateBreakEvenByCity,
  calculateCityDeliveryCosts,
  calculateDeliveryCost,
  type CourierId,
  type Zone,
  type CourierRatesConfig,
  type CourierCostResult,
} from '@/utils/courierEngine';

interface CODCalculatorProps {
  currency: string;
  onNavigate: (page: PageId) => void;
}

const CITIES = ['Karachi', 'Lahore', 'Islamabad'];
const COMPARISON_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];

export default function CODCalculator({ currency, onNavigate }: CODCalculatorProps) {
  const { t } = useTranslation();

  // ─── Shared Courier Rates ────────────────────────────────────────────────
  const {
    rates: ratesConfig,
    updateRates: updateRatesConfig,
    resetToDefaults: resetRates,
    syncRates,
    lastSyncedAt,
    isCustomized,
    justSynced,
    clearJustSynced,
  } = useCourierRates();

  // ─── Active Product (for product cost / other costs) ────────────────────
  const activeProductId = useAppSelector((s) => s.products.activeProductId);
  const products = useAppSelector((s) => s.products.items);
  const activeProduct = products.find((p) => p._id === activeProductId) ?? null;
  const effectiveProductCost = activeProduct?.productCost ?? 0;
  const effectiveOtherCosts = activeProduct?.otherCosts ?? 0;

  // ─── Input State ────────────────────────────────────────────────────────
  const [selectedCourier, setSelectedCourier] = useState<CourierId>('tcs');
  const [weight, setWeight] = useState(1);
  const [zone, setZone] = useState<Zone>('within-city');
  const [orderValue, setOrderValue] = useState(3000);
  const [deliveryRate, setDeliveryRate] = useState(75);
  const [adBudget, setAdBudget] = useState(12000);
  const [rtoCost, setRtoCost] = useState(DEFAULT_COURIER_RATES.rtoCostDefault);

  // ─── Editable Rates UI ──────────────────────────────────────────────────
  const [showRateEditor, setShowRateEditor] = useState(false);

  // Auto-clear sync confirmation after 3 seconds
  useEffect(() => {
    if (justSynced) {
      const timer = setTimeout(clearJustSynced, 3000);
      return () => clearTimeout(timer);
    }
  }, [justSynced, clearJustSynced]);

  // ─── Calculations ───────────────────────────────────────────────────────
  const allResults = useMemo(
    () => calculateAllCouriers(weight, zone, orderValue, deliveryRate, adBudget, ratesConfig, rtoCost, effectiveProductCost, effectiveOtherCosts),
    [weight, zone, orderValue, deliveryRate, adBudget, ratesConfig, rtoCost, effectiveProductCost, effectiveOtherCosts]
  );

  const selectedResult = allResults.find((r) => r.courierId === selectedCourier) ?? allResults[0];

  // Break-even ROAS by city (for Karachi, Lahore, Islamabad as origin)
  const breakEvenByCity = useMemo(
    () => {
      const result: Record<string, Record<string, Record<CourierId, number | null>>> = {};
      for (const origin of CITIES) {
        result[origin] = calculateBreakEvenByCity(
          origin, CITIES, weight, orderValue, deliveryRate, adBudget, ratesConfig, rtoCost, effectiveProductCost, effectiveOtherCosts
        );
      }
      return result;
    },
    [weight, orderValue, deliveryRate, adBudget, ratesConfig, rtoCost, effectiveProductCost, effectiveOtherCosts]
  );

  // City delivery cost comparison (1kg parcel from Karachi)
  const cityDeliveryCosts = useMemo(
    () => calculateCityDeliveryCosts('Karachi', COMPARISON_CITIES, 1, ratesConfig),
    [ratesConfig]
  );

  // ─── Rate Editor Helpers ────────────────────────────────────────────────
  const updateCourierRate = (courierId: CourierId, field: keyof typeof ratesConfig.couriers.tcs, value: number) => {
    const newConfig = {
      ...ratesConfig,
      couriers: {
        ...ratesConfig.couriers,
        [courierId]: { ...ratesConfig.couriers[courierId], [field]: value },
      },
    };
    updateRatesConfig(newConfig);
  };

  const updateZoneMultiplier = (z: Zone, value: number) => {
    const newConfig = {
      ...ratesConfig,
      zoneMultipliers: { ...ratesConfig.zoneMultipliers, [z]: value },
    };
    updateRatesConfig(newConfig);
  };

  // ─── Format Helpers ─────────────────────────────────────────────────────
  const fmt = (val: number) => formatCurrency(val, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtRoas = (val: number | null) => val !== null ? `${val.toFixed(2)}x` : 'N/A';

  // ─── Freshness label ────────────────────────────────────────────────────
  const syncedLabel = lastSyncedAt
    ? `${t('Last synced:')} ${new Date(lastSyncedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date(lastSyncedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    : t('Never synced');

  return (
    <div className="space-y-6" data-icod-id="src_pages_codcalculator_tsx_root">
      {/* Header */}
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        data-icod-id="src_pages_codcalculator_tsx_b546">
        <div data-icod-id="src_pages_codcalculator_tsx_db5e">
          <h1
            className="text-2xl font-bold text-foreground"
            data-icod-id="src_pages_codcalculator_tsx_af97">{t('COD/RTO Calculator')}</h1>
          <p
            className="mt-1 text-sm text-muted-foreground"
            data-icod-id="src_pages_codcalculator_tsx_e8af">
            {t('Compare courier costs, COD fees, and break-even ROAS across Pakistani couriers')}
          </p>
        </div>
        <div className="flex items-center gap-2" data-icod-id="src_pages_codcalculator_tsx_header_btns">
          <Button
            variant="outline"
            size="sm"
            onClick={syncRates}
            data-icod-id="src_pages_codcalculator_tsx_sync_btn">
            <RefreshCw className="mr-2 h-4 w-4" data-icod-id="src_pages_codcalculator_tsx_sync_icon" />
            {t('Sync Rates')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRateEditor(!showRateEditor)}
            data-icod-id="src_pages_codcalculator_tsx_6ace">
            <Settings2 className="mr-2 h-4 w-4" data-icod-id="src_pages_codcalculator_tsx_8241" />
            {showRateEditor ? t('Hide Rate Editor') : t('Edit Rates')}
          </Button>
        </div>
      </div>
      {/* Sync confirmation toast */}
      {justSynced && (
        <Alert variant="info" data-icod-id="src_pages_codcalculator_tsx_sync_confirm">
          {t('Rates synced to defaults')}
        </Alert>
      )}
      {/* Freshness indicator */}
      <div className="space-y-1" data-icod-id="src_pages_codcalculator_tsx_freshness">
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
          data-icod-id="src_pages_codcalculator_tsx_f16e">
          <span className="flex items-center gap-1" data-icod-id="src_pages_codcalculator_tsx_freshness_ts">
            <Clock className="h-3 w-3" data-icod-id="src_pages_codcalculator_tsx_freshness_clock" />
            {syncedLabel}
          </span>
          {isCustomized && (
            <span className="font-medium text-warning" data-icod-id="src_pages_codcalculator_tsx_freshness_custom">
              {t('Rates customized since last sync')}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground" data-icod-id="src_pages_codcalculator_tsx_freshness_disclaimer">
          {t('Indicative rates — not a live courier feed. Verify with your courier.')}
        </p>
      </div>
      <Alert variant="info" data-icod-id="src_pages_codcalculator_tsx_8f7a">
        <div className="space-y-1" data-icod-id="src_pages_codcalculator_tsx_fuel_note_wrap">
          <p data-icod-id="src_pages_codcalculator_tsx_fuel_note_main">
            Rates move with fuel — 18.5% fuel surcharge in Q4 2026. Rates are indicative, researched Nov 2026 — edit to match your courier rate card.
          </p>
          <p className="text-xs opacity-80" data-icod-id="src_pages_codcalculator_tsx_fuel_note_updated">
            Last updated: Nov 2026
          </p>
        </div>
      </Alert>
      {/* Rate Editor Panel */}
      {showRateEditor && (
        <Card
          className="p-6 space-y-6 border-border/60 bg-card"
          data-icod-id="src_pages_codcalculator_tsx_51b7">
          <div
            className="flex items-center justify-between"
            data-icod-id="src_pages_codcalculator_tsx_655c">
            <h2
              className="text-lg font-semibold text-foreground"
              data-icod-id="src_pages_codcalculator_tsx_2cb5">{t('Rate Configuration')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetRates}
              data-icod-id="src_pages_codcalculator_tsx_401a">
              <RotateCcw className="mr-2 h-4 w-4" data-icod-id="src_pages_codcalculator_tsx_c1d1" />
              {t('Reset to Defaults')}
            </Button>
          </div>

          {/* Courier rates */}
          <div
            className="grid gap-6 md:grid-cols-3"
            data-icod-id="src_pages_codcalculator_tsx_df60">
            {COURIER_IDS.map((cid) => {
              const c = ratesConfig.couriers[cid];
              return (
                <div
                  key={cid}
                  className="space-y-3 rounded-lg border border-border/40 p-4"
                  data-icod-id={`src_pages_codcalculator_tsx_46ae_${cid}`}>
                  <h3
                    className="font-semibold text-foreground"
                    data-icod-id={`src_pages_codcalculator_tsx_7e2f_${cid}`}>{c.name}</h3>
                  <Field
                    label="Base rate (1kg PKR)"
                    data-icod-id={`src_pages_codcalculator_tsx_d8bb_${cid}`}>
                    <Input
                      type="number"
                      value={c.baseRate1kg}
                      onChange={(e) => updateCourierRate(cid, 'baseRate1kg', parseFloat(e.target.value) || 0)}
                      data-icod-id={`src_pages_codcalculator_tsx_a423_${cid}`} />
                  </Field>
                  <Field
                    label={`COD fee % (min ${c.codFeeMinimum > 0 ? fmt(c.codFeeMinimum) : 'No minimum'})`}
                    data-icod-id={`src_pages_codcalculator_tsx_351f_${cid}`}>
                    <Input
                      type="number"
                      step="0.1"
                      value={c.codFeePercent}
                      onChange={(e) => updateCourierRate(cid, 'codFeePercent', parseFloat(e.target.value) || 0)}
                      data-icod-id={`src_pages_codcalculator_tsx_547a_${cid}`} />
                  </Field>
                  <Field
                    label="COD fee minimum (PKR)"
                    data-icod-id={`src_pages_codcalculator_tsx_aadf_${cid}`}>
                    <Input
                      type="number"
                      value={c.codFeeMinimum}
                      onChange={(e) => updateCourierRate(cid, 'codFeeMinimum', parseFloat(e.target.value) || 0)}
                      data-icod-id={`src_pages_codcalculator_tsx_f3c8_${cid}`} />
                  </Field>
                  <Field
                    label="Settlement days"
                    data-icod-id={`src_pages_codcalculator_tsx_ee1c_${cid}`}>
                    <Input
                      type="text"
                      value={c.settlementDays}
                      onChange={(e) => {
                        const newConfig = {
                          ...ratesConfig,
                          couriers: {
                            ...ratesConfig.couriers,
                            [cid]: { ...ratesConfig.couriers[cid], settlementDays: e.target.value },
                          },
                        };
                        updateRatesConfig(newConfig);
                      }}
                      data-icod-id={`src_pages_codcalculator_tsx_4e09_${cid}`} />
                  </Field>
                </div>
              );
            })}
          </div>

          {/* Zone multipliers & extras */}
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            data-icod-id="src_pages_codcalculator_tsx_2db6">
            {(Object.entries(ZONE_LABELS) as [Zone, string][]).map(([z, label]) => (
              <Field
                key={z}
                label={`${label} multiplier`}
                data-icod-id={`src_pages_codcalculator_tsx_8535_${z}`}>
                <Input
                  type="number"
                  step="0.01"
                  value={ratesConfig.zoneMultipliers[z]}
                  onChange={(e) => updateZoneMultiplier(z, parseFloat(e.target.value) || 0)}
                  data-icod-id={`src_pages_codcalculator_tsx_b6c1_${z}`} />
              </Field>
            ))}
            <Field
              label="Extra weight charge (PKR/kg)"
              data-icod-id="src_pages_codcalculator_tsx_8706">
              <Input
                type="number"
                value={ratesConfig.extraWeightPerKg}
                onChange={(e) => {
                  const newConfig = { ...ratesConfig, extraWeightPerKg: parseFloat(e.target.value) || 0 };
                  updateRatesConfig(newConfig);
                }}
                data-icod-id="src_pages_codcalculator_tsx_0db1" />
            </Field>
          </div>
        </Card>
      )}
      {/* Main Inputs */}
      <Card className="p-6" data-icod-id="src_pages_codcalculator_tsx_1d9b">
        <h2
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_codcalculator_tsx_d101">{t('Shipment Parameters')}</h2>
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          data-icod-id="src_pages_codcalculator_tsx_02a3">
          {/* Courier Selector */}
          <Field label={t('Courier')} data-icod-id="src_pages_codcalculator_tsx_b508">
            <div className="flex gap-2" data-icod-id="src_pages_codcalculator_tsx_e0c9">
              {COURIER_IDS.map((cid) => (
                <button
                  key={cid}
                  onClick={() => setSelectedCourier(cid)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                    selectedCourier === cid
                      ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                      : 'border-border/60 bg-background text-muted-foreground hover:border-border hover:bg-muted'
                  )}
                  data-icod-id={`src_pages_codcalculator_tsx_0f61_${cid}`}>
                  {ratesConfig.couriers[cid].name}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label={t('Weight (kg)')}
            htmlFor="weight"
            data-icod-id="src_pages_codcalculator_tsx_ba4e">
            <Input
              id="weight"
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
              data-icod-id="src_pages_codcalculator_tsx_196f" />
          </Field>

          <Field
            label={t('Zone')}
            htmlFor="zone"
            data-icod-id="src_pages_codcalculator_tsx_853f">
            <div className="relative" data-icod-id="src_pages_codcalculator_tsx_006b">
              <select
                id="zone"
                value={zone}
                onChange={(e) => setZone(e.target.value as Zone)}
                className={cn(
                  'w-full appearance-none rounded-lg border border-border/60 bg-background px-3 py-2.5 pr-8 text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'
                )}
                data-icod-id="src_pages_codcalculator_tsx_5866">
                {(Object.entries(ZONE_LABELS) as [Zone, string][]).map(([val, label]) => (
                  <option
                    key={val}
                    value={val}
                    data-icod-id={`src_pages_codcalculator_tsx_6888_${val}`}>{label}</option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                data-icod-id="src_pages_codcalculator_tsx_bb09" />
            </div>
          </Field>

          <Field
            label={t('Order value (PKR)')}
            htmlFor="orderValue"
            data-icod-id="src_pages_codcalculator_tsx_560b">
            <Input
              id="orderValue"
              type="number"
              min="0"
              value={orderValue}
              onChange={(e) => setOrderValue(Math.max(0, parseFloat(e.target.value) || 0))}
              data-icod-id="src_pages_codcalculator_tsx_5cc6" />
          </Field>

          <Field
            label={t('Delivery success rate (%)')}
            htmlFor="deliveryRate"
            data-icod-id="src_pages_codcalculator_tsx_689b">
            <Input
              id="deliveryRate"
              type="number"
              min="0"
              max="100"
              value={deliveryRate}
              onChange={(e) => setDeliveryRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              data-icod-id="src_pages_codcalculator_tsx_1d61" />
          </Field>

          <Field
            label={t('RTO shipping cost (PKR)')}
            htmlFor="rtoCost"
            data-icod-id="src_pages_codcalculator_tsx_5eb4">
            <Input
              id="rtoCost"
              type="number"
              min="0"
              value={rtoCost}
              onChange={(e) => setRtoCost(Math.max(0, parseFloat(e.target.value) || 0))}
              data-icod-id="src_pages_codcalculator_tsx_ff1d" />
          </Field>
        </div>

        <div
          className="mt-4 grid gap-4 sm:grid-cols-2"
          data-icod-id="src_pages_codcalculator_tsx_ef8d">
          <Field
            label={t('Ad budget (PKR)')}
            htmlFor="adBudget"
            data-icod-id="src_pages_codcalculator_tsx_f273">
            <Input
              id="adBudget"
              type="number"
              min="0"
              value={adBudget}
              onChange={(e) => setAdBudget(Math.max(0, parseFloat(e.target.value) || 0))}
              data-icod-id="src_pages_codcalculator_tsx_7d47" />
          </Field>
        </div>

        <p
          className="mt-3 text-xs text-muted-foreground"
          data-icod-id="src_pages_codcalculator_tsx_82eb">
          Full RTO cost (including product loss): indicative {fmt(ratesConfig.rtoCostRangeLow)}–{fmt(ratesConfig.rtoCostRangeHigh)} per returned order
        </p>
      </Card>
      {/* Side-by-side Results */}
      <div data-icod-id="src_pages_codcalculator_tsx_f79a">
        <h2
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_codcalculator_tsx_296c">{t('Cost Comparison')}</h2>
        <div
          className="grid gap-4 md:grid-cols-3"
          data-icod-id="src_pages_codcalculator_tsx_956d">
          {allResults.map((result) => (
            <CourierResultCard
              key={result.courierId}
              result={result}
              isSelected={result.courierId === selectedCourier}
              currency={currency}
              fmt={fmt}
              fmtRoas={fmtRoas}
              t={t}
              data-icod-id={`src_pages_codcalculator_tsx_493f_${result.courierId}`} />
          ))}
        </div>
      </div>
      {/* Detailed breakdown for selected courier */}
      <Card className="p-6" data-icod-id="src_pages_codcalculator_tsx_75e3">
        <h2
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_codcalculator_tsx_10bc">
          {t('Detailed Breakdown')} — {selectedResult.courierName}
        </h2>
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-icod-id="src_pages_codcalculator_tsx_13c9">
          <MetricRow
            label={t('Delivery cost')}
            value={fmt(selectedResult.deliveryCost)}
            icon={Truck}
            data-icod-id="src_pages_codcalculator_tsx_d5a5" />
          <MetricRow
            label={t('COD fee')}
            value={fmt(selectedResult.codFee)}
            icon={DollarSign}
            subtitle={`${ratesConfig.couriers[selectedCourier].codFeePercent}% of ${fmt(orderValue)}`}
            data-icod-id="src_pages_codcalculator_tsx_2f93" />
          <MetricRow
            label={t('Expected RTO cost/order')}
            value={fmt(selectedResult.expectedRtoCost)}
            icon={RotateCcw}
            subtitle={`${(100 - deliveryRate).toFixed(0)}% return rate × ${fmt(rtoCost)}`}
            data-icod-id="src_pages_codcalculator_tsx_5ce9" />
          <MetricRow
            label={t('Total cost/placed order')}
            value={fmt(selectedResult.totalCostPerPlacedOrder)}
            icon={Calculator}
            highlight
            data-icod-id="src_pages_codcalculator_tsx_7405" />
          <MetricRow
            label={t('Expected contribution/order')}
            value={fmt(selectedResult.expectedContributionPerPlacedOrder)}
            icon={TrendingUp}
            color={selectedResult.expectedContributionPerPlacedOrder >= 0 ? 'green' : 'coral'}
            data-icod-id="src_pages_codcalculator_tsx_1762" />
          <MetricRow
            label={t('Break-even ROAS')}
            value={fmtRoas(selectedResult.breakEvenRoas)}
            icon={Percent}
            data-icod-id="src_pages_codcalculator_tsx_aaec" />
          <MetricRow
            label={t('Settlement period')}
            value={selectedResult.settlementDays + ' days'}
            icon={Info}
            data-icod-id="src_pages_codcalculator_tsx_82ba" />
        </div>
      </Card>
      {/* Break-even ROAS by City */}
      <Card className="p-6" data-icod-id="src_pages_codcalculator_tsx_d7ee">
        <h2
          className="mb-2 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_codcalculator_tsx_31e1">{t('Break-even ROAS by Origin City')}</h2>
        <p
          className="mb-4 text-xs text-muted-foreground"
          data-icod-id="src_pages_codcalculator_tsx_2e5e">
          Same-city deliveries use Within City rate; inter-city use Different Zone rate. Ad budget: {fmt(adBudget)}
        </p>
        <div
          className="overflow-x-auto"
          data-icod-id="src_pages_codcalculator_tsx_cbea">
          <table
            className="w-full text-sm"
            data-icod-id="src_pages_codcalculator_tsx_f267">
            <thead data-icod-id="src_pages_codcalculator_tsx_5bbb">
              <tr
                className="border-b border-border/40"
                data-icod-id="src_pages_codcalculator_tsx_f5df">
                <th
                  className="pb-2 text-left font-medium text-muted-foreground"
                  data-icod-id="src_pages_codcalculator_tsx_343a">{t('Origin City')}</th>
                <th
                  className="pb-2 text-left font-medium text-muted-foreground"
                  data-icod-id="src_pages_codcalculator_tsx_eec8">{t('Destination')}</th>
                {COURIER_IDS.map((cid) => (
                  <th
                    key={cid}
                    className="pb-2 text-right font-medium text-muted-foreground"
                    data-icod-id={`src_pages_codcalculator_tsx_c580_${cid}`}>
                    {ratesConfig.couriers[cid].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody data-icod-id="src_pages_codcalculator_tsx_a7bf">
              {CITIES.map((origin, __icodIdx1) => CITIES.map((dest, __icodIdx0) => {
                const roas = breakEvenByCity[origin]?.[dest];
                return (
                  <tr
                    key={`${origin}-${dest}`}
                    className="border-b border-border/20"
                    data-icod-id={`src_pages_codcalculator_tsx_7a46_${__icodIdx1}_${__icodIdx0}`}>
                    {dest === CITIES[0] && (
                      <td
                        rowSpan={CITIES.length}
                        className="pr-4 pt-2 align-top font-medium text-foreground"
                        data-icod-id={`src_pages_codcalculator_tsx_acd1_${__icodIdx1}_${__icodIdx0}`}>
                        {origin}
                      </td>
                    )}
                    <td
                      className="py-2 text-muted-foreground"
                      data-icod-id={`src_pages_codcalculator_tsx_e94c_${__icodIdx1}_${__icodIdx0}`}>{dest}</td>
                    {COURIER_IDS.map((cid) => (
                      <td
                        key={cid}
                        className="py-2 text-right tabular-nums text-foreground"
                        data-icod-id={`src_pages_codcalculator_tsx_d444_${__icodIdx1}_${__icodIdx0}_${cid}`}>
                        {fmtRoas(roas?.[cid] ?? null)}
                      </td>
                    ))}
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {/* City Delivery Cost Comparison */}
      <Card className="p-6" data-icod-id="src_pages_codcalculator_tsx_01cb">
        <h2
          className="mb-2 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_codcalculator_tsx_3709">{t('Delivery Cost by Destination City')}</h2>
        <p
          className="mb-4 text-xs text-muted-foreground"
          data-icod-id="src_pages_codcalculator_tsx_6876">
          1 kg parcel from Karachi. Same-city uses Within City rate; others use Different Zone rate.
        </p>
        <div
          className="overflow-x-auto"
          data-icod-id="src_pages_codcalculator_tsx_8928">
          <table
            className="w-full text-sm"
            data-icod-id="src_pages_codcalculator_tsx_b688">
            <thead data-icod-id="src_pages_codcalculator_tsx_3683">
              <tr
                className="border-b border-border/40"
                data-icod-id="src_pages_codcalculator_tsx_1a3a">
                <th
                  className="pb-2 text-left font-medium text-muted-foreground"
                  data-icod-id="src_pages_codcalculator_tsx_3499">{t('Destination')}</th>
                {COURIER_IDS.map((cid) => (
                  <th
                    key={cid}
                    className="pb-2 text-right font-medium text-muted-foreground"
                    data-icod-id={`src_pages_codcalculator_tsx_09f9_${cid}`}>
                    {ratesConfig.couriers[cid].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody data-icod-id="src_pages_codcalculator_tsx_195a">
              {cityDeliveryCosts.map(({ city, costs }) => (
                <tr
                  key={city}
                  className="border-b border-border/20"
                  data-icod-id={`src_pages_codcalculator_tsx_b1f6_${city}`}>
                  <td
                    className="py-2 font-medium text-foreground"
                    data-icod-id={`src_pages_codcalculator_tsx_f98f_${city}`}>{city}</td>
                  {COURIER_IDS.map((cid) => (
                    <td
                      key={cid}
                      className="py-2 text-right tabular-nums text-foreground"
                      data-icod-id={`src_pages_codcalculator_tsx_ea9b_${city}_${cid}`}>
                      {fmt(costs[cid])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Break-Even ROAS by City */}
      <BreakEvenByCitySection
        currency={currency}
        orderValue={orderValue}
        weight={weight}
        adBudget={adBudget}
        rtoCost={rtoCost}
        ratesConfig={ratesConfig}
        fmt={fmt}
        fmtRoas={fmtRoas}
        t={t}
        lastSyncedAt={lastSyncedAt}
        isCustomized={isCustomized}
        data-icod-id="src_pages_codcalculator_tsx_be_city_section" />
    </div>
  );
}

// ─── Break-Even ROAS by City Section ────────────────────────────────────────

interface BreakEvenByCitySectionProps {
  currency: string;
  orderValue: number;
  weight: number;
  adBudget: number;
  rtoCost: number;
  ratesConfig: CourierRatesConfig;
  fmt: (val: number) => string;
  fmtRoas: (val: number | null) => string;
  t: (key: string) => string;
  lastSyncedAt: string | null;
  isCustomized: boolean;
}

function BreakEvenByCitySection({
  orderValue,
  weight,
  adBudget,
  rtoCost,
  ratesConfig,
  fmt,
  fmtRoas,
  t,
  lastSyncedAt,
  isCustomized,
}: BreakEvenByCitySectionProps) {
  // Read the current active product from Redux to use its selling price and product cost
  const activeProductId = useAppSelector((s) => s.products.activeProductId);
  const products = useAppSelector((s) => s.products.items);
  const activeProduct = products.find((p) => p._id === activeProductId) ?? null;

  // Use active product's selling price if available, otherwise fall back to the local orderValue input
  const effectiveSellingPrice = activeProduct?.sellingPrice ?? orderValue;
  const effectiveProductCost = activeProduct?.productCost ?? 0;
  const effectiveOtherCosts = activeProduct?.otherCosts ?? 0;

  // Compute break-even ROAS per city using each city's assumed delivery success rate
  const cityBreakEvenData = useMemo(() => {
    return COMPARISON_CITIES.map((city) => {
      const successRate = CITY_DELIVERY_SUCCESS_RATES[city] ?? 75;
      const zone: Zone = city === 'Karachi' ? 'within-city' : 'different-zone';
      const courierResults = COURIER_IDS.map((cid) => {
        const deliveryCost = calculateDeliveryCost(
          ratesConfig.couriers[cid],
          weight,
          zone,
          ratesConfig
        );
        const codFee = Math.max(
          Math.round(effectiveSellingPrice * ratesConfig.couriers[cid].codFeePercent / 100 * 100) / 100,
          ratesConfig.couriers[cid].codFeeMinimum
        );
        const deliveryRateDecimal = successRate / 100;

        // Canonical formula:
        // 1. Delivered Contribution = Selling Price − Product Cost − Delivery Cost − Other Costs
        const deliveredContribution = Math.round(
          (effectiveSellingPrice - effectiveProductCost - deliveryCost - effectiveOtherCosts) * 100
        ) / 100;

        // 2. Expected Contribution = Delivered Contribution × Delivery Rate − RTO Cost × (1 − Delivery Rate)
        const expectedContribution = Math.round(
          (deliveredContribution * deliveryRateDecimal - rtoCost * (1 - deliveryRateDecimal)) * 100
        ) / 100;

        // 3. Break-Even ROAS = (Delivery Rate × Selling Price) / Expected Contribution
        let breakEvenRoas: number | null = null;
        if (expectedContribution > 0 && adBudget > 0) {
          const expectedRevenue = Math.round(effectiveSellingPrice * deliveryRateDecimal * 100) / 100;
          breakEvenRoas = Math.round((expectedRevenue / expectedContribution) * 100) / 100;
        }

        return {
          courierId: cid,
          courierName: ratesConfig.couriers[cid].name,
          deliveryCost,
          breakEvenRoas,
        };
      });

      return {
        city,
        successRate,
        couriers: courierResults,
      };
    });
  }, [weight, effectiveSellingPrice, effectiveProductCost, effectiveOtherCosts, adBudget, rtoCost, ratesConfig]);

  return (
    <div className="space-y-4" data-icod-id="src_pages_codcalculator_tsx_be_city_root">
      <div data-icod-id="src_pages_codcalculator_tsx_be_city_header">
        <h2
          className="text-lg font-semibold text-foreground"
          data-icod-id="src_pages_codcalculator_tsx_be_city_title">
          {t('Break-Even ROAS by City')}
        </h2>
        <p
          className="mt-1 text-xs text-muted-foreground"
          data-icod-id="src_pages_codcalculator_tsx_be_city_subtitle">
          {activeProduct
            ? `${t('Using current product')}: ${activeProduct.name} (${fmt(effectiveSellingPrice)})`
            : `${t('Using order value')}: ${fmt(effectiveSellingPrice)}`}
        </p>
        {/* Freshness indicator */}
        <div
          className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
          data-icod-id="src_pages_codcalculator_tsx_29d6">
          <span
            className="flex items-center gap-1"
            data-icod-id="src_pages_codcalculator_tsx_e6b0">
            <Clock className="h-3 w-3" data-icod-id="src_pages_codcalculator_tsx_1153" />
            {lastSyncedAt
              ? `${t('Last synced:')} ${new Date(lastSyncedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : t('Never synced')}
          </span>
          {isCustomized && (
            <span
              className="font-medium text-warning"
              data-icod-id="src_pages_codcalculator_tsx_1fd5">
              {t('Rates customized since last sync')}
            </span>
          )}
          <span data-icod-id="src_pages_codcalculator_tsx_5b2b">{t('Indicative rates — not a live courier feed. Verify with your courier.')}</span>
        </div>
      </div>
      {/* Mobile-first stacked cards */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-icod-id="src_pages_codcalculator_tsx_be_city_grid">
        {cityBreakEvenData.map(({ city, successRate, couriers }) => (
          <Card
            key={city}
            className="p-4"
            data-icod-id={`src_pages_codcalculator_tsx_be_city_card_${city}`}>
            <div
              className="mb-3 flex items-center gap-2"
              data-icod-id={`src_pages_codcalculator_tsx_be_city_card_header_${city}`}>
              <Building2
                className="h-4 w-4 text-primary"
                data-icod-id={`src_pages_codcalculator_tsx_be_city_icon_${city}`} />
              <h3
                className="font-semibold text-foreground"
                data-icod-id={`src_pages_codcalculator_tsx_be_city_name_${city}`}>
                {city}
              </h3>
              <span
                className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                data-icod-id={`src_pages_codcalculator_tsx_be_city_rate_${city}`}>
                {successRate}% {t('delivery')}
              </span>
            </div>

            <div
              className="space-y-2"
              data-icod-id={`src_pages_codcalculator_tsx_be_city_couriers_${city}`}>
              {couriers.map(({ courierId, courierName, deliveryCost, breakEvenRoas }) => (
                <div
                  key={courierId}
                  className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2"
                  data-icod-id={`src_pages_codcalculator_tsx_be_city_row_${city}_${courierId}`}>
                  <div data-icod-id={`src_pages_codcalculator_tsx_be_city_info_${city}_${courierId}`}>
                    <span
                      className="text-sm font-medium text-foreground"
                      data-icod-id={`src_pages_codcalculator_tsx_be_city_cname_${city}_${courierId}`}>
                      {courierName}
                    </span>
                    <span
                      className="ml-2 text-xs text-muted-foreground"
                      data-icod-id={`src_pages_codcalculator_tsx_be_city_dcost_${city}_${courierId}`}>
                      {fmt(deliveryCost)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-bold tabular-nums',
                      breakEvenRoas !== null ? 'text-foreground' : 'text-muted-foreground'
                    )}
                    data-icod-id={`src_pages_codcalculator_tsx_be_city_roas_${city}_${courierId}`}>
                    {breakEvenRoas !== null ? `${breakEvenRoas.toFixed(2)}x` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {/* Explanatory note */}
      <Alert variant="info" data-icod-id="src_pages_codcalculator_tsx_be_city_note">
        <p className="text-xs" data-icod-id="src_pages_codcalculator_tsx_be_city_note_text">
          {t('Break-Even ROAS by City note')}
        </p>
      </Alert>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CourierResultCardProps {
  result: CourierCostResult;
  isSelected: boolean;
  currency: string;
  fmt: (val: number) => string;
  fmtRoas: (val: number | null) => string;
  t: (key: string) => string;
}

function CourierResultCard({ result, isSelected, currency, fmt, fmtRoas, t }: CourierResultCardProps) {
  return (
    <Card
      className={cn(
        'relative p-5 transition-all duration-200',
        isSelected ? 'ring-2 ring-primary shadow-md' : 'opacity-90 hover:opacity-100'
      )}
      data-icod-id="src_pages_codcalculator_tsx_9b2d">
      {result.isCheapest && (
        <div
          className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-1 text-xs font-bold text-success shadow-sm"
          data-icod-id="src_pages_codcalculator_tsx_4d9f">
          <Award className="h-3 w-3" data-icod-id="src_pages_codcalculator_tsx_7766" />
          {t('Cheapest')}
        </div>
      )}
      <div
        className="mb-3 flex items-center justify-between"
        data-icod-id="src_pages_codcalculator_tsx_cded">
        <h3
          className="text-lg font-bold text-foreground"
          data-icod-id="src_pages_codcalculator_tsx_9a52">{result.courierName}</h3>
        {isSelected && (
          <span
            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            data-icod-id="src_pages_codcalculator_tsx_fb30">
            {t('Selected')}
          </span>
        )}
      </div>
      <div
        className="space-y-2 text-sm"
        data-icod-id="src_pages_codcalculator_tsx_a214">
        <div
          className="flex justify-between"
          data-icod-id="src_pages_codcalculator_tsx_0176">
          <span
            className="text-muted-foreground"
            data-icod-id="src_pages_codcalculator_tsx_b46a">{t('Delivery')}</span>
          <span
            className="tabular-nums text-foreground"
            data-icod-id="src_pages_codcalculator_tsx_8e32">{fmt(result.deliveryCost)}</span>
        </div>
        <div
          className="flex justify-between"
          data-icod-id="src_pages_codcalculator_tsx_6ba1">
          <span
            className="text-muted-foreground"
            data-icod-id="src_pages_codcalculator_tsx_1fe1">{t('COD fee')}</span>
          <span
            className="tabular-nums text-foreground"
            data-icod-id="src_pages_codcalculator_tsx_b665">{fmt(result.codFee)}</span>
        </div>
        <div
          className="flex justify-between"
          data-icod-id="src_pages_codcalculator_tsx_97ec">
          <span
            className="text-muted-foreground"
            data-icod-id="src_pages_codcalculator_tsx_b0b9">{t('Exp. RTO')}</span>
          <span
            className="tabular-nums text-foreground"
            data-icod-id="src_pages_codcalculator_tsx_44c0">{fmt(result.expectedRtoCost)}</span>
        </div>
        <div
          className="my-2 border-t border-border/40"
          data-icod-id="src_pages_codcalculator_tsx_a5bf" />
        <div
          className="flex justify-between font-semibold"
          data-icod-id="src_pages_codcalculator_tsx_c4d9">
          <span
            className="text-foreground"
            data-icod-id="src_pages_codcalculator_tsx_cd0b">{t('Total/order')}</span>
          <span
            className="tabular-nums text-foreground"
            data-icod-id="src_pages_codcalculator_tsx_25a8">{fmt(result.totalCostPerPlacedOrder)}</span>
        </div>
        <div
          className="flex justify-between"
          data-icod-id="src_pages_codcalculator_tsx_130e">
          <span
            className="text-muted-foreground"
            data-icod-id="src_pages_codcalculator_tsx_f0b4">{t('Contribution')}</span>
          <span
            className={cn(
              'tabular-nums font-medium',
              result.expectedContributionPerPlacedOrder >= 0 ? 'text-success' : 'text-destructive'
            )}
            data-icod-id="src_pages_codcalculator_tsx_589b">
            {fmt(result.expectedContributionPerPlacedOrder)}
          </span>
        </div>
        <div
          className="flex justify-between"
          data-icod-id="src_pages_codcalculator_tsx_0ffa">
          <span
            className="text-muted-foreground"
            data-icod-id="src_pages_codcalculator_tsx_998a">{t('BE ROAS')}</span>
          <span
            className="tabular-nums text-foreground"
            data-icod-id="src_pages_codcalculator_tsx_37f5">{fmtRoas(result.breakEvenRoas)}</span>
        </div>
        <div
          className="flex justify-between text-xs"
          data-icod-id="src_pages_codcalculator_tsx_cabe">
          <span
            className="text-muted-foreground"
            data-icod-id="src_pages_codcalculator_tsx_b78c">{t('Settlement')}</span>
          <span
            className="text-muted-foreground"
            data-icod-id="src_pages_codcalculator_tsx_358c">{result.settlementDays} days</span>
        </div>
      </div>
    </Card>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
  icon: React.ElementType;
  subtitle?: string;
  highlight?: boolean;
  color?: 'green' | 'coral';
}

function MetricRow({ label, value, icon: Icon, subtitle, highlight, color }: MetricRowProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3',
        highlight ? 'border-primary/30 bg-primary/5' : 'border-border/40'
      )}
      data-icod-id="src_pages_codcalculator_tsx_0ec2">
      <div
        className={cn(
          'mt-0.5 rounded-lg p-2',
          color === 'green' ? 'bg-success/10 text-success' :
          color === 'coral' ? 'bg-destructive/10 text-destructive' :
          highlight ? 'bg-primary/10 text-primary' :
          'bg-muted text-muted-foreground'
        )}
        data-icod-id="src_pages_codcalculator_tsx_c90c">
        <Icon className="h-4 w-4" data-icod-id="src_pages_codcalculator_tsx_b1bb" />
      </div>
      <div data-icod-id="src_pages_codcalculator_tsx_7de3">
        <p
          className="text-xs text-muted-foreground"
          data-icod-id="src_pages_codcalculator_tsx_ade4">{label}</p>
        <p
          className={cn(
            'text-lg font-bold tabular-nums',
            color === 'green' ? 'text-success' :
            color === 'coral' ? 'text-destructive' :
            'text-foreground'
          )}
          data-icod-id="src_pages_codcalculator_tsx_d020">
          {value}
        </p>
        {subtitle && <p
          className="text-xs text-muted-foreground"
          data-icod-id="src_pages_codcalculator_tsx_37c7">{subtitle}</p>}
      </div>
    </div>
  );
}
