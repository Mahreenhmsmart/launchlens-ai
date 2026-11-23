import { ReactNode, useState } from 'react';
import Sidebar, { type PageId } from './Sidebar';
import TopNav from './TopNav';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import ManageSubscription from './ManageSubscription';
import { cn } from '@/utils/cn';

interface LayoutProps {
  children: ReactNode;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  currency: string;
  onCurrencyChange: (currencyCode: string) => void;
  className?: string;
}

export default function Layout({ children, activePage, onNavigate, currency, onCurrencyChange, className }: LayoutProps) {
  const [showManageSubscription, setShowManageSubscription] = useState(false);

  const handleNewSimulation = () => {
    onNavigate('simulator');
  };

  return (
    <div
      className="flex min-h-screen w-full overflow-x-hidden bg-background"
      data-icod-id="src_components_layout_tsx_38d0">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        onManageSubscription={() => setShowManageSubscription(true)}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
        data-icod-id="src_components_layout_tsx_806c" />
      <div
        className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden"
        data-icod-id="src_components_layout_tsx_9c91">
        <TopNav
          onNewSimulation={handleNewSimulation}
          currency={currency}
          onCurrencyChange={onCurrencyChange}
          data-icod-id="src_components_layout_tsx_df93" />

        <main
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden p-4 transition-all duration-200 sm:p-5 md:p-6 lg:p-8',
            className
          )}
          data-icod-id="src_components_layout_tsx_5222">
          <div
            className="mx-auto w-full max-w-[80rem]"
            data-icod-id="src_components_layout_tsx_b739">{children}</div>
        </main>

        {/* Footer with logo */}
        <Footer onNavigate={onNavigate} data-icod-id="src_components_layout_tsx_footer" />
      </div>
      {/* Floating WhatsApp chat button — visible on all pages */}
      <WhatsAppButton data-icod-id="src_components_layout_tsx_fe00" />
      {/* Manage Subscription Modal */}
      <ManageSubscription
        open={showManageSubscription}
        onClose={() => setShowManageSubscription(false)}
        data-icod-id="src_components_layout_tsx_manage_sub_modal" />
    </div>
  );
}
