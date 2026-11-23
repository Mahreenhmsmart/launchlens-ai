import { Card, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/currency';
import type { ProductIdea } from '@/types';
import { X, ArrowRightLeft } from 'lucide-react';

interface ProductCompareProps {
  products: ProductIdea[];
  currency: string;
  onRemove: (productId: string) => void;
  onClose: () => void;
  className?: string;
}

export default function ProductCompare({
  products,
  currency,
  onRemove,
  onClose,
  className,
}: ProductCompareProps) {
  if (products.length === 0) return null;

  const rows = [
    { label: 'Category', key: 'category' as const, render: (p: ProductIdea) => p.category },
    { label: 'Problem Solved', key: 'customerProblem' as const, render: (p: ProductIdea) => p.customerProblem },
    { label: 'Target Customer', key: 'targetCustomer' as const, render: (p: ProductIdea) => p.targetCustomer },
    { label: 'Demand', key: 'demandLevel' as const, render: (p: ProductIdea) => (
      <span
        className={cn(
          'font-medium',
          p.demandLevel === 'High' ? 'text-[#9DD37D]' : p.demandLevel === 'Medium' ? 'text-[#EACAA1]' : 'text-[#E88B9E]'
        )}
        data-icod-id="src_components_productcompare_tsx_e644">
        {p.demandLevel}
      </span>
    )},
    { label: 'Trend', key: 'trendDirection' as const, render: (p: ProductIdea) => (
      <span
        className={cn(
          'font-medium capitalize',
          p.trendDirection === 'rising' ? 'text-[#9DD37D]' : p.trendDirection === 'declining' ? 'text-[#E88B9E]' : 'text-muted-foreground'
        )}
        data-icod-id="src_components_productcompare_tsx_4283">
        {p.trendDirection}
      </span>
    )},
    { label: 'Competition', key: 'competitionLevel' as const, render: (p: ProductIdea) => (
      <span
        className={cn(
          'font-medium',
          p.competitionLevel === 'Low' ? 'text-[#9DD37D]' : p.competitionLevel === 'Medium' ? 'text-[#EACAA1]' : 'text-[#E88B9E]'
        )}
        data-icod-id="src_components_productcompare_tsx_907f">
        {p.competitionLevel}
      </span>
    )},
    { label: 'Sell Price Range', key: 'price' as const, render: (p: ProductIdea) => (
      <span
        className="font-medium"
        data-icod-id="src_components_productcompare_tsx_048a">
        {formatCurrency(p.estimatedSellingPriceRange.min, currency, { compact: true })}–
        {formatCurrency(p.estimatedSellingPriceRange.max, currency, { compact: true })}
      </span>
    )},
    { label: 'Cost Range', key: 'cost' as const, render: (p: ProductIdea) => (
      <span
        className="font-medium"
        data-icod-id="src_components_productcompare_tsx_a4ed">
        {formatCurrency(p.estimatedSourcingCostRange.min, currency, { compact: true })}–
        {formatCurrency(p.estimatedSourcingCostRange.max, currency, { compact: true })}
      </span>
    )},
    { label: 'Margin %', key: 'margin' as const, render: (p: ProductIdea) => (
      <span
        className={cn(
          'font-bold',
          p.potentialMarginPercent >= 50 ? 'text-[#9DD37D]' : p.potentialMarginPercent >= 30 ? 'text-[#EACAA1]' : 'text-[#E88B9E]'
        )}
        data-icod-id="src_components_productcompare_tsx_e89f">
        ~{p.potentialMarginPercent}%
      </span>
    )},
    { label: 'Shipping Risk', key: 'shippingRisk' as const, render: (p: ProductIdea) => p.shippingRisk },
    { label: 'Quality Risk', key: 'qualityRisk' as const, render: (p: ProductIdea) => p.qualityRisk },
    { label: 'Returns Risk', key: 'returnsRisk' as const, render: (p: ProductIdea) => p.returnsRisk },
    { label: 'Regulatory Risk', key: 'regulatoryRisk' as const, render: (p: ProductIdea) => p.regulatoryRisk },
    { label: 'Opportunity Score', key: 'score' as const, render: (p: ProductIdea) => (
      <span
        className={cn(
          'font-bold',
          p.opportunityScore.total >= 75 ? 'text-[#9DD37D]' : p.opportunityScore.total >= 50 ? 'text-[#EACAA1]' : 'text-[#E88B9E]'
        )}
        data-icod-id="src_components_productcompare_tsx_c683">
        {p.opportunityScore.total}/100
      </span>
    )},
  ];

  return (
    <Card variant="cream" className={cn('overflow-hidden', className)} data-icod-id="product_compare_card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3" data-icod-id="product_compare_header">
        <div
          className="flex items-center gap-2"
          data-icod-id="src_components_productcompare_tsx_84a6">
          <ArrowRightLeft
            className="h-4 w-4 text-[#C9D0FC]"
            data-icod-id="src_components_productcompare_tsx_fb64" />
          <h3
            className="text-sm font-semibold text-foreground"
            data-icod-id="src_components_productcompare_tsx_6027">
            Compare Products ({products.length}/3)
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} data-icod-id="product_compare_close">
          <X className="h-4 w-4" data-icod-id="src_components_productcompare_tsx_9f9a" />
        </Button>
      </div>
      {/* Comparison Table */}
      <div className="overflow-x-auto" data-icod-id="product_compare_table_wrap">
        <table className="w-full min-w-[600px] text-sm" data-icod-id="product_compare_table">
          <thead data-icod-id="src_components_productcompare_tsx_e34e">
            <tr className="border-b border-border" data-icod-id="product_compare_thead">
              <th className="sticky left-0 z-10 bg-card p-3 text-left font-semibold text-foreground" data-icod-id="product_compare_th_label">
                Attribute
              </th>
              {products.map((product) => (
                <th key={product.id} className="min-w-[180px] bg-card p-3 text-left" data-icod-id={`product_compare_th_${product.id}`}>
                  <div
                    className="flex items-start justify-between gap-2"
                    data-icod-id={`src_components_productcompare_tsx_b069_${product.id}`}>
                    <span
                      className="font-semibold text-foreground"
                      data-icod-id={`src_components_productcompare_tsx_902f_${product.id}`}>{product.name}</span>
                    <button
                      onClick={() => onRemove(product.id)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove from comparison"
                      data-icod-id={`src_components_productcompare_tsx_378d_${product.id}`}>
                      <X
                        className="h-3 w-3"
                        data-icod-id={`src_components_productcompare_tsx_29bc_${product.id}`} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody data-icod-id="src_components_productcompare_tsx_a559">
            {rows.map((row, rowIndex) => (
              <tr
                key={row.key}
                className={cn(
                  'border-b border-border/50 transition-colors hover:bg-muted/20',
                  rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                )}
                data-icod-id={`src_components_productcompare_tsx_f36b_${row.key}`}>
                <td className="sticky left-0 z-10 bg-card p-3 font-medium text-muted-foreground" data-icod-id={`product_compare_row_label_${row.key}`}>
                  {row.label}
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-foreground" data-icod-id={`product_compare_cell_${row.key}_${product.id}`}>
                    {row.render(product)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
