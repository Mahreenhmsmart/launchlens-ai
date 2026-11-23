import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { OpportunityScoreBreakdown } from '@/types';

interface OpportunityScoreProps {
  score: OpportunityScoreBreakdown;
  isProvisional?: boolean;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-[#9DD37D]';
  if (score >= 50) return 'text-[#EACAA1]';
  return 'text-[#E88B9E]';
}

function getScoreBgColor(score: number): string {
  if (score >= 75) return 'bg-[#9DD37D]';
  if (score >= 50) return 'bg-[#EACAA1]';
  return 'bg-[#E88B9E]/30';
}

function getSubScoreColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio >= 0.75) return 'bg-[#9DD37D]';
  if (ratio >= 0.5) return 'bg-[#EACAA1]';
  return 'bg-[#E88B9E]';
}

export default function OpportunityScore({
  score,
  isProvisional = false,
  className,
}: OpportunityScoreProps) {
  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDashoffset = circumference - (score.total / 100) * circumference;

  const subScores = [
    { label: 'Problem Severity', value: score.problemSeverity, max: 20, explanation: score.explanations.problemSeverity },
    { label: 'Demand Signals', value: score.demandSignals, max: 20, explanation: score.explanations.demandSignals },
    { label: 'Competition Gap', value: score.competitionGap, max: 20, explanation: score.explanations.competitionGap },
    { label: 'Profit Potential', value: score.profitPotential, max: 20, explanation: score.explanations.profitPotential },
    { label: 'Sourcing/Shipping', value: score.sourcingShippingEase, max: 10, explanation: score.explanations.sourcingShippingEase },
    { label: 'Risk/Differentiation', value: score.riskDifferentiation, max: 10, explanation: score.explanations.riskDifferentiation },
  ];

  return (
    <Card variant="mint" className={cn('p-4', className)} data-icod-id="opportunity_score_card">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start" data-icod-id="opportunity_score_layout">
        {/* Circular Score */}
        <div className="relative flex shrink-0 items-center justify-center" data-icod-id="opportunity_score_circle_wrap">
          <svg width="100" height="100" className="rotate-[-90deg]" data-icod-id="opportunity_score_svg">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-border"
              data-icod-id="opportunity_score_bg_circle"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn('transition-all duration-500', getScoreColor(score.total))}
              style={{ color: score.total >= 75 ? '#9DD37D' : score.total >= 50 ? '#EACAA1' : '#E88B9E' }}
              data-icod-id="opportunity_score_progress_circle"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" data-icod-id="opportunity_score_value_wrap">
            <span className={cn('text-2xl font-bold', getScoreColor(score.total))} data-icod-id="opportunity_score_value">
              {score.total}
            </span>
            <span className="text-[10px] text-muted-foreground" data-icod-id="opportunity_score_label">/100</span>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="min-w-0 flex-1 space-y-2" data-icod-id="opportunity_score_subs">
          <div className="flex items-center gap-2" data-icod-id="opportunity_score_header">
            <h4 className="text-sm font-semibold text-foreground" data-icod-id="opportunity_score_title">
              Opportunity Breakdown
            </h4>
            {isProvisional && (
              <span
                className="rounded-full bg-[#EACAA1]/20 px-2 py-0.5 text-[10px] font-medium text-[#EACAA1]"
                data-icod-id="opportunity_score_provisional_badge"
              >
                Provisional
              </span>
            )}
          </div>

          <div className="grid min-w-0 gap-2 sm:grid-cols-2" data-icod-id="opportunity_score_grid">
            {subScores.map((item) => (
              <div key={item.label} className="group relative" data-icod-id={`opportunity_score_sub_${item.label}`}>
                <div className="flex items-center justify-between text-xs" data-icod-id="opportunity_score_sub_header">
                  <span className="text-muted-foreground" data-icod-id="opportunity_score_sub_label">{item.label}</span>
                  <span className="font-medium text-foreground" data-icod-id="opportunity_score_sub_value">
                    {item.value}/{item.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border" data-icod-id="opportunity_score_sub_bar_bg">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', getSubScoreColor(item.value, item.max))}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                    data-icod-id="opportunity_score_sub_bar_fill"
                  />
                </div>
                {/* Tooltip on hover */}
                <div
                  className="invisible absolute bottom-full left-0 z-10 mb-1 w-48 rounded-lg border border-border bg-card p-2 text-[10px] text-muted-foreground shadow-lg group-hover:visible"
                  data-icod-id="opportunity_score_sub_tooltip"
                >
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
