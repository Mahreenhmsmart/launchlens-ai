// Standard response envelope returned by the Express backend.
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
  message?: string;
  resetToken?: string; // For forgot password (development only)
}

// ─── Product Discovery Types ────────────────────────────────────────────────

export type DemandLevel = 'Low' | 'Medium' | 'High';
export type CompetitionLevel = 'Low' | 'Medium' | 'High';
export type TrendDirection = 'rising' | 'stable' | 'declining';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export type DiscoveryCategory =
  | 'trending'
  | 'problem-solving'
  | 'market-gaps'
  | 'low-competition'
  | 'emerging';

export type TargetMarket =
  | 'Pakistan'
  | 'USA'
  | 'UK'
  | 'UAE'
  | 'Saudi Arabia'
  | 'India'
  | 'Canada'
  | 'Australia'
  | 'Germany'
  | 'Other';

export type BusinessModel =
  | 'Shopify store'
  | 'General e-commerce'
  | 'Dropshipping'
  | 'Private label';

export type ProductCategory =
  | 'Beauty'
  | 'Skincare'
  | 'Home'
  | 'Fashion'
  | 'Accessories'
  | 'Gadgets'
  | 'Pets'
  | 'Lifestyle'
  | 'All categories';

export type BudgetRange =
  | 'Under 5K'
  | '5K–15K'
  | '15K–50K'
  | '50K–100K'
  | '100K+';

export type ProductType =
  | 'Lightweight'
  | 'Easy to ship'
  | 'Repeat-purchase'
  | 'Premium';

export interface DiscoveryFilters {
  targetMarket: TargetMarket;
  businessModel: BusinessModel;
  productCategory: ProductCategory;
  budgetRange: BudgetRange;
  productType: ProductType;
  preferredNiche: string;
}

export interface OpportunityScoreBreakdown {
  problemSeverity: number; // 0-20
  demandSignals: number; // 0-20
  competitionGap: number; // 0-20
  profitPotential: number; // 0-20
  sourcingShippingEase: number; // 0-10
  riskDifferentiation: number; // 0-10
  total: number; // 0-100
  explanations: {
    problemSeverity: string;
    demandSignals: string;
    competitionGap: string;
    profitPotential: string;
    sourcingShippingEase: string;
    riskDifferentiation: string;
  };
}

export type SupplierChannel = 'Local Wholesale Market' | 'Importer' | 'Manufacturer (Direct)' | 'Online Marketplace';

export interface LandedCostBreakdown {
  productCostPerUnit: number;
  shippingToPakistanPerUnit: number;
  importDutyTaxPerUnit: number;
  packagingPerUnit: number;
  totalLandedCostPerUnit: number;
}

export interface SourcingInfo {
  likelySupplierChannel: SupplierChannel;
  estimatedMinOrderQuantity: number;
  landedCost: LandedCostBreakdown;
  marginOnLandedCostPercent: number;
}

export interface ProductIdea {
  id: string;
  name: string;
  category: string;
  customerProblem: string;
  targetCustomer: string;
  demandLevel: DemandLevel;
  trendDirection: TrendDirection;
  competitionLevel: CompetitionLevel;
  estimatedSellingPriceRange: { min: number; max: number };
  estimatedSourcingCostRange: { min: number; max: number };
  potentialMarginPercent: number;
  shippingRisk: RiskLevel;
  qualityRisk: RiskLevel;
  returnsRisk: RiskLevel;
  regulatoryRisk: RiskLevel;
  differentiationIdeas: string[];
  validationTestSuggestion: string;
  opportunityScore: OpportunityScoreBreakdown;
  isProvisional: boolean;
  evidenceSource?: string;
  dateChecked?: string;
  discoveryCategory: DiscoveryCategory;
  sourcing?: SourcingInfo;
}

export interface DiscoverProductsRequest {
  filters: DiscoveryFilters;
  category: DiscoveryCategory;
  currency: string;
}

export interface DiscoverProductsResponse {
  success: boolean;
  data?: {
    products: ProductIdea[];
    isFallback: boolean;
    reason?: string;
  };
  error?: string;
}

export interface AskTrendScoutRequest {
  question: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  filterContext: DiscoveryFilters;
  currency: string;
}

export interface AskTrendScoutResponse {
  success: boolean;
  data?: {
    reply: string;
    isFallback: boolean;
    reason?: string;
  };
  error?: string;
}

export interface ValidateProductRequest {
  product: ProductIdea;
  currency: string;
}

export interface ValidateProductResponse {
  success: boolean;
  data?: {
    validationPlan: string;
    isFallback: boolean;
    reason?: string;
  };
  error?: string;
}

// ─── Manual Research Types ──────────────────────────────────────────────────

export type EvidenceStatus = 'ai-idea' | 'researching' | 'partially-verified' | 'evidence-collected';

export interface CompetitorObservation {
  id: string;
  competitorName: string;
  sellerName: string;
  price: number;
  currency: string;
  productUrl: string;
  availability: string;
  deliveryNotes: string;
  dateChecked: string;
  qualityNotes: string;
  reviewNotes: string;
  differentiationNotes: string;
  complaintNotes: string;
}

export interface ProductResearch {
  productId: string;
  productName: string;
  customerProblem: string;
  status: EvidenceStatus;
  observations: CompetitorObservation[];
  summaryNotes: string;
  lastUpdated: string;
}

export interface AskTrendScoutRequestWithResearch extends AskTrendScoutRequest {
  researchData?: {
    observations: CompetitorObservation[];
    status: EvidenceStatus;
    productName?: string;
  };
}

// ─── Launch Decision Engine Types ──────────────────────────────────────────

export interface CodProductInputs {
  id: string;
  productName: string;
  sellingPrice: number;
  productCost: number;
  deliveryCost: number;
  packagingCost: number;
  adBudget: number;
  deliverySuccessRate: number; // percentage (0-100)
  rtoShippingCost: number;
  nonRecoverableLoss: number;
  createdAt: string;
}

export interface CodCalculations {
  contributionPerDeliveredOrder: number;
  expectedContributionPerPlacedOrder: number;
  maxBreakEvenAdCostPerOrder: number;
  breakEvenRoas: number;
  breakEvenOrderCount: number;
  profitAtVolume: (volume: number) => number;
}

export type LaunchDecision = 'GO' | 'TEST FIRST' | 'NO-GO';

export interface LaunchDecisionResult {
  decision: LaunchDecision;
  reasons: string[];
}

export interface CodScenario {
  label: string;
  adBudget: number;
  expectedOrderVolume: number;
  deliverySuccessRate: number;
}

export interface CodScenarioResult extends CodScenario {
  expectedProfit: number;
  expectedRevenue: number;
  expectedDeliveredOrders: number;
  expectedRtoOrders: number;
}

export interface ActualCampaignResults {
  id: string;
  analysisId: string;
  dateRecorded: string;
  actualAdSpend: number;
  ordersPlaced: number;
  deliveredOrders: number;
  rtoOrders: number;
  actualRevenue: number;
  additionalExpenses: number;
}

export interface PredictionVsActual {
  predictedProfit: number;
  actualProfit: number;
  profitDifference: number;
  predictedDeliveryRate: number;
  actualDeliveryRate: number;
  deliveryRateDifference: number;
  mainLossSources: string[];
  suggestions: string[];
}

export interface SavedCodAnalysis {
  inputs: CodProductInputs;
  calculations: {
    contributionPerDeliveredOrder: number;
    expectedContributionPerPlacedOrder: number;
    maxBreakEvenAdCostPerOrder: number;
    breakEvenRoas: number;
    breakEvenOrderCount: number;
  };
  decision: LaunchDecisionResult;
  scenarios: CodScenarioResult[];
  actualResults?: ActualCampaignResults[];
}

// ─── Shared Product Types ──────────────────────────────────────────────────

export interface SharedProduct {
  _id: string;
  userId: string;
  name: string;
  sellingPrice: number;
  productCost: number;
  deliveryCost: number;
  otherCosts: number;
  adBudget: number;
  expectedOrders: number;
  market: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sellingPrice: number;
  productCost: number;
  deliveryCost: number;
  otherCosts: number;
  adBudget: number;
  expectedOrders: number;
  market: string;
  category: string;
}

export interface UpdateProductRequest {
  name?: string;
  sellingPrice?: number;
  productCost?: number;
  deliveryCost?: number;
  otherCosts?: number;
  adBudget?: number;
  expectedOrders?: number;
  market?: string;
  category?: string;
}

// ─── Saved Simulator Analysis Types ──────────────────────────────────────

export interface SavedSimulatorAnalysis {
  id: string;
  name: string;
  createdAt: string;
  currency: string;
  inputs: {
    productName: string;
    sellingPrice: number;
    productCost: number;
    deliveryCost: number;
    rtoShippingCost?: number;
    otherVariableCosts: number;
    advertisingBudget: number;
    expectedOrders: number;
    deliverySuccessRate?: number;
  };
  results: {
    revenue: number;
    variableCosts: number;
    contributionPerOrder: number;
    contributionBeforeAdvertising: number;
    campaignProfitLoss: number;
    roas: number | null;
    contributionMarginPercent: number | null;
    breakEvenRoas: number | null;
    breakEvenOrders: number | null;
  };
  verdict: 'Profitable' | 'Loss-making';
}

// ─── Saved Scenario Analysis Types ────────────────────────────────────────

export interface SavedScenarioConfig {
  id: string;
  name: string;
  description: string;
  advertisingBudget: number;
  expectedOrders: number;
  deliverySuccessRate: number;
}

export interface SavedScenarioResult {
  scenarioName: string;
  revenue: number;
  variableCosts: number;
  contributionBeforeAdvertising: number;
  campaignProfitLoss: number;
  roas: number | null;
  breakEvenRoas: number | null;
  breakEvenOrders: number | null;
}

export interface SavedScenarioAnalysis {
  id: string;
  name: string;
  productName: string;
  createdAt: string;
  currency: string;
  scenarios: SavedScenarioConfig[];
  results: SavedScenarioResult[];
  simulatorInputs: {
    sellingPrice: number;
    productCost: number;
    deliveryCost: number;
    rtoShippingCost: number;
    otherVariableCosts: number;
  };
}

// ─── Subscription Types ──────────────────────────────────────────────────

export type PlanType = 'basic' | 'standard' | 'business';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'pending_setup' | 'active' | 'cancelled';

export interface BuyerDetails {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  businessName?: string;
}

export interface Subscription extends BuyerDetails {
  _id: string;
  userId: string;
  plan: PlanType;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  paymentMethod: string;
  paymentConfigured: boolean;
  nextBillingDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SelectPlanRequest extends Partial<BuyerDetails> {
  plan: PlanType;
  billingCycle: BillingCycle;
  paymentMethod: string;
}

export interface ChangePlanRequest {
  plan: PlanType;
  billingCycle: BillingCycle;
}

export interface SubscriptionHistoryEntry {
  _id: string;
  plan: PlanType;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionState {
  subscription: Subscription | null;
  paymentConfigured: boolean;
  preferredBillingCycle: BillingCycle;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// ─── Profit Actuals Types ──────────────────────────────────────────────────

export interface ProfitActualEntry {
  id: string;
  analysisId: string;
  dateLogged: string;
  ordersDelivered: number;
  ordersReturned: number;
  revenueReceived: number;
  adSpent: number;
  deliveryCostPaid: number;
  actualProfit: number;
  actualRoas: number | null;
  actualDeliveryRate: number;
}

// ─── CSV Import Types ──────────────────────────────────────────────────────

/** A single order row parsed from a Daraz/Shopify CSV export. */
export interface ImportedOrder {
  id: string;
  date: string;
  product: string;
  sellingPrice: number;
  productCost: number;
  courier: string;
  city: string;
  deliveryStatus: 'delivered' | 'returned';
  adSpend: number;
}

/** Summary statistics computed after a successful CSV parse. */
export interface CsvImportSummary {
  totalRows: number;
  deliveredCount: number;
  returnedCount: number;
  dateRange: { min: string; max: string };
  totalRevenue: number;
  totalAdSpend: number;
  totalProductCost: number;
  totalCourierCost: number;
}

/** Aggregated actuals derived from imported orders for comparison. */
export interface ImportedActuals {
  revenue: number;
  profit: number;
  roas: number | null;
  deliveryRate: number;
  ordersDelivered: number;
  ordersReturned: number;
  adSpend: number;
  deliveryCost: number;
}

/** A single row in the Predicted vs Actual comparison table. */
export interface ComparisonMetric {
  label: string;
  predicted: string;
  actual: string;
  variance: string;
  varianceValue: number;
  isRatio?: boolean;
  isPercentage?: boolean;
}

// ─── Plan Gating Types ───────────────────────────────────────────────────

export type GatedFeature =
  | 'advancedAIAnalysis'
  | 'exportReports'
  | 'teamCollaboration'
  | 'higherUsageLimits';

export interface PlanLimits {
  maxAnalysesPerMonth: number | null; // null = unlimited
  features: GatedFeature[];
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  basic: {
    maxAnalysesPerMonth: 10,
    features: [],
  },
  standard: {
    maxAnalysesPerMonth: 50,
    features: ['advancedAIAnalysis', 'exportReports'],
  },
  business: {
    maxAnalysesPerMonth: null,
    features: ['advancedAIAnalysis', 'exportReports', 'teamCollaboration', 'higherUsageLimits'],
  },
};

// ─── Team Collaboration Types ──────────────────────────────────────────────

export type TeamRole = 'Admin' | 'Editor' | 'Viewer';
export type TeamMemberStatus = 'Invited' | 'Active';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  invitedAt: string;
}
