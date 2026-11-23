import { cn } from '@/utils/cn';
import { WHATSAPP_URL } from '@/utils/contact';
import LaunchLensLogo from './LaunchLensLogo';
import type { PageId } from './Sidebar';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/utils/i18n';

interface FooterProps {
  className?: string;
  onNavigate?: (page: PageId) => void;
}

// Map PageId → actual route so footer links always navigate to the correct
// tool page regardless of which public/private page the user is on.
// ProtectedRoute handles auth redirection for authenticated-only tools.

interface FooterLink {
  label: string;
  route: string;
  page?: PageId;
}

const toolsLinks: FooterLink[] = [
  { label: 'Product Discovery', route: '/dashboard?page=discovery', page: 'discovery' },
  { label: 'COD/RTO Calculator', route: '/dashboard?page=cod-calculator', page: 'cod-calculator' },
  { label: 'Launch Simulator', route: '/dashboard?page=simulator', page: 'simulator' },
  { label: 'Decision Engine', route: '/dashboard?page=decision-engine', page: 'decision-engine' },
  { label: 'Scenarios', route: '/dashboard?page=scenarios', page: 'scenarios' },
  { label: 'AI Insights', route: '/dashboard?page=insights', page: 'insights' },
  { label: 'Profit Tracker', route: '/dashboard?page=profit-tracker', page: 'profit-tracker' },
  { label: 'Readiness Checklist', route: '/dashboard?page=checklist', page: 'checklist' },
  { label: 'My Products', route: '/products', page: 'my-products' },
  { label: 'Saved Analyses', route: '/dashboard?page=saved-analyses', page: 'saved-analyses' },
];

const resourcesLinks: FooterLink[] = [
  { label: 'Features', route: '/features' },
  { label: 'Pricing', route: '/pricing' },
  { label: 'FAQ', route: '/faq' },
  { label: 'How It Works', route: '/how-it-works' },
  { label: 'Demo', route: '/demo' },
];

const companyLinks: FooterLink[] = [
  { label: 'About', route: '/about' },
  { label: 'Team', route: '/dashboard?page=team', page: 'team' },
  { label: 'Contact', route: '/contact' },
  { label: 'Why LaunchLens', route: '/why-launchlens' },
];

export default function Footer({ className, onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  const handleLinkClick = (page: PageId, route: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    // When no onNavigate callback is provided (public pages), we rely on
    // the <Link> wrapper to navigate to the tool route. ProtectedRoute
    // will redirect to /auth if the user is not logged in.
  };

  return (
    <footer
      className={cn(
        'py-12',
        className
      )}
      style={{ backgroundColor: '#201034' }}
      data-icod-id="src_components_footer_tsx_17eb">
      <div
        className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8"
        data-icod-id="src_components_footer_tsx_f767">
        <div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-5"
          data-icod-id="src_components_footer_tsx_a13b">
          {/* Logo and brand */}
          <div className="space-y-4 lg:col-span-2" data-icod-id="src_components_footer_tsx_30e5">
            <LaunchLensLogo size="md" theme="dark" data-icod-id="src_components_footer_tsx_1ab1" />
            <p
              className="text-xs leading-relaxed text-[#A0A0B0]"
              data-icod-id="src_components_footer_tsx_d334">
              Helping e-commerce entrepreneurs make smarter product launch decisions with data-driven insights.
            </p>
            {/* Contact info — moved here for cleaner layout */}
            <div className="space-y-2 pt-2" data-icod-id="src_components_footer_tsx_contact_block">
              <p
                className="text-sm text-[#A0A0B0]"
                data-icod-id="src_components_footer_tsx_b4b8">
                {t('Questions or feedback?')}{' '}
                <a
                  href="mailto:hello@launchlens.ai"
                  className="text-[#C4B5E0] underline decoration-[#C4B5E0]/30 underline-offset-2 transition-colors hover:text-[#D4A574]"
                  data-icod-id="src_components_footer_tsx_d9d5">
                  hello@launchlens.ai
                </a>
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-[#C4B5E0] underline decoration-[#C4B5E0]/30 underline-offset-2 transition-colors hover:text-[#D4A574]"
                data-icod-id="src_components_footer_tsx_whatsapp_link">
                {t('Chat on WhatsApp')}
              </a>
            </div>
          </div>

          {/* Tools */}
          <nav className="space-y-3" data-icod-id="src_components_footer_tsx_tools_nav">
            <h4
              className="text-xs font-semibold uppercase tracking-wide text-white"
              data-icod-id="src_components_footer_tsx_tools_heading">
              {t('Tools')}
            </h4>
            <ul className="space-y-2" data-icod-id="src_components_footer_tsx_tools_list">
              {toolsLinks.map((link) => (
                <li key={link.label} data-icod-id={`src_components_footer_tsx_tool_${link.label}`}>
                  <Link
                    to={onNavigate && link.page ? '#' : link.route}
                    onClick={(e) => {
                      if (onNavigate && link.page) {
                        e.preventDefault();
                        handleLinkClick(link.page, link.route);
                      }
                    }}
                    className="text-sm text-[#C4B5E0] transition-colors hover:text-[#D4A574]"
                    data-icod-id={`src_components_footer_tsx_tool_link_${link.label}`}>
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav className="space-y-3" data-icod-id="src_components_footer_tsx_resources_nav">
            <h4
              className="text-xs font-semibold uppercase tracking-wide text-white"
              data-icod-id="src_components_footer_tsx_resources_heading">
              {t('Resources')}
            </h4>
            <ul className="space-y-2" data-icod-id="src_components_footer_tsx_resources_list">
              {resourcesLinks.map((link) => (
                <li key={link.label} data-icod-id={`src_components_footer_tsx_res_${link.label}`}>
                  <Link
                    to={link.route}
                    className="text-sm text-[#C4B5E0] transition-colors hover:text-[#D4A574]"
                    data-icod-id={`src_components_footer_tsx_res_link_${link.label}`}>
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav className="space-y-3" data-icod-id="src_components_footer_tsx_company_nav">
            <h4
              className="text-xs font-semibold uppercase tracking-wide text-white"
              data-icod-id="src_components_footer_tsx_company_heading">
              {t('Company')}
            </h4>
            <ul className="space-y-2" data-icod-id="src_components_footer_tsx_company_list">
              {companyLinks.map((link) => (
                <li key={link.label} data-icod-id={`src_components_footer_tsx_co_${link.label}`}>
                  <Link
                    to={onNavigate && link.page ? '#' : link.route}
                    onClick={(e) => {
                      if (onNavigate && link.page) {
                        e.preventDefault();
                        handleLinkClick(link.page, link.route);
                      }
                    }}
                    className="text-sm text-[#C4B5E0] transition-colors hover:text-[#D4A574]"
                    data-icod-id={`src_components_footer_tsx_co_link_${link.label}`}>
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar with copyright */}
        <div
          className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 sm:flex-row"
          data-icod-id="src_components_footer_tsx_b67a">
          <p
            className="text-xs text-[#A0A0B0]"
            data-icod-id="src_components_footer_tsx_f17f">
            &copy; {currentYear} LaunchLens AI. {t('All rights reserved.')}
          </p>
          <div
            className="flex gap-4 text-xs text-[#A0A0B0]"
            data-icod-id="src_components_footer_tsx_a0c6">
            <Link
              to="/privacy"
              className="transition-colors hover:text-[#D4A574]"
              data-icod-id="src_components_footer_tsx_f821">
              {t('Privacy Policy')}
            </Link>
            <Link
              to="/terms"
              className="transition-colors hover:text-[#D4A574]"
              data-icod-id="src_components_footer_tsx_046b">
              {t('Terms of Service')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
