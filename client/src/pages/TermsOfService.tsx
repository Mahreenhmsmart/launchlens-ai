import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, User, CreditCard, RefreshCcw, AlertTriangle, Lock, Scale, Mail } from 'lucide-react';
import { Card } from '@/components/ui';
import { CONTACT_EMAIL } from '@/utils/contact';

export default function TermsOfService() {
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_termsofservice_tsx_root">
      {/* Back link */}
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-[#555] transition-colors hover:text-[#201034]"
        data-icod-id="src_pages_termsofservice_tsx_back">
        <ArrowLeft className="h-4 w-4" data-icod-id="src_pages_termsofservice_tsx_05f0" />
        Back to Home
      </Link>
      <div className="space-y-2 text-center" data-icod-id="src_pages_termsofservice_tsx_header">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_termsofservice_tsx_title">
          Terms of Service
        </h1>
        <p className="text-sm text-[#555]" data-icod-id="src_pages_termsofservice_tsx_subtitle">
          Last updated: November 2026
        </p>
      </div>
      <div className="mt-10 space-y-6" data-icod-id="src_pages_termsofservice_tsx_content">
        {/* Introduction */}
        <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_intro">
          <p
            className="text-sm leading-relaxed text-[#333]"
            data-icod-id="src_pages_termsofservice_tsx_3fd7">
            Welcome to LaunchLens AI. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our AI-powered e-commerce launch analysis platform. By creating an account or using LaunchLens AI, you agree to be bound by these Terms.
          </p>
        </Card>

        {/* Service Description */}
        <Card className="relative overflow-hidden p-6" data-icod-id="src_pages_termsofservice_tsx_service">
          <div
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#C9D0FC]/10 blur-2xl"
            data-icod-id="src_pages_termsofservice_tsx_fcf9" />
          <div
            className="relative z-10 space-y-3"
            data-icod-id="src_pages_termsofservice_tsx_a512">
            <div
              className="inline-flex rounded-xl bg-[#C9D0FC]/20 p-3"
              data-icod-id="src_pages_termsofservice_tsx_89c8">
              <FileText
                className="h-5 w-5 text-[#C9D0FC]"
                data-icod-id="src_pages_termsofservice_tsx_4b49" />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{ color: '#201034' }}
              data-icod-id="src_pages_termsofservice_tsx_779e">
              Service Description
            </h2>
            <p
              className="text-sm leading-relaxed text-[#333]"
              data-icod-id="src_pages_termsofservice_tsx_8d73">
              LaunchLens AI is a product launch intelligence platform that helps e-commerce sellers evaluate product viability, simulate profitability, assess delivery risks, and make data-driven launch decisions. The platform includes a Launch Simulator, Decision Engine, Scenario Planner, Readiness Checklist, Product Discovery, and AI Advisor tools.
            </p>
          </div>
        </Card>

        {/* Account Responsibilities */}
        <Card className="relative overflow-hidden p-6" data-icod-id="src_pages_termsofservice_tsx_account">
          <div
            className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#DE85E2]/10 blur-2xl"
            data-icod-id="src_pages_termsofservice_tsx_d05c" />
          <div
            className="relative z-10 space-y-3"
            data-icod-id="src_pages_termsofservice_tsx_9d6a">
            <div
              className="inline-flex rounded-xl bg-[#DE85E2]/20 p-3"
              data-icod-id="src_pages_termsofservice_tsx_0471">
              <User
                className="h-5 w-5 text-[#DE85E2]"
                data-icod-id="src_pages_termsofservice_tsx_5c2b" />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{ color: '#201034' }}
              data-icod-id="src_pages_termsofservice_tsx_1c3c">
              Account Responsibilities
            </h2>
            <ul
              className="list-inside list-disc space-y-2 text-sm leading-relaxed text-[#333]"
              data-icod-id="src_pages_termsofservice_tsx_ff50">
              <li data-icod-id="src_pages_termsofservice_tsx_e3ee">You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</li>
              <li data-icod-id="src_pages_termsofservice_tsx_c6c0">Each individual may register one personal account only. Additional accounts require written approval from LaunchLens AI for support, audit, or administrative purposes. Sharing accounts between multiple people is not permitted.</li>
              <li data-icod-id="src_pages_termsofservice_tsx_5ea8">You must provide accurate information during registration and keep your account details up to date.</li>
              <li data-icod-id="src_pages_termsofservice_tsx_90d1">You must notify us immediately if you suspect unauthorised access to your account.</li>
            </ul>
          </div>
        </Card>

        {/* Subscription Terms */}
        <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_subscription">
          <div
            className="flex items-start gap-3"
            data-icod-id="src_pages_termsofservice_tsx_1b53">
            <CreditCard
              className="mt-0.5 h-5 w-5 shrink-0 text-[#D4A574]"
              data-icod-id="src_pages_termsofservice_tsx_1ccf" />
            <div className="space-y-2" data-icod-id="src_pages_termsofservice_tsx_1fc4">
              <h2
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_termsofservice_tsx_3d8f">
                Subscription &amp; Billing
              </h2>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_termsofservice_tsx_d4b2">
                LaunchLens AI offers Standard and Business subscription plans, priced in Pakistani Rupees (PKR) and US Dollars (USD). Both monthly and yearly billing cycles are available. Yearly plans are billed as a single upfront payment for twelve months of service. Pricing is displayed on our Pricing page and may be updated from time to time; changes take effect at the start of your next billing cycle.
              </p>
            </div>
          </div>
        </Card>

        {/* Refund & Cancellation */}
        <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_refund">
          <div
            className="flex items-start gap-3"
            data-icod-id="src_pages_termsofservice_tsx_eeff">
            <RefreshCcw
              className="mt-0.5 h-5 w-5 shrink-0 text-[#D4A574]"
              data-icod-id="src_pages_termsofservice_tsx_e926" />
            <div className="space-y-2" data-icod-id="src_pages_termsofservice_tsx_4425">
              <h2
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_termsofservice_tsx_8d09">
                Cancellation &amp; Refunds
              </h2>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_termsofservice_tsx_16eb">
                You may cancel your subscription at any time from the Manage Subscription page in your dashboard. Upon cancellation, your access continues until the end of your current paid billing period. We do not issue refunds for partial billing periods — whether monthly or yearly. After the paid period ends, your account reverts to the free tier and premium features become inaccessible.
              </p>
            </div>
          </div>
        </Card>

        {/* Limitation of Liability */}
        <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_liability">
          <div
            className="flex items-start gap-3"
            data-icod-id="src_pages_termsofservice_tsx_706d">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-warning"
              data-icod-id="src_pages_termsofservice_tsx_6848" />
            <div className="space-y-2" data-icod-id="src_pages_termsofservice_tsx_37c1">
              <h2
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_termsofservice_tsx_827e">
                Limitation of Liability
              </h2>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_termsofservice_tsx_6678">
                LaunchLens AI provides analytical tools and AI-generated insights to support your decision-making. These insights are advisory in nature and do not constitute financial, legal, or business guarantees. Product launch outcomes depend on many factors beyond our analysis, including market conditions, execution quality, and external events. We are not liable for any financial losses, missed opportunities, or business decisions made based solely on our platform&apos;s output. Always conduct your own due diligence before investing in inventory or advertising.
              </p>
            </div>
          </div>
        </Card>

        {/* Intellectual Property */}
        <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_ip">
          <div
            className="flex items-start gap-3"
            data-icod-id="src_pages_termsofservice_tsx_6ed4">
            <Lock
              className="mt-0.5 h-5 w-5 shrink-0 text-[#201034]"
              data-icod-id="src_pages_termsofservice_tsx_0564" />
            <div className="space-y-2" data-icod-id="src_pages_termsofservice_tsx_12a8">
              <h2
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_termsofservice_tsx_1c92">
                Intellectual Property
              </h2>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_termsofservice_tsx_5144">
                All content, branding, logos, design elements, and software comprising the LaunchLens AI platform are the intellectual property of LaunchLens AI and are protected by applicable laws. AI-generated advice and analysis produced by the platform are provided for your personal business use and may not be resold, redistributed, or represented as your own proprietary methodology without written permission.
              </p>
            </div>
          </div>
        </Card>

        {/* Governing Law */}
        <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_law">
          <div
            className="flex items-start gap-3"
            data-icod-id="src_pages_termsofservice_tsx_a826">
            <Scale
              className="mt-0.5 h-5 w-5 shrink-0 text-[#201034]"
              data-icod-id="src_pages_termsofservice_tsx_ed03" />
            <div className="space-y-2" data-icod-id="src_pages_termsofservice_tsx_aa90">
              <h2
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_termsofservice_tsx_3369">
                Governing Law
              </h2>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_termsofservice_tsx_ad7c">
                These Terms shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising from or related to these Terms or your use of LaunchLens AI shall be subject to the exclusive jurisdiction of the courts in Pakistan.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-br from-[#F3EEFF] to-[#FFF5D2] p-6" data-icod-id="src_pages_termsofservice_tsx_contact">
          <div
            className="flex items-start gap-3"
            data-icod-id="src_pages_termsofservice_tsx_47e5">
            <Mail
              className="mt-0.5 h-5 w-5 shrink-0 text-[#201034]"
              data-icod-id="src_pages_termsofservice_tsx_ca31" />
            <div className="space-y-2" data-icod-id="src_pages_termsofservice_tsx_1c91">
              <h2
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_termsofservice_tsx_7cdd">
                Contact Us
              </h2>
              <p
                className="text-sm leading-relaxed text-[#333]"
                data-icod-id="src_pages_termsofservice_tsx_493b">
                For questions about these Terms of Service, please contact us at{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-[#201034] underline decoration-[#201034]/30 underline-offset-2 transition-colors hover:text-[#D4A574]"
                  data-icod-id="src_pages_termsofservice_tsx_email_link">
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
