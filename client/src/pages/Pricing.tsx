import { useState, useEffect, useMemo } from 'react';
import { Check, Tag, Truck, ArrowRight, RefreshCw, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setPreferredBillingCycle } from '@/store/slices/subscriptionSlice';
import { formatPlanPrice, getExchangeRateLabel, convertPKRtoUSD, formatCurrency } from '@/utils/currency';
import { scopedGetRaw, scopedSetRaw, STORAGE_KEYS } from '@/utils/scopedStorage';
import { useTranslation } from '@/utils/i18n';
import { useCourierRates } from '@/hooks/useCourierRates';
import {
  COURIER_IDS,
  calculateCityDeliveryCosts,
} from '@/utils/courierEngine';

/* =========================================================================
 * PRICING CONFIGURATION — edit prices and features here
 * ========================================================================= */

const MONTHLY_DISCOUNT_PERCENT = 20;

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPricePKR: number;
  yearlyPricePKR: number;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Free',
    monthlyPricePKR: 0,
    yearlyPricePKR: 0,
    features: [
      { text: 'Basic AI access' },
      { text: 'Limited research' },
      { text: 'Limited projects' },
      { text: 'Basic reports' },
    ],
    cta: 'Get Started',
  },
  {
    id: 'standard',
    name: 'Standard',
    tagline: '',
    monthlyPricePKR: 1500,
    yearlyPricePKR: 14400,
    features: [
      { text: 'Advanced AI access' },
      { text: 'More research capabilities' },
      { text: 'Increased project limits' },
      { text: 'Detailed analysis' },
      { text: 'Report exports' },
    ],
    cta: 'Upgrade Plan',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    tagline: '',
    monthlyPricePKR: 4000,
    yearlyPricePKR: 38400,
    features: [
      { text: 'Advanced AI capabilities' },
      { text: 'Higher usage limits' },
      { text: 'All premium features' },
      { text: 'Team collaboration' },
      { text: 'Advanced analytics' },
    ],
    cta: 'Choose Business',
  },
];

/* =========================================================================
 * COMPONENT
 * ========================================================================= */

export default function Pricing() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { preferredBillingCycle, subscription } = useAppSelector((s) => s.subscription);
  const { user } = useAppSelector((s) => s.auth);
  const isYearly = preferredBillingCycle === 'yearly';

  // Currency selector state (PKR or USD), persisted per-user
  const [pricingCurrency, setPricingCurrency] = useState<string>('PKR');

  useEffect(() => {
    // Read pricing currency; fall back to main app currency if pricing-specific isn't set
    const storedPricing = scopedGetRaw(STORAGE_KEYS.PRICING_CURRENCY, user?.id ?? null, '');
    const storedMain = scopedGetRaw(STORAGE_KEYS.CURRENCY, user?.id ?? null, '');
    const resolved = storedPricing || storedMain || 'PKR';
    if (resolved === 'USD' || resolved === 'PKR') {
      setPricingCurrency(resolved);
    }
  }, [user?.id]);

  const handleCurrencyToggle = () => {
    const next = pricingCurrency === 'PKR' ? 'USD' : 'PKR';
    setPricingCurrency(next);
    scopedSetRaw(STORAGE_KEYS.PRICING_CURRENCY, user?.id ?? null, next);
    // Also sync to main app currency so header stays in agreement
    scopedSetRaw(STORAGE_KEYS.CURRENCY, user?.id ?? null, next);
  };

  // Sync local toggle state to Redux whenever user toggles
  const handleToggle = () => {
    dispatch(setPreferredBillingCycle(isYearly ? 'monthly' : 'yearly'));
  };

  const handleCtaClick = (plan: PricingPlan) => {
    if (plan.id === 'basic') {
      navigate('/auth?tab=signup');
    } else {
      navigate(`/checkout?plan=${plan.id}&cycle=${isYearly ? 'yearly' : 'monthly'}`);
    }
  };

  // Current plan for badge display — users without a subscription record are on Basic.
  // When no user is authenticated, treat no plan as current so badges/buttons don't show.
  const currentPlanId = user ? (subscription?.plan ?? 'basic') : null;

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_pricing_tsx_1d2c">
      {/* Page header */}
      <div
        className="space-y-4 text-center"
        data-icod-id="src_pages_pricing_tsx_e0c5">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#29213D' }}
          data-icod-id="src_pages_pricing_tsx_3502">
          {t('Choose Your Plan')}
        </h1>
        <p
          className="mx-auto max-w-xl text-sm text-[#555] md:text-base"
          data-icod-id="src_pages_pricing_tsx_13c3">
          {t("Unlock the right tools to research smarter, build faster, and grow with AI.")}
        </p>

        {/* Monthly / Yearly toggle + Currency selector row */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
          data-icod-id="src_pages_pricing_tsx_ebe3">
          <div className="flex items-center gap-3" data-icod-id="src_pages_pricing_tsx_toggle_row">
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                !isYearly ? 'text-[#29213D]' : 'text-[#8B72E8]/60',
              )}
              data-icod-id="src_pages_pricing_tsx_b8ca">
              {t('Monthly')}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isYearly}
              onClick={handleToggle}
              className={cn(
                'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B72E8] focus-visible:ring-offset-2',
                isYearly ? 'bg-[#8B72E8]' : 'bg-[#D8B779]',
              )}
              data-icod-id="src_pages_pricing_tsx_3464">
              <span
                className={cn(
                  'pointer-events-none block h-5.5 w-5.5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
                  isYearly ? 'translate-x-5' : 'translate-x-0',
                )}
                style={{ height: '1.375rem', width: '1.375rem' }}
                data-icod-id="src_pages_pricing_tsx_efd8" />
            </button>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                isYearly ? 'text-[#29213D]' : 'text-[#8B72E8]/60',
              )}
              data-icod-id="src_pages_pricing_tsx_f1fa">
              {t('Yearly')}
            </span>
            {isYearly && (
              <span
                className="rounded-full bg-[#9DDCC5]/20 px-2 py-0.5 text-xs font-semibold text-[#29213D]"
                data-icod-id="src_pages_pricing_tsx_b9cb">
                {pricingCurrency === 'USD' ? t('Save up to 21%') : t('Save 20%')}
              </span>
            )}
          </div>

          {/* Currency toggle: PKR / USD */}
          <div className="flex items-center gap-2" data-icod-id="src_pages_pricing_tsx_currency_toggle">
            <button
              type="button"
              onClick={handleCurrencyToggle}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                pricingCurrency === 'PKR'
                  ? 'border-[#8B72E8] bg-[#8B72E8]/10 text-[#29213D]'
                  : 'border-border text-[#555] hover:border-[#8B72E8]/40',
              )}
              data-icod-id="src_pages_pricing_tsx_pkr_btn">
              PKR
            </button>
            <button
              type="button"
              onClick={handleCurrencyToggle}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                pricingCurrency === 'USD'
                  ? 'border-[#8B72E8] bg-[#8B72E8]/10 text-[#29213D]'
                  : 'border-border text-[#555] hover:border-[#8B72E8]/40',
              )}
              data-icod-id="src_pages_pricing_tsx_usd_btn">
              USD
            </button>
          </div>
        </div>

        {/* Exchange rate info */}
        <p
          className="text-xs text-[#555]"
          data-icod-id="src_pages_pricing_tsx_exchange_rate">
          {getExchangeRateLabel()}
        </p>
      </div>
      {/* Pricing cards grid */}
      <div
        className="mt-12 grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-3"
        data-icod-id="src_pages_pricing_tsx_0501">
        {PLANS.map((plan) => {
          const pricePKR = isYearly ? plan.yearlyPricePKR : plan.monthlyPricePKR;
          const isPopular = plan.popular === true;
          const isCurrentPlan = currentPlanId === plan.id;

          // Compute correct yearly monthly equivalent: yearlyPrice / 12
          const yearlyMonthlyEquivalent = plan.yearlyPricePKR > 0
            ? Math.round(plan.yearlyPricePKR / 12)
            : 0;

          return (
            <div
              key={plan.id}
              className="relative min-w-0"
              data-icod-id={`src_pages_pricing_tsx_5aa6_${plan.id}`}>
              {/* Popular badge */}
              {isPopular && (
                <div
                  className="absolute -top-4 left-1/2 z-10 -translate-x-1/2"
                  data-icod-id={`src_pages_pricing_tsx_7447_${plan.id}`}>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-4 py-1 text-xs font-bold tracking-wide text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #8B72E8, #29213D)' }}
                    data-icod-id={`src_pages_pricing_tsx_013c_${plan.id}`}>
                    <Tag
                      className="h-3 w-3"
                      data-icod-id={`src_pages_pricing_tsx_da02_${plan.id}`} />
                    {t('Most Popular')}
                  </span>
                </div>
              )}
              {/* Current Plan badge — only shown when user is signed in */}
              {isCurrentPlan && !!user && (
                <div
                  className="absolute -top-4 right-4 z-10"
                  data-icod-id={`src_pages_pricing_tsx_current_badge_${plan.id}`}>
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white shadow-md"
                    style={{ backgroundColor: '#9DDCC5' }}
                    data-icod-id={`src_pages_pricing_tsx_current_label_${plan.id}`}>
                    {t('Current Plan')}
                  </span>
                </div>
              )}
              <Card
                className={cn(
                  'relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1',
                  isPopular
                    ? 'border-2 border-[#8B72E8] shadow-xl lg:scale-105'
                    : 'border border-border shadow-md hover:shadow-lg',
                )}
                style={{
                  backgroundColor: '#F7F5FA',
                  ...(isPopular
                    ? { boxShadow: '0 20px 40px -12px rgba(139, 114, 232, 0.25)' }
                    : {}),
                }}
                data-icod-id={`src_pages_pricing_tsx_f3a2_${plan.id}`}>
                {/* Gradient accent bar for popular card */}
                {isPopular && (
                  <div
                    className="absolute left-0 right-0 top-0 h-1.5"
                    style={{ background: 'linear-gradient(90deg, #8B72E8, #D8B779, #9DDCC5)' }}
                    data-icod-id={`src_pages_pricing_tsx_68f3_${plan.id}`} />
                )}

                {/* Plan name & tagline */}
                <div
                  className="mb-4 space-y-1"
                  data-icod-id={`src_pages_pricing_tsx_8647_${plan.id}`}>
                  {plan.tagline && (
                    <p
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: isPopular ? '#8B72E8' : '#9DDCC5' }}
                      data-icod-id={`src_pages_pricing_tsx_afbb_${plan.id}`}>
                      {plan.tagline}
                    </p>
                  )}
                  <h3
                    className="text-xl font-bold"
                    style={{ color: '#29213D' }}
                    data-icod-id={`src_pages_pricing_tsx_18c5_${plan.id}`}>
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div
                  className="mb-6 flex items-baseline gap-1"
                  data-icod-id={`src_pages_pricing_tsx_1bdd_${plan.id}`}>
                  <span
                    className="text-4xl font-extrabold tracking-tight"
                    style={{ color: '#29213D' }}
                    data-icod-id={`src_pages_pricing_tsx_4d6c_${plan.id}`}>
                    {formatPlanPrice(pricePKR, pricingCurrency)}
                  </span>
                  <span
                    className="text-sm text-[#555]"
                    data-icod-id={`src_pages_pricing_tsx_c2b2_${plan.id}`}>
                    /{isYearly && plan.monthlyPricePKR > 0 ? t('per year') : t('per month')}
                  </span>
                </div>

                {/* Yearly savings note — corrected math: yearlyPrice / 12 */}
                {isYearly && plan.monthlyPricePKR > 0 && (
                  <p
                    className="mb-4 text-xs font-medium text-[#29213D]"
                    data-icod-id={`src_pages_pricing_tsx_savings_${plan.id}`}>
                    {t('{price}/mo equivalent · {savings}')
                      .replace('{price}', formatPlanPrice(yearlyMonthlyEquivalent, pricingCurrency))
                      .replace('{savings}', pricingCurrency === 'USD' ? t('Save up to 21%') : t('Save 20%'))}
                  </p>
                )}

                {/* Features list */}
                <ul
                  className="mb-8 flex-1 space-y-3"
                  data-icod-id={`src_pages_pricing_tsx_746b_${plan.id}`}>
                  {plan.features.map((feature) => (
                    <li
                      key={feature.text}
                      className="flex items-start gap-2.5"
                      data-icod-id={`src_pages_pricing_tsx_24a7_${plan.id}_${feature.text}`}>
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: isPopular ? 'rgba(139, 114, 232, 0.15)' : 'rgba(157, 220, 197, 0.2)',
                        }}
                        data-icod-id={`src_pages_pricing_tsx_179b_${plan.id}_${feature.text}`}>
                        <Check
                          className="h-3 w-3"
                          style={{ color: isPopular ? '#8B72E8' : '#29213D' }}
                          data-icod-id={`src_pages_pricing_tsx_a744_${plan.id}_${feature.text}`} />
                      </div>
                      <span
                        className="text-sm leading-relaxed text-[#444]"
                        data-icod-id={`src_pages_pricing_tsx_52af_${plan.id}_${feature.text}`}>
                        {t(feature.text)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Button
                  onClick={() => handleCtaClick(plan)}
                  disabled={isCurrentPlan}
                  className={cn(
                    'w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200',
                    isPopular
                      ? 'text-white shadow-lg hover:shadow-xl'
                      : '',
                    isCurrentPlan && 'cursor-default opacity-70',
                  )}
                  style={
                    isPopular
                      ? { background: 'linear-gradient(135deg, #8B72E8 0%, #29213D 100%)' }
                      : {
                          backgroundColor: '#F7F5FA',
                          color: '#29213D',
                          border: '1.5px solid #D8B779',
                        }
                  }
                  data-icod-id={`src_pages_pricing_tsx_1a5f_${plan.id}`}>
                  {isCurrentPlan ? t('Current Plan') : t(plan.cta)}
                </Button>
              </Card>
            </div>
          );
        })}
      </div>
      {/* Courier Rates by City */}
      <CourierRatesSection pricingCurrency={pricingCurrency} navigate={navigate} data-icod-id="src_pages_pricing_tsx_courier_section" />
      {/* Footer text */}
      <p
        className="mt-10 text-center text-sm text-[#555]"
        data-icod-id="src_pages_pricing_tsx_b9fc">
        {t("Start free. Upgrade when you're ready.")}
      </p>
    </div>
  );
}

/* =========================================================================
 * COURIER RATES BY CITY SECTION
 * ========================================================================= */

const PRICING_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];

function CourierRatesSection({ pricingCurrency, navigate }: { pricingCurrency: string; navigate: ReturnType<typeof useNavigate> }) {
  const { t } = useTranslation();
  const {
    rates,
    syncRates,
    lastSyncedAt,
    isCustomized,
    justSynced,
    clearJustSynced,
  } = useCourierRates();

  // Auto-clear sync confirmation after 3 seconds
  useEffect(() => {
    if (justSynced) {
      const timer = setTimeout(clearJustSynced, 3000);
      return () => clearTimeout(timer);
    }
  }, [justSynced, clearJustSynced]);

  const cityCosts = useMemo(
    () => calculateCityDeliveryCosts('Karachi', PRICING_CITIES, 1, rates),
    [rates]
  );

  const syncedLabel = lastSyncedAt
    ? `${t('Last synced:')} ${new Date(lastSyncedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date(lastSyncedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    : t('Never synced');

  return (
    <section
      className="mx-auto mt-16 max-w-5xl px-4 md:px-6"
      data-icod-id="src_pages_pricing_tsx_courier_rates_section">
      <div
        className="mb-6 space-y-2 text-center"
        data-icod-id="src_pages_pricing_tsx_courier_header">
        <div
          className="flex items-center justify-center gap-2"
          data-icod-id="src_pages_pricing_tsx_courier_title_row">
          <Truck
            className="h-6 w-6 text-[#8B72E8]"
            data-icod-id="src_pages_pricing_tsx_courier_icon" />
          <h2
            className="text-2xl font-bold md:text-3xl"
            style={{ color: '#29213D' }}
            data-icod-id="src_pages_pricing_tsx_courier_title">
            {t('Courier Rates by City')}
          </h2>
        </div>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_pricing_tsx_courier_subtitle">
          {t('Indicative delivery costs for a standard 1 kg parcel. Researched Nov 2026.')}
        </p>
      </div>
      <Card
        className="overflow-hidden p-0"
        data-icod-id="src_pages_pricing_tsx_courier_card">
        {/* Desktop table view (sm and above) */}
        <div
          className="hidden sm:block overflow-x-hidden"
          data-icod-id="src_pages_pricing_tsx_courier_table_wrap">
          <table
            className="w-full text-sm"
            data-icod-id="src_pages_pricing_tsx_courier_table">
            <thead data-icod-id="src_pages_pricing_tsx_courier_thead">
              <tr
                className="border-b border-border bg-muted/50"
                data-icod-id="src_pages_pricing_tsx_courier_thead_row">
                <th
                  className="px-6 py-3 text-left font-semibold text-foreground"
                  data-icod-id="src_pages_pricing_tsx_courier_th_city">
                  {t('Destination City')}
                </th>
                {COURIER_IDS.map((cid) => (
                  <th
                    key={cid}
                    className="px-4 py-3 text-right font-semibold text-foreground"
                    data-icod-id={`src_pages_pricing_tsx_courier_th_${cid}`}>
                    {rates.couriers[cid].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody data-icod-id="src_pages_pricing_tsx_courier_tbody">
              {cityCosts.map(({ city, costs }, rowIndex) => (
                <tr
                  key={city}
                  className={cn(
                    'border-b border-border/50 transition-colors hover:bg-muted/30',
                    rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/10'
                  )}
                  data-icod-id={`src_pages_pricing_tsx_courier_row_${city}`}>
                  <td
                    className="px-6 py-3 font-medium text-foreground"
                    data-icod-id={`src_pages_pricing_tsx_courier_td_city_${city}`}>
                    {city}
                  </td>
                  {COURIER_IDS.map((cid) => (
                    <td
                      key={cid}
                      className="px-4 py-3 text-right tabular-nums font-semibold text-foreground"
                      data-icod-id={`src_pages_pricing_tsx_courier_td_${city}_${cid}`}>
                      {formatCurrency(costs[cid], pricingCurrency)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked card view (below sm) */}
        <div
          className="sm:hidden divide-y divide-border/50"
          data-icod-id="src_pages_pricing_tsx_courier_mobile_cards">
          {cityCosts.map(({ city, costs }, rowIndex) => (
            <div
              key={city}
              className={cn(
                'p-4',
                rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/10'
              )}
              data-icod-id={`src_pages_pricing_tsx_courier_mobile_card_${city}`}>
              <h3
                className="mb-3 text-base font-semibold text-foreground"
                data-icod-id={`src_pages_pricing_tsx_courier_mobile_city_${city}`}>
                {city}
              </h3>
              <div
                className="grid grid-cols-3 gap-2"
                data-icod-id={`src_pages_pricing_tsx_2752_${city}`}>
                {COURIER_IDS.map((cid) => (
                  <div
                    key={cid}
                    className="flex flex-col items-center rounded-lg bg-muted/30 px-2 py-2"
                    data-icod-id={`src_pages_pricing_tsx_courier_mobile_rate_${city}_${cid}`}>
                    <span
                      className="text-xs font-medium text-muted-foreground"
                      data-icod-id={`src_pages_pricing_tsx_251e_${city}_${cid}`}>
                      {rates.couriers[cid].name}
                    </span>
                    <span
                      className="mt-1 text-sm font-semibold tabular-nums text-foreground"
                      data-icod-id={`src_pages_pricing_tsx_50a5_${city}_${cid}`}>
                      {formatCurrency(costs[cid], pricingCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      {/* Sync confirmation */}
      {justSynced && (
        <Alert variant="info" className="mt-3" data-icod-id="src_pages_pricing_tsx_courier_sync_confirm">
          {t('Rates synced to defaults')}
        </Alert>
      )}
      {/* Freshness indicator + actions */}
      <div
        className="mt-4 space-y-2"
        data-icod-id="src_pages_pricing_tsx_courier_footer">
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
          data-icod-id="src_pages_pricing_tsx_6778">
          <span
            className="flex items-center gap-1"
            data-icod-id="src_pages_pricing_tsx_e6cf">
            <Clock className="h-3 w-3" data-icod-id="src_pages_pricing_tsx_6a0e" />
            {syncedLabel}
          </span>
          {isCustomized && (
            <span
              className="font-medium text-warning"
              data-icod-id="src_pages_pricing_tsx_ea4e">
              {t('Rates customized since last sync')}
            </span>
          )}
        </div>
        <p
          className="text-xs text-muted-foreground"
          data-icod-id="src_pages_pricing_tsx_courier_disclaimer">
          {t('Indicative rates — not a live courier feed. Verify with your courier.')}
        </p>
        <div
          className="flex items-center gap-2"
          data-icod-id="src_pages_pricing_tsx_bbcf">
          <Button
            variant="outline"
            size="sm"
            onClick={syncRates}
            className="gap-2"
            data-icod-id="src_pages_pricing_tsx_courier_sync_btn">
            <RefreshCw
              className="h-4 w-4"
              data-icod-id="src_pages_pricing_tsx_courier_sync_icon" />
            {t('Sync Rates')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
            data-icod-id="src_pages_pricing_tsx_courier_compare_btn">
            {t('Compare our courier rates')}
            <ArrowRight
              className="h-4 w-4"
              data-icod-id="src_pages_pricing_tsx_courier_compare_icon" />
          </Button>
        </div>
      </div>
    </section>
  );
}
