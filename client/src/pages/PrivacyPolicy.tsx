import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Cookie, Trash2, Mail } from 'lucide-react';
import { Card } from '@/components/ui';
import { CONTACT_EMAIL } from '@/utils/contact';

export default function PrivacyPolicy() {
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_privacypolicy_tsx_root">
      {/* Back link */}
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-[#555] transition-colors hover:text-[#201034]"
        data-icod-id="src_pages_privacypolicy_tsx_back">
        <ArrowLeft className="h-4 w-4" data-icod-id="src_pages_privacypolicy_tsx_c5b3" />
        Back to Home
      </Link>
      <div className="space-y-2 text-center" data-icod-id="src_pages_privacypolicy_tsx_header">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_privacypolicy_tsx_title">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#555]" data-icod-id="src_pages_privacypolicy_tsx_subtitle">
          Last updated: November 2026
        </p>
      </div>
      <div className="mt-10 space-y-6" data-icod-id="src_pages_privacypolicy_tsx_content">
        {/* Introduction */}
        <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_intro">
          <p
            className="text-sm leading-relaxed text-[#333]"
            data-icod-id="src_pages_privacypolicy_tsx_1607">
            LaunchLens AI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our product launch intelligence platform for e-commerce sellers.
          </p>
        </Card>

        {/* Data We Collect */}
        <Card className="relative overflow-hidden p-6" data-icod-id="src_pages_privacypolicy_tsx_data_collect">
          <div
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#C9D0FC]/10 blur-2xl"
            data-icod-id="src_pages_privacypolicy_tsx_13f4" />
          <div
            className="relative z-10 space-y-3"
            data-icod-id="src_pages_privacypolicy_tsx_613f">
            <div
              className="inline-flex rounded-xl bg-[#C9D0FC]/20 p-3"
              data-icod-id="src_pages_privacypolicy_tsx_e6a0">
              <Database
                className="h-5 w-5 text-[#C9D0FC]"
                data-icod-id="src_pages_privacypolicy_tsx_c38d" />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{ color: '#201034' }}
              data-icod-id="src_pages_privacypolicy_tsx_6231">
              Data We Collect
            </h2>
            <ul
              className="list-inside list-disc space-y-2 text-sm leading-relaxed text-[#333]"
              data-icod-id="src_pages_privacypolicy_tsx_5933">
              <li data-icod-id="src_pages_privacypolicy_tsx_cc55"><strong data-icod-id="src_pages_privacypolicy_tsx_2079">Account information:</strong> Your name, email address, and authentication credentials when you create an account.</li>
              <li data-icod-id="src_pages_privacypolicy_tsx_3075"><strong data-icod-id="src_pages_privacypolicy_tsx_813e">Product data:</strong> Product names, pricing, costs, delivery estimates, advertising budgets, and other details you enter into our analysis tools.</li>
              <li data-icod-id="src_pages_privacypolicy_tsx_d0f8"><strong data-icod-id="src_pages_privacypolicy_tsx_a7ee">Saved analyses:</strong> Simulator results, Decision Engine evaluations, and scenario comparisons that you choose to save.</li>
              <li data-icod-id="src_pages_privacypolicy_tsx_12cf"><strong data-icod-id="src_pages_privacypolicy_tsx_143a">Checklist state:</strong> Your launch readiness checklist progress and custom tasks.</li>
              <li data-icod-id="src_pages_privacypolicy_tsx_f5b7"><strong data-icod-id="src_pages_privacypolicy_tsx_75e2">Usage preferences:</strong> Currency selection and other display preferences.</li>
            </ul>
          </div>
        </Card>

        {/* How Data Is Stored */}
        <Card className="relative overflow-hidden p-6" data-icod-id="src_pages_privacypolicy_tsx_storage">
          <div
            className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#DE85E2]/10 blur-2xl"
            data-icod-id="src_pages_privacypolicy_tsx_1822" />
          <div
            className="relative z-10 space-y-3"
            data-icod-id="src_pages_privacypolicy_tsx_ef8e">
            <div
              className="inline-flex rounded-xl bg-[#DE85E2]/20 p-3"
              data-icod-id="src_pages_privacypolicy_tsx_07ae">
              <Shield
                className="h-5 w-5 text-[#DE85E2]"
                data-icod-id="src_pages_privacypolicy_tsx_e0d8" />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{ color: '#201034' }}
              data-icod-id="src_pages_privacypolicy_tsx_654d">
              How Your Data Is Stored
            </h2>
            <p
              className="text-sm leading-relaxed text-[#333]"
              data-icod-id="src_pages_privacypolicy_tsx_0d31">
              All saved data — including products, analyses, checklists, and preferences — is stored per-user and scoped exclusively to your authenticated account. Your data is never shared with, visible to, or accessible by other users. Server-side data is stored in encrypted databases, and local browser storage is keyed by your unique user ID to prevent cross-account access on shared devices.
            </p>
          </div>
        </Card>

        {/* No Sale of Data */}
        <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_no_sale">
          <h2
            className="text-lg font-semibold"
            style={{ color: '#201034' }}
            data-icod-id="src_pages_privacypolicy_tsx_feef">
            No Sale of Personal Data
          </h2>
          <p
            className="mt-2 text-sm leading-relaxed text-[#333]"
            data-icod-id="src_pages_privacypolicy_tsx_895e">
            We do not sell, rent, or trade your personal data to third parties. Your product data and analyses are used solely to provide the LaunchLens AI service to you. We may use anonymized, aggregated usage statistics to improve the platform, but these never include personally identifiable information or individual product data.
          </p>
        </Card>

        {/* Cookies & Local Storage */}
        <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_cookies">
          <div
            className="flex items-start gap-3"
            data-icod-id="src_pages_privacypolicy_tsx_518d">
            <Cookie
              className="mt-0.5 h-5 w-5 shrink-0 text-[#D4A574]"
              data-icod-id="src_pages_privacypolicy_tsx_98c8" />
            <div className="space-y-2" data-icod-id="src_pages_privacypolicy_tsx_a4fe">
              <h2
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_privacypolicy_tsx_eacd">
                Cookies &amp; Local Storage
              </h2>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_privacypolicy_tsx_e713">
                We use browser local storage to persist your session token (for staying logged in), currency preference, simulator inputs, checklist state, and other UI preferences. These are essential for the service to function correctly. We do not use tracking cookies or third-party analytics scripts that profile your browsing behaviour.
              </p>
            </div>
          </div>
        </Card>

        {/* Data Deletion */}
        <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_deletion">
          <div
            className="flex items-start gap-3"
            data-icod-id="src_pages_privacypolicy_tsx_0fe1">
            <Trash2
              className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              data-icod-id="src_pages_privacypolicy_tsx_2d2d" />
            <div className="space-y-2" data-icod-id="src_pages_privacypolicy_tsx_b698">
              <h2
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_privacypolicy_tsx_fce1">
                Data Deletion
              </h2>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_privacypolicy_tsx_b370">
                When you request account deletion via support, all data associated with your account — including products, saved analyses, checklists, and preferences — will be permanently deleted from our servers. Browser-local data can be cleared at any time through your browser settings. To request account deletion and data removal, contact us at the email below.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-br from-[#F3EEFF] to-[#FFF5D2] p-6" data-icod-id="src_pages_privacypolicy_tsx_contact">
          <div
            className="flex items-start gap-3"
            data-icod-id="src_pages_privacypolicy_tsx_001f">
            <Mail
              className="mt-0.5 h-5 w-5 shrink-0 text-[#201034]"
              data-icod-id="src_pages_privacypolicy_tsx_f287" />
            <div className="space-y-2" data-icod-id="src_pages_privacypolicy_tsx_80c4">
              <h2
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_privacypolicy_tsx_0a00">
                Contact Us
              </h2>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_privacypolicy_tsx_c635">
                If you have questions about this Privacy Policy or wish to exercise your data rights, please reach out to us at{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-[#201034] underline decoration-[#201034]/30 underline-offset-2 transition-colors hover:text-[#D4A574]"
                  data-icod-id="src_pages_privacypolicy_tsx_email_link">
                  {CONTACT_EMAIL}
                </a>.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
