import { Factory, Truck, Package, Box, Calculator, Info } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/currency';
import type { SourcingInfo } from '@/types';

interface SourcingLandedCostProps {
  sourcing: SourcingInfo;
  currency: string;
  variant?: 'compact' | 'detailed';
  className?: string;
}

const supplierChannelIcons: Record<string, React.ElementType> = {
  'Local Wholesale Market': Box,
  'Importer': Truck,
  'Manufacturer (Direct)': Factory,
  'Online Marketplace': Package,
};

export default function SourcingLandedCost({
  sourcing,
  currency,
  variant = 'detailed',
  className,
}: SourcingLandedCostProps) {
  const { likelySupplierChannel, estimatedMinOrderQuantity, landedCost, marginOnLandedCostPercent } = sourcing;
  const ChannelIcon = supplierChannelIcons[likelySupplierChannel] || Box;

  const marginColor =
    marginOnLandedCostPercent >= 50
      ? 'text-[#9DD37D]'
      : marginOnLandedCostPercent >= 30
        ? 'text-[#EACAA1]'
        : 'text-[#E88B9E]';

  if (variant === 'compact') {
    return (
      <div
        className={cn('space-y-2 border-t border-border/50 pt-2', className)}
        data-icod-id="src_components_sourcinglandedcost_tsx_f3fb">
        <div
          className="flex items-center gap-1.5"
          data-icod-id="src_components_sourcinglandedcost_tsx_ddc4">
          <ChannelIcon
            className="h-3 w-3 text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_37c5" />
          <span
            className="text-[10px] font-medium text-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_729e">{likelySupplierChannel}</span>
        </div>
        <div
          className="flex items-center justify-between text-[10px]"
          data-icod-id="src_components_sourcinglandedcost_tsx_df49">
          <span
            className="text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_6427">MOQ: ~{estimatedMinOrderQuantity} units</span>
        </div>
        <div
          className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]"
          data-icod-id="src_components_sourcinglandedcost_tsx_b729">
          <span
            className="text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_5c8b">Product:</span>
          <span
            className="text-right text-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_cf85">{formatCurrency(landedCost.productCostPerUnit, currency, { compact: true })}</span>
          <span
            className="text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_edaf">Ship + Duty:</span>
          <span
            className="text-right text-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_d3ab">
            {formatCurrency(landedCost.shippingToPakistanPerUnit + landedCost.importDutyTaxPerUnit, currency, { compact: true })}
          </span>
          <span
            className="text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_cdb2">Packaging:</span>
          <span
            className="text-right text-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_b104">{formatCurrency(landedCost.packagingPerUnit, currency, { compact: true })}</span>
        </div>
        <div
          className="flex items-center justify-between border-t border-border/30 pt-1 text-[10px]"
          data-icod-id="src_components_sourcinglandedcost_tsx_b2ef">
          <span
            className="font-medium text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_f18d">Landed Cost:</span>
          <span
            className="font-semibold text-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_31a2">
            {formatCurrency(landedCost.totalLandedCostPerUnit, currency, { compact: true })}
          </span>
        </div>
        <div
          className="flex items-center justify-between text-[10px]"
          data-icod-id="src_components_sourcinglandedcost_tsx_66d9">
          <span
            className="text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_b9da">Margin on Landed:</span>
          <span
            className={cn('font-bold', marginColor)}
            data-icod-id="src_components_sourcinglandedcost_tsx_65c1">~{marginOnLandedCostPercent}%</span>
        </div>
        <p
          className="text-[9px] italic text-muted-foreground"
          data-icod-id="src_components_sourcinglandedcost_tsx_7d25">Estimates — needs validation</p>
      </div>
    );
  }

  // Detailed variant for modal
  return (
    <Card
      className={cn('space-y-3 p-4', className)}
      data-icod-id="src_components_sourcinglandedcost_tsx_033a">
      <div
        className="flex items-center gap-2"
        data-icod-id="src_components_sourcinglandedcost_tsx_6254">
        <Calculator
          className="h-4 w-4 text-[#C9D0FC]"
          data-icod-id="src_components_sourcinglandedcost_tsx_c9df" />
        <h4
          className="text-sm font-semibold text-foreground"
          data-icod-id="src_components_sourcinglandedcost_tsx_058d">Sourcing & Landed Cost</h4>
      </div>
      {/* Supplier Channel & MOQ */}
      <div
        className="grid gap-2 sm:grid-cols-2"
        data-icod-id="src_components_sourcinglandedcost_tsx_23a8">
        <div
          className="rounded-lg border border-border/50 p-3"
          data-icod-id="src_components_sourcinglandedcost_tsx_47d6">
          <p
            className="text-xs text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_e022">Likely Supplier Channel</p>
          <div
            className="mt-1 flex items-center gap-2"
            data-icod-id="src_components_sourcinglandedcost_tsx_1478">
            <ChannelIcon
              className="h-4 w-4 text-[#C9D0FC]"
              data-icod-id="src_components_sourcinglandedcost_tsx_d9ba" />
            <p
              className="text-sm font-semibold text-foreground"
              data-icod-id="src_components_sourcinglandedcost_tsx_a98d">{likelySupplierChannel}</p>
          </div>
        </div>
        <div
          className="rounded-lg border border-border/50 p-3"
          data-icod-id="src_components_sourcinglandedcost_tsx_5a29">
          <p
            className="text-xs text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_4dba">Est. Min Order Quantity</p>
          <p
            className="mt-1 text-sm font-semibold text-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_878b">~{estimatedMinOrderQuantity} units</p>
        </div>
      </div>
      {/* Landed Cost Breakdown */}
      <div
        className="space-y-2"
        data-icod-id="src_components_sourcinglandedcost_tsx_816c">
        <p
          className="text-xs font-medium text-muted-foreground"
          data-icod-id="src_components_sourcinglandedcost_tsx_f2ac">Landed-Cost Breakdown (per unit)</p>
        <div
          className="grid gap-2 sm:grid-cols-2"
          data-icod-id="src_components_sourcinglandedcost_tsx_09ab">
          <div
            className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
            data-icod-id="src_components_sourcinglandedcost_tsx_52c0">
            <span
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_sourcinglandedcost_tsx_5885">Product Cost</span>
            <span
              className="text-sm font-medium text-foreground"
              data-icod-id="src_components_sourcinglandedcost_tsx_3e23">
              {formatCurrency(landedCost.productCostPerUnit, currency, { compact: true })}
            </span>
          </div>
          <div
            className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
            data-icod-id="src_components_sourcinglandedcost_tsx_254e">
            <span
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_sourcinglandedcost_tsx_7207">Shipping to Pakistan</span>
            <span
              className="text-sm font-medium text-foreground"
              data-icod-id="src_components_sourcinglandedcost_tsx_64d1">
              {formatCurrency(landedCost.shippingToPakistanPerUnit, currency, { compact: true })}
            </span>
          </div>
          <div
            className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
            data-icod-id="src_components_sourcinglandedcost_tsx_cd99">
            <span
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_sourcinglandedcost_tsx_3863">Import Duty / Tax</span>
            <span
              className="text-sm font-medium text-foreground"
              data-icod-id="src_components_sourcinglandedcost_tsx_8e96">
              {formatCurrency(landedCost.importDutyTaxPerUnit, currency, { compact: true })}
            </span>
          </div>
          <div
            className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
            data-icod-id="src_components_sourcinglandedcost_tsx_4720">
            <span
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_sourcinglandedcost_tsx_c757">Packaging</span>
            <span
              className="text-sm font-medium text-foreground"
              data-icod-id="src_components_sourcinglandedcost_tsx_af0f">
              {formatCurrency(landedCost.packagingPerUnit, currency, { compact: true })}
            </span>
          </div>
        </div>
      </div>
      {/* Total Landed Cost & Margin */}
      <div
        className="grid gap-2 sm:grid-cols-2"
        data-icod-id="src_components_sourcinglandedcost_tsx_03dd">
        <div
          className="rounded-lg bg-muted/30 p-3"
          data-icod-id="src_components_sourcinglandedcost_tsx_4675">
          <p
            className="text-xs text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_04fd">Total Landed Cost / Unit</p>
          <p
            className="text-lg font-bold text-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_454d">
            {formatCurrency(landedCost.totalLandedCostPerUnit, currency, { compact: true })}
          </p>
        </div>
        <div
          className="rounded-lg bg-muted/30 p-3"
          data-icod-id="src_components_sourcinglandedcost_tsx_0c0b">
          <p
            className="text-xs text-muted-foreground"
            data-icod-id="src_components_sourcinglandedcost_tsx_7bf6">Margin vs Sell Price</p>
          <p
            className={cn('text-lg font-bold', marginColor)}
            data-icod-id="src_components_sourcinglandedcost_tsx_9786">
            ~{marginOnLandedCostPercent}%
          </p>
        </div>
      </div>
      {/* Estimate Disclaimer */}
      <div
        className="flex items-start gap-2 rounded-lg border border-[#EACAA1]/30 bg-[#EACAA1]/5 p-2"
        data-icod-id="src_components_sourcinglandedcost_tsx_e7fe">
        <Info
          className="mt-0.5 h-3 w-3 shrink-0 text-[#EACAA1]"
          data-icod-id="src_components_sourcinglandedcost_tsx_27b0" />
        <p
          className="text-[10px] italic text-muted-foreground"
          data-icod-id="src_components_sourcinglandedcost_tsx_e100">
          All sourcing and landed-cost figures are AI-generated estimates. Supplier channel, MOQ, duty rates,
          and shipping costs vary significantly by supplier and shipment size. Validate with actual quotes before ordering.
        </p>
      </div>
    </Card>
  );
}
