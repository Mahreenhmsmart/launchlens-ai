import {
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  GitCompare,
  CheckCircle2,
  ArrowRightLeft,
  ShieldAlert,
  PackageCheck,
  Truck,
  FlaskConical,
} from 'lucide-react';
import { Button, Card, type CardVariant } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/currency';
import SourcingLandedCost from './SourcingLandedCost';
import type { ProductIdea, DemandLevel, CompetitionLevel, RiskLevel, EvidenceStatus } from '@/types';

interface ProductCardProps {
  product: ProductIdea;
  currency: string;
  isSelectedForCompare?: boolean;
  evidenceStatus?: EvidenceStatus;
  onViewDetails: (product: ProductIdea) => void;
  onCompare: (product: ProductIdea) => void;
  onValidate: (product: ProductIdea) => void;
  onSendToSimulator: (product: ProductIdea) => void;
  onResearch: (product: ProductIdea) => void;
  className?: string;
  cardVariant?: CardVariant;
}

function DemandBadge({ level }: { level: DemandLevel }) {
  const colors = {
    Low: 'bg-[#E88B9E]/10 text-[#E88B9E]',
    Medium: 'bg-[#EACAA1]/10 text-[#EACAA1]',
    High: 'bg-[#9DD37D]/10 text-[#9DD37D]',
  };

  return (
    <span
      className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', colors[level])}
      data-icod-id="src_components_productcard_tsx_4d2c">
      {level}Demand
          </span>
  );
}

function CompetitionBadge({ level }: { level: CompetitionLevel }) {
  const colors = {
    Low: 'bg-[#9DD37D]/10 text-[#9DD37D]',
    Medium: 'bg-[#EACAA1]/10 text-[#EACAA1]',
    High: 'bg-[#E88B9E]/10 text-[#E88B9E]',
  };

  return (
    <span
      className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', colors[level])}
      data-icod-id="src_components_productcard_tsx_0f16">
      {level}Competition
          </span>
  );
}

function RiskBadge({ label, level, icon: Icon }: { label: string; level: RiskLevel; icon: React.ElementType }) {
  const colors = {
    Low: 'text-[#9DD37D]',
    Medium: 'text-[#EACAA1]',
    High: 'text-[#E88B9E]',
  };

  return (
    <div
      className="flex items-center gap-1"
      title={`${label}: ${level}`}
      data-icod-id="src_components_productcard_tsx_2be1">
      <Icon
        className={cn('h-3 w-3', colors[level])}
        data-icod-id="src_components_productcard_tsx_a1f7" />
      <span
        className="text-[10px] text-muted-foreground"
        data-icod-id="src_components_productcard_tsx_ddde">{label}</span>
    </div>
  );
}

function TrendArrow({ direction }: { direction: 'rising' | 'stable' | 'declining' }) {
  if (direction === 'rising') {
    return (
      <TrendingUp
        className="h-4 w-4 text-[#9DD37D]"
        data-icod-id="src_components_productcard_tsx_5fcd" />
    );
  }
  if (direction === 'declining') {
    return (
      <TrendingDown
        className="h-4 w-4 text-[#E88B9E]"
        data-icod-id="src_components_productcard_tsx_5d9d" />
    );
  }
  return (
    <Minus
      className="h-4 w-4 text-muted-foreground"
      data-icod-id="src_components_productcard_tsx_c203" />
  );
}

function EvidenceStatusBadge({ status }: { status: EvidenceStatus }) {
  const config: Record<EvidenceStatus, { label: string; color: string }> = {
    'ai-idea': { label: 'AI Idea', color: 'bg-muted text-muted-foreground border-border' },
    'researching': { label: 'Researching', color: 'bg-[#EACAA1]/10 text-[#EACAA1] border-[#EACAA1]/20' },
    'partially-verified': { label: 'Partial', color: 'bg-[#C9D0FC]/10 text-[#C9D0FC] border-[#C9D0FC]/20' },
    'evidence-collected': { label: 'Verified', color: 'bg-[#9DD37D]/10 text-[#9DD37D] border-[#9DD37D]/20' },
  };

  const { label, color } = config[status];

  return (
    <span
      className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', color)}
      title={`Evidence Status: ${label}`}
      data-icod-id="src_components_productcard_tsx_3e74">
      {label}
    </span>
  );
}

export default function ProductCard({
  product,
  currency,
  isSelectedForCompare = false,
  evidenceStatus,
  onViewDetails,
  onCompare,
  onValidate,
  onSendToSimulator,
  onResearch,
  className,
  cardVariant = 'default',
}: ProductCardProps) {
  return (
    <Card
      variant={cardVariant}
      className={cn(
        'group relative flex flex-col gap-3 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
        isSelectedForCompare && 'ring-2 ring-[#C9D0FC]',
        className
      )}
      data-icod-id={`product_card_${product.id}`}
    >
      {/* Provisional Badge */}
      {product.isProvisional && (
        <div
          className="absolute right-3 top-3 rounded-full bg-[#EACAA1]/20 px-2 py-0.5 text-[10px] font-medium text-[#EACAA1]"
          data-icod-id="product_card_provisional"
        >
          Estimate
        </div>
      )}
      {/* Evidence Status Badge */}
      {evidenceStatus && (
        <div
          className="absolute left-3 top-3"
          data-icod-id="src_components_productcard_tsx_4900">
          <EvidenceStatusBadge
            status={evidenceStatus}
            data-icod-id="src_components_productcard_tsx_7102" />
        </div>
      )}
      {/* Header */}
      <div className="space-y-1" data-icod-id="product_card_header">
        <div className="flex items-start justify-between gap-2" data-icod-id="product_card_title_row">
          <h3 className="text-base font-semibold text-foreground leading-tight" data-icod-id="product_card_name">
            {product.name}
          </h3>
          <TrendArrow
            direction={product.trendDirection}
            data-icod-id="src_components_productcard_tsx_264c" />
        </div>
        <span
          className="inline-block rounded-full bg-[#C9D0FC]/10 px-2 py-0.5 text-[10px] font-medium text-[#C9D0FC]"
          data-icod-id="src_components_productcard_tsx_2f3c">
          {product.category}
        </span>
      </div>
      {/* Problem & Customer */}
      <div className="space-y-1 text-xs text-muted-foreground" data-icod-id="product_card_problem_section">
        <p data-icod-id="product_card_problem">
          <span
            className="font-medium text-foreground"
            data-icod-id="src_components_productcard_tsx_23a5">Solves:</span> {product.customerProblem}
        </p>
        <p data-icod-id="product_card_customer">
          <span
            className="font-medium text-foreground"
            data-icod-id="src_components_productcard_tsx_672b">For:</span> {product.targetCustomer}
        </p>
      </div>
      {/* Metrics Row */}
      <div className="flex flex-wrap items-center gap-2" data-icod-id="product_card_metrics">
        <DemandBadge
          level={product.demandLevel}
          data-icod-id="src_components_productcard_tsx_c26f" />
        <CompetitionBadge
          level={product.competitionLevel}
          data-icod-id="src_components_productcard_tsx_4617" />
      </div>
      {/* Price Ranges */}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/30 p-2 text-xs" data-icod-id="product_card_prices">
        <div data-icod-id="product_card_sell_price">
          <p
            className="text-muted-foreground"
            data-icod-id="src_components_productcard_tsx_9848">Sell Price</p>
          <p
            className="font-semibold text-foreground"
            data-icod-id="src_components_productcard_tsx_77d6">
            {formatCurrency(product.estimatedSellingPriceRange.min, currency, { compact: true })}–
            {formatCurrency(product.estimatedSellingPriceRange.max, currency, { compact: true })}
          </p>
        </div>
        <div data-icod-id="product_card_cost">
          <p
            className="text-muted-foreground"
            data-icod-id="src_components_productcard_tsx_75d7">Cost</p>
          <p
            className="font-semibold text-foreground"
            data-icod-id="src_components_productcard_tsx_a231">
            {formatCurrency(product.estimatedSourcingCostRange.min, currency, { compact: true })}–
            {formatCurrency(product.estimatedSourcingCostRange.max, currency, { compact: true })}
          </p>
        </div>
      </div>
      {/* Margin */}
      <div className="flex items-center justify-between text-xs" data-icod-id="product_card_margin">
        <span
          className="text-muted-foreground"
          data-icod-id="src_components_productcard_tsx_f938">Potential Margin</span>
        <span
          className={cn(
            'font-bold',
            product.potentialMarginPercent >= 50 ? 'text-[#9DD37D]' : product.potentialMarginPercent >= 30 ? 'text-[#EACAA1]' : 'text-[#E88B9E]'
          )}
          data-icod-id="src_components_productcard_tsx_15ce">
          ~{product.potentialMarginPercent}%
        </span>
      </div>
      {/* Risk Badges */}
      <div className="flex flex-wrap gap-2 border-t border-border/50 pt-2" data-icod-id="product_card_risks">
        <RiskBadge
          label="Ship"
          level={product.shippingRisk}
          icon={Truck}
          data-icod-id="src_components_productcard_tsx_ee7b" />
        <RiskBadge
          label="Quality"
          level={product.qualityRisk}
          icon={PackageCheck}
          data-icod-id="src_components_productcard_tsx_1563" />
        <RiskBadge
          label="Returns"
          level={product.returnsRisk}
          icon={ArrowRightLeft}
          data-icod-id="src_components_productcard_tsx_1221" />
        <RiskBadge
          label="Regulatory"
          level={product.regulatoryRisk}
          icon={ShieldAlert}
          data-icod-id="src_components_productcard_tsx_4f73" />
      </div>
      {/* Differentiation Ideas */}
      {product.differentiationIdeas.length > 0 && (
        <div className="space-y-1 text-xs" data-icod-id="product_card_differentiation">
          <p
            className="font-medium text-muted-foreground"
            data-icod-id="src_components_productcard_tsx_fc74">Differentiation:</p>
          <ul
            className="list-inside list-disc space-y-0.5 text-muted-foreground"
            data-icod-id="src_components_productcard_tsx_4b29">
            {product.differentiationIdeas.slice(0, 2).map((idea, i) => (
              <li key={i} data-icod-id={`src_components_productcard_tsx_2b39_${i}`}>{idea}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Evidence Status */}
      <div className="text-[10px] text-muted-foreground italic" data-icod-id="product_card_evidence">
        {product.evidenceSource ? (
          <span data-icod-id="src_components_productcard_tsx_89be">Source: {product.evidenceSource} ({product.dateChecked})</span>
        ) : (
          <span data-icod-id="src_components_productcard_tsx_d894">Needs validation — estimates only</span>
        )}
      </div>
      {/* Sourcing & Landed Cost */}
      {product.sourcing && (
        <SourcingLandedCost
          sourcing={product.sourcing}
          currency={currency}
          variant="compact"
          data-icod-id="src_components_productcard_tsx_1013" />
      )}
      {/* Action Buttons */}
      <div className="mt-auto flex flex-col gap-2 pt-2" data-icod-id="product_card_actions">
        <div
          className="grid grid-cols-2 gap-2"
          data-icod-id="src_components_productcard_tsx_1bb5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(product)}
            className="gap-1 text-xs"
            data-icod-id="product_card_btn_details"
          >
            <Eye className="h-3 w-3" data-icod-id="src_components_productcard_tsx_4485" />
            Details
          </Button>
          <Button
            variant={isSelectedForCompare ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onCompare(product)}
            className="gap-1 text-xs"
            data-icod-id="product_card_btn_compare"
          >
            <GitCompare className="h-3 w-3" data-icod-id="src_components_productcard_tsx_790a" />
            {isSelectedForCompare ? 'Selected' : 'Compare'}
          </Button>
        </div>
        <div
          className="grid grid-cols-3 gap-2"
          data-icod-id="src_components_productcard_tsx_b980">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResearch(product)}
            className="gap-1 text-xs"
            title="Research This Product"
            data-icod-id="src_components_productcard_tsx_65a7">
            <FlaskConical className="h-3 w-3" data-icod-id="src_components_productcard_tsx_bfea" />
            Research
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onValidate(product)}
            className="gap-1 text-xs"
            data-icod-id="product_card_btn_validate"
          >
            <CheckCircle2 className="h-3 w-3" data-icod-id="src_components_productcard_tsx_e6fc" />
            Validate
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSendToSimulator(product)}
            className="gap-1 text-xs"
            data-icod-id="product_card_btn_simulator"
          >
            <ArrowRightLeft className="h-3 w-3" data-icod-id="src_components_productcard_tsx_b48f" />
            Sim
          </Button>
        </div>
      </div>
    </Card>
  );
}
