import { Shield, TrendingUp, Calculator, BrainCircuit, Globe, Zap } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';

const benefits = [
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

export default function WhyLaunchLens() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_whylaunchlens_tsx_9471">
      <div
        className="space-y-2 text-center"
        data-icod-id="src_pages_whylaunchlens_tsx_0887">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_whylaunchlens_tsx_a29e">Why LaunchLens AI</h1>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_whylaunchlens_tsx_1ba6">
          The competitive edge every e-commerce seller needs.
        </p>
      </div>
      <div
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        data-icod-id="src_pages_whylaunchlens_tsx_db2d">
        {benefits.map((benefit) => (
          <Card
            key={benefit.title}
            className={cn(
              'group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
              benefit.bgTint,
              'min-h-[240px] flex flex-col'
            )}
            data-icod-id={`src_pages_whylaunchlens_tsx_0122_${benefit.title}`}>
            <div
              className="space-y-4"
              data-icod-id={`src_pages_whylaunchlens_tsx_829c_${benefit.title}`}>
              <div
                className={cn('inline-flex rounded-xl p-3', benefit.iconBg)}
                data-icod-id={`src_pages_whylaunchlens_tsx_eba7_${benefit.title}`}>
                <benefit.icon className={cn('h-6 w-6', benefit.iconColor)} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id={`src_pages_whylaunchlens_tsx_fe9d_${benefit.title}`}>{benefit.title}</h3>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id={`src_pages_whylaunchlens_tsx_c83e_${benefit.title}`}>{benefit.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
