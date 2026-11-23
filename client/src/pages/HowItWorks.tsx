import { ArrowRight, ClipboardCheck, BarChart3, Zap } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';

const steps = [
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

export default function HowItWorks() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_howitworks_tsx_41eb">
      <div
        className="space-y-2 text-center"
        data-icod-id="src_pages_howitworks_tsx_a279">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_howitworks_tsx_dbcf">How It Works</h1>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_howitworks_tsx_1dd7">
          Three simple steps to smarter product launches.
        </p>
      </div>
      <div className="relative mt-12" data-icod-id="src_pages_howitworks_tsx_ae66">
        {/* Connecting line (desktop only) */}
        <div
          className="absolute left-0 right-0 top-20 hidden h-1 bg-gradient-to-r from-[#C9D0FC] via-[#DE85E2] to-[#9DD37D] opacity-30 md:block"
          data-icod-id="src_pages_howitworks_tsx_17d5" />

        <div
          className="grid gap-8 md:grid-cols-3"
          data-icod-id="src_pages_howitworks_tsx_a352">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative flex flex-col items-center text-center"
              data-icod-id={`src_pages_howitworks_tsx_6cc0_${step.number}`}>
              <Card
                className={cn(
                  'relative w-full overflow-hidden p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl',
                  step.bgTint,
                  'min-h-[320px] flex flex-col items-center justify-start'
                )}
                data-icod-id={`src_pages_howitworks_tsx_8868_${step.number}`}>
                {/* Step number badge */}
                <div
                  className={cn(
                    'mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110',
                    step.color
                  )}
                  data-icod-id={`src_pages_howitworks_tsx_890d_${step.number}`}>
                  <span
                    className="text-2xl font-bold text-white"
                    data-icod-id={`src_pages_howitworks_tsx_7e67_${step.number}`}>{step.number}</span>
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    'mx-auto mb-6 rounded-xl p-3 transition-colors duration-200',
                    step.color,
                    'bg-opacity-15 group-hover:bg-opacity-25'
                  )}
                  data-icod-id={`src_pages_howitworks_tsx_ddb5_${step.number}`}>
                  <step.icon className={cn('h-8 w-8', step.textColor)} />
                </div>

                {/* Content */}
                <h3
                  className="mb-3 text-lg font-semibold"
                  style={{ color: '#201034' }}
                  data-icod-id={`src_pages_howitworks_tsx_5cf6_${step.number}`}>{step.title}</h3>
                <p
                  className="text-sm leading-relaxed text-[#333]"
                  data-icod-id={`src_pages_howitworks_tsx_8103_${step.number}`}>{step.description}</p>

                {/* Decorative bottom border */}
                <div
                  className={cn('absolute bottom-0 left-0 h-1 w-full opacity-60', step.color)}
                  data-icod-id={`src_pages_howitworks_tsx_1648_${step.number}`} />
              </Card>

              {/* Arrow between steps (mobile only) */}
              {index < steps.length - 1 && (
                <div
                  className="my-4 flex justify-center md:hidden"
                  data-icod-id={`src_pages_howitworks_tsx_dfc3_${step.number}`}>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
                    data-icod-id={`src_pages_howitworks_tsx_dcc6_${step.number}`}>
                    <ArrowRight
                      className="h-4 w-4 rotate-90 text-muted-foreground"
                      data-icod-id={`src_pages_howitworks_tsx_62e0_${step.number}`} />
                  </div>
                </div>
              )}

              {/* Connector arrow (desktop only) */}
              {index < steps.length - 1 && (
                <div
                  className="absolute -right-4 top-20 hidden md:flex"
                  data-icod-id={`src_pages_howitworks_tsx_fcd2_${step.number}`}>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-md"
                    data-icod-id={`src_pages_howitworks_tsx_fff5_${step.number}`}>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground"
                      data-icod-id={`src_pages_howitworks_tsx_134e_${step.number}`} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
