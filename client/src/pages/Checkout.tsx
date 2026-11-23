import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, CreditCard, Smartphone, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { Card, Button, Spinner, Field, Input } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectPlan, fetchPaymentStatus } from '@/store/slices/subscriptionSlice';
import type { PlanType, BillingCycle } from '@/types';
import { formatPlanPrice, getExchangeRateLabel } from '@/utils/currency';
import { scopedGetRaw, scopedSetRaw, STORAGE_KEYS } from '@/utils/scopedStorage';

/* =========================================================================
 * PLAN DATA — mirrors Pricing.tsx exactly
 * ========================================================================= */

const MONTHLY_DISCOUNT_PERCENT = 20;

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  id: PlanType;
  name: string;
  tagline: string;
  monthlyPricePKR: number;
  yearlyPricePKR: number;
  features: PlanFeature[];
}

const PLANS: Record<string, PricingPlan> = {
  basic: {
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
  },
  standard: {
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
  },
  business: {
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
  },
};

type PaymentMethodId = 'jazzcash' | 'easypaisa' | 'card';

interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  icon: React.ElementType;
  placeholderText: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'jazzcash',
    label: 'JazzCash',
    icon: Smartphone,
    placeholderText: 'JazzCash Business account: [Not configured]',
  },
  {
    id: 'easypaisa',
    label: 'Easypaisa',
    icon: Smartphone,
    placeholderText: 'Easypaisa Business account: [Not configured]',
  },
  {
    id: 'card',
    label: 'Card',
    icon: CreditCard,
    placeholderText: 'Card payment gateway: [Not configured]',
  },
];

/* =========================================================================
 * BUYER FORM VALIDATION
 * ========================================================================= */

interface BuyerFormData {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  businessName: string;
}

interface BuyerFormErrors {
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

function validateBuyerForm(data: BuyerFormData): BuyerFormErrors {
  const errors: BuyerFormErrors = {};

  if (!data.buyerName.trim()) {
    errors.buyerName = 'Full name is required';
  }

  if (!data.buyerEmail.trim()) {
    errors.buyerEmail = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.buyerEmail)) {
    errors.buyerEmail = 'Please enter a valid email address';
  }

  if (!data.buyerPhone.trim()) {
    errors.buyerPhone = 'Phone number is required';
  } else if (!/^(\+92|0)?3[0-9]{9}$/.test(data.buyerPhone.replace(/[\s-]/g, ''))) {
    errors.buyerPhone = 'Enter a valid Pakistani phone number (e.g., 03001234567)';
  }

  return errors;
}

/* =========================================================================
 * COMPONENT
 * ========================================================================= */

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { subscription, paymentConfigured, status } = useAppSelector((s) => s.subscription);
  const { user } = useAppSelector((s) => s.auth);

  // Read plan and billing cycle from URL search params
  const planParam = searchParams.get('plan') as PlanType | null;
  const cycleParam = searchParams.get('cycle') as BillingCycle | null;

  const selectedPlanId: PlanType = planParam && PLANS[planParam] ? planParam : 'standard';
  const selectedCycle: BillingCycle = cycleParam === 'yearly' ? 'yearly' : 'monthly';
  const plan = PLANS[selectedPlanId];

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>('jazzcash');
  const [isSaving, setIsSaving] = useState(false);

  // Currency selector state (persisted per-user)
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

  // Buyer form state
  const [buyerForm, setBuyerForm] = useState<BuyerFormData>({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    businessName: '',
  });
  const [buyerErrors, setBuyerErrors] = useState<BuyerFormErrors>({});
  const [formTouched, setFormTouched] = useState(false);

  // Fetch payment configuration status on mount
  useEffect(() => {
    dispatch(fetchPaymentStatus());
  }, [dispatch]);

  const pricePKR = selectedCycle === 'yearly' ? plan.yearlyPricePKR : plan.monthlyPricePKR;

  // Corrected yearly monthly equivalent
  const yearlyMonthlyEquivalent = plan.yearlyPricePKR > 0
    ? Math.round(plan.yearlyPricePKR / 12)
    : 0;

  const handleBuyerFieldChange = (field: keyof BuyerFormData, value: string) => {
    setBuyerForm((prev) => ({ ...prev, [field]: value }));
    if (formTouched) {
      setBuyerErrors(validateBuyerForm({ ...buyerForm, [field]: value }));
    }
  };

  const handleCompleteSetupLater = async () => {
    setFormTouched(true);
    const errors = validateBuyerForm(buyerForm);
    setBuyerErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(
        selectPlan({
          plan: selectedPlanId,
          billingCycle: selectedCycle,
          paymentMethod: selectedPaymentMethod,
          buyerName: buyerForm.buyerName.trim(),
          buyerEmail: buyerForm.buyerEmail.trim(),
          buyerPhone: buyerForm.buyerPhone.trim(),
          businessName: buyerForm.businessName.trim(),
        })
      ).unwrap();
      navigate('/dashboard');
    } catch {
      // Error is handled by the slice
    } finally {
      setIsSaving(false);
    }
  };

  if (!plan) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        data-icod-id="src_pages_checkout_tsx_1b3c">
        <Spinner size="lg" data-icod-id="src_pages_checkout_tsx_397b" />
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-3xl px-4 py-10 md:px-6"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_checkout_tsx_6ffa">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-[#8B72E8] transition-colors hover:text-[#29213D]"
        data-icod-id="src_pages_checkout_tsx_f5b1">
        <ArrowLeft className="h-4 w-4" data-icod-id="src_pages_checkout_tsx_152f" />
        Back to Pricing
      </button>
      {/* Page header */}
      <div className="mb-8 space-y-2" data-icod-id="src_pages_checkout_tsx_3897">
        <h1
          className="text-3xl font-bold"
          style={{ color: '#29213D' }}
          data-icod-id="src_pages_checkout_tsx_8da1">
          Complete Your Setup
        </h1>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_checkout_tsx_00bf">
          Review your selected plan and choose a payment method.
        </p>
        {/* Exchange rate info + currency toggle */}
        <div className="flex flex-wrap items-center gap-3" data-icod-id="src_pages_checkout_tsx_currency_row">
          <p className="text-xs text-[#555]" data-icod-id="src_pages_checkout_tsx_exchange_rate">
            {getExchangeRateLabel()}
          </p>
          <div className="flex items-center gap-1" data-icod-id="src_pages_checkout_tsx_currency_toggle">
            <button
              type="button"
              onClick={handleCurrencyToggle}
              className={cn(
                'rounded border px-2 py-0.5 text-xs font-semibold transition-all',
                pricingCurrency === 'PKR'
                  ? 'border-[#8B72E8] bg-[#8B72E8]/10 text-[#29213D]'
                  : 'border-border text-[#555] hover:border-[#8B72E8]/40',
              )}
              data-icod-id="src_pages_checkout_tsx_pkr_btn">
              PKR
            </button>
            <button
              type="button"
              onClick={handleCurrencyToggle}
              className={cn(
                'rounded border px-2 py-0.5 text-xs font-semibold transition-all',
                pricingCurrency === 'USD'
                  ? 'border-[#8B72E8] bg-[#8B72E8]/10 text-[#29213D]'
                  : 'border-border text-[#555] hover:border-[#8B72E8]/40',
              )}
              data-icod-id="src_pages_checkout_tsx_usd_btn">
              USD
            </button>
          </div>
        </div>
      </div>
      {/* Plan summary card */}
      <Card
        className="mb-6 overflow-hidden rounded-2xl border-2 p-0"
        style={{ borderColor: '#8B72E8', backgroundColor: '#F7F5FA' }}
        data-icod-id="src_pages_checkout_tsx_8beb">
        {/* Gradient accent bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #8B72E8, #D8B779, #9DDCC5)' }}
          data-icod-id="src_pages_checkout_tsx_beab" />

        <div className="p-6" data-icod-id="src_pages_checkout_tsx_de00">
          <div
            className="mb-4 flex items-start justify-between"
            data-icod-id="src_pages_checkout_tsx_66ec">
            <div data-icod-id="src_pages_checkout_tsx_6790">
              {plan.tagline && (
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: '#8B72E8' }}
                  data-icod-id="src_pages_checkout_tsx_069b">
                  {plan.tagline}
                </p>
              )}
              <h2
                className="text-2xl font-bold"
                style={{ color: '#29213D' }}
                data-icod-id="src_pages_checkout_tsx_c7d0">
                {plan.name} Plan
              </h2>
            </div>
            <div className="text-right" data-icod-id="src_pages_checkout_tsx_90d8">
              <span
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: '#29213D' }}
                data-icod-id="src_pages_checkout_tsx_5b15">
                {formatPlanPrice(pricePKR, pricingCurrency)}
              </span>
              <span
                className="block text-sm text-[#555]"
                data-icod-id="src_pages_checkout_tsx_ed7a">
                /{selectedCycle === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
          </div>

          {selectedCycle === 'yearly' && plan.monthlyPricePKR > 0 && (
            <p
              className="mb-4 text-xs font-medium text-[#29213D]"
              data-icod-id="src_pages_checkout_tsx_bd75">
              Billed yearly &middot; {formatPlanPrice(yearlyMonthlyEquivalent, pricingCurrency)}/mo equivalent &middot; Save {MONTHLY_DISCOUNT_PERCENT}%
            </p>
          )}

          <ul className="space-y-2" data-icod-id="src_pages_checkout_tsx_14f3">
            {plan.features.map((feature) => (
              <li
                key={feature.text}
                className="flex items-start gap-2"
                data-icod-id={`src_pages_checkout_tsx_88cf_${feature.text}`}>
                <div
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(139, 114, 232, 0.15)' }}
                  data-icod-id={`src_pages_checkout_tsx_8f58_${feature.text}`}>
                  <Check
                    className="h-3 w-3"
                    style={{ color: '#8B72E8' }}
                    data-icod-id={`src_pages_checkout_tsx_655c_${feature.text}`} />
                </div>
                <span
                  className="text-sm text-[#444]"
                  data-icod-id={`src_pages_checkout_tsx_93f4_${feature.text}`}>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Order Summary with explicit Total line */}
      <Card
        className="mb-6 rounded-xl border p-5"
        style={{ borderColor: '#8B72E8', backgroundColor: '#F7F5FA' }}
        data-icod-id="src_pages_checkout_tsx_order_summary">
        <h3
          className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#555]"
          data-icod-id="src_pages_checkout_tsx_summary_heading">
          Order Summary
        </h3>
        <div className="space-y-2 text-sm" data-icod-id="src_pages_checkout_tsx_summary_lines">
          <div className="flex justify-between" data-icod-id="src_pages_checkout_tsx_summary_plan_line">
            <span className="text-[#555]" data-icod-id="src_pages_checkout_tsx_summary_plan_label">
              {plan.name} Plan ({selectedCycle === 'yearly' ? 'Yearly' : 'Monthly'})
            </span>
            <span className="font-medium text-[#29213D]" data-icod-id="src_pages_checkout_tsx_summary_plan_price">
              {formatPlanPrice(pricePKR, pricingCurrency)}
            </span>
          </div>
          <div className="border-t border-border/40 pt-2" data-icod-id="src_pages_checkout_tsx_total_divider" />
          <div className="flex justify-between" data-icod-id="src_pages_checkout_tsx_total_line">
            <span
              className="text-base font-bold text-[#29213D]"
              data-icod-id="src_pages_checkout_tsx_total_label">
              Total
            </span>
            <span
              className="text-lg font-extrabold text-[#29213D]"
              data-icod-id="src_pages_checkout_tsx_total_amount">
              {formatPlanPrice(pricePKR, pricingCurrency)}
            </span>
          </div>
        </div>
      </Card>

      {/* Buyer Information Form */}
      <div className="mb-6" data-icod-id="src_pages_checkout_tsx_buyer_form">
        <h3
          className="mb-3 text-lg font-semibold"
          style={{ color: '#29213D' }}
          data-icod-id="src_pages_checkout_tsx_buyer_heading">
          Buyer Information
        </h3>
        <Card
          className="rounded-xl border p-5"
          style={{ borderColor: '#D8B779', backgroundColor: '#F7F5FA' }}
          data-icod-id="src_pages_checkout_tsx_buyer_card">
          <div
            className="grid gap-4 sm:grid-cols-2"
            data-icod-id="src_pages_checkout_tsx_6a38">
            <Field
              label="Full Name"
              htmlFor="buyerName"
              error={buyerErrors.buyerName}
              required
              data-icod-id="src_pages_checkout_tsx_buyer_name_field">
              <Input
                id="buyerName"
                type="text"
                placeholder="Your full name"
                value={buyerForm.buyerName}
                onChange={(e) => handleBuyerFieldChange('buyerName', e.target.value)}
                data-icod-id="src_pages_checkout_tsx_buyer_name_input" />
            </Field>
            <Field
              label="Email Address"
              htmlFor="buyerEmail"
              error={buyerErrors.buyerEmail}
              required
              data-icod-id="src_pages_checkout_tsx_buyer_email_field">
              <Input
                id="buyerEmail"
                type="email"
                placeholder="your@email.com"
                value={buyerForm.buyerEmail}
                onChange={(e) => handleBuyerFieldChange('buyerEmail', e.target.value)}
                data-icod-id="src_pages_checkout_tsx_buyer_email_input" />
            </Field>
            <Field
              label="Phone Number"
              htmlFor="buyerPhone"
              error={buyerErrors.buyerPhone}
              hint="Pakistani format: 03XXXXXXXXX"
              required
              data-icod-id="src_pages_checkout_tsx_buyer_phone_field">
              <Input
                id="buyerPhone"
                type="tel"
                placeholder="03001234567"
                value={buyerForm.buyerPhone}
                onChange={(e) => handleBuyerFieldChange('buyerPhone', e.target.value)}
                data-icod-id="src_pages_checkout_tsx_buyer_phone_input" />
            </Field>
            <Field
              label="Business Name"
              htmlFor="businessName"
              hint="Optional"
              data-icod-id="src_pages_checkout_tsx_buyer_business_field">
              <Input
                id="businessName"
                type="text"
                placeholder="Your business name"
                value={buyerForm.businessName}
                onChange={(e) => handleBuyerFieldChange('businessName', e.target.value)}
                data-icod-id="src_pages_checkout_tsx_buyer_business_input" />
            </Field>
          </div>
        </Card>
      </div>
      {/* Payment method selector */}
      <div className="mb-6" data-icod-id="src_pages_checkout_tsx_c0e7">
        <h3
          className="mb-3 text-lg font-semibold"
          style={{ color: '#29213D' }}
          data-icod-id="src_pages_checkout_tsx_ec09">
          Payment Method
        </h3>
        <div
          className="grid gap-3 sm:grid-cols-3"
          data-icod-id="src_pages_checkout_tsx_1153">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPaymentMethod === method.id;
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
                  isSelected
                    ? 'border-[#8B72E8] shadow-md'
                    : 'border-border hover:border-[#8B72E8]/40 hover:shadow-sm',
                )}
                style={{
                  backgroundColor: isSelected ? '#F7F5FA' : 'transparent',
                }}
                data-icod-id={`src_pages_checkout_tsx_5064_${method.id}`}>
                {isSelected && (
                  <div
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: '#8B72E8' }}
                    data-icod-id={`src_pages_checkout_tsx_5364_${method.id}`}>
                    <Check
                      className="h-3 w-3 text-white"
                      data-icod-id={`src_pages_checkout_tsx_67c0_${method.id}`} />
                  </div>
                )}
                <Icon
                  className="h-6 w-6"
                  style={{ color: isSelected ? '#8B72E8' : '#999' }}
                  data-icod-id={`src_pages_checkout_tsx_ab2b_${method.id}`} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: isSelected ? '#29213D' : '#555' }}
                  data-icod-id={`src_pages_checkout_tsx_9239_${method.id}`}>
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Selected payment method placeholder */}
      <Card
        className="mb-6 rounded-xl border border-dashed p-5"
        style={{ borderColor: '#D8B779', backgroundColor: '#F7F5FA' }}
        data-icod-id="src_pages_checkout_tsx_1b1f">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_checkout_tsx_c4a7">
          <Lock
            className="h-5 w-5 text-[#D8B779]"
            data-icod-id="src_pages_checkout_tsx_973a" />
          <div data-icod-id="src_pages_checkout_tsx_b3b8">
            <p
              className="text-sm font-semibold"
              style={{ color: '#29213D' }}
              data-icod-id="src_pages_checkout_tsx_7479">
              {PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.label}
            </p>
            <p
              className="text-sm text-[#555]"
              data-icod-id="src_pages_checkout_tsx_a220">
              {PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.placeholderText}
            </p>
          </div>
        </div>
      </Card>
      {/* Payment pending notice */}
      {!paymentConfigured && (
        <Card
          className="mb-8 rounded-xl border p-5"
          style={{ borderColor: '#D8B779', backgroundColor: 'rgba(216, 183, 121, 0.08)' }}
          data-icod-id="src_pages_checkout_tsx_7b5c">
          <div className="flex gap-3" data-icod-id="src_pages_checkout_tsx_fec3">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-[#D8B779]"
              data-icod-id="src_pages_checkout_tsx_1c89" />
            <div className="space-y-1" data-icod-id="src_pages_checkout_tsx_e0ff">
              <p
                className="text-sm font-bold"
                style={{ color: '#29213D' }}
                data-icod-id="src_pages_checkout_tsx_4966">
                Payment setup is pending
              </p>
              <p
                className="text-sm leading-relaxed text-[#555]"
                data-icod-id="src_pages_checkout_tsx_e902">
                Payment processing has not been configured yet. Your plan selection has been saved.
                You will be able to complete payment once the payment provider is connected.
                Contact the administrator to set up payment processing.
              </p>
            </div>
          </div>
        </Card>
      )}
      {/* Action buttons */}
      <div
        className="flex flex-col gap-3 sm:flex-row"
        data-icod-id="src_pages_checkout_tsx_a3a1">
        <Button
          onClick={handleCompleteSetupLater}
          loading={isSaving || status === 'loading'}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl sm:flex-1"
          style={{ background: 'linear-gradient(135deg, #8B72E8 0%, #29213D 100%)' }}
          data-icod-id="src_pages_checkout_tsx_e4e3">
          Complete Setup Later
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/pricing')}
          className="w-full rounded-xl py-3 text-sm font-semibold sm:w-auto"
          style={{ borderColor: '#D8B779', color: '#29213D' }}
          data-icod-id="src_pages_checkout_tsx_7c5e">
          Change Plan
        </Button>
      </div>
      {/* Current subscription info if already exists */}
      {subscription && subscription.status === 'pending_setup' && (
        <p
          className="mt-6 text-center text-xs text-[#555]"
          data-icod-id="src_pages_checkout_tsx_b63e">
          Your current selection: {PLANS[subscription.plan]?.name} ({subscription.billingCycle}) &mdash; Payment Pending
        </p>
      )}
    </div>
  );
}
