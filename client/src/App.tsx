import { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import type { PageId } from '@/components/Sidebar';
import Overview from '@/pages/Overview';
import LaunchSimulator from '@/pages/LaunchSimulator';
import Scenarios from '@/pages/Scenarios';
import ReadinessChecklist from '@/pages/ReadinessChecklist';
import AIInsights from '@/pages/AIInsights';
import ProductDiscovery from '@/pages/ProductDiscovery';
import LaunchDecisionEngine from '@/pages/LaunchDecisionEngine';
import CODCalculator from '@/pages/CODCalculator';
import SavedAnalyses from '@/pages/SavedAnalyses';
import ProfitTracker from '@/pages/ProfitTracker';
import MyProducts from '@/pages/MyProducts';
import Team from '@/pages/Team';
import Auth from '@/pages/Auth';
import HowItWorks from '@/pages/HowItWorks';
import About from '@/pages/About';
import WhyLaunchLens from '@/pages/WhyLaunchLens';
import Features from '@/pages/Features';
import Demo from '@/pages/Demo';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import Pricing from '@/pages/Pricing';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import Checkout from '@/pages/Checkout';
import ProtectedRoute from '@/components/ProtectedRoute';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import OnboardingFlow from '@/components/OnboardingFlow';
import { DEFAULT_CURRENCY } from '@/utils/currency';
import { DEFAULT_SIMULATION_INPUTS, calculateSimulation, type SimulationInputs, type SimulationResults } from '@/utils/calculations';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth, logout as logoutAction } from '@/store/slices/authSlice';
import { loadProducts, editProduct, addProduct, resetProducts, setActiveProduct } from '@/store/slices/productsSlice';
import type { SavedSimulatorAnalysis, SavedCodAnalysis, SavedScenarioAnalysis } from '@/types';
import { STORAGE_KEYS, scopedGetRaw, scopedSetRaw, scopedGetItem, scopedSetItem, scopedRemoveItem } from '@/utils/scopedStorage';
import { useAutoCheckEligibility, useReadinessNotifications } from '@/hooks/useChecklistAutoCheck';

// Public routes that must render without authentication.
// Used by App.tsx routing AND by the axios 401 interceptor in apiClient.ts
// to prevent hard-redirects to /auth when visiting these pages.
export const PUBLIC_ROUTES: ReadonlySet<string> = new Set([
  '/',
  '/home',
  '/auth',
  '/privacy',
  '/terms',
  '/pricing',
  '/about',
  '/faq',
  '/contact',
  '/features',
  '/how-it-works',
  '/why-launchlens',
]);

/** Returns true when the given pathname is a public route exempt from auth guards. */
export function isPublicRoute(pathname: string): boolean {
  // Strip query string and trailing slash (except for root "/")
  const clean = pathname.split('?')[0].split('#')[0];
  if (clean === '/') return true;
  const trimmed = clean.replace(/\/+$/, '');
  return PUBLIC_ROUTES.has(trimmed);
}

/** The canonical homepage path — always renders the public landing page. */
export const HOMEPAGE_PATH = '/home';

export interface ChecklistTask {
  id: string;
  label: string;
  description: string;
  priority: 'High' | 'Medium';
  suggestion: string;
  checked: boolean;
  /** True when auto-check logic determined this task is complete from app data. */
  autoChecked?: boolean;
  /** True when the user has manually overridden the auto-check state. */
  manualOverride?: boolean;
}

export const DEFAULT_CHECKLIST_TASKS: ChecklistTask[] = [
  {
    id: 'pricing-economics',
    label: 'Product pricing and unit economics reviewed',
    description: 'Verify your margins and contribution per order',
    priority: 'High',
    suggestion: 'Run the Launch Simulator to verify margins',
    checked: false,
  },
  {
    id: 'product-page-images',
    label: 'Product page and product images ready',
    description: 'Ensure visual assets are complete and optimized',
    priority: 'High',
    suggestion: 'Ensure high-quality images and clear descriptions',
    checked: false,
  },
  {
    id: 'shipping-fulfillment',
    label: 'Shipping and fulfillment policy confirmed',
    description: 'Confirm delivery timelines and costs with partners',
    priority: 'High',
    suggestion: 'Confirm delivery timelines and costs',
    checked: false,
  },
  {
    id: 'returns-refund-policy',
    label: 'Returns and refund policy confirmed',
    description: 'Have a clear, customer-friendly returns process',
    priority: 'Medium',
    suggestion: 'Draft a clear, customer-friendly returns policy',
    checked: false,
  },
  {
    id: 'ad-creatives',
    label: 'Advertising creatives prepared',
    description: 'Design ad visuals and copy for campaigns',
    priority: 'High',
    suggestion: 'Prepare at least 3 ad creative variations',
    checked: false,
  },
  {
    id: 'target-audience',
    label: 'Target audience and campaign objective defined',
    description: 'Know who you are targeting and what success looks like',
    priority: 'High',
    suggestion: 'Define audience segments and campaign goals',
    checked: false,
  },
  {
    id: 'tracking-analytics',
    label: 'Tracking and analytics checked',
    description: 'Verify pixels and event tracking are working correctly',
    priority: 'Medium',
    suggestion: 'Verify pixel installation and event tracking',
    checked: false,
  },
  {
    id: 'testing-budget',
    label: 'Initial testing budget and success criteria decided',
    description: 'Set daily limits and define KPI targets for test phase',
    priority: 'Medium',
    suggestion: 'Set daily budget limits and KPI targets',
    checked: false,
  },
];

// Public landing page — TopNav + Overview + Footer, no sidebar, no auth required
function PublicLanding() {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [currency, setCurrency] = useState<string>(() => {
    if (userId) {
      return scopedGetRaw(STORAGE_KEYS.CURRENCY, userId, DEFAULT_CURRENCY);
    }
    return DEFAULT_CURRENCY;
  });

  // Sync currency when userId becomes available
  useEffect(() => {
    if (userId) {
      setCurrency(scopedGetRaw(STORAGE_KEYS.CURRENCY, userId, DEFAULT_CURRENCY));
    }
  }, [userId]);

  // For authenticated users, internal navigation goes to the dashboard.
  // For unauthenticated visitors, it goes to signup.
  const handlePublicNavigate = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth?tab=signup');
    }
  };

  const handleNewSimulation = () => {
    if (isAuthenticated) {
      navigate('/dashboard?page=simulator');
    } else {
      navigate('/auth?tab=signup');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" data-icod-id="src_app_tsx_public_landing">
      <TopNav
        onNewSimulation={handleNewSimulation}
        currency={currency}
        onCurrencyChange={setCurrency}
        data-icod-id="src_app_tsx_public_topnav" />
      <main className="flex-1 p-4 md:p-6 lg:p-8" data-icod-id="src_app_tsx_public_main">
        <div className="mx-auto max-w-7xl" data-icod-id="src_app_tsx_public_content">
          <Overview
            onNavigate={handlePublicNavigate}
            currency={currency}
            simulatorInputs={DEFAULT_SIMULATION_INPUTS}
            checklistCompletion={0}
            forcePublic
            data-icod-id="src_app_tsx_public_overview" />
        </div>
      </main>
      <Footer onNavigate={handlePublicNavigate} data-icod-id="src_app_tsx_public_footer" />
    </div>
  );
}

// Public section page — TopNav + content + Footer, no sidebar, no auth required
function PublicSectionPage({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [currency, setCurrency] = useState<string>(() => {
    // Read stored currency preference for authenticated users
    if (userId) {
      return scopedGetRaw(STORAGE_KEYS.CURRENCY, userId, DEFAULT_CURRENCY);
    }
    return DEFAULT_CURRENCY;
  });

  // Sync currency when userId becomes available (e.g., after checkAuth resolves)
  useEffect(() => {
    if (userId) {
      setCurrency(scopedGetRaw(STORAGE_KEYS.CURRENCY, userId, DEFAULT_CURRENCY));
    }
  }, [userId]);

  const handleNewSimulation = () => {
    navigate('/auth?tab=signup');
  };

  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      data-icod-id="src_app_tsx_e1dd">
      <TopNav
        onNewSimulation={handleNewSimulation}
        currency={currency}
        onCurrencyChange={setCurrency}
        data-icod-id="src_app_tsx_578c" />
      <main className="flex-1" data-icod-id="src_app_tsx_7879">
        {children}
      </main>
      <Footer data-icod-id="src_app_tsx_02f8" />
    </div>
  );
}

// Home router — shows public landing or authenticated dashboard
function HomePage() {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // While auth is being verified, show the public landing to avoid a blank page.
  // If the user turns out to be authenticated, React will re-render with the
  // dashboard once loading resolves. Public routes must never redirect to /auth.
  if (isAuthenticated && !loading) {
    return <DashboardContent data-icod-id="src_app_tsx_b299" />;
  }

  return <PublicLanding data-icod-id="src_app_tsx_504d" />;
}

// Main dashboard content wrapped in ProtectedRoute
function DashboardContent() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const userCreatedAt = useAppSelector((state) => state.auth.user?.createdAt ?? null);
  const { items: products, activeProductId, status: productsStatus } = useAppSelector((s) => s.products);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Read initial page from URL query param (e.g., /dashboard?page=scenarios)
  // or from the pathname for dedicated routes (e.g., /products → my-products)
  const initialPage = useMemo<PageId>(() => {
    // Check pathname-based routes first
    if (location.pathname === '/products') return 'my-products';
    const pageParam = searchParams.get('page');
    const validPages: PageId[] = ['overview', 'simulator', 'scenarios', 'checklist', 'insights', 'discovery', 'decision-engine', 'cod-calculator', 'saved-analyses', 'profit-tracker', 'my-products', 'team'];
    if (pageParam && validPages.includes(pageParam as PageId)) {
      return pageParam as PageId;
    }
    return 'overview';
  }, [searchParams, location.pathname]);
  
  const [activePage, setActivePage] = useState<PageId>(initialPage);
  
  // Initialize currency from scoped localStorage or default to PKR
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);

  // Initialize simulator inputs from scoped localStorage or defaults
  const [simulatorInputs, setSimulatorInputs] = useState<SimulationInputs>(DEFAULT_SIMULATION_INPUTS);

  // Initialize checklist tasks from scoped localStorage or defaults
  const [checklistTasks, setChecklistTasks] = useState<ChecklistTask[]>(DEFAULT_CHECKLIST_TASKS);

  // Manual overrides for auto-check: maps taskId → true (user unchecked an auto-checked task)
  // or false (user checked a non-auto task manually). Persisted separately from tasks.
  const [checklistOverrides, setChecklistOverrides] = useState<Record<string, boolean>>({});

  // Auto-check eligibility derived from product/simulation data
  const autoEligibility = useAutoCheckEligibility(simulatorInputs);

  // Onboarding state — shown once for brand-new accounts only
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Chunk 8 deployment date — accounts created before this are NOT eligible for onboarding
  const ONBOARDING_ELIGIBLE_DATE = new Date('2025-11-19T00:00:00Z');

  // Track whether we're syncing from product → simulator (to avoid loops)
  const syncingFromProduct = useRef(false);

  // Sync activePage with URL search param when it changes
  useEffect(() => {
    setActivePage(initialPage);
  }, [initialPage]);

  // Load user-scoped data when userId is available (handles migration from old keys)
  useEffect(() => {
    if (!userId) return;
    // Read main currency preference; fall back to pricing currency if main isn't set
    const storedCurrency = scopedGetRaw(STORAGE_KEYS.CURRENCY, userId, '');
    const storedPricingCurrency = scopedGetRaw(STORAGE_KEYS.PRICING_CURRENCY, userId, '');
    const resolvedCurrency = storedCurrency || storedPricingCurrency || DEFAULT_CURRENCY;
    setCurrency(resolvedCurrency);
    setChecklistTasks(
      scopedGetItem<ChecklistTask[]>(STORAGE_KEYS.CHECKLIST, userId, DEFAULT_CHECKLIST_TASKS)
    );
    setChecklistOverrides(
      scopedGetItem<Record<string, boolean>>(STORAGE_KEYS.CHECKLIST_OVERRIDES, userId, {})
    );

    // Check if onboarding has been completed (per-user scoped)
    const onboardingDone = scopedGetRaw(STORAGE_KEYS.ONBOARDING_DONE, userId, '');
    if (!onboardingDone) {
      // Only show onboarding for accounts created after Chunk 8 deployment
      // Pre-existing accounts are never shown the wizard
      const createdAtDate = userCreatedAt ? new Date(userCreatedAt) : null;
      const isEligible = createdAtDate && createdAtDate >= ONBOARDING_ELIGIBLE_DATE;
      if (isEligible) {
        setShowOnboarding(true);
      } else {
        // Mark as done for pre-existing accounts so they never see it
        scopedSetRaw(STORAGE_KEYS.ONBOARDING_DONE, userId, 'true');
      }
    }
  }, [userId, userCreatedAt]);

  // Load products from server when authenticated
  useEffect(() => {
    if (userId && productsStatus === 'idle') {
      dispatch(loadProducts());
    }
  }, [userId, productsStatus, dispatch]);

  // Derive simulator inputs from the active shared product
  const activeProduct = useMemo(
    () => products.find((p) => p._id === activeProductId) || null,
    [products, activeProductId]
  );

  // Sync active product → simulator inputs whenever the product changes
  useEffect(() => {
    if (!activeProduct) return;
    syncingFromProduct.current = true;
    setSimulatorInputs({
      productName: activeProduct.name,
      sellingPrice: activeProduct.sellingPrice,
      productCost: activeProduct.productCost,
      deliveryCost: activeProduct.deliveryCost,
      rtoShippingCost: simulatorInputs.rtoShippingCost || 200,
      otherVariableCosts: activeProduct.otherCosts,
      advertisingBudget: activeProduct.adBudget,
      expectedOrders: activeProduct.expectedOrders,
      deliverySuccessRate: 75,
    });
    // Reset flag after the state update batch completes
    requestAnimationFrame(() => {
      syncingFromProduct.current = false;
    });
  }, [activeProduct]);

  // When simulator inputs change AND it's not a product sync, push back to the active product
  const prevInputsRef = useRef(simulatorInputs);
  useEffect(() => {
    if (syncingFromProduct.current) {
      prevInputsRef.current = simulatorInputs;
      return;
    }
    if (!activeProductId) return;

    const prev = prevInputsRef.current;
    const changed =
      prev.productName !== simulatorInputs.productName ||
      prev.sellingPrice !== simulatorInputs.sellingPrice ||
      prev.productCost !== simulatorInputs.productCost ||
      prev.deliveryCost !== simulatorInputs.deliveryCost ||
      prev.otherVariableCosts !== simulatorInputs.otherVariableCosts ||
      prev.advertisingBudget !== simulatorInputs.advertisingBudget ||
      prev.expectedOrders !== simulatorInputs.expectedOrders;

    if (changed) {
      dispatch(editProduct({
        id: activeProductId,
        data: {
          name: simulatorInputs.productName,
          sellingPrice: simulatorInputs.sellingPrice,
          productCost: simulatorInputs.productCost,
          deliveryCost: simulatorInputs.deliveryCost,
          otherCosts: simulatorInputs.otherVariableCosts,
          adBudget: simulatorInputs.advertisingBudget,
          expectedOrders: simulatorInputs.expectedOrders,
        },
      }));
    }
    prevInputsRef.current = simulatorInputs;
  }, [simulatorInputs, activeProductId, dispatch]);

  // Merge auto-check eligibility with manual overrides to produce effective task list.
  // A task is checked if: (auto-eligible AND not manually unchecked) OR manually checked.
  const effectiveChecklistTasks = useMemo<ChecklistTask[]>(() => {
    return checklistTasks.map((task) => {
      const isAutoEligible = !!autoEligibility[task.id];
      const hasOverride = task.id in checklistOverrides;
      const overrideValue = checklistOverrides[task.id];

      let effectiveChecked: boolean;
      let isAutoChecked = false;
      let isManualOverride = false;

      if (hasOverride) {
        // User explicitly toggled this task — their choice wins
        effectiveChecked = overrideValue;
        isManualOverride = true;
        // If user re-checked an auto-eligible task, it's still auto-eligible but overridden
        if (overrideValue && isAutoEligible) {
          isAutoChecked = true;
        }
      } else {
        // No override — use auto-eligibility or stored checked state
        if (isAutoEligible) {
          effectiveChecked = true;
          isAutoChecked = true;
        } else {
          effectiveChecked = task.checked;
        }
      }

      return {
        ...task,
        checked: effectiveChecked,
        autoChecked: isAutoChecked && !isManualOverride,
        manualOverride: isManualOverride,
      };
    });
  }, [checklistTasks, autoEligibility, checklistOverrides]);

  // Calculate checklist completion percentage from effective tasks
  const checklistCompletion = useMemo(() => {
    if (effectiveChecklistTasks.length === 0) return 0;
    const completedCount = effectiveChecklistTasks.filter((t) => t.checked).length;
    return Math.round((completedCount / effectiveChecklistTasks.length) * 100);
  }, [effectiveChecklistTasks]);

  // Fire notification when readiness percentage changes (debounced)
  useReadinessNotifications(checklistCompletion);

  // Calculate simulation results from current inputs
  const simulationResults = useMemo<SimulationResults>(
    () => calculateSimulation(simulatorInputs),
    [simulatorInputs]
  );

  // Get incomplete checklist item labels for AI context
  const incompleteChecklistsItems = useMemo(
    () => effectiveChecklistTasks.filter((t) => !t.checked).map((t) => t.label),
    [effectiveChecklistTasks]
  );

  // Build full checklist state for AI grounding — includes label, checked status, and priority
  const checklistItemsState = useMemo(
    () => effectiveChecklistTasks.map((t) => ({ label: t.label, checked: t.checked, priority: t.priority })),
    [effectiveChecklistTasks]
  );

  // Persist currency to scoped localStorage when it changes
  useEffect(() => {
    scopedSetRaw(STORAGE_KEYS.CURRENCY, userId, currency);
    // Also sync to pricing currency so Pricing/Checkout stay in agreement
    scopedSetRaw(STORAGE_KEYS.PRICING_CURRENCY, userId, currency);
  }, [currency, userId]);

  // Persist simulator inputs to scoped localStorage when they change
  useEffect(() => {
    scopedSetItem(STORAGE_KEYS.SIMULATOR_INPUTS, userId, simulatorInputs);
  }, [simulatorInputs, userId]);

  // Persist checklist tasks to scoped localStorage when they change
  useEffect(() => {
    scopedSetItem(STORAGE_KEYS.CHECKLIST, userId, checklistTasks);
  }, [checklistTasks, userId]);

  // Persist checklist overrides to scoped localStorage when they change
  useEffect(() => {
    scopedSetItem(STORAGE_KEYS.CHECKLIST_OVERRIDES, userId, checklistOverrides);
  }, [checklistOverrides, userId]);

  // Persist active product ID to scoped localStorage when it changes
  useEffect(() => {
    if (activeProductId && userId) {
      scopedSetRaw('activeProductId', userId, activeProductId);
    }
  }, [activeProductId, userId]);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    // Also sync to pricing currency so Pricing/Checkout stay in agreement
    scopedSetRaw(STORAGE_KEYS.PRICING_CURRENCY, userId, newCurrency);
  };

  const handleSimulatorInputsChange = (newInputs: SimulationInputs) => {
    setSimulatorInputs(newInputs);
  };

  const handleChecklistTaskToggle = (taskId: string) => {
    // Find the effective state of this task (after auto-check merge)
    const effectiveTask = effectiveChecklistTasks.find((t) => t.id === taskId);
    if (!effectiveTask) return;

    const newChecked = !effectiveTask.checked;
    const isAutoEligible = !!autoEligibility[taskId];

    // Determine if this toggle creates or removes an override
    setChecklistOverrides((prev) => {
      const next = { ...prev };
      if (isAutoEligible) {
        if (newChecked) {
          // Re-checking an auto-eligible task that was manually unchecked → remove override
          delete next[taskId];
        } else {
          // Unchecking an auto-eligible task → record override as false
          next[taskId] = false;
        }
      } else {
        // Non-auto task: manual toggle
        if (newChecked !== DEFAULT_CHECKLIST_TASKS.find((t) => t.id === taskId)?.checked) {
          next[taskId] = newChecked;
        } else {
          // Back to default state → remove override
          delete next[taskId];
        }
      }
      return next;
    });

    // Also update the base checked state for non-auto tasks and persistence
    setChecklistTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, checked: newChecked } : task
      )
    );
  };

  // Add custom task to checklist
  const handleAddCustomTask = (taskData: Omit<ChecklistTask, 'id'>) => {
    const newTask: ChecklistTask = {
      ...taskData,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setChecklistTasks((prev) => [...prev, newTask]);
  };

  // Delete custom task from checklist
  const handleDeleteCustomTask = (taskId: string) => {
    setChecklistTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleChecklistReset = () => {
    const freshTasks: ChecklistTask[] = JSON.parse(JSON.stringify(
      DEFAULT_CHECKLIST_TASKS.map((t) => ({ ...t, checked: false }))
    ));
    setChecklistTasks(freshTasks);
    setChecklistOverrides({});
    scopedRemoveItem(STORAGE_KEYS.CHECKLIST, userId);
    scopedRemoveItem(STORAGE_KEYS.CHECKLIST_OVERRIDES, userId);
  };

  // Onboarding handlers
  const handleOnboardingComplete = (data: {
    name: string;
    sellingPrice: number;
    productCost: number;
    deliveryCost: number;
    otherCosts: number;
    adBudget: number;
    market: string;
    expectedOrders: number;
    category?: string;
  }) => {
    // Create a new product from onboarding data and set it as active
    dispatch(addProduct({
      name: data.name,
      sellingPrice: data.sellingPrice,
      productCost: data.productCost,
      deliveryCost: data.deliveryCost,
      otherCosts: data.otherCosts,
      adBudget: data.adBudget,
      market: data.market,
      expectedOrders: data.expectedOrders,
      category: data.category || 'Skincare',
    }));
    if (userId) {
      scopedSetRaw(STORAGE_KEYS.ONBOARDING_DONE, userId, 'true');
    }
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    if (userId) {
      scopedSetRaw(STORAGE_KEYS.ONBOARDING_DONE, userId, 'true');
    }
    setShowOnboarding(false);
  };

  // Load simulator analysis from saved
  const handleLoadSimulatorAnalysis = (analysis: SavedSimulatorAnalysis) => {
    setSimulatorInputs({
      productName: analysis.inputs.productName,
      sellingPrice: analysis.inputs.sellingPrice,
      productCost: analysis.inputs.productCost,
      deliveryCost: analysis.inputs.deliveryCost,
      rtoShippingCost: analysis.inputs.rtoShippingCost ?? 200,
      otherVariableCosts: analysis.inputs.otherVariableCosts,
      advertisingBudget: analysis.inputs.advertisingBudget,
      expectedOrders: analysis.inputs.expectedOrders,
      deliverySuccessRate: analysis.inputs.deliverySuccessRate ?? 75,
    });
    setActivePage('simulator');
  };

  // Load decision engine analysis - navigates to decision engine page
  const handleLoadDecisionEngineAnalysis = (_analysis: SavedCodAnalysis) => {
    setActivePage('decision-engine');
  };

  // Load scenario analysis - restores simulator inputs and navigates to scenarios
  const handleLoadScenariosAnalysis = (analysis: SavedScenarioAnalysis) => {
    // Restore the base simulator inputs that were used for the scenario comparison
    setSimulatorInputs((prev) => ({
      ...prev,
      sellingPrice: analysis.simulatorInputs.sellingPrice,
      productCost: analysis.simulatorInputs.productCost,
      deliveryCost: analysis.simulatorInputs.deliveryCost,
      rtoShippingCost: analysis.simulatorInputs.rtoShippingCost,
      otherVariableCosts: analysis.simulatorInputs.otherVariableCosts,
      productName: analysis.productName || prev.productName,
    }));
    // Restore scenario configs to scoped storage so Scenarios page picks them up
    if (userId) {
      const scenarioConfigs = analysis.scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        advertisingBudget: s.advertisingBudget,
        expectedOrders: s.expectedOrders,
        deliverySuccessRate: s.deliverySuccessRate,
        accentColor: s.id === 'conservative' ? 'indigo' as const : s.id === 'expected' ? 'violet' as const : s.id === 'optimistic' ? 'coral' as const : 'custom' as const,
        cardVariant: s.id === 'conservative' ? 'mint' as const : s.id === 'expected' ? 'lavender' as const : s.id === 'optimistic' ? 'cream' as const : 'default' as const,
        isCustom: s.id === 'custom' ? true : undefined,
      }));
      scopedSetItem(STORAGE_KEYS.SCENARIOS, userId, scenarioConfigs);
    }
    setActivePage('scenarios');
  };

  // Show onboarding flow if needed
  if (showOnboarding && productsStatus !== 'loading') {
    return (
      <Layout
        activePage={activePage}
        onNavigate={setActivePage}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        data-icod-id="src_app_tsx_e228">
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          data-icod-id="src_app_tsx_fd1c" />
      </Layout>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <Overview
            onNavigate={setActivePage}
            currency={currency}
            simulatorInputs={simulatorInputs}
            checklistCompletion={checklistCompletion}
            data-icod-id="src_app_tsx_0a78"
          />
        );
      case 'simulator':
        return (
          <LaunchSimulator
            currency={currency}
            onNavigate={setActivePage}
            inputs={simulatorInputs}
            onInputsChange={handleSimulatorInputsChange}
            data-icod-id="src_app_tsx_b4a6"
          />
        );
      case 'scenarios':
        return (
          <Scenarios
            currency={currency}
            simulatorInputs={simulatorInputs}
            onNavigate={setActivePage}
            data-icod-id="src_app_tsx_764b"
          />
        );
      case 'checklist':
        return (
          <ReadinessChecklist
            onNavigate={setActivePage}
            tasks={effectiveChecklistTasks}
            onTaskToggle={handleChecklistTaskToggle}
            onReset={handleChecklistReset}
            onAddCustomTask={handleAddCustomTask}
            onDeleteCustomTask={handleDeleteCustomTask}
            data-icod-id="src_app_tsx_07af"
          />
        );
      case 'insights':
        return (
          <AIInsights
            currency={currency}
            simulatorInputs={simulatorInputs}
            simulationResults={simulationResults}
            checklistCompletion={checklistCompletion}
            incompleteChecklistItems={incompleteChecklistsItems}
            checklistItems={checklistItemsState}
            data-icod-id="src_app_tsx_8894"
          />
        );
      case 'discovery':
        return (
          <ProductDiscovery
            currency={currency}
            onNavigate={setActivePage}
            simulatorInputs={simulatorInputs}
            onSimulatorInputsChange={handleSimulatorInputsChange}
            data-icod-id="src_app_tsx_discovery"
          />
        );
      case 'decision-engine':
        return (<LaunchDecisionEngine currency={currency} data-icod-id="src_app_tsx_a222" />);
      case 'cod-calculator':
        return (<CODCalculator currency={currency} onNavigate={setActivePage} data-icod-id="src_app_tsx_cod_calc" />);
      case 'saved-analyses':
        return (
          <SavedAnalyses
            currency={currency}
            onNavigate={setActivePage}
            onLoadSimulatorAnalysis={handleLoadSimulatorAnalysis}
            onLoadDecisionEngineAnalysis={handleLoadDecisionEngineAnalysis}
            onLoadScenariosAnalysis={handleLoadScenariosAnalysis}
            data-icod-id="src_app_tsx_saved_analyses"
          />
        );
      case 'profit-tracker':
        return (
          <ProfitTracker
            currency={currency}
            onNavigate={setActivePage}
            data-icod-id="src_app_tsx_5cba" />
        );
      case 'my-products':
        return (
          <MyProducts
            currency={currency}
            onNavigate={setActivePage}
            data-icod-id="src_app_tsx_my_products" />
        );
      case 'team':
        return (
          <Team
            data-icod-id="src_app_tsx_team" />
        );
      default:
        return (
          <Overview
            onNavigate={setActivePage}
            currency={currency}
            simulatorInputs={simulatorInputs}
            checklistCompletion={checklistCompletion}
            data-icod-id="src_app_tsx_e0ad"
          />
        );
    }
  };

  return (
    <Layout
      activePage={activePage}
      onNavigate={setActivePage}
      currency={currency}
      onCurrencyChange={handleCurrencyChange}
      data-icod-id="src_app_tsx_e228">
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);

  // Check auth status on app mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Reset in-memory product state whenever the authenticated user changes.
  // This prevents cross-account data leakage when switching accounts within
  // the same browser tab (login → logout → login as different user).
  // The previous userId ref tracks transitions so we only reset on actual changes,
  // not on initial mount when checkAuth populates the user for the first time.
  const prevUserIdRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      // Skip reset on the very first render — checkAuth hasn't resolved yet
      // and we don't want to wipe products before they're loaded.
      isInitialMountRef.current = false;
      prevUserIdRef.current = userId;
      return;
    }

    // If userId changed (including becoming null on logout or changing to a
    // different user), reset product state synchronously before any child
    // component renders with stale data.
    if (userId !== prevUserIdRef.current) {
      dispatch(resetProducts());
      prevUserIdRef.current = userId;
    }
  }, [userId, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth route */}
        <Route path="/auth" element={<Auth data-icod-id="src_app_tsx_3959" />} />
        
        {/* Home — public landing page for unauthenticated, dashboard for authenticated */}
        <Route path="/" element={<HomePage data-icod-id="src_app_tsx_d980" />} />

        {/* Dedicated public homepage — always shows the public landing regardless of auth state */}
        <Route path="/home" element={<PublicLanding data-icod-id="src_app_tsx_home_route" />} />

        {/* Public section pages */}
        <Route path="/how-it-works" element={<PublicSectionPage data-icod-id="src_app_tsx_de74"><HowItWorks data-icod-id="src_app_tsx_90ba" /></PublicSectionPage>} />
        <Route path="/about" element={<PublicSectionPage data-icod-id="src_app_tsx_8f87"><About data-icod-id="src_app_tsx_428a" /></PublicSectionPage>} />
        <Route path="/why-launchlens" element={<PublicSectionPage data-icod-id="src_app_tsx_4382"><WhyLaunchLens data-icod-id="src_app_tsx_ca26" /></PublicSectionPage>} />
        <Route path="/features" element={<PublicSectionPage data-icod-id="src_app_tsx_d8ff"><Features data-icod-id="src_app_tsx_9157" /></PublicSectionPage>} />
        <Route path="/demo" element={<PublicSectionPage data-icod-id="src_app_tsx_4359"><Demo data-icod-id="src_app_tsx_6c51" /></PublicSectionPage>} />
        <Route path="/faq" element={<PublicSectionPage data-icod-id="src_app_tsx_6a4d"><FAQ data-icod-id="src_app_tsx_290c" /></PublicSectionPage>} />
        <Route path="/contact" element={<PublicSectionPage data-icod-id="src_app_tsx_47ce"><Contact data-icod-id="src_app_tsx_ee57" /></PublicSectionPage>} />
        <Route path="/pricing" element={<PublicSectionPage data-icod-id="src_app_tsx_ff41"><Pricing data-icod-id="src_app_tsx_a1cf" /></PublicSectionPage>} />
        <Route path="/privacy" element={<PublicSectionPage data-icod-id="src_app_tsx_privacy"><PrivacyPolicy data-icod-id="src_app_tsx_privacy_page" /></PublicSectionPage>} />
        <Route path="/terms" element={<PublicSectionPage data-icod-id="src_app_tsx_terms"><TermsOfService data-icod-id="src_app_tsx_terms_page" /></PublicSectionPage>} />
        
        {/* Protected routes - internal pages require authentication */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute data-icod-id="src_app_tsx_checkout_protected">
              <PublicSectionPage data-icod-id="src_app_tsx_checkout_layout">
                <Checkout data-icod-id="src_app_tsx_checkout_page" />
              </PublicSectionPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute data-icod-id="src_app_tsx_102f">
              <DashboardContent data-icod-id="src_app_tsx_fff7" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute data-icod-id="src_app_tsx_products_protected">
              <DashboardContent data-icod-id="src_app_tsx_products_content" />
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
