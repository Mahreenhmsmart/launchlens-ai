import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Lightbulb,
  Search,
  Target,
  Zap,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button, Card, EmptyState, Spinner, Alert, Modal, type CardVariant } from '@/components/ui';
import { cn } from '@/utils/cn';
import DiscoveryFilters, { DEFAULT_FILTERS } from '@/components/DiscoveryFilters';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import ProductCompare from '@/components/ProductCompare';
import TrendScoutChat from '@/components/TrendScoutChat';
import ResearchPanel from '@/components/ResearchPanel';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { discoverProducts, validateProduct } from '@/services/apiClient';
import type {
  DiscoveryCategory,
  DiscoveryFilters as FiltersType,
  ProductIdea,
  ValidateProductResponse,
  ProductResearch,
} from '@/types';
import type { PageId } from '@/components/Sidebar';
import type { SimulationInputs } from '@/utils/calculations';
import { STORAGE_KEYS, scopedGetItem, scopedSetItem } from '@/utils/scopedStorage';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/utils/i18n';

/** Strip all non-ASCII characters from a string to remove garbled tokens. */
function stripNonAscii(text: string): string {
  return text.replace(/[^\x00-\x7F]/g, '');
}

/** Sanitize all AI-generated text fields on a ProductIdea to ASCII-only. */
function sanitizeProduct(product: ProductIdea): ProductIdea {
  return {
    ...product,
    name: stripNonAscii(product.name),
    category: stripNonAscii(product.category),
    customerProblem: stripNonAscii(product.customerProblem),
    targetCustomer: stripNonAscii(product.targetCustomer),
    validationTestSuggestion: stripNonAscii(product.validationTestSuggestion),
    differentiationIdeas: product.differentiationIdeas.map(stripNonAscii),
    evidenceSource: product.evidenceSource ? stripNonAscii(product.evidenceSource) : product.evidenceSource,
    opportunityScore: {
      ...product.opportunityScore,
      explanations: {
        problemSeverity: stripNonAscii(product.opportunityScore.explanations.problemSeverity),
        demandSignals: stripNonAscii(product.opportunityScore.explanations.demandSignals),
        competitionGap: stripNonAscii(product.opportunityScore.explanations.competitionGap),
        profitPotential: stripNonAscii(product.opportunityScore.explanations.profitPotential),
        sourcingShippingEase: stripNonAscii(product.opportunityScore.explanations.sourcingShippingEase),
        riskDifferentiation: stripNonAscii(product.opportunityScore.explanations.riskDifferentiation),
      },
    },
  };
}

interface ProductDiscoveryProps {
  currency: string;
  onNavigate: (page: PageId) => void;
  simulatorInputs: SimulationInputs;
  onSimulatorInputsChange: (inputs: SimulationInputs) => void;
}

const CATEGORIES: { id: DiscoveryCategory; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'trending', label: 'Trending Products', icon: TrendingUp, color: 'text-[#C9D0FC] bg-[#C9D0FC]/10 border-[#C9D0FC]' },
  { id: 'problem-solving', label: 'Problem-Solving', icon: Lightbulb, color: 'text-[#EACAA1] bg-[#EACAA1]/10 border-[#EACAA1]' },
  { id: 'market-gaps', label: 'Market Gaps', icon: Search, color: 'text-[#9DD37D] bg-[#9DD37D]/10 border-[#9DD37D]' },
  { id: 'low-competition', label: 'Low Competition', icon: Target, color: 'text-[#C9D0FC] bg-[#C9D0FC]/10 border-[#C9D0FC]' },
  { id: 'emerging', label: 'Emerging Ideas', icon: Sparkles, color: 'text-[#EACAA1] bg-[#EACAA1]/10 border-[#EACAA1]' },
];

export default function ProductDiscovery({
  currency,
  onNavigate,
  simulatorInputs,
  onSimulatorInputsChange,
}: ProductDiscoveryProps) {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const { t } = useTranslation();

  // State
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory>('trending');
  const [filters, setFilters] = useState<FiltersType>(DEFAULT_FILTERS);
  const [products, setProducts] = useState<ProductIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | undefined>();

  // UI state
  const [selectedProduct, setSelectedProduct] = useState<ProductIdea | null>(null);
  const [compareProducts, setCompareProducts] = useState<ProductIdea[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [validationPlan, setValidationPlan] = useState<{ product: ProductIdea; plan: string; isFallback: boolean } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'chat'>('discover');
  const [simulatorTransferNotice, setSimulatorTransferNotice] = useState<string | null>(null);
  const [pendingSimProduct, setPendingSimProduct] = useState<ProductIdea | null>(null);

  // Research state — initialized empty, loaded via useEffect when userId is available
  const [researchDataMap, setResearchDataMap] = useState<Record<string, ProductResearch>>({});
  const [researchProduct, setResearchProduct] = useState<ProductIdea | null>(null);
  const [chatContextProductId, setChatContextProductId] = useState<string | null>(null);

  // Load user-scoped filters and research data when userId changes
  useEffect(() => {
    if (!userId) return;
    setFilters(
      scopedGetItem<FiltersType>(STORAGE_KEYS.DISCOVERY_FILTERS, userId, DEFAULT_FILTERS)
    );
    setResearchDataMap(
      scopedGetItem<Record<string, ProductResearch>>(STORAGE_KEYS.RESEARCH, userId, {})
    );
  }, [userId]);

  // Persist filters to scoped localStorage
  useEffect(() => {
    scopedSetItem(STORAGE_KEYS.DISCOVERY_FILTERS, userId, filters);
  }, [filters, userId]);

  // Persist research data to scoped localStorage
  useEffect(() => {
    scopedSetItem(STORAGE_KEYS.RESEARCH, userId, researchDataMap);
  }, [researchDataMap, userId]);

  // Handle research save
  const handleResearchSave = useCallback((research: ProductResearch) => {
    setResearchDataMap((prev) => ({
      ...prev,
      [research.productId]: research,
    }));
    // Set this product as chat context if it has observations
    if (research.observations.length > 0) {
      setChatContextProductId(research.productId);
    }
  }, []);

  // Fetch products when category or filters change
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await discoverProducts({
        filters,
        category: activeCategory,
        currency,
      });

      if (response.success && response.data) {
        setProducts(response.data.products.map(sanitizeProduct));
        setIsFallback(response.data.isFallback);
        setFallbackReason(response.data.reason);
      } else {
        setError(response.error || 'Failed to fetch product ideas.');
        setProducts([]);
      }
    } catch {
      setError('Unable to connect to the server.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, activeCategory, currency]);

  // Auto-fetch on mount and when category/filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle compare toggle
  const handleCompareToggle = (product: ProductIdea) => {
    const isSelected = compareProducts.some((p) => p.id === product.id);
    if (isSelected) {
      setCompareProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      if (compareProducts.length >= 3) {
        // Replace oldest selection
        setCompareProducts((prev) => [...prev.slice(1), product]);
      } else {
        setCompareProducts((prev) => [...prev, product]);
      }
    }
  };

  // Handle send to simulator — opens confirmation modal first
  const handleSendToSimulator = (product: ProductIdea) => {
    setPendingSimProduct(product);
  };

  const confirmSendToSimulator = () => {
    if (!pendingSimProduct) return;
    const product = pendingSimProduct;
    setPendingSimProduct(null);

    // Transfer product name, selling price (midpoint of range), and cost (midpoint of range)
    const midPrice = Math.round((product.estimatedSellingPriceRange.min + product.estimatedSellingPriceRange.max) / 2);
    const midCost = Math.round((product.estimatedSourcingCostRange.min + product.estimatedSourcingCostRange.max) / 2);

    onSimulatorInputsChange({
      ...simulatorInputs,
      productName: `${product.name} (unverified estimate)`,
      sellingPrice: midPrice,
      productCost: midCost,
    });

    setSimulatorTransferNotice(`"${product.name}" estimates sent to Launch Simulator. Values are marked as unverified.`);
    
    // Auto-dismiss notice after 5 seconds
    setTimeout(() => setSimulatorTransferNotice(null), 5000);
  };

  // Handle validation
  const handleValidate = async (product: ProductIdea) => {
    setIsValidating(true);
    try {
      const response: ValidateProductResponse = await validateProduct({ product, currency });
      if (response.success && response.data) {
        setValidationPlan({
          product,
          plan: response.data.validationPlan,
          isFallback: response.data.isFallback,
        });
      } else {
        setError(response.error || 'Failed to generate validation plan.');
      }
    } catch {
      setError('Unable to connect to the server.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6" style={{ animation: 'fadeIn 0.3s ease-out' }} data-icod-id="product_discovery_page">
      {/* Page Header */}
      <div className="space-y-2" data-icod-id="product_discovery_header">
        <h1 className="text-3xl font-bold text-[#171717]" data-icod-id="product_discovery_title">
          {t('TrendScout AI — Product Discovery')}
        </h1>
        <p className="text-muted-foreground" data-icod-id="product_discovery_subtitle">
          {t('Discover profitable product opportunities using AI-powered market research.')}
        </p>
      </div>
      {/* Simulator Transfer Notice */}
      {simulatorTransferNotice && (
        <Alert variant="success" className="animate-pulse" data-icod-id="product_discovery_transfer_notice">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_productdiscovery_tsx_d94c">
            <Zap className="h-4 w-4" data-icod-id="src_pages_productdiscovery_tsx_1ce5" />
            <span className="text-sm" data-icod-id="src_pages_productdiscovery_tsx_1979">{simulatorTransferNotice}</span>
            <button
              onClick={() => setSimulatorTransferNotice(null)}
              className="ml-auto text-xs underline"
              data-icod-id="src_pages_productdiscovery_tsx_b441">
              Dismiss
            </button>
          </div>
        </Alert>
      )}
      {/* Promotional Banner — TrendScout AI */}
      <div className="space-y-4" data-icod-id="src_pages_productdiscovery_tsx_promo_banner_4">
        <div
          className="mx-auto max-w-5xl overflow-hidden rounded-xl shadow-lg"
          data-icod-id="src_pages_productdiscovery_tsx_promo_banner_4_img_wrap">
          <img
            src="/assets/1795035776547_image-5-upload.webp"
            alt="TrendScout AI — Discover Profitable Products"
            className="w-full object-contain"
            loading="lazy"
            data-icod-id="src_pages_productdiscovery_tsx_promo_banner_4_img"
          />
        </div>
      </div>
      {/* Main Tab Switcher */}
      <div className="flex gap-2 border-b border-border" data-icod-id="product_discovery_tabs">
        <button
          onClick={() => setActiveTab('discover')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'discover'
              ? 'border-[#C9D0FC] text-[#C9D0FC]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
          data-icod-id="product_discovery_tab_discover"
        >
          <Search className="h-4 w-4" data-icod-id="src_pages_productdiscovery_tsx_dad6" />
          {t('Discover Products')}
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'chat'
              ? 'border-[#C9D0FC] text-[#C9D0FC]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
          data-icod-id="product_discovery_tab_chat"
        >
          <MessageSquare className="h-4 w-4" data-icod-id="src_pages_productdiscovery_tsx_25c6" />
          {t('Ask TrendScout')}
        </button>
      </div>
      {activeTab === 'discover' ? (
        <div className="space-y-6" data-icod-id="product_discovery_content">
          {/* Filters */}
          <DiscoveryFilters
            filters={filters}
            onFiltersChange={setFilters}
            data-icod-id="product_discovery_filters"
          />

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2" data-icod-id="product_discovery_categories">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? cat.color
                      : 'border-border bg-card text-muted-foreground hover:border-[#C9D0FC]/30 hover:text-foreground'
                  )}
                  data-icod-id={`product_discovery_cat_${cat.id}`}
                >
                  <Icon
                    className="h-4 w-4"
                    data-icod-id={`src_pages_productdiscovery_tsx_17f9_${cat.id}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Fallback Notice */}
          {isFallback && fallbackReason && (
            <Alert variant="warning" data-icod-id="product_discovery_fallback_notice">
              <div
                className="flex items-start gap-2"
                data-icod-id="src_pages_productdiscovery_tsx_df64">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  data-icod-id="src_pages_productdiscovery_tsx_fcfc" />
                <div data-icod-id="src_pages_productdiscovery_tsx_4855">
                  <p
                    className="text-sm font-semibold"
                    data-icod-id="src_pages_productdiscovery_tsx_3e30">
                    {fallbackReason.includes('error') ? 'AI Service Unavailable' : 'Template-Based Suggestions'}
                  </p>
                  <p
                    className="text-xs opacity-80"
                    data-icod-id="src_pages_productdiscovery_tsx_f495">{fallbackReason}</p>
                </div>
              </div>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="error" data-icod-id="product_discovery_error">
              <div
                className="flex items-start gap-2"
                data-icod-id="src_pages_productdiscovery_tsx_09b1">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  data-icod-id="src_pages_productdiscovery_tsx_9cc8" />
                <div className="flex-1" data-icod-id="src_pages_productdiscovery_tsx_cd71">
                  <p className="text-sm" data-icod-id="src_pages_productdiscovery_tsx_a65d">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchProducts}
                  data-icod-id="src_pages_productdiscovery_tsx_6eb6">
                  Retry
                </Button>
              </div>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12" data-icod-id="product_discovery_loading">
              <Spinner size="lg" data-icod-id="src_pages_productdiscovery_tsx_9438" />
              <p
                className="mt-4 text-sm text-muted-foreground"
                data-icod-id="src_pages_productdiscovery_tsx_91f4">Discovering product ideas…</p>
            </div>
          )}

          {/* Product Grid */}
          {!isLoading && !error && products.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-icod-id="product_discovery_grid">
              {products.map((product, index) => {
                const variants: CardVariant[] = ['lavender', 'mint', 'cream'];
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currency={currency}
                    isSelectedForCompare={compareProducts.some((p) => p.id === product.id)}
                    evidenceStatus={researchDataMap[product.id]?.status}
                    onViewDetails={setSelectedProduct}
                    onCompare={handleCompareToggle}
                    onValidate={handleValidate}
                    onSendToSimulator={handleSendToSimulator}
                    onResearch={setResearchProduct}
                    cardVariant={variants[index % variants.length]}
                    data-icod-id={`product_discovery_card_${product.id}`}
                  />
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && products.length === 0 && (
            <EmptyState
              icon={Search}
              title="No products found"
              description="Try adjusting your filters or selecting a different category."
              action={
                <Button
                  variant="outline"
                  onClick={fetchProducts}
                  data-icod-id="src_pages_productdiscovery_tsx_2b67">
                  <RefreshCw
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_productdiscovery_tsx_d9df" />
                  Refresh
                </Button>
              }
              data-icod-id="product_discovery_empty"
            />
          )}

          {/* Comparison Panel */}
          {compareProducts.length > 0 && showCompare && (
            <ProductCompare
              products={compareProducts}
              currency={currency}
              onRemove={(id) => setCompareProducts((prev) => prev.filter((p) => p.id !== id))}
              onClose={() => setShowCompare(false)}
              data-icod-id="product_discovery_compare"
            />
          )}

          {/* Compare Toggle Button (floating) */}
          {compareProducts.length > 0 && !showCompare && (
            <div className="fixed bottom-6 right-6 z-30" data-icod-id="product_discovery_compare_float">
              <Button
                variant="primary"
                onClick={() => setShowCompare(true)}
                className="shadow-lg"
                data-icod-id="src_pages_productdiscovery_tsx_cf18">
                Compare ({compareProducts.length})
              </Button>
            </div>
          )}

          {/* Validation Plan Modal */}
          {validationPlan && (
            <Card variant="lavender" className="space-y-4 p-6" data-icod-id="product_discovery_validation">
              <div
                className="flex items-center justify-between"
                data-icod-id="src_pages_productdiscovery_tsx_d329">
                <h3
                  className="text-lg font-semibold text-foreground"
                  data-icod-id="src_pages_productdiscovery_tsx_6f5b">
                  Validation Plan: {validationPlan.product.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setValidationPlan(null)}
                  data-icod-id="src_pages_productdiscovery_tsx_cc4d">
                  Close
                </Button>
              </div>
              {validationPlan.isFallback && (
                <Alert variant="warning" data-icod-id="src_pages_productdiscovery_tsx_f331">
                  <p className="text-xs" data-icod-id="src_pages_productdiscovery_tsx_ecb0">This is a template-based plan. Connect AI for personalized validation steps.</p>
                </Alert>
              )}
              <MarkdownRenderer
                content={validationPlan.plan}
                data-icod-id="src_pages_productdiscovery_tsx_2c89" />
            </Card>
          )}
        </div>
      ) : (
        /* Chat Tab */
        (<div data-icod-id="product_discovery_chat_section">
          <TrendScoutChat
            filters={filters}
            currency={currency}
            selectedProductResearch={chatContextProductId ? researchDataMap[chatContextProductId] : undefined}
            data-icod-id="src_pages_productdiscovery_tsx_57f6" />
        </div>)
      )}
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        currency={currency}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSendToSimulator={handleSendToSimulator}
        onValidate={handleValidate}
        data-icod-id="product_discovery_detail_modal"
      />
      {/* Research Panel */}
      <ResearchPanel
        product={researchProduct}
        open={!!researchProduct}
        onClose={() => setResearchProduct(null)}
        researchData={researchProduct ? researchDataMap[researchProduct.id] : undefined}
        onSave={handleResearchSave}
        targetMarket={filters.targetMarket}
        data-icod-id="src_pages_productdiscovery_tsx_ac81" />
      {/* Simulator Overwrite Confirmation Modal */}
      <Modal
        open={pendingSimProduct !== null}
        onClose={() => setPendingSimProduct(null)}
        title="Overwrite Simulation"
        footer={
          <div className="flex gap-2" data-icod-id="src_pages_productdiscovery_tsx_4c74">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingSimProduct(null)}
              data-icod-id="src_pages_productdiscovery_tsx_0e2a">Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={confirmSendToSimulator}
              data-icod-id="src_pages_productdiscovery_tsx_8231">Continue</Button>
          </div>
        }
        data-icod-id="src_pages_productdiscovery_tsx_3663">
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_productdiscovery_tsx_60b6">This will overwrite your current simulation with estimates from &ldquo;{pendingSimProduct?.name}&rdquo;. Values are unverified midpoints of estimated ranges.</p>
      </Modal>
    </div>
  );
}
