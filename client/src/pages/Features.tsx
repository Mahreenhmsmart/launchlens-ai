import { ArrowRight, Rocket, Calculator, TrendingUp, BrainCircuit, Zap, BarChart3, Share2, GitCompare, CheckSquare } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { PageId } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/utils/i18n';

const features = [
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

export default function Features() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavigate = (page: PageId) => {
    navigate('/auth?tab=signup');
  };

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_features_tsx_cd28">
      <div
        className="space-y-2 text-center"
        data-icod-id="src_pages_features_tsx_c6c0">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_features_tsx_9190">{t('Features')}</h1>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_features_tsx_66f1">
          {t('Powerful tools to help you make smarter launch decisions.')}
        </p>
      </div>
      <div
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        data-icod-id="src_pages_features_tsx_e1d9">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className={cn(
              'group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
              'bg-gradient-to-br',
              feature.gradient,
              'bg-opacity-20 flex flex-col min-h-[320px]'
            )}
            data-icod-id={`src_pages_features_tsx_da9c_${feature.title}`}>
            {/* Gradient overlay for softer look */}
            <div
              className={cn('absolute inset-0 bg-gradient-to-br opacity-20', feature.gradient)}
              data-icod-id={`src_pages_features_tsx_f2a1_${feature.title}`} />

            <div
              className="relative z-10 flex flex-1 flex-col gap-4"
              data-icod-id={`src_pages_features_tsx_d149_${feature.title}`}>
              <div
                className={cn('inline-flex h-12 w-12 items-center justify-center rounded-xl', feature.iconBg)}
                data-icod-id={`src_pages_features_tsx_1552_${feature.title}`}>
                <feature.icon className={cn('h-6 w-6', feature.iconColor)} />
              </div>

              <div
                className="space-y-2"
                data-icod-id={`src_pages_features_tsx_c566_${feature.title}`}>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: '#201034' }}
                  data-icod-id={`src_pages_features_tsx_d0c5_${feature.title}`}>{feature.title}</h3>
                <p
                  className="text-sm leading-relaxed text-[#333]"
                  data-icod-id={`src_pages_features_tsx_1c13_${feature.title}`}>{feature.description}</p>
              </div>

              <button
                type="button"
                onClick={() => handleNavigate(feature.page)}
                className={cn(
                  'mt-auto w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]',
                  feature.buttonStyle
                )}
                data-icod-id={`src_pages_features_tsx_e726_${feature.title}`}>
                <span
                  className="flex items-center justify-center gap-2"
                  data-icod-id={`src_pages_features_tsx_88e9_${feature.title}`}>
                  {feature.cta}
                  <ArrowRight
                    className="h-4 w-4"
                    data-icod-id={`src_pages_features_tsx_75fe_${feature.title}`} />
                </span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
