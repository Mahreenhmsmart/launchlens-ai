import { useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button, Card, Field, Input } from '@/components/ui';
import { cn } from '@/utils/cn';
import type {
  DiscoveryFilters as FiltersType,
  TargetMarket,
  BusinessModel,
  ProductCategory,
  BudgetRange,
  ProductType,
} from '@/types';

const TARGET_MARKETS: TargetMarket[] = [
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

const BUSINESS_MODELS: BusinessModel[] = [
  'Shopify store',
  'General e-commerce',
  'Dropshipping',
  'Private label',
];

const PRODUCT_CATEGORIES: ProductCategory[] = [
  'All categories',
  'Beauty',
  'Skincare',
  'Home',
  'Fashion',
  'Accessories',
  'Gadgets',
  'Pets',
  'Lifestyle',
];

const BUDGET_RANGES: BudgetRange[] = [
  'Under 5K',
  '5K–15K',
  '15K–50K',
  '50K–100K',
  '100K+',
];

const PRODUCT_TYPES: ProductType[] = [
  'Lightweight',
  'Easy to ship',
  'Repeat-purchase',
  'Premium',
];

const DEFAULT_FILTERS: FiltersType = {
  targetMarket: 'Pakistan',
  businessModel: 'Shopify store',
  productCategory: 'All categories',
  budgetRange: '5K–15K',
  productType: 'Lightweight',
  preferredNiche: '',
};

const FILTERS_STORAGE_KEY = 'launchlens_discovery_filters';

interface DiscoveryFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  className?: string;
}

export default function DiscoveryFilters({
  filters,
  onFiltersChange,
  className,
}: DiscoveryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <Card variant="lavender" className={cn('overflow-hidden', className)} data-icod-id="discovery_filters_card">
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3"
        data-icod-id="discovery_filters_header"
      >
        <div className="flex items-center gap-2" data-icod-id="discovery_filters_header_left">
          <SlidersHorizontal className="h-4 w-4 text-[#C9D0FC]" data-icod-id="discovery_filters_icon" />
          <h3 className="text-sm font-semibold text-foreground" data-icod-id="discovery_filters_title">
            Discovery Filters
          </h3>
        </div>
        <div className="flex items-center gap-2" data-icod-id="discovery_filters_actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1 text-xs"
            data-icod-id="discovery_filters_reset_btn"
          >
            <RotateCcw className="h-3 w-3" data-icod-id="discovery_filters_reset_icon" />
            Reset
          </Button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-foreground md:hidden"
            data-icod-id="discovery_filters_toggle"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      {/* Filter Fields */}
      <div
        className={cn(
          'grid gap-4 p-4 transition-all duration-200',
          isExpanded ? 'opacity-100' : 'hidden md:grid md:opacity-100',
          'md:grid-cols-2 lg:grid-cols-3'
        )}
        data-icod-id="discovery_filters_grid"
      >
        <Field label="Target Market" htmlFor="targetMarket" data-icod-id="discovery_filters_field_market">
          <select
            id="targetMarket"
            value={filters.targetMarket}
            onChange={(e) => handleChange('targetMarket', e.target.value as TargetMarket)}
            className={cn(
              'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-[#C9D0FC] focus:outline-none focus:ring-2 focus:ring-[#C9D0FC]/20'
            )}
            data-icod-id="discovery_filters_select_market"
          >
            {TARGET_MARKETS.map((market) => (
              <option
                key={market}
                value={market}
                data-icod-id={`src_components_discoveryfilters_tsx_187b_${market}`}>{market}</option>
            ))}
          </select>
        </Field>

        <Field label="Business Model" htmlFor="businessModel" data-icod-id="discovery_filters_field_model">
          <select
            id="businessModel"
            value={filters.businessModel}
            onChange={(e) => handleChange('businessModel', e.target.value as BusinessModel)}
            className={cn(
              'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-[#C9D0FC] focus:outline-none focus:ring-2 focus:ring-[#C9D0FC]/20'
            )}
            data-icod-id="discovery_filters_select_model"
          >
            {BUSINESS_MODELS.map((model) => (
              <option
                key={model}
                value={model}
                data-icod-id={`src_components_discoveryfilters_tsx_4cc7_${model}`}>{model}</option>
            ))}
          </select>
        </Field>

        <Field label="Product Category" htmlFor="productCategory" data-icod-id="discovery_filters_field_category">
          <select
            id="productCategory"
            value={filters.productCategory}
            onChange={(e) => handleChange('productCategory', e.target.value as ProductCategory)}
            className={cn(
              'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-[#C9D0FC] focus:outline-none focus:ring-2 focus:ring-[#C9D0FC]/20'
            )}
            data-icod-id="discovery_filters_select_category"
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option
                key={cat}
                value={cat}
                data-icod-id={`src_components_discoveryfilters_tsx_2b66_${cat}`}>{cat}</option>
            ))}
          </select>
        </Field>

        <Field label="Budget Range" htmlFor="budgetRange" data-icod-id="discovery_filters_field_budget">
          <select
            id="budgetRange"
            value={filters.budgetRange}
            onChange={(e) => handleChange('budgetRange', e.target.value as BudgetRange)}
            className={cn(
              'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-[#C9D0FC] focus:outline-none focus:ring-2 focus:ring-[#C9D0FC]/20'
            )}
            data-icod-id="discovery_filters_select_budget"
          >
            {BUDGET_RANGES.map((range) => (
              <option
                key={range}
                value={range}
                data-icod-id={`src_components_discoveryfilters_tsx_9516_${range}`}>{range}</option>
            ))}
          </select>
        </Field>

        <Field label="Product Type" htmlFor="productType" data-icod-id="discovery_filters_field_type">
          <select
            id="productType"
            value={filters.productType}
            onChange={(e) => handleChange('productType', e.target.value as ProductType)}
            className={cn(
              'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-[#C9D0FC] focus:outline-none focus:ring-2 focus:ring-[#C9D0FC]/20'
            )}
            data-icod-id="discovery_filters_select_type"
          >
            {PRODUCT_TYPES.map((type) => (
              <option
                key={type}
                value={type}
                data-icod-id={`src_components_discoveryfilters_tsx_7b64_${type}`}>{type}</option>
            ))}
          </select>
        </Field>

        <Field label="Preferred Niche / Problem" htmlFor="preferredNiche" data-icod-id="discovery_filters_field_niche">
          <Input
            id="preferredNiche"
            value={filters.preferredNiche}
            onChange={(e) => handleChange('preferredNiche', e.target.value)}
            placeholder="e.g., eco-friendly kitchen products"
            data-icod-id="discovery_filters_input_niche"
          />
        </Field>
      </div>
    </Card>
  );
}

export { DEFAULT_FILTERS, FILTERS_STORAGE_KEY };
