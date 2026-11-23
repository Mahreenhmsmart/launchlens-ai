import { useState } from 'react';
import { Plus, LogOut, Menu, X, Tag, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import CurrencySelector from './CurrencySelector';
import LanguageToggle from './LanguageToggle';
import LaunchLensLogo, { LaunchLensTextLogo } from './LaunchLensLogo';
import NotificationBell from './NotificationBell';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { resetProducts } from '@/store/slices/productsSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/utils/i18n';

interface TopNavProps {
  onNewSimulation: () => void;
  currency: string;
  onCurrencyChange: (currencyCode: string) => void;
  className?: string;
}

export default function TopNav({ onNewSimulation, currency, onCurrencyChange, className }: TopNavProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = async () => {
    dispatch(resetProducts());
    await dispatch(logout());
    navigate('/', { replace: true });
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    navigate('/auth');
  };

  const handleGetStartedClick = () => {
    setMobileMenuOpen(false);
    navigate('/auth?tab=signup');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.06] px-3 shadow-[0_1px_3px_rgba(0,0,0,0.2)] sm:px-4 md:px-6 lg:px-8',
        className
      )}
      style={{ backgroundColor: '#201034' }}
      data-icod-id="src_components_topnav_tsx_8390">
      {/* Left side — Logo */}
      <div
        className="flex shrink-0 items-center gap-2 pl-12 pr-2 sm:gap-3 sm:pl-2 sm:pr-4 md:pl-0"
        data-icod-id="src_components_topnav_tsx_7c35">
        <button
          type="button"
          onClick={() => navigate(user ? '/home' : '/')}
          className="shrink-0 cursor-pointer"
          aria-label="Go to homepage"
          data-icod-id="src_components_topnav_tsx_a7d0">
          {/* Mobile: text fallback to avoid image clipping at narrow widths */}
          <LaunchLensTextLogo className="sm:hidden" data-icod-id="src_components_topnav_tsx_af73" />
          {/* Desktop: full image logo */}
          <LaunchLensLogo
            size={24}
            theme="light"
            className="hidden h-8 w-[116px] sm:block md:h-9 md:w-auto"
            data-icod-id="src_components_topnav_tsx_33a8" />
        </button>
      </div>
      {/* Right side actions */}
      <div
        className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2 md:gap-3"
        data-icod-id="src_components_topnav_tsx_6bed">
        {/* Authenticated controls */}
        {user && (
          <>
            <div
              className="hidden items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-1 md:flex"
              data-icod-id="src_components_topnav_tsx_1d40">
              <span
                className="text-sm font-medium text-white"
                data-icod-id="src_components_topnav_tsx_04e3">{user.name}</span>
              <span
                className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-xs font-medium text-[#F0D78C]"
                data-icod-id="src_components_topnav_tsx_2669">
                {user.role}
              </span>
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="sm"
              className="hidden gap-1.5 text-white/80 hover:bg-white/10 hover:text-white md:inline-flex"
              data-icod-id="src_components_topnav_tsx_dashboard_btn">
              <LayoutDashboard className="h-3.5 w-3.5" data-icod-id="src_components_topnav_tsx_dashboard_icon" />
              {t('Dashboard')}
            </Button>

            <NotificationBell className="hidden sm:block" data-icod-id="src_components_topnav_tsx_c3b3" />

            <CurrencySelector
              value={currency}
              onChange={onCurrencyChange}
              className="hidden sm:block"
              data-icod-id="src_components_topnav_tsx_8112" />

            <LanguageToggle
              className="hidden sm:inline-flex"
              data-icod-id="src_components_topnav_tsx_0b4a" />

            <Button
              onClick={() => navigate('/pricing')}
              variant="ghost"
              size="sm"
              className="hidden gap-1.5 text-white/80 hover:bg-white/10 hover:text-white lg:inline-flex"
              data-icod-id="src_components_topnav_tsx_26dd">
              <Tag className="h-3.5 w-3.5" data-icod-id="src_components_topnav_tsx_aff4" />
              {t('Pricing')}
            </Button>

            <Button
              onClick={onNewSimulation}
              size="sm"
              className="gap-1.5 whitespace-nowrap rounded-lg bg-white/90 px-2 py-1.5 text-[#171717] transition-all hover:bg-white sm:px-3 md:px-4"
              data-icod-id="src_components_topnav_tsx_26dd">
              <Plus
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                data-icod-id="src_components_topnav_tsx_9ad6" />
              <span
                className="hidden sm:inline"
                data-icod-id="src_components_topnav_tsx_bec1">{t('New Simulation')}</span>
            </Button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-white/70 hover:bg-white/10 hover:text-white sm:h-9 sm:w-9"
              aria-label="Logout"
              data-icod-id="src_components_topnav_tsx_7265">
              <LogOut
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                data-icod-id="src_components_topnav_tsx_03e4" />
            </Button>
          </>
        )}

        {/* Unauthenticated CTA buttons — desktop */}
        {!user && (
          <div
            className="hidden items-center gap-2 lg:flex"
            data-icod-id="src_components_topnav_tsx_a834">
            <LanguageToggle data-icod-id="src_components_topnav_tsx_5f96" />
            <Button
              onClick={() => navigate('/pricing')}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/80 hover:bg-white/10 hover:text-white"
              data-icod-id="src_components_topnav_tsx_1c6a">
              <Tag className="h-3.5 w-3.5" data-icod-id="src_components_topnav_tsx_cdc9" />
              {t('Pricing')}
            </Button>
            <Button
              onClick={handleLoginClick}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:bg-white/10 hover:text-white"
              data-icod-id="src_components_topnav_tsx_1c6a">
              {t('Login')}
            </Button>
            <Button
              onClick={handleGetStartedClick}
              size="sm"
              className="rounded-lg bg-[#D4AF37] px-4 text-[#171717] transition-all hover:bg-[#C9A430]"
              data-icod-id="src_components_topnav_tsx_266a">
              {t('Get Started Free')}
            </Button>
          </div>
        )}

        {/* Single mobile hamburger toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/10 sm:p-2 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          data-icod-id="src_components_topnav_tsx_88c1">
          {mobileMenuOpen ? <X className="h-5 w-5" data-icod-id="src_components_topnav_tsx_1a2f" /> : <Menu className="h-5 w-5" data-icod-id="src_components_topnav_tsx_0d56" />}
        </button>
      </div>
      {/* Mobile menu overlay — single menu, no duplicate hamburger */}
      {mobileMenuOpen && (
        <div
          className="absolute left-0 right-0 top-16 border-b border-white/[0.08] bg-[#201034] shadow-xl lg:hidden"
          data-icod-id="src_components_topnav_tsx_75a3">
          <div
            className="flex flex-col gap-0.5 p-3"
            data-icod-id="src_components_topnav_tsx_acf6">
            {/* Auth-dependent items */}
            {user ? (
              <>
                <div
                  className="flex items-center gap-2 px-4 py-2"
                  data-icod-id="src_components_topnav_tsx_7d8b">
                  <span
                    className="text-sm font-medium text-white"
                    data-icod-id="src_components_topnav_tsx_eaca">{user.name}</span>
                  <span
                    className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white"
                    data-icod-id="src_components_topnav_tsx_ef42">
                    {user.role}
                  </span>
                </div>
                <Button
                  onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                  variant="ghost"
                  className="mx-4 mt-1 justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white"
                  data-icod-id="src_components_topnav_tsx_mobile_dashboard_btn">
                  <LayoutDashboard className="h-4 w-4" data-icod-id="src_components_topnav_tsx_mobile_dashboard_icon" />
                  {t('Dashboard')}
                </Button>
                <div
                  className="flex items-center gap-2 px-4 py-2"
                  data-icod-id="src_components_topnav_tsx_04a8">
                  <CurrencySelector
                    value={currency}
                    onChange={onCurrencyChange}
                    data-icod-id="src_components_topnav_tsx_75ee" />
                  <LanguageToggle data-icod-id="src_components_topnav_tsx_b9bf" />
                  <NotificationBell data-icod-id="src_components_topnav_tsx_ecc3" />
                </div>
                <Button
                  onClick={() => { setMobileMenuOpen(false); onNewSimulation(); }}
                  size="md"
                  className="mx-4 mt-1 gap-2 bg-white/90 text-[#171717] hover:bg-white"
                  data-icod-id="src_components_topnav_tsx_7339">
                  <Plus className="h-4 w-4" data-icod-id="src_components_topnav_tsx_cb4d" />
                  {t('New Simulation')}
                </Button>
                <Button
                  onClick={() => { setMobileMenuOpen(false); navigate('/pricing'); }}
                  variant="ghost"
                  className="mx-4 mt-1 justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white"
                  data-icod-id="src_components_topnav_tsx_118a">
                  <Tag className="h-4 w-4" data-icod-id="src_components_topnav_tsx_ea7c" />
                  {t('Pricing')}
                </Button>
                <Button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  variant="ghost"
                  className="mx-4 mt-1 justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white"
                  data-icod-id="src_components_topnav_tsx_118a">
                  <LogOut className="h-4 w-4" data-icod-id="src_components_topnav_tsx_ddb8" />
                  {t('Logout')}
                </Button>
              </>
            ) : (
              <>
                <div
                  className="flex items-center gap-2 px-4 py-2"
                  data-icod-id="src_components_topnav_tsx_mobile_lang">
                  <LanguageToggle data-icod-id="src_components_topnav_tsx_432b" />
                </div>
                <Button
                  onClick={() => { setMobileMenuOpen(false); navigate('/pricing'); }}
                  variant="ghost"
                  className="mx-4 mt-1 justify-center gap-2 text-white/80 hover:bg-white/10 hover:text-white"
                  data-icod-id="src_components_topnav_tsx_2ac1">
                  <Tag className="h-4 w-4" data-icod-id="src_components_topnav_tsx_0cc5" />
                  {t('Pricing')}
                </Button>
                <Button
                  onClick={handleLoginClick}
                  variant="ghost"
                  className="mx-4 mt-1 justify-center text-white/80 hover:bg-white/10 hover:text-white"
                  data-icod-id="src_components_topnav_tsx_2ac1">
                  {t('Login')}
                </Button>
                <Button
                  onClick={handleGetStartedClick}
                  size="md"
                  className="mx-4 mt-1 bg-[#D4AF37] text-[#171717] hover:bg-[#C9A430]"
                  data-icod-id="src_components_topnav_tsx_473d">
                  {t('Get Started Free')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
