import { Modal, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/currency';
import OpportunityScore from './OpportunityScore';
import SourcingLandedCost from './SourcingLandedCost';
import type { ProductIdea } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Truck,
  PackageCheck,
  ArrowRightLeft,
  ShieldAlert,
  Lightbulb,
  FlaskConical,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductIdea | null;
  currency: string;
  open: boolean;
  onClose: () => void;
  onSendToSimulator?: (product: ProductIdea) => void;
  onValidate?: (product: ProductIdea) => void;
}

function RiskRow({ label, level, icon: Icon }: { label: string; level: string; icon: React.ElementType }) {
  const colors: Record<string, string> = {
    Low: 'text-[#9DD37D] bg-[#9DD37D]/10',
    Medium: 'text-[#EACAA1] bg-[#EACAA1]/10',
    High: 'text-[#E88B9E] bg-[#E88B9E]/10',
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 p-2" data-icod-id={`detail_risk_${label}`}>
      <div
        className="flex items-center gap-2"
        data-icod-id="src_components_productdetailmodal_tsx_9e12">
        <Icon
          className="h-4 w-4 text-muted-foreground"
          data-icod-id="src_components_productdetailmodal_tsx_0fb3" />
        <span
          className="text-sm text-foreground"
          data-icod-id="src_components_productdetailmodal_tsx_6f7b">{label}</span>
      </div>
      <span
        className={cn('rounded-full px-2 py-0.5 text-xs font-medium', colors[level] || colors.Medium)}
        data-icod-id="src_components_productdetailmodal_tsx_9bba">
        {level}
      </span>
    </div>
  );
}

export default function ProductDetailModal({
  product,
  currency,
  open,
  onClose,
  onSendToSimulator,
  onValidate,
}: ProductDetailModalProps) {
  if (!product) return null;

  const TrendIcon = product.trendDirection === 'rising' ? TrendingUp : product.trendDirection === 'declining' ? TrendingDown : Minus;
  const trendColor = product.trendDirection === 'rising' ? 'text-[#9DD37D]' : product.trendDirection === 'declining' ? 'text-[#E88B9E]' : 'text-muted-foreground';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product.name}
      className="max-w-2xl"
      footer={
        <div className="flex justify-end gap-2" data-icod-id="detail_modal_footer">
          {onValidate && (
            <Button variant="outline" onClick={() => onValidate(product)} data-icod-id="detail_modal_btn_validate">
              Validate This Idea
            </Button>
          )}
          {onSendToSimulator && (
            <Button variant="primary" onClick={() => onSendToSimulator(product)} data-icod-id="detail_modal_btn_simulator">
              Send to Simulator
            </Button>
          )}
        </div>
      }
      data-icod-id="detail_modal"
    >
      <div className="max-h-[70vh] w-full max-w-full space-y-6 overflow-x-hidden overflow-y-auto pr-2" data-icod-id="detail_modal_content">
        {/* Basic Info */}
        <div className="space-y-2" data-icod-id="detail_modal_basic_info">
          <div
            className="flex flex-wrap items-center gap-2"
            data-icod-id="src_components_productdetailmodal_tsx_1431">
            <span
              className="rounded-full bg-[#C9D0FC]/10 px-3 py-1 text-xs font-medium text-[#C9D0FC]"
              data-icod-id="src_components_productdetailmodal_tsx_3285">
              {product.category}
            </span>
            <span
              className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}
              data-icod-id="src_components_productdetailmodal_tsx_cb89">
              <TrendIcon
                className="h-3 w-3"
                data-icod-id="src_components_productdetailmodal_tsx_e8a0" />
              {product.trendDirection.charAt(0).toUpperCase() + product.trendDirection.slice(1)} Trend
            </span>
            {product.isProvisional && (
              <span
                className="rounded-full bg-[#EACAA1]/20 px-2 py-0.5 text-[10px] font-medium text-[#EACAA1]"
                data-icod-id="src_components_productdetailmodal_tsx_f3e3">
                Provisional Estimate
              </span>
            )}
          </div>
          <p
            className="break-words text-sm text-muted-foreground"
            data-icod-id="src_components_productdetailmodal_tsx_5e5b">
            <strong
              className="text-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_0f2f">Target Customer:</strong> {product.targetCustomer}
          </p>
        </div>

        {/* Problem Solved */}
        <div className="rounded-lg bg-muted/30 p-4" data-icod-id="detail_modal_problem">
          <h4
            className="mb-1 text-sm font-semibold text-foreground"
            data-icod-id="src_components_productdetailmodal_tsx_8401">Customer Problem</h4>
          <p
            className="break-words text-sm text-muted-foreground"
            data-icod-id="src_components_productdetailmodal_tsx_d460">{product.customerProblem}</p>
        </div>

        {/* Pricing & Economics */}
        <div className="grid min-w-0 gap-3 sm:grid-cols-3" data-icod-id="detail_modal_economics">
          <div className="min-w-0 overflow-hidden rounded-lg border border-border/50 p-3" data-icod-id="detail_modal_sell_price">
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_13e5">Selling Price Range</p>
            <p
              className="truncate text-lg font-bold text-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_91b1">
              {formatCurrency(product.estimatedSellingPriceRange.min, currency, { compact: true })}–
              {formatCurrency(product.estimatedSellingPriceRange.max, currency, { compact: true })}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-lg border border-border/50 p-3" data-icod-id="detail_modal_cost">
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_b444">Sourcing Cost Range</p>
            <p
              className="truncate text-lg font-bold text-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_121c">
              {formatCurrency(product.estimatedSourcingCostRange.min, currency, { compact: true })}–
              {formatCurrency(product.estimatedSourcingCostRange.max, currency, { compact: true })}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-lg border border-border/50 p-3" data-icod-id="detail_modal_margin">
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_7ca4">Potential Margin</p>
            <p
              className={cn(
                'text-lg font-bold',
                product.potentialMarginPercent >= 50 ? 'text-[#9DD37D]' : product.potentialMarginPercent >= 30 ? 'text-[#EACAA1]' : 'text-[#E88B9E]'
              )}
              data-icod-id="src_components_productdetailmodal_tsx_9648">
              ~{product.potentialMarginPercent}%
            </p>
          </div>
        </div>

        {/* Demand & Competition */}
        <div className="grid min-w-0 gap-3 sm:grid-cols-2" data-icod-id="detail_modal_demand_competition">
          <div
            className="min-w-0 overflow-hidden rounded-lg border border-border/50 p-3"
            data-icod-id="src_components_productdetailmodal_tsx_f87b">
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_ca01">Demand Level</p>
            <p
              className={cn(
                'text-base font-semibold',
                product.demandLevel === 'High' ? 'text-[#9DD37D]' : product.demandLevel === 'Medium' ? 'text-[#EACAA1]' : 'text-[#E88B9E]'
              )}
              data-icod-id="src_components_productdetailmodal_tsx_23aa">
              {product.demandLevel}
            </p>
          </div>
          <div
            className="min-w-0 overflow-hidden rounded-lg border border-border/50 p-3"
            data-icod-id="src_components_productdetailmodal_tsx_1715">
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_326a">Competition Level</p>
            <p
              className={cn(
                'text-base font-semibold',
                product.competitionLevel === 'Low' ? 'text-[#9DD37D]' : product.competitionLevel === 'Medium' ? 'text-[#EACAA1]' : 'text-[#E88B9E]'
              )}
              data-icod-id="src_components_productdetailmodal_tsx_783a">
              {product.competitionLevel}
            </p>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-2" data-icod-id="detail_modal_risks">
          <h4
            className="text-sm font-semibold text-foreground"
            data-icod-id="src_components_productdetailmodal_tsx_ff12">Risk Assessment</h4>
          <div
            className="grid min-w-0 gap-2 sm:grid-cols-2"
            data-icod-id="src_components_productdetailmodal_tsx_c38f">
            <RiskRow
              label="Shipping"
              level={product.shippingRisk}
              icon={Truck}
              data-icod-id="src_components_productdetailmodal_tsx_fb44" />
            <RiskRow
              label="Quality"
              level={product.qualityRisk}
              icon={PackageCheck}
              data-icod-id="src_components_productdetailmodal_tsx_2339" />
            <RiskRow
              label="Returns"
              level={product.returnsRisk}
              icon={ArrowRightLeft}
              data-icod-id="src_components_productdetailmodal_tsx_4aba" />
            <RiskRow
              label="Regulatory"
              level={product.regulatoryRisk}
              icon={ShieldAlert}
              data-icod-id="src_components_productdetailmodal_tsx_729c" />
          </div>
        </div>

        {/* Differentiation Ideas */}
        <div className="space-y-2" data-icod-id="detail_modal_differentiation">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_components_productdetailmodal_tsx_af57">
            <Lightbulb
              className="h-4 w-4 text-[#EACAA1]"
              data-icod-id="src_components_productdetailmodal_tsx_902b" />
            <h4
              className="text-sm font-semibold text-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_08f0">Differentiation Ideas</h4>
          </div>
          <ul
            className="list-inside list-disc space-y-1 break-words text-sm text-muted-foreground"
            data-icod-id="src_components_productdetailmodal_tsx_acc0">
            {product.differentiationIdeas.map((idea, i) => (
              <li key={i} data-icod-id={`src_components_productdetailmodal_tsx_a11b_${i}`}>{idea}</li>
            ))}
          </ul>
        </div>

        {/* Validation Suggestion */}
        <div className="space-y-2" data-icod-id="detail_modal_validation">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_components_productdetailmodal_tsx_6fb1">
            <FlaskConical
              className="h-4 w-4 text-[#C9D0FC]"
              data-icod-id="src_components_productdetailmodal_tsx_4942" />
            <h4
              className="text-sm font-semibold text-foreground"
              data-icod-id="src_components_productdetailmodal_tsx_3ac1">Validation Test</h4>
          </div>
          <p
            className="break-words text-sm text-muted-foreground"
            data-icod-id="src_components_productdetailmodal_tsx_2ef1">{product.validationTestSuggestion}</p>
        </div>

        {/* Opportunity Score */}
        <OpportunityScore
          score={product.opportunityScore}
          isProvisional={product.isProvisional}
          data-icod-id="src_components_productdetailmodal_tsx_4580" />

        {/* Sourcing & Landed Cost */}
        {product.sourcing && (
          <SourcingLandedCost
            sourcing={product.sourcing}
            currency={currency}
            variant="detailed"
            data-icod-id="src_components_productdetailmodal_tsx_55e3" />
        )}

        {/* Evidence Notice */}
        <div className="rounded-lg border border-[#EACAA1]/30 bg-[#EACAA1]/5 p-3 break-words text-xs text-muted-foreground" data-icod-id="detail_modal_evidence_notice">
          {product.evidenceSource ? (
            <p data-icod-id="src_components_productdetailmodal_tsx_f284">Evidence source: {product.evidenceSource}. Date checked: {product.dateChecked || 'Unknown'}.</p>
          ) : (
            <p data-icod-id="src_components_productdetailmodal_tsx_a33d">All figures are AI-generated estimates and hypotheses requiring validation. No live sales data or search volumes were used.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
