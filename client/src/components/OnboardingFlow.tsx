import { useState, useRef } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, SkipForward } from 'lucide-react';
import { Button, Card, Field, Input } from '@/components/ui';
import { cn } from '@/utils/cn';
import LaunchLensLogo from '@/components/LaunchLensLogo';
import { roundTwo } from '@/utils/currency';
import { useTranslation } from '@/utils/i18n';

interface OnboardingData {
  name: string;
  sellingPrice: number;
  productCost: number;
  deliveryCost: number;
  otherCosts: number;
  adBudget: number;
  market: string;
  expectedOrders: number;
  category: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const MARKETS = [
  'Pakistan',
  'USA',
  'UK',
  'UAE',
  'Saudi Arabia',
  'India',
  'Canada',
  'Australia',
  'Germany',
  'Other',
];

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const skipFired = useRef(false);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    sellingPrice: 3000,
    productCost: 0,
    deliveryCost: 0,
    otherCosts: 0,
    adBudget: 0,
    market: 'Pakistan',
    expectedOrders: 0,
    category: 'Skincare',
  });

  const updateField = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(data);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return data.name.trim().length > 0 && data.sellingPrice > 0;
    if (step === 2) return true; // costs can be zero
    if (step === 3) return data.expectedOrders >= 0;
    return false;
  };

  return (
    <div
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-8"
      data-icod-id="src_components_onboardingflow_tsx_cd2d">
      <div
        className="w-full max-w-lg space-y-6"
        data-icod-id="src_components_onboardingflow_tsx_051f">
        {/* Header */}
        <div
          className="text-center space-y-3"
          data-icod-id="src_components_onboardingflow_tsx_f071">
          <div
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 shadow-lg"
            style={{ backgroundColor: '#201034' }}
            data-icod-id="src_components_onboardingflow_tsx_logo_container">
            <LaunchLensLogo
              size="md"
              theme="light"
              data-icod-id="src_components_onboardingflow_tsx_2073" />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            data-icod-id="src_components_onboardingflow_tsx_b7c7">{t('Set Up Your Product')}</h1>
          <p
            className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground"
            data-icod-id="src_components_onboardingflow_tsx_2c08">
            {t("Tell us about your first product so all tools start with real numbers.")}
          </p>
        </div>

        {/* Progress */}
        <div
          className="flex items-center gap-3"
          data-icod-id="src_components_onboardingflow_tsx_297c">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1"
              data-icod-id={`src_components_onboardingflow_tsx_45ec_${s}`}>
              <div
                className="relative h-1 w-full overflow-hidden rounded-full bg-muted"
                data-icod-id={`src_components_onboardingflow_tsx_progress_track_${s}`}>
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
                    s <= step ? 'bg-primary' : 'bg-transparent'
                  )}
                  style={{ width: s <= step ? '100%' : '0%' }}
                  data-icod-id={`src_components_onboardingflow_tsx_dec5_${s}`} />
              </div>
              <p
                className={cn(
                  'mt-1.5 text-center text-[11px] font-semibold uppercase tracking-wider',
                  s === step ? 'text-foreground' : s < step ? 'text-primary' : 'text-muted-foreground'
                )}
                data-icod-id={`src_components_onboardingflow_tsx_f99b_${s}`}>
                {t('Step')} {s}
              </p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="border border-border/60 p-6 shadow-md sm:p-8" data-icod-id="src_components_onboardingflow_tsx_f06b">
          {step === 1 && (
            <div
              className="space-y-5"
              data-icod-id="src_components_onboardingflow_tsx_6250">
              <h2
                className="text-lg font-semibold tracking-tight text-foreground"
                data-icod-id="src_components_onboardingflow_tsx_51a1">{t('Product Basics')}</h2>
              <Field
                label={t('Product Name')}
                htmlFor="ob-name"
                required
                data-icod-id="src_components_onboardingflow_tsx_cf85">
                <Input
                  id="ob-name"
                  value={data.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Premium Skincare Serum"
                  autoFocus
                  data-icod-id="src_components_onboardingflow_tsx_01d5" />
              </Field>
              <Field
                label={`${t('Selling Price')} (PKR)`}
                htmlFor="ob-price"
                required
                data-icod-id="src_components_onboardingflow_tsx_5b1a">
                <Input
                  id="ob-price"
                  type="number"
                  min="0"
                  value={data.sellingPrice || ''}
                  onChange={(e) => updateField('sellingPrice', roundTwo(parseFloat(e.target.value) || 0))}
                  placeholder="3000"
                  data-icod-id="src_components_onboardingflow_tsx_f1d8" />
              </Field>
              <Field
                label={t('Category')}
                htmlFor="ob-category"
                data-icod-id="src_components_onboardingflow_tsx_category_field">
                <select
                  id="ob-category"
                  value={data.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  data-icod-id="src_components_onboardingflow_tsx_category_select">
                  {['Skincare', 'Beauty', 'Home', 'Fashion', 'Accessories', 'Gadgets', 'Pets', 'Lifestyle'].map((c) => (
                    <option
                      key={c}
                      value={c}
                      data-icod-id={`src_components_onboardingflow_tsx_d666_${c}`}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div
              className="space-y-5"
              data-icod-id="src_components_onboardingflow_tsx_350f">
              <h2
                className="text-lg font-semibold tracking-tight text-foreground"
                data-icod-id="src_components_onboardingflow_tsx_b085">{t('Cost Breakdown')}</h2>
              <div
                className="grid gap-4 sm:grid-cols-2"
                data-icod-id="src_components_onboardingflow_tsx_ebfb">
                <Field
                  label={`${t('Product Cost')} (PKR)`}
                  htmlFor="ob-cost"
                  data-icod-id="src_components_onboardingflow_tsx_b4a8">
                  <Input
                    id="ob-cost"
                    type="number"
                    min="0"
                    value={data.productCost || ''}
                    onChange={(e) => updateField('productCost', roundTwo(parseFloat(e.target.value) || 0))}
                    placeholder="900"
                    data-icod-id="src_components_onboardingflow_tsx_8560" />
                </Field>
                <Field
                  label={`${t('Delivery Cost')} (PKR)`}
                  htmlFor="ob-delivery"
                  data-icod-id="src_components_onboardingflow_tsx_7e9c">
                  <Input
                    id="ob-delivery"
                    type="number"
                    min="0"
                    value={data.deliveryCost || ''}
                    onChange={(e) => updateField('deliveryCost', roundTwo(parseFloat(e.target.value) || 0))}
                    placeholder="250"
                    data-icod-id="src_components_onboardingflow_tsx_a0c8" />
                </Field>
              </div>
              <div
                className="grid gap-4 sm:grid-cols-2"
                data-icod-id="src_components_onboardingflow_tsx_2175">
                <Field
                  label={`${t('Other Costs')} (PKR)`}
                  htmlFor="ob-other"
                  data-icod-id="src_components_onboardingflow_tsx_50c9">
                  <Input
                    id="ob-other"
                    type="number"
                    min="0"
                    value={data.otherCosts || ''}
                    onChange={(e) => updateField('otherCosts', roundTwo(parseFloat(e.target.value) || 0))}
                    placeholder="150"
                    data-icod-id="src_components_onboardingflow_tsx_22cb" />
                </Field>
                <Field
                  label={`${t('Ad Budget')} (PKR)`}
                  htmlFor="ob-ad"
                  data-icod-id="src_components_onboardingflow_tsx_ac22">
                  <Input
                    id="ob-ad"
                    type="number"
                    min="0"
                    value={data.adBudget || ''}
                    onChange={(e) => updateField('adBudget', roundTwo(parseFloat(e.target.value) || 0))}
                    placeholder="12000"
                    data-icod-id="src_components_onboardingflow_tsx_a442" />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div
              className="space-y-5"
              data-icod-id="src_components_onboardingflow_tsx_78cd">
              <h2
                className="text-lg font-semibold tracking-tight text-foreground"
                data-icod-id="src_components_onboardingflow_tsx_d832">{t('Market & Orders')}</h2>
              <Field
                label={t('Target Market')}
                htmlFor="ob-market"
                data-icod-id="src_components_onboardingflow_tsx_ea89">
                <select
                  id="ob-market"
                  value={data.market}
                  onChange={(e) => updateField('market', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  data-icod-id="src_components_onboardingflow_tsx_2809">
                  {MARKETS.map((m) => (
                    <option
                      key={m}
                      value={m}
                      data-icod-id={`src_components_onboardingflow_tsx_7a30_${m}`}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field
                label={t('Expected Orders')}
                htmlFor="ob-orders"
                data-icod-id="src_components_onboardingflow_tsx_e8b1">
                <Input
                  id="ob-orders"
                  type="number"
                  min="0"
                  value={data.expectedOrders || ''}
                  onChange={(e) => updateField('expectedOrders', Math.round(parseFloat(e.target.value) || 0))}
                  placeholder="20"
                  data-icod-id="src_components_onboardingflow_tsx_bfe1" />
              </Field>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            className="mt-8 flex items-center justify-between border-t border-border/40 pt-5"
            data-icod-id="src_components_onboardingflow_tsx_5d74">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              data-icod-id="src_components_onboardingflow_tsx_5670">
              <ArrowLeft className="h-4 w-4" data-icod-id="src_components_onboardingflow_tsx_38a2" />
              {t('Back')}
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-1.5 px-5"
              data-icod-id="src_components_onboardingflow_tsx_dc1e">
              {step === 3 ? (
                <>
                  <Sparkles className="h-4 w-4" data-icod-id="src_components_onboardingflow_tsx_1d97" />
                  {t('Finish Setup')}
                </>
              ) : (
                <>
                  {t('Next')}
                  <ArrowRight className="h-4 w-4" data-icod-id="src_components_onboardingflow_tsx_d194" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Skip button */}
        <div
          className="text-center"
          data-icod-id="src_components_onboardingflow_tsx_b9a5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (skipFired.current) return;
              skipFired.current = true;
              onSkip();
            }}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            data-icod-id="src_components_onboardingflow_tsx_9e81">
            <SkipForward className="h-3.5 w-3.5" data-icod-id="src_components_onboardingflow_tsx_21f4" />
            {t('Skip for now')}
          </Button>
          <p
            className="mt-1.5 text-xs text-muted-foreground/80"
            data-icod-id="src_components_onboardingflow_tsx_0307">
            {t("We'll use a demo product to get you started.")}
          </p>
        </div>
      </div>
    </div>
  );
}
