import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '@/utils/i18n';
import {
  ArrowRight,
  TrendingUp,
  Calculator,
  BrainCircuit,
  Zap,
  Rocket,
  ClipboardCheck,
  BarChart3,
  Target,
  Globe,
  Shield,
  ChevronDown,
  DollarSign,
  Package,
  Activity,
  FileText,
  Calendar,
  ListChecks,
  IndianRupee,
  Play,
  Truck,
  Share2,
  GitCompare,
  CheckSquare,
  Clock,
} from 'lucide-react';
import { Button, Card, EmptyState } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { PageId } from '@/components/Sidebar';
import HeroSlider from '@/components/HeroSlider';
import ProductSwitcher from '@/components/ProductSwitcher';
import { useAppSelector } from '@/store/hooks';
import { calculateSimulation, type SimulationInputs } from '@/utils/calculations';
import { formatCurrency, formatMultiplier, roundTwo } from '@/utils/currency';
import { getSavedSimulatorAnalyses } from '@/utils/saveExport';
import type { SavedSimulatorAnalysis } from '@/types';
import {
  COURIER_IDS,
} from '@/utils/courierEngine';
import { useCourierRates } from '@/hooks/useCourierRates';

interface OverviewProps {
  onNavigate: (page: PageId) => void;
  currency: string;
  simulatorInputs: SimulationInputs;
  checklistCompletion: number;
  /** When true, always render the public marketing homepage regardless of auth state. */
  forcePublic?: boolean;
}

/* =========================================================================
 * PREMIUM TOOLS SECTION
 * ========================================================================= */

function FeatureCardsSection({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const { t } = useTranslation();
  const features = [
    {
      title: 'Product Launch Decision Engine',
      description: 'Understand whether your product is ready to launch, needs testing or should be reconsidered.',
      cta: 'Explore Decision Engine',
      page: 'decision-engine' as PageId,
      Icon: Rocket,
      gradient: 'from-[#C9D0FC] to-[#DE85E2]',
      iconBg: 'bg-[#DE85E2]/20',
      iconColor: 'text-[#DE85E2]',
      buttonStyle: 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white hover:from-[#6d28d9] hover:to-[#9333ea] border-transparent shadow-md hover:shadow-lg',
    },
    {
      title: 'COD Profitability Calculator',
      description: 'Calculate expected profit, delivery risks, break-even CPA and ROAS.',
      cta: 'Calculate Profit',
      page: 'simulator' as PageId,
      Icon: Calculator,
      gradient: 'from-[#E9FEDE] to-[#9DD37D]',
      iconBg: 'bg-[#9DD37D]/20',
      iconColor: 'text-[#9DD37D]',
      buttonStyle: 'bg-[#22c55e] text-white hover:bg-[#16a34a] border-transparent shadow-md hover:shadow-lg',
    },
    {
      title: 'TrendScout',
      description: 'Discover trending products and market opportunities with AI-powered insights.',
      cta: 'Discover Trends',
      page: 'discovery' as PageId,
      Icon: TrendingUp,
      gradient: 'from-[#F3EEFF] to-[#E4B2BE]',
      iconBg: 'bg-[#E4B2BE]/20',
      iconColor: 'text-[#E4B2BE]',
      buttonStyle: 'bg-gradient-to-r from-[#ec4899] to-[#d946ef] text-white hover:from-[#db2777] hover:to-[#c026d3] border-transparent shadow-md hover:shadow-lg',
    },
    {
      title: 'AI Advisor',
      description: 'Get actionable AI-powered recommendations for pricing, positioning, and campaigns.',
      cta: 'Get AI Insights',
      page: 'insights' as PageId,
      Icon: BrainCircuit,
      gradient: 'from-[#EACAA1] to-[#DE85E2]',
      iconBg: 'bg-[#201034]/10',
      iconColor: 'text-[#201034]',
      buttonStyle: 'bg-[#201034] text-white hover:bg-[#1a0d2b] border-transparent shadow-md hover:shadow-lg',
    },
    {
      title: 'Launch Smarter Simulator',
      description: 'Model different scenarios and predict outcomes before investing in ads.',
      cta: 'Run Simulation',
      page: 'simulator' as PageId,
      Icon: Zap,
      gradient: 'from-[#FFF5D2] to-[#EACAA1]',
      iconBg: 'bg-[#EACAA1]/20',
      iconColor: 'text-[#E9BCA6]',
      buttonStyle: 'bg-[#EACAA1] text-[#171717] hover:bg-[#e0b88a] border-transparent shadow-md hover:shadow-lg font-medium',
    },
  ];

  return (
    <section className="space-y-6" data-icod-id="src_pages_overview_tsx_025d">
      <div className="space-y-2" data-icod-id="src_pages_overview_tsx_8693">
        <h2
          className="text-2xl font-bold"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_overview_tsx_c85f">{t('Premium Tools')}</h2>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_overview_tsx_b513">
          {t('Powerful features to help you make smarter launch decisions.')}
        </p>
      </div>
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        data-icod-id="src_pages_overview_tsx_bd8f">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className={cn(
              'group relative min-w-0 overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
              'bg-gradient-to-br',
              feature.gradient,
              'bg-opacity-20 flex flex-col'
            )}
            data-icod-id={`src_pages_overview_tsx_60c0_${feature.title}`}>
            <div
              className={cn('absolute inset-0 bg-gradient-to-br opacity-20', feature.gradient)}
              data-icod-id={`src_pages_overview_tsx_e21d_${feature.title}`} />
            <div
              className="relative z-10 flex flex-1 flex-col gap-4"
              data-icod-id={`src_pages_overview_tsx_f584_${feature.title}`}>
              <div
                className={cn('inline-flex h-12 w-12 items-center justify-center rounded-xl', feature.iconBg)}
                data-icod-id={`src_pages_overview_tsx_3eda_${feature.title}`}>
                <feature.Icon className={cn('h-6 w-6', feature.iconColor)} />
              </div>
              <div
                className="space-y-2"
                data-icod-id={`src_pages_overview_tsx_7dd4_${feature.title}`}>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: '#201034' }}
                  data-icod-id={`src_pages_overview_tsx_dd99_${feature.title}`}>{t(feature.title)}</h3>
                <p
                  className="text-sm leading-relaxed text-[#333]"
                  data-icod-id={`src_pages_overview_tsx_027f_${feature.title}`}>{t(feature.description)}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(feature.page)}
                className={cn(
                  'mt-auto w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]',
                  feature.buttonStyle
                )}
                data-icod-id={`src_pages_overview_tsx_8a55_${feature.title}`}>
                <span
                  className="flex items-center justify-center gap-2"
                  data-icod-id={`src_pages_overview_tsx_3c73_${feature.title}`}>
                  {t(feature.cta)}
                  <ArrowRight
                    className="h-4 w-4"
                    data-icod-id={`src_pages_overview_tsx_bd15_${feature.title}`} />
                </span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
 * HOW IT WORKS SECTION
 * ========================================================================= */

const howItWorksSteps = [
  {
    number: 1,
    title: 'Enter Product Details',
    description: 'Input your product cost, pricing, and target market parameters.',
    icon: ClipboardCheck,
    color: 'bg-[#C9D0FC]',
    textColor: 'text-[#C9D0FC]',
    bgTint: 'bg-[#F3EEFF]',
  },
  {
    number: 2,
    title: 'Get Profitability Insights',
    description: 'Our engine calculates margins, break-even points, and delivery risk factors.',
    icon: BarChart3,
    color: 'bg-[#DE85E2]',
    textColor: 'text-[#DE85E2]',
    bgTint: 'bg-[#F9F0FA]',
  },
  {
    number: 3,
    title: 'Make a Smarter Launch Decision',
    description: 'Get actionable insights to launch with confidence or pivot before spending.',
    icon: Zap,
    color: 'bg-[#9DD37D]',
    textColor: 'text-[#9DD37D]',
    bgTint: 'bg-[#F2FBF0]',
  },
];

function HowItWorksSection() {
  const { t } = useTranslation();
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      data-icod-id="src_pages_overview_tsx_84c3">
      <div
        className="space-y-2 text-center"
        data-icod-id="src_pages_overview_tsx_1224">
        <h2
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_overview_tsx_084b">{t('How It Works')}</h2>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_overview_tsx_df29">{t('Three simple steps to smarter product launches.')}</p>
      </div>
      <div className="relative mt-12" data-icod-id="src_pages_overview_tsx_993c">
        <div
          className="absolute left-0 right-0 top-20 hidden h-1 bg-gradient-to-r from-[#C9D0FC] via-[#DE85E2] to-[#9DD37D] opacity-30 md:block"
          data-icod-id="src_pages_overview_tsx_8c4d" />
        <div
          className="grid gap-8 md:grid-cols-3"
          data-icod-id="src_pages_overview_tsx_df16">
          {howItWorksSteps.map((step, index) => (
            <div
              key={step.number}
              className="group relative flex min-w-0 flex-col items-center text-center"
              data-icod-id={`src_pages_overview_tsx_8ccb_${step.number}`}>
              <Card
                className={cn(
                  'relative w-full overflow-hidden p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl',
                  step.bgTint,
                  'min-h-[320px] flex flex-col items-center justify-start'
                )}
                data-icod-id={`src_pages_overview_tsx_4a14_${step.number}`}>
                <div
                  className={cn('mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110', step.color)}
                  data-icod-id={`src_pages_overview_tsx_987e_${step.number}`}>
                  <span
                    className="text-2xl font-bold text-white"
                    data-icod-id={`src_pages_overview_tsx_3c3f_${step.number}`}>{step.number}</span>
                </div>
                <div
                  className={cn('mx-auto mb-6 rounded-xl p-3 transition-colors duration-200', step.color, 'bg-opacity-15 group-hover:bg-opacity-25')}
                  data-icod-id={`src_pages_overview_tsx_bc3c_${step.number}`}>
                  <step.icon className={cn('h-8 w-8', step.textColor)} />
                </div>
                <h3
                  className="mb-3 text-lg font-semibold"
                  style={{ color: '#201034' }}
                  data-icod-id={`src_pages_overview_tsx_64d5_${step.number}`}>{t(step.title)}</h3>
                <p
                  className="text-sm leading-relaxed text-[#333]"
                  data-icod-id={`src_pages_overview_tsx_4093_${step.number}`}>{t(step.description)}</p>
                <div
                  className={cn('absolute bottom-0 left-0 h-1 w-full opacity-60', step.color)}
                  data-icod-id={`src_pages_overview_tsx_7987_${step.number}`} />
              </Card>
              {index < howItWorksSteps.length - 1 && (
                <div
                  className="my-4 flex justify-center md:hidden"
                  data-icod-id={`src_pages_overview_tsx_1d7c_${step.number}`}>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
                    data-icod-id={`src_pages_overview_tsx_6e96_${step.number}`}>
                    <ArrowRight
                      className="h-4 w-4 rotate-90 text-muted-foreground"
                      data-icod-id={`src_pages_overview_tsx_dea3_${step.number}`} />
                  </div>
                </div>
              )}
              {index < howItWorksSteps.length - 1 && (
                <div
                  className="absolute -right-4 top-20 hidden md:flex"
                  data-icod-id={`src_pages_overview_tsx_9930_${step.number}`}>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-md"
                    data-icod-id={`src_pages_overview_tsx_8594_${step.number}`}>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground"
                      data-icod-id={`src_pages_overview_tsx_3c18_${step.number}`} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 * ABOUT US SECTION (with improved card styling)
 * ========================================================================= */

function AboutSection() {
  const { t } = useTranslation();
  return (
    <section
      className="py-12"
      style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #FFF0F5 50%, #FFF5D2 100%)' }}
      data-icod-id="src_pages_overview_tsx_4c38">
      <div
        className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8"
        data-icod-id="src_pages_overview_tsx_0fc4">
        <div
          className="space-y-2 text-center"
          data-icod-id="src_pages_overview_tsx_cb23">
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ color: '#201034' }}
            data-icod-id="src_pages_overview_tsx_545d">{t('About LaunchLens AI')}</h2>
          <p
            className="text-sm text-[#555]"
            data-icod-id="src_pages_overview_tsx_3794">{t('Built for e-commerce sellers who want to launch with confidence.')}</p>
        </div>
        <div
          className="mt-10 grid gap-8 md:grid-cols-2"
          data-icod-id="src_pages_overview_tsx_e71e">
          {/* Card 1 — What We Do (Pale Champagne) */}
          <Card
            className="relative overflow-hidden p-8 shadow-md"
            style={{ backgroundColor: '#FFF5D2', borderColor: '#EACAA1' }}
            data-icod-id="src_pages_overview_tsx_7240">
            <div
              className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#EACAA1]/20 blur-2xl"
              data-icod-id="src_pages_overview_tsx_c7ab" />
            <div
              className="relative z-10 space-y-4"
              data-icod-id="src_pages_overview_tsx_4ecc">
              <div
                className="inline-flex rounded-xl bg-[#EACAA1]/30 p-3"
                data-icod-id="src_pages_overview_tsx_5018">
                <Target
                  className="h-6 w-6 text-[#201034]"
                  data-icod-id="src_pages_overview_tsx_fff4" />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_overview_tsx_624f">{t('What We Do')}</h3>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_overview_tsx_1f6e">
                {t('LaunchLens AI is a product launch intelligence platform that helps e-commerce entrepreneurs evaluate product viability before investing in advertising. We combine unit economics analysis, delivery risk assessment, and market intelligence to provide data-driven launch recommendations tailored for COD (Cash on Delivery) markets.')}
              </p>
            </div>
          </Card>
          {/* Card 2 — Who It's For (Mint Green) */}
          <Card
            className="relative overflow-hidden p-8 shadow-md"
            style={{ backgroundColor: '#E9FEDE', borderColor: '#9DD37D' }}
            data-icod-id="src_pages_overview_tsx_10cd">
            <div
              className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#9DD37D]/20 blur-2xl"
              data-icod-id="src_pages_overview_tsx_bf39" />
            <div
              className="relative z-10 space-y-4"
              data-icod-id="src_pages_overview_tsx_eb9c">
              <div
                className="inline-flex rounded-xl bg-[#9DD37D]/30 p-3"
                data-icod-id="src_pages_overview_tsx_e5ff">
                <Globe
                  className="h-6 w-6 text-[#201034]"
                  data-icod-id="src_pages_overview_tsx_82a6" />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_overview_tsx_b103">{t("Who It's For")}</h3>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_overview_tsx_9c30">
                {t('Designed for Amazon sellers, Shopify store owners, and independent e-commerce businesses operating in markets with high COD adoption — especially Pakistan, South Asia, Middle East, and Latin America. Whether you are launching your first product or scaling an existing catalog, LaunchLens AI gives you the financial clarity to make confident decisions.')}
              </p>
            </div>
          </Card>
        </div>
        {/* Mission Section */}
        <div className="mt-12" data-icod-id="src_pages_overview_tsx_a832">
          <Card
            className="relative overflow-hidden p-8 shadow-md"
            style={{ backgroundColor: '#C9D0FC', borderColor: '#9BA3E8' }}
            data-icod-id="src_pages_overview_tsx_f07e">
            <div
              className="relative z-10 mx-auto max-w-3xl space-y-4 text-center"
              data-icod-id="src_pages_overview_tsx_9063">
              <h3
                className="text-xl font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_overview_tsx_eb89">{t('Our Mission')}</h3>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_overview_tsx_bf0e">
                {t('We believe every e-commerce entrepreneur deserves access to the same level of financial analysis that large brands use. LaunchLens AI democratizes product launch intelligence, helping sellers avoid costly mistakes and focus their resources on products with the highest probability of success.')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 * WHY CHOOSE US SECTION
 * ========================================================================= */

const whyBenefits = [
  {
    title: 'Data-Driven Decisions',
    description: 'Stop guessing. Use real financial modeling to evaluate product viability before investing in ads.',
    icon: Calculator,
    bgTint: 'bg-[#F3EEFF]',
    iconColor: 'text-[#C9D0FC]',
    iconBg: 'bg-[#C9D0FC]/20',
  },
  {
    title: 'COD Market Expertise',
    description: 'Built specifically for Cash on Delivery markets where return rates and delivery success directly impact profitability.',
    icon: Globe,
    bgTint: 'bg-[#F9F0FA]',
    iconColor: 'text-[#DE85E2]',
    iconBg: 'bg-[#DE85E2]/20',
  },
  {
    title: 'Risk Assessment',
    description: 'Understand delivery risks, break-even points, and worst-case scenarios before committing budget.',
    icon: Shield,
    bgTint: 'bg-[#F2FBF0]',
    iconColor: 'text-[#9DD37D]',
    iconBg: 'bg-[#9DD37D]/20',
  },
  {
    title: 'Profit Optimization',
    description: 'Identify the optimal pricing strategy and ad spend allocation to maximize your return on investment.',
    icon: TrendingUp,
    bgTint: 'bg-[#FFF8F0]',
    iconColor: 'text-[#EACAA1]',
    iconBg: 'bg-[#EACAA1]/20',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Get actionable recommendations for pricing, positioning, and campaign testing powered by AI.',
    icon: BrainCircuit,
    bgTint: 'bg-[#F3EEFF]',
    iconColor: 'text-[#C9D0FC]',
    iconBg: 'bg-[#C9D0FC]/20',
  },
  {
    title: 'Fast Analysis',
    description: 'Go from product idea to launch decision in minutes, not days. Save time and move faster than competitors.',
    icon: Zap,
    bgTint: 'bg-[#FFF5D2]',
    iconColor: 'text-[#E9BCA6]',
    iconBg: 'bg-[#E9BCA6]/20',
  },
];

function WhyChooseUsSection() {
  const { t } = useTranslation();
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      data-icod-id="src_pages_overview_tsx_3ce1">
      <div
        className="space-y-2 text-center"
        data-icod-id="src_pages_overview_tsx_32aa">
        <h2
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_overview_tsx_8bf3">{t('Why LaunchLens AI')}</h2>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_overview_tsx_9ed2">{t('The competitive edge every e-commerce seller needs.')}</p>
      </div>
      <div
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        data-icod-id="src_pages_overview_tsx_0b2a">
        {whyBenefits.map((benefit) => (
          <Card
            key={benefit.title}
            className={cn(
              'group relative min-w-0 overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
              benefit.bgTint,
              'min-h-[240px] flex flex-col'
            )}
            data-icod-id={`src_pages_overview_tsx_4a40_${benefit.title}`}>
            <div
              className="space-y-4"
              data-icod-id={`src_pages_overview_tsx_7c9a_${benefit.title}`}>
              <div
                className={cn('inline-flex rounded-xl p-3', benefit.iconBg)}
                data-icod-id={`src_pages_overview_tsx_9d9e_${benefit.title}`}>
                <benefit.icon className={cn('h-6 w-6', benefit.iconColor)} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id={`src_pages_overview_tsx_d360_${benefit.title}`}>{t(benefit.title)}</h3>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id={`src_pages_overview_tsx_cefb_${benefit.title}`}>{t(benefit.description)}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
 * FEATURES SECTION
 * ========================================================================= */

const featuresList = [
  {
    title: 'Product Launch Decision Engine',
    description: 'Understand whether your product is ready to launch, needs testing or should be reconsidered.',
    cta: 'Explore Decision Engine',
    page: 'decision-engine' as PageId,
    icon: Rocket,
    gradient: 'from-[#C9D0FC] to-[#DE85E2]',
    iconBg: 'bg-[#DE85E2]/20',
    iconColor: 'text-[#DE85E2]',
    buttonStyle: 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white hover:from-[#6d28d9] hover:to-[#9333ea] border-transparent shadow-md hover:shadow-lg',
  },
  {
    title: 'COD Profitability Calculator',
    description: 'Calculate expected profit, delivery risks, break-even CPA and ROAS.',
    cta: 'Calculate Profit',
    page: 'simulator' as PageId,
    icon: Calculator,
    gradient: 'from-[#E9FEDE] to-[#9DD37D]',
    iconBg: 'bg-[#9DD37D]/20',
    iconColor: 'text-[#9DD37D]',
    buttonStyle: 'bg-[#22c55e] text-white hover:bg-[#16a34a] border-transparent shadow-md hover:shadow-lg',
  },
  {
    title: 'TrendScout',
    description: 'Discover trending products and market opportunities with AI-powered insights.',
    cta: 'Discover Trends',
    page: 'discovery' as PageId,
    icon: TrendingUp,
    gradient: 'from-[#F3EEFF] to-[#E4B2BE]',
    iconBg: 'bg-[#E4B2BE]/20',
    iconColor: 'text-[#E4B2BE]',
    buttonStyle: 'bg-gradient-to-r from-[#ec4899] to-[#d946ef] text-white hover:from-[#db2777] hover:to-[#c026d3] border-transparent shadow-md hover:shadow-lg',
  },
  {
    title: 'AI Advisor',
    description: 'Get actionable AI-powered recommendations for pricing, positioning, and campaigns.',
    cta: 'Get AI Insights',
    page: 'insights' as PageId,
    icon: BrainCircuit,
    gradient: 'from-[#EACAA1] to-[#DE85E2]',
    iconBg: 'bg-[#201034]/10',
    iconColor: 'text-[#201034]',
    buttonStyle: 'bg-[#201034] text-white hover:bg-[#1a0d2b] border-transparent shadow-md hover:shadow-lg',
  },
  {
    title: 'Launch Smarter Simulator',
    description: 'Model different scenarios and predict outcomes before investing in ads.',
    cta: 'Run Simulation',
    page: 'simulator' as PageId,
    icon: Zap,
    gradient: 'from-[#FFF5D2] to-[#EACAA1]',
    iconBg: 'bg-[#EACAA1]/20',
    iconColor: 'text-[#E9BCA6]',
    buttonStyle: 'bg-[#EACAA1] text-[#171717] hover:bg-[#e0b88a] border-transparent shadow-md hover:shadow-lg font-medium',
  },
  {
    title: 'Profit Tracker',
    description: 'Track predicted vs actual profit, ROAS and delivery rate after your launch — see the variance, launch by launch.',
    cta: 'Track Profit',
    page: 'profit-tracker' as PageId,
    icon: BarChart3,
    gradient: 'from-[#D4F1FF] to-[#7CC4FA]',
    iconBg: 'bg-[#7CC4FA]/20',
    iconColor: 'text-[#2B8FD4]',
    buttonStyle: 'bg-gradient-to-r from-[#2B8FD4] to-[#7CC4FA] text-white hover:from-[#1f7abf] hover:to-[#5bb0e8] border-transparent shadow-md hover:shadow-lg',
  },
  {
    title: 'WhatsApp Verdict Sharing',
    description: 'Share your GO / NO-GO launch verdict on WhatsApp as a clean verdict card with your real figures.',
    cta: 'Share Verdict',
    page: 'simulator' as PageId,
    icon: Share2,
    gradient: 'from-[#D1FAE5] to-[#6EE7B7]',
    iconBg: 'bg-[#6EE7B7]/20',
    iconColor: 'text-[#059669]',
    buttonStyle: 'bg-[#059669] text-white hover:bg-[#047857] border-transparent shadow-md hover:shadow-lg',
  },
  {
    title: 'Launch Scenarios',
    description: 'Compare Conservative, Expected and Optimistic launch outcomes side by side before you spend.',
    cta: 'Compare Scenarios',
    page: 'scenarios' as PageId,
    icon: GitCompare,
    gradient: 'from-[#FEF3C7] to-[#FCD34D]',
    iconBg: 'bg-[#FCD34D]/20',
    iconColor: 'text-[#B45309]',
    buttonStyle: 'bg-[#B45309] text-white hover:bg-[#92400E] border-transparent shadow-md hover:shadow-lg',
  },
  {
    title: 'Readiness Checklist',
    description: 'Check your launch readiness step by step, from product to pricing to ads.',
    cta: 'Check Readiness',
    page: 'checklist' as PageId,
    icon: CheckSquare,
    gradient: 'from-[#EDE9FE] to-[#A78BFA]',
    iconBg: 'bg-[#A78BFA]/20',
    iconColor: 'text-[#7C3AED]',
    buttonStyle: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] border-transparent shadow-md hover:shadow-lg',
  },
];

function FeaturesSection({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const { t } = useTranslation();
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      data-icod-id="src_pages_overview_tsx_6e9e">
      <div
        className="space-y-2 text-center"
        data-icod-id="src_pages_overview_tsx_cf3a">
        <h2
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_overview_tsx_b1e8">{t('Features')}</h2>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_overview_tsx_d512">{t('Powerful tools to help you make smarter launch decisions.')}</p>
      </div>
      <div
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        data-icod-id="src_pages_overview_tsx_3c52">
        {featuresList.map((feature) => (
          <Card
            key={feature.title}
            className={cn(
              'group relative min-w-0 overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
              'bg-gradient-to-br',
              feature.gradient,
              'bg-opacity-20 flex flex-col min-h-[320px]'
            )}
            data-icod-id={`src_pages_overview_tsx_199c_${feature.title}`}>
            <div
              className={cn('absolute inset-0 bg-gradient-to-br opacity-20', feature.gradient)}
              data-icod-id={`src_pages_overview_tsx_9bdc_${feature.title}`} />
            <div
              className="relative z-10 flex flex-1 flex-col gap-4"
              data-icod-id={`src_pages_overview_tsx_d82e_${feature.title}`}>
              <div
                className={cn('inline-flex h-12 w-12 items-center justify-center rounded-xl', feature.iconBg)}
                data-icod-id={`src_pages_overview_tsx_8356_${feature.title}`}>
                <feature.icon className={cn('h-6 w-6', feature.iconColor)} />
              </div>
              <div
                className="space-y-2"
                data-icod-id={`src_pages_overview_tsx_ae3b_${feature.title}`}>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: '#201034' }}
                  data-icod-id={`src_pages_overview_tsx_f01c_${feature.title}`}>{t(feature.title)}</h3>
                <p
                  className="text-sm leading-relaxed text-[#333]"
                  data-icod-id={`src_pages_overview_tsx_cc21_${feature.title}`}>{t(feature.description)}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(feature.page)}
                className={cn(
                  'mt-auto w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]',
                  feature.buttonStyle
                )}
                data-icod-id={`src_pages_overview_tsx_9a38_${feature.title}`}>
                <span
                  className="flex items-center justify-center gap-2"
                  data-icod-id={`src_pages_overview_tsx_e92f_${feature.title}`}>
                  {t(feature.cta)}
                  <ArrowRight
                    className="h-4 w-4"
                    data-icod-id={`src_pages_overview_tsx_58ee_${feature.title}`} />
                </span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
 * DEMO VIDEO SECTION
 * ========================================================================= */

const DRIVE_FILE_ID = '1yssis0_xg8i8-l9tOn8Pr0adkPlYd_DN';
const DRIVE_PREVIEW_URL = `https://drive.google.com/file/d/${DRIVE_FILE_ID}/preview`;
const VIDEO_DURATION_MS = 44_000; // known duration of the demo video

function DemoSection() {
  const { t } = useTranslation();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    // Start a timer to detect when the video ends (Drive embed doesn't fire standard events)
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVideoEnded(true);
    }, VIDEO_DURATION_MS);
  }, []);

  const handleReplay = useCallback(() => {
    setVideoEnded(false);
    setIframeLoaded(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Force iframe reload by toggling a key — done via state reset below
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // When replaying, we use a key to force iframe remount
  const [iframeKey, setIframeKey] = useState(0);
  const handleReplayWithKey = useCallback(() => {
    handleReplay();
    setIframeKey((k) => k + 1);
  }, [handleReplay]);

  return (
    <section
      id="demo-video"
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      data-icod-id="src_pages_overview_tsx_7447">
      <div
        className="space-y-2 text-center"
        data-icod-id="src_pages_overview_tsx_e878">
        <h2
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_overview_tsx_9f6d">{t('See LaunchLens AI in Action')}</h2>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_overview_tsx_4fe8">{t('From Product Idea to Smarter Launch Decisions.')}</p>
      </div>
      <div
        className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl shadow-xl"
        data-icod-id="src_pages_overview_tsx_963c">
        <div
          className="aspect-video relative w-full overflow-hidden drive-video-crop"
          data-icod-id="src_pages_overview_tsx_video_container">
          {/* Branded loading placeholder — visible until iframe loads */}
          {!iframeLoaded && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#2A1F2E] to-[#3D2B52]"
              data-icod-id="src_pages_overview_tsx_loading_overlay">
              <div
                className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"
                data-icod-id="src_pages_overview_tsx_spinner" />
              <p
                className="text-sm font-medium text-white/80"
                data-icod-id="src_pages_overview_tsx_loading_text">{t('Loading video...')}</p>
            </div>
          )}

          {/* Replay overlay — shown when video has ended */}
          {videoEnded && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#2A1F2E]/90"
              data-icod-id="src_pages_overview_tsx_replay_overlay">
              <button
                onClick={handleReplayWithKey}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Replay video"
                data-icod-id="src_pages_overview_tsx_replay_btn">
                <Play
                  className="ml-1 h-8 w-8 fill-current"
                  data-icod-id="src_pages_overview_tsx_replay_icon" />
              </button>
              <p
                className="text-sm font-medium text-white/80"
                data-icod-id="src_pages_overview_tsx_replay_text">{t('Watch again')}</p>
            </div>
          )}

          {/* Google Drive preview iframe — scaled to eliminate letterboxing at narrow widths */}
          <div
            className="drive-iframe-wrapper absolute inset-0"
            data-icod-id="src_pages_overview_tsx_3070">
            <iframe
              key={iframeKey}
              src={DRIVE_PREVIEW_URL}
              title="LaunchLens AI Demo Video"
              allow="autoplay"
              onLoad={handleIframeLoad}
              className="h-full w-full border-0"
              data-icod-id="src_pages_overview_tsx_video_iframe" />
          </div>
        </div>
      </div>
      <p
        className="mx-auto mt-4 max-w-4xl text-center text-xs italic text-muted-foreground"
        data-icod-id="src_pages_overview_tsx_video_caption">
        {t('Dashboard figures shown are an illustrative example using the demo product (Premium Skincare Serum).')}
      </p>
      <div
        className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3"
        data-icod-id="src_pages_overview_tsx_9932">
        {[
          { label: 'Comprehensive Metrics Evaluated', value: 'Full Analysis' },
          { label: 'Fast Product Analysis', value: 'Quick Results' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: '#F3EEFF' }}
            data-icod-id={`src_pages_overview_tsx_9dae_${stat.label}`}>
            <p
              className="text-2xl font-bold"
              style={{ color: '#201034' }}
              data-icod-id={`src_pages_overview_tsx_e057_${stat.label}`}>{t(stat.value)}</p>
            <p
              className="text-xs text-[#555]"
              data-icod-id={`src_pages_overview_tsx_0860_${stat.label}`}>{t(stat.label)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
 * PROMOTIONAL BANNER SECTION
 * ========================================================================= */

function PromoBannerSection() {
  return (
    <section
      className="mx-auto max-w-full px-4 py-8 md:px-6"
      style={{ maxWidth: '64rem' }}
      data-icod-id="src_pages_overview_tsx_c95b">
      <div
        className="overflow-hidden rounded-2xl shadow-lg"
        data-icod-id="src_pages_overview_tsx_75b4">
        <img
          src="/assets/1795052257815_slide-1-1920x1080-upload.webp"
          alt="Smarter Decisions. Bigger Profits."
          className="h-auto w-full max-w-full object-contain"
          loading="lazy"
          data-icod-id="src_pages_overview_tsx_e554" />
      </div>
    </section>
  );
}

/* =========================================================================
 * FINAL CTA SECTION
 * ========================================================================= */

function FinalCTASection({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const { t } = useTranslation();
  return (
    <section
      className="mx-auto max-w-4xl px-4 py-12 text-center md:px-6"
      data-icod-id="src_pages_overview_tsx_1aa7">
      <h2
        className="text-3xl font-bold md:text-4xl"
        style={{ color: '#201034' }}
        data-icod-id="src_pages_overview_tsx_75ee">
        {t('Ready to Launch Smarter?')}
      </h2>
      <p
        className="mx-auto mt-4 max-w-2xl text-sm text-[#555]"
        data-icod-id="src_pages_overview_tsx_ccf1">
        {t('Make data-driven launch decisions with LaunchLens AI.')}
      </p>
      <div
        className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        data-icod-id="src_pages_overview_tsx_4930">
        <button
          type="button"
          onClick={() => onNavigate('decision-engine')}
          className="rounded-lg bg-[#201034] px-8 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#1a0d2b] hover:shadow-lg"
          data-icod-id="src_pages_overview_tsx_4e5f">
          {t('Try Decision Engine')}
        </button>
        <button
          type="button"
          onClick={() => onNavigate('simulator')}
          className="rounded-lg bg-[#9DD37D] px-8 py-3 text-sm font-medium text-[#171717] shadow-md transition-all hover:bg-[#8cc56d] hover:shadow-lg"
          data-icod-id="src_pages_overview_tsx_532c">
          {t('Calculate Profitability')}
        </button>
      </div>
    </section>
  );
}

/* =========================================================================
 * FAQ SECTION
 * ========================================================================= */

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'What is LaunchLens AI and how does it work?',
    answer: 'LaunchLens AI is a product launch intelligence platform that helps e-commerce entrepreneurs evaluate product viability before investing in advertising. It analyzes your unit economics, delivery risks, and market conditions to provide data-driven launch recommendations.',
  },
  {
    question: 'How does the Product Launch Decision Engine analyze my product?',
    answer: 'The Decision Engine evaluates multiple factors including your profit margins, competitive landscape, delivery success rates, and return risk. It combines these metrics into a comprehensive readiness score that tells you whether to launch, test further, or reconsider.',
  },
  {
    question: 'What is COD profitability and why does it matter?',
    answer: 'COD (Cash on Delivery) profitability accounts for the unique risks of cash-on-delivery markets where return rates and delivery failures directly impact your bottom line. Understanding true COD profitability prevents costly surprises from rejected deliveries and returns.',
  },
  {
    question: 'How are break-even CPA and ROAS calculated?',
    answer: 'Break-Even ROAS = (Delivery Rate \u00d7 Selling Price) / Expected Contribution per Placed Order. Break-Even CPA = Expected Contribution per Placed Order. The delivery rate appears in the ROAS formula because it determines how many placed orders actually result in delivered, paid orders \u2014 a lower delivery rate means fewer completed sales for the same ad spend, raising the minimum ROAS needed to break even.',
  },
  {
    question: 'Is my data secure and private?',
    answer: 'Yes, all data is processed securely and stored with industry-standard encryption. We never share your product information or business data with third parties. Your analysis results are visible only to your account.',
  },
];

function FAQSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      data-icod-id="src_pages_overview_tsx_acf1">
      <div
        className="space-y-2 text-center"
        data-icod-id="src_pages_overview_tsx_2546">
        <h2
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_overview_tsx_8336">{t('Frequently Asked Questions')}</h2>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_overview_tsx_8150">{t('Everything you need to know about LaunchLens AI.')}</p>
      </div>
      <div
        className="mx-auto mt-10 max-w-3xl space-y-3 rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #FFF0F5 50%, #FFF5D2 100%)' }}
        data-icod-id="src_pages_overview_tsx_3c4a">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={cn(
                'overflow-hidden rounded-xl border transition-all duration-200',
                isOpen ? 'border-[#C9D0FC] shadow-md' : 'border-[#E8E0F0] shadow-sm hover:border-[#C9D0FC]/60'
              )}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              data-icod-id={`src_pages_overview_tsx_2659_${index}`}>
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[#F3EEFF]/50"
                aria-expanded={isOpen}
                data-icod-id={`src_pages_overview_tsx_90b5_${index}`}>
                <span
                  className="pr-4 text-sm font-semibold"
                  style={{ color: '#201034' }}
                  data-icod-id={`src_pages_overview_tsx_b8ed_${index}`}>{t(item.question)}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200',
                    isOpen ? 'rotate-180 text-[#DE85E2]' : 'text-[#C9D0FC]'
                  )}
                  data-icod-id={`src_pages_overview_tsx_737d_${index}`} />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-200 ease-in-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
                data-icod-id={`src_pages_overview_tsx_8b9c_${index}`}>
                <div
                  className="overflow-hidden"
                  data-icod-id={`src_pages_overview_tsx_8414_${index}`}>
                  <p
                    className="px-4 pb-4 text-sm leading-relaxed text-[#333]"
                    data-icod-id={`src_pages_overview_tsx_9319_${index}`}>
                    {t(item.answer)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================================
 * AUTHENTICATED DASHBOARD
 * ========================================================================= */

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  currency: string;
  simulatorInputs: SimulationInputs;
  checklistCompletion: number;
}

function AuthenticatedDashboard({ onNavigate, currency, simulatorInputs, checklistCompletion }: DashboardProps) {
  const { t } = useTranslation();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const { items: products, activeProductId } = useAppSelector((s) => s.products);

  // Shared courier rates (same source as CODCalculator & Pricing)
  const {
    rates: courierRates,
    lastSyncedAt,
    isCustomized,
  } = useCourierRates();

  const activeProduct = useMemo(
    () => products.find((p) => p._id === activeProductId) || null,
    [products, activeProductId]
  );

  // Calculate KPIs from current simulator inputs
  const results = useMemo(() => calculateSimulation(simulatorInputs), [simulatorInputs]);

  // Load recent saved analyses from localStorage
  const recentAnalyses = useMemo(() => {
    const all = getSavedSimulatorAnalyses(userId);
    return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  }, [userId]);

  // Pick a currency-appropriate icon for revenue display
  const CurrencyIcon = useMemo(() => {
    if (currency === 'PKR' || currency === 'INR' || currency === 'NPR' || currency === 'LKR') return IndianRupee;
    return DollarSign;
  }, [currency]);

  // KPI definitions
  const kpis = [
    {
      label: 'Revenue',
      value: formatCurrency(results.revenue, currency),
      icon: CurrencyIcon,
      color: 'text-[#C9D0FC]',
      bg: 'bg-[#C9D0FC]/10',
      border: 'border-l-[#C9D0FC]',
    },
    {
      label: 'Profit',
      value: formatCurrency(results.campaignProfitLoss, currency),
      icon: results.campaignProfitLoss >= 0 ? TrendingUp : Activity,
      color: results.campaignProfitLoss >= 0 ? 'text-[#9DD37D]' : 'text-[#E88B9E]',
      bg: results.campaignProfitLoss >= 0 ? 'bg-[#9DD37D]/10' : 'bg-[#E88B9E]/10',
      border: results.campaignProfitLoss >= 0 ? 'border-l-[#9DD37D]' : 'border-l-[#E88B9E]',
    },
    {
      label: 'Contribution / Order',
      value: formatCurrency(results.contributionPerOrder, currency),
      icon: Package,
      color: 'text-[#EACAA1]',
      bg: 'bg-[#EACAA1]/10',
      border: 'border-l-[#EACAA1]',
    },
    {
      label: 'ROAS',
      value: results.roas !== null ? formatMultiplier(results.roas) : 'N/A',
      icon: Target,
      color: 'text-[#C9D0FC]',
      bg: 'bg-[#C9D0FC]/10',
      border: 'border-l-[#C9D0FC]',
    },
    {
      label: 'Break-Even ROAS',
      value: results.breakEvenRoas !== null ? formatMultiplier(results.breakEvenRoas) : 'N/A',
      icon: Calculator,
      color: 'text-[#DE85E2]',
      bg: 'bg-[#DE85E2]/10',
      border: 'border-l-[#DE85E2]',
    },
  ];

  return (
    <div
      className="space-y-10"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_overview_tsx_1c9e">
      {/* Product Switcher */}
      <div className="max-w-sm" data-icod-id="src_pages_overview_tsx_04a9">
        <ProductSwitcher data-icod-id="src_pages_overview_tsx_eec2" />
      </div>
      {/* Current Product Section */}
      {activeProduct && (
        <Card className="p-6 sm:p-8" data-icod-id="src_pages_overview_tsx_e97b">
          <h2
            className="mb-6 text-lg font-semibold tracking-tight text-foreground"
            data-icod-id="src_pages_overview_tsx_32b1">{t('Current Product')}</h2>
          <div
            className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4"
            data-icod-id="src_pages_overview_tsx_810c">
            <div className="space-y-1.5" data-icod-id="src_pages_overview_tsx_b430">
              <p
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                data-icod-id="src_pages_overview_tsx_c2bd">{t('Product Name')}</p>
              <p
                className="text-base font-semibold text-foreground"
                data-icod-id="src_pages_overview_tsx_ab41">{activeProduct.name}</p>
            </div>
            <div className="space-y-1.5" data-icod-id="src_pages_overview_tsx_296b">
              <p
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                data-icod-id="src_pages_overview_tsx_a7ad">{t('Selling Price')}</p>
              <p
                className="text-base font-semibold tabular-nums text-foreground"
                data-icod-id="src_pages_overview_tsx_98dd">{formatCurrency(activeProduct.sellingPrice, currency)}</p>
            </div>
            <div className="space-y-1.5" data-icod-id="src_pages_overview_tsx_414b">
              <p
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                data-icod-id="src_pages_overview_tsx_c049">{t('Product Cost')}</p>
              <p
                className="text-base font-semibold tabular-nums text-foreground"
                data-icod-id="src_pages_overview_tsx_348e">{formatCurrency(activeProduct.productCost, currency)}</p>
            </div>
            <div className="space-y-1.5" data-icod-id="src_pages_overview_tsx_73d3">
              <p
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                data-icod-id="src_pages_overview_tsx_e0de">{t('Delivery Cost')}</p>
              <p
                className="text-base font-semibold tabular-nums text-foreground"
                data-icod-id="src_pages_overview_tsx_a481">{formatCurrency(activeProduct.deliveryCost, currency)}</p>
            </div>
            <div className="space-y-1.5" data-icod-id="src_pages_overview_tsx_da2b">
              <p
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                data-icod-id="src_pages_overview_tsx_5ee8">{t('Other Costs')}</p>
              <p
                className="text-base font-semibold tabular-nums text-foreground"
                data-icod-id="src_pages_overview_tsx_a28e">{formatCurrency(activeProduct.otherCosts, currency)}</p>
            </div>
            <div className="space-y-1.5" data-icod-id="src_pages_overview_tsx_2c90">
              <p
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                data-icod-id="src_pages_overview_tsx_007f">{t('Ad Budget')}</p>
              <p
                className="text-base font-semibold tabular-nums text-foreground"
                data-icod-id="src_pages_overview_tsx_4b70">{formatCurrency(activeProduct.adBudget, currency)}</p>
            </div>
            <div className="space-y-1.5" data-icod-id="src_pages_overview_tsx_ce5e">
              <p
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                data-icod-id="src_pages_overview_tsx_8477">{t('Expected Orders')}</p>
              <p
                className="text-base font-semibold tabular-nums text-foreground"
                data-icod-id="src_pages_overview_tsx_7fc1">{activeProduct.expectedOrders}</p>
            </div>
            <div className="space-y-1.5" data-icod-id="src_pages_overview_tsx_c26a">
              <p
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                data-icod-id="src_pages_overview_tsx_6956">{t('Delivery Rate')}</p>
              <p
                className="text-base font-semibold tabular-nums text-foreground"
                data-icod-id="src_pages_overview_tsx_8a01">{roundTwo(simulatorInputs.deliverySuccessRate)}%</p>
            </div>
          </div>
        </Card>
      )}
      {/* Latest Simulation KPIs */}
      <section className="space-y-5" data-icod-id="src_pages_overview_tsx_46ef">
        <h2
          className="text-lg font-semibold tracking-tight text-foreground"
          data-icod-id="src_pages_overview_tsx_00f8">{t('Latest Simulation KPIs')}</h2>
        <div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          data-icod-id="src_pages_overview_tsx_2f94">
          {kpis.map((kpi, idx) => (
            <Card
              key={kpi.label}
              className={cn(
                'card-hover-lift border-l-[3px] p-5',
                kpi.border,
                'animate-card-entrance'
              )}
              style={{ animationDelay: `${idx * 60}ms` }}
              data-icod-id={`src_pages_overview_tsx_b920_${kpi.label}`}>
              <div
                className="flex items-start justify-between gap-3"
                data-icod-id={`src_pages_overview_tsx_55c3_${kpi.label}`}>
                <div
                  className="min-w-0 space-y-2"
                  data-icod-id={`src_pages_overview_tsx_67aa_${kpi.label}`}>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    data-icod-id={`src_pages_overview_tsx_2f5a_${kpi.label}`}>{t(kpi.label)}</p>
                  <p
                    className="truncate text-2xl font-bold tabular-nums tracking-tight text-foreground"
                    data-icod-id={`src_pages_overview_tsx_e263_${kpi.label}`}>{kpi.value}</p>
                </div>
                <div
                  className={cn('shrink-0 rounded-lg p-2.5', kpi.bg)}
                  data-icod-id={`src_pages_overview_tsx_121e_${kpi.label}`}>
                  <kpi.icon className={cn('h-5 w-5', kpi.color)} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
      {/* Readiness Progress + Recent Analyses side by side */}
      <div
        className="grid gap-6 lg:grid-cols-2"
        data-icod-id="src_pages_overview_tsx_deea">
        {/* Readiness Progress */}
        <Card className="p-6" data-icod-id="src_pages_overview_tsx_069b">
          <div
            className="mb-4 flex items-center justify-between"
            data-icod-id="src_pages_overview_tsx_2265">
            <h2
              className="text-xl font-bold text-foreground"
              data-icod-id="src_pages_overview_tsx_1b13">{t('Launch Readiness')}</h2>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-sm font-bold',
                checklistCompletion >= 75 ? 'bg-[#9DD37D]/20 text-[#9DD37D]' :
                checklistCompletion >= 50 ? 'bg-[#C9D0FC]/20 text-[#C9D0FC]' :
                'bg-[#E88B9E]/20 text-[#E88B9E]'
              )}
              data-icod-id="src_pages_overview_tsx_1912">
              {checklistCompletion}%
            </span>
          </div>
          {/* Progress bar */}
          <div
            className="relative mb-4 h-3 w-full overflow-hidden rounded-full bg-muted"
            data-icod-id="src_pages_overview_tsx_828a">
            <div
              className={cn(
                'h-full transition-all duration-500',
                checklistCompletion >= 75 ? 'bg-[#9DD37D]' :
                checklistCompletion >= 50 ? 'bg-[#C9D0FC]' :
                'bg-[#E88B9E]'
              )}
              style={{ width: `${checklistCompletion}%` }}
              data-icod-id="src_pages_overview_tsx_8bc1" />
          </div>
          <p
            className="mb-4 text-sm text-muted-foreground"
            data-icod-id="src_pages_overview_tsx_ad4f">
            {checklistCompletion === 100
              ? t("All tasks complete — you're ready to launch!")
              : `${checklistCompletion}${t('% of launch readiness tasks completed.')}`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('checklist')}
            className="gap-2"
            data-icod-id="src_pages_overview_tsx_9aad">
            <ListChecks className="h-4 w-4" data-icod-id="src_pages_overview_tsx_bf4e" />
            {t('View Checklist')}
          </Button>
        </Card>

        {/* Recent Saved Analyses */}
        <Card className="p-6" data-icod-id="src_pages_overview_tsx_0e3b">
          <div
            className="mb-4 flex items-center justify-between"
            data-icod-id="src_pages_overview_tsx_36c3">
            <h2
              className="text-xl font-bold text-foreground"
              data-icod-id="src_pages_overview_tsx_ae73">{t('Recent Analyses')}</h2>
          </div>
          {recentAnalyses.length > 0 ? (
            <div className="space-y-3" data-icod-id="src_pages_overview_tsx_7815">
              {recentAnalyses.map((analysis: SavedSimulatorAnalysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                  data-icod-id={`src_pages_overview_tsx_5f5e_${analysis.id}`}>
                  <div
                    className="min-w-0 flex-1 space-y-1"
                    data-icod-id={`src_pages_overview_tsx_dd9b_${analysis.id}`}>
                    <div
                      className="flex items-center gap-2"
                      data-icod-id={`src_pages_overview_tsx_5a6f_${analysis.id}`}>
                      <FileText
                        className="h-4 w-4 shrink-0 text-[#C9D0FC]"
                        data-icod-id={`src_pages_overview_tsx_60bd_${analysis.id}`} />
                      <p
                        className="truncate font-medium text-foreground"
                        data-icod-id={`src_pages_overview_tsx_7937_${analysis.id}`}>{analysis.name}</p>
                    </div>
                    <div
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                      data-icod-id={`src_pages_overview_tsx_016a_${analysis.id}`}>
                      <Calendar
                        className="h-3 w-3"
                        data-icod-id={`src_pages_overview_tsx_bb6c_${analysis.id}`} />
                      <span data-icod-id={`src_pages_overview_tsx_c8a5_${analysis.id}`}>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                          analysis.verdict === 'Profitable' ? 'bg-[#9DD37D]/20 text-[#9DD37D]' : 'bg-[#E88B9E]/20 text-[#E88B9E]'
                        )}
                        data-icod-id={`src_pages_overview_tsx_a607_${analysis.id}`}>
                        {analysis.verdict}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('saved-analyses')}
                    data-icod-id={`src_pages_overview_tsx_9f2b_${analysis.id}`}>
                    <ArrowRight
                      className="h-4 w-4"
                      data-icod-id={`src_pages_overview_tsx_a8bf_${analysis.id}`} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title={t('No saved analyses yet')}
              description={t('Run your first simulation and save it to see recent analyses here.')}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('simulator')}
                  data-icod-id="src_pages_overview_tsx_db60">
                  {t('Run Your First Simulation')}
                </Button>
              }
              data-icod-id="src_pages_overview_tsx_fd09" />
          )}
        </Card>
      </div>
      {/* Courier Rates at a Glance */}
      <Card className="p-6" data-icod-id="src_pages_overview_tsx_courier_glance">
        <div
          className="mb-4 flex items-center justify-between"
          data-icod-id="src_pages_overview_tsx_courier_glance_header">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_overview_tsx_courier_glance_title_row">
            <Truck
              className="h-5 w-5 text-muted-foreground"
              data-icod-id="src_pages_overview_tsx_courier_glance_icon" />
            <h2
              className="text-xl font-bold text-foreground"
              data-icod-id="src_pages_overview_tsx_courier_glance_title">
              {t('Courier Rates at a Glance')}
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('cod-calculator')}
            className="gap-2"
            data-icod-id="src_pages_overview_tsx_courier_glance_link">
            {t('View full comparison')}
            <ArrowRight
              className="h-4 w-4"
              data-icod-id="src_pages_overview_tsx_courier_glance_arrow" />
          </Button>
        </div>
        <div
          className="grid gap-4 sm:grid-cols-3"
          data-icod-id="src_pages_overview_tsx_courier_glance_grid">
          {COURIER_IDS.map((cid) => {
            const c = courierRates.couriers[cid];
            return (
              <div
                key={cid}
                className="rounded-lg border border-border/40 bg-muted/20 p-4"
                data-icod-id={`src_pages_overview_tsx_courier_glance_card_${cid}`}>
                <h3
                  className="mb-2 font-semibold text-foreground"
                  data-icod-id={`src_pages_overview_tsx_courier_glance_name_${cid}`}>
                  {c.name}
                </h3>
                <div
                  className="space-y-1 text-sm"
                  data-icod-id={`src_pages_overview_tsx_courier_glance_details_${cid}`}>
                  <div
                    className="flex justify-between"
                    data-icod-id={`src_pages_overview_tsx_courier_glance_base_${cid}`}>
                    <span
                      className="text-muted-foreground"
                      data-icod-id={`src_pages_overview_tsx_1914_${cid}`}>{t('Base (1kg)')}</span>
                    <span
                      className="tabular-nums font-medium text-foreground"
                      data-icod-id={`src_pages_overview_tsx_c15d_${cid}`}>
                      {formatCurrency(c.baseRate1kg, currency)}
                    </span>
                  </div>
                  <div
                    className="flex justify-between"
                    data-icod-id={`src_pages_overview_tsx_courier_glance_cod_${cid}`}>
                    <span
                      className="text-muted-foreground"
                      data-icod-id={`src_pages_overview_tsx_40b1_${cid}`}>{t('COD fee')}</span>
                    <span
                      className="tabular-nums font-medium text-foreground"
                      data-icod-id={`src_pages_overview_tsx_e5b5_${cid}`}>
                      {c.codFeePercent}%
                    </span>
                  </div>
                  <div
                    className="flex justify-between"
                    data-icod-id={`src_pages_overview_tsx_courier_glance_settle_${cid}`}>
                    <span
                      className="text-muted-foreground"
                      data-icod-id={`src_pages_overview_tsx_258f_${cid}`}>{t('Settlement')}</span>
                    <span
                      className="font-medium text-foreground"
                      data-icod-id={`src_pages_overview_tsx_67e3_${cid}`}>
                      {c.settlementDays} days
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Freshness indicator */}
        <div className="mt-3 space-y-1" data-icod-id="src_pages_overview_tsx_97bb">
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
            data-icod-id="src_pages_overview_tsx_26e6">
            <span
              className="flex items-center gap-1"
              data-icod-id="src_pages_overview_tsx_8c8c">
              <Clock className="h-3 w-3" data-icod-id="src_pages_overview_tsx_e31f" />
              {lastSyncedAt
                ? `${t('Last synced:')} ${new Date(lastSyncedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : t('Never synced')}
            </span>
            {isCustomized && (
              <span
                className="font-medium text-warning"
                data-icod-id="src_pages_overview_tsx_a486">
                {t('Rates customized since last sync')}
              </span>
            )}
          </div>
          <p
            className="text-xs text-muted-foreground"
            data-icod-id="src_pages_overview_tsx_courier_glance_disclaimer">
            {t('Indicative rates — not a live courier feed. Verify with your courier.')}
          </p>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
 * MAIN OVERVIEW COMPONENT
 * ========================================================================= */

export default function Overview({ onNavigate, currency, simulatorInputs, checklistCompletion, forcePublic }: OverviewProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Logged-in view: show the dashboard (unless forcePublic is set)
  if (isAuthenticated && !forcePublic) {
    return (
      <AuthenticatedDashboard
        onNavigate={onNavigate}
        currency={currency}
        simulatorInputs={simulatorInputs}
        checklistCompletion={checklistCompletion}
        data-icod-id="src_pages_overview_tsx_4627" />
    );
  }

  // Logged-out view: existing marketing homepage
  return (
    <div
      className="space-y-10"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_overview_tsx_e494">
      {/* 1. Hero Slider */}
      <HeroSlider data-icod-id="src_pages_overview_tsx_5a39" />
      {/* 2. How It Works */}
      <HowItWorksSection data-icod-id="src_pages_overview_tsx_ec90" />
      {/* 3. About Us */}
      <AboutSection data-icod-id="src_pages_overview_tsx_8849" />
      {/* 4. Why Choose Us */}
      <WhyChooseUsSection data-icod-id="src_pages_overview_tsx_10ee" />
      {/* 5. Features */}
      <FeaturesSection onNavigate={onNavigate} data-icod-id="src_pages_overview_tsx_07e7" />
      {/* 6. Demo Video */}
      <DemoSection data-icod-id="src_pages_overview_tsx_58ad" />
      {/* 7. Promotional Banner */}
      <PromoBannerSection data-icod-id="src_pages_overview_tsx_c460" />
      {/* 8. Final CTA */}
      <FinalCTASection onNavigate={onNavigate} data-icod-id="src_pages_overview_tsx_f75b" />
      {/* 9. FAQ */}
      <FAQSection data-icod-id="src_pages_overview_tsx_981a" />
    </div>
  );
}
