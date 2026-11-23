import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calculator,
  GitCompare,
  CheckSquare,
  BrainCircuit,
  Menu,
  X,
  Compass,
  Scale,
  Shield,
  FolderOpen,
  CreditCard,
  Settings,
  Truck,
  TrendingUp,
  Home,
  Package,
  Users,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCurrentSubscription } from '@/store/slices/subscriptionSlice';
import LaunchLensLogo, { LaunchLensIcon } from './LaunchLensLogo';
import LanguageToggle from './LanguageToggle';
import CurrencySelector from './CurrencySelector';
import { useTranslation } from '@/utils/i18n';
import { useNavigate } from 'react-router-dom';

export type PageId =
  | 'overview'
  | 'simulator'
  | 'scenarios'
  | 'checklist'
  | 'insights'
  | 'discovery'
  | 'decision-engine'
  | 'cod-calculator'
  | 'saved-analyses'
  | 'profit-tracker'
  | 'my-products'
  | 'team';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'simulator', label: 'Launch Simulator', icon: Calculator },
  { id: 'decision-engine', label: 'Decision Engine', icon: Scale },
  { id: 'scenarios', label: 'Scenarios', icon: GitCompare },
  { id: 'cod-calculator', label: 'COD/RTO Calculator', icon: Truck },
  { id: 'checklist', label: 'Readiness Checklist', icon: CheckSquare },
  { id: 'insights', label: 'AI Insights', icon: BrainCircuit },
  { id: 'discovery', label: 'Product Discovery', icon: Compass },
  { id: 'my-products', label: 'My Products', icon: Package },
  { id: 'saved-analyses', label: 'Saved Analyses', icon: FolderOpen },
  { id: 'profit-tracker', label: 'Profit Tracker', icon: TrendingUp },
  { id: 'team', label: 'Team', icon: Users },
];

// Translation keys for nav items (same as label values)
const NAV_TRANSLATION_KEYS: Record<string, string> = {
  'overview': 'Dashboard',
  'simulator': 'Launch Simulator',
  'decision-engine': 'Decision Engine',
  'scenarios': 'Scenarios',
  'cod-calculator': 'COD/RTO Calculator',
  'checklist': 'Readiness Checklist',
  'insights': 'AI Insights',
  'discovery': 'Product Discovery',
  'my-products': 'My Products',
  'saved-analyses': 'Saved Analyses',
  'profit-tracker': 'Profit Tracker',
  'team': 'Team',
};

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  basic: 'Basic',
  standard: 'Standard',
  business: 'Business',
};

const STATUS_LABELS: Record<string, string> = {
  pending_setup: 'Payment Pending',
  active: 'Active',
  cancelled: 'Cancelled',
};

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onManageSubscription?: () => void;
  currency?: string;
  onCurrencyChange?: (currencyCode: string) => void;
  className?: string;
}

export default function Sidebar({ activePage, onNavigate, onManageSubscription, currency, onCurrencyChange, className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { subscription } = useAppSelector((state) => state.subscription);
  const { t } = useTranslation();

  // Fetch subscription when user is available
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCurrentSubscription());
    }
  }, [user?.id, dispatch]);

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      } else if (window.innerWidth < 1024) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (pageId: PageId) => {
    onNavigate(pageId);
    setIsMobileOpen(false);
  };

  const sidebarWidth = isMobileOpen ? 'w-[15rem]' : isCollapsed ? 'w-16' : 'w-[15rem]';
  // When the mobile drawer is open, always show labels even if collapsed
  const showLabels = isMobileOpen || !isCollapsed;

  // Determine plan display info
  const planName = subscription ? PLAN_DISPLAY_NAMES[subscription.plan] || subscription.plan : 'Basic';
  const statusLabel = subscription ? STATUS_LABELS[subscription.status] || '' : '';
  const billingCycleLabel = subscription?.billingCycle === 'yearly' ? t('Yearly') : t('Monthly');

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={cn(
          'fixed left-4 top-4 z-50 rounded-lg p-2 text-white shadow-lg md:hidden',
          'transition-all duration-200 hover:bg-white/10'
        )}
        style={{ background: '#201034' }}
        aria-label="Toggle menu"
        data-icod-id="src_components_sidebar_tsx_a5e7">
        {isMobileOpen ? <X className="h-6 w-6" data-icod-id="src_components_sidebar_tsx_f2d2" /> : <Menu className="h-6 w-6" data-icod-id="src_components_sidebar_tsx_4458" />}
      </button>
      {/* Sidebar overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          data-icod-id="src_components_sidebar_tsx_594e" />
      )}
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-dvh flex-col overflow-hidden border-r border-white/[0.06] transition-all duration-200 ease-in-out md:h-screen',
          sidebarWidth,
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
        style={{ background: 'linear-gradient(180deg, #1e0e30 0%, #281440 50%, #1e0e30 100%)' }}
        data-icod-id="src_components_sidebar_tsx_42c7">
        {/* Gold left-edge stripe */}
        <div
          className="absolute left-0 top-0 h-full w-[2px]"
          style={{ background: 'linear-gradient(180deg, #D4A843 0%, #F0D78C 50%, #D4A843 100%)' }}
          data-icod-id="src_components_sidebar_tsx_gold_stripe" />
        <div
          className="flex min-h-0 flex-1 flex-col"
          data-icod-id="src_components_sidebar_tsx_c4f9">
          {/* Logo area */}
          <div
            className="flex h-16 shrink-0 items-center gap-3 px-4 pt-2"
            data-icod-id="src_components_sidebar_tsx_7fde">
            {/* Use LaunchLensLogo component for consistent branding */}
            {!showLabels ? (
              <LaunchLensIcon
                size={32}
                className="mx-auto"
                data-icod-id="src_components_sidebar_tsx_2e17" />
            ) : (
              <LaunchLensLogo size={40} theme="dark" data-icod-id="src_components_sidebar_tsx_b3f6" />
            )}
          </div>

          {/* Scrollable content area — nav + footer combined so footer is reachable via scroll */}
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin"
            style={{ WebkitOverflowScrolling: 'touch' }}
            data-icod-id="src_components_sidebar_tsx_scrollable_content">
            {/* Navigation */}
            <nav
              className="mt-6 space-y-0.5 px-2.5"
              data-icod-id="src_components_sidebar_tsx_3b4b">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;
                const displayLabel = t(NAV_TRANSLATION_KEYS[item.id] || item.label);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all duration-150 ease-in-out',
                      !showLabels && 'justify-center px-2'
                    )}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(240, 215, 140, 0.12) 100%)',
                      color: '#FFFFFF',
                    } : {
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                      }
                    }}
                    title={!showLabels ? displayLabel : undefined}
                    data-icod-id={`src_components_sidebar_tsx_089d_${item.id}`}>
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-[#D4AF37]"
                        data-icod-id={`src_components_sidebar_tsx_active_bar_${item.id}`} />
                    )}
                    <Icon
                      className="h-[18px] w-[18px] shrink-0 transition-colors duration-150"
                      style={{ color: isActive ? '#F0D78C' : 'rgba(255, 255, 255, 0.55)' }}
                      data-icod-id={`src_components_sidebar_tsx_1922_${item.id}`} />
                    {showLabels && (
                      <span
                        className={cn(
                          'truncate text-[13px] font-medium tracking-wide',
                          isActive && 'text-white'
                        )}
                        data-icod-id={`src_components_sidebar_tsx_1b4a_${item.id}`}>{displayLabel}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div
              className="border-t border-white/[0.06] p-3"
              data-icod-id="src_components_sidebar_tsx_f55b">
              {/* Language & Currency controls — visible in mobile drawer and expanded sidebar */}
              {showLabels && (
                <div
                  className="mb-2.5 flex flex-col gap-1 rounded-lg bg-white/[0.03] px-2 py-2"
                  data-icod-id="src_components_sidebar_tsx_lang_currency_row">
                  <LanguageToggle
                    className="w-full justify-center border-white/20 bg-white/10 text-xs text-white hover:border-white/40 hover:bg-white/20"
                    data-icod-id="src_components_sidebar_tsx_lang_toggle" />
                  {currency && onCurrencyChange && (
                    <CurrencySelector
                      value={currency}
                      onChange={onCurrencyChange}
                      className="w-full"
                      data-icod-id="src_components_sidebar_tsx_currency_sel" />
                  )}
                </div>
              )}
              {/* Enhanced Plan status indicator */}
              {showLabels && (
                <div
                  className="mb-2.5 space-y-1.5 rounded-lg bg-white/[0.03] px-3 py-2.5"
                  data-icod-id="src_components_sidebar_tsx_bfa4">
                  <div
                    className="flex items-center gap-2"
                    data-icod-id="src_components_sidebar_tsx_6c4d">
                    <CreditCard
                      className="h-3.5 w-3.5 text-[#D8B779]"
                      data-icod-id="src_components_sidebar_tsx_f710" />
                    <span
                      className="truncate text-xs font-semibold tracking-wide text-white/90"
                      data-icod-id="src_components_sidebar_tsx_plan_name">
                      {planName}
                    </span>
                  </div>
                  {subscription && (
                    <div
                      className="space-y-0.5 pl-5"
                      data-icod-id="src_components_sidebar_tsx_3db3">
                      <p
                        className="text-[11px] text-white/50"
                        data-icod-id="src_components_sidebar_tsx_billing_cycle">
                        {billingCycleLabel}
                      </p>
                      <p
                        className={cn(
                          'text-[11px] font-medium',
                          subscription.status === 'active' ? 'text-[#9DDCC5]' :
                          subscription.status === 'cancelled' ? 'text-red-400' :
                          'text-[#D8B779]'
                        )}
                        data-icod-id="src_components_sidebar_tsx_status_label">
                        {statusLabel}
                      </p>
                      {subscription.status === 'pending_setup' ? (
                        <p
                          className="text-[11px] text-[#D8B779]/80"
                          data-icod-id="src_components_sidebar_tsx_next_billing_pending">
                          Pending payment setup
                        </p>
                      ) : subscription.nextBillingDate && subscription.status !== 'cancelled' ? (
                        <p
                          className="text-[11px] text-white/40"
                          data-icod-id="src_components_sidebar_tsx_next_billing">
                          Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString('en-PK')}
                        </p>
                      ) : null}
                    </div>
                  )}
                  {/* Manage Subscription link */}
                  {onManageSubscription && (
                    <button
                      onClick={onManageSubscription}
                      className="mt-0.5 flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"
                      data-icod-id="src_components_sidebar_tsx_manage_sub_btn">
                      <Settings className="h-3 w-3" data-icod-id="src_components_sidebar_tsx_manage_icon" />
                      {t('Manage Subscription')}
                    </button>
                  )}
                </div>
              )}
              {/* Collapsed plan indicator */}
              {!showLabels && (
                <div
                  className="mb-2.5 flex justify-center"
                  title={`${planName} — ${statusLabel || 'Free'}`}
                  data-icod-id="src_components_sidebar_tsx_collapsed_plan">
                  <CreditCard
                    className={cn(
                      'h-4 w-4',
                      subscription?.status === 'active' ? 'text-[#9DDCC5]' :
                      subscription?.status === 'cancelled' ? 'text-red-400' :
                      'text-[#D8B779]'
                    )}
                    data-icod-id="src_components_sidebar_tsx_collapsed_plan_icon" />
                </div>
              )}
              {/* Admin Panel link - only for admin users */}
              {user?.role === 'admin' && showLabels && (
                <button
                  onClick={() => handleNavClick('overview')}
                  className="mb-2.5 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 transition-all duration-150 hover:bg-white/[0.06] hover:text-white/90"
                  data-icod-id="src_components_sidebar_tsx_29fc">
                  <Shield className="h-3.5 w-3.5" data-icod-id="src_components_sidebar_tsx_2bc1" />
                  <span data-icod-id="src_components_sidebar_tsx_d8e9">{t('Admin Panel')}</span>
                </button>
              )}
              <div
                className={cn('flex items-center gap-2.5', !showLabels && 'justify-center')}
                data-icod-id="src_components_sidebar_tsx_6fd5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#DE85E2] to-[#EACAA1]"
                  data-icod-id="src_components_sidebar_tsx_5149">
                  <span
                    className="text-xs font-bold text-white"
                    data-icod-id="src_components_sidebar_tsx_4ca9">
                    {user ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                {showLabels && (
                  <div
                    className="overflow-hidden"
                    data-icod-id="src_components_sidebar_tsx_9393">
                    <p
                      className="truncate text-[13px] font-medium text-white/90"
                      data-icod-id="src_components_sidebar_tsx_1e67">
                      {user?.name || 'User'}
                    </p>
                    <p
                      className="truncate text-[11px] text-white/40"
                      data-icod-id="src_components_sidebar_tsx_6681">
                      {user?.role === 'admin' ? 'Administrator' : 'Member'}
                    </p>
                  </div>
                )}
              </div>
              {/* Go to homepage — always reachable via scroll */}
              {showLabels && (
                <button
                  onClick={() => { setIsMobileOpen(false); navigate('/home'); }}
                  className="mt-2.5 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 transition-all duration-150 hover:bg-white/[0.06] hover:text-white/90"
                  data-icod-id="src_components_sidebar_tsx_go_homepage">
                  <Home className="h-3.5 w-3.5" data-icod-id="src_components_sidebar_tsx_home_icon" />
                  <span data-icod-id="src_components_sidebar_tsx_home_label">{t('Go to homepage')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
      {/* Spacer to push content when sidebar is visible on desktop */}
      <div
        className={cn('hidden md:block', sidebarWidth)}
        data-icod-id="src_components_sidebar_tsx_58e3" />
    </>
  );
}
