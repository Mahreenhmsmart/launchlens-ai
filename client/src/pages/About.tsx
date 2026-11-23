import { Target, Globe } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslation } from '@/utils/i18n';

export default function About() {
  const { t } = useTranslation();

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_about_tsx_e566">
      <div className="space-y-2 text-center" data-icod-id="src_pages_about_tsx_b236">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_about_tsx_d04f">{t('About LaunchLens AI')}</h1>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_about_tsx_d7ec">
          {t('Built for e-commerce sellers who want to launch with confidence.')}
        </p>
      </div>
      <div
        className="mt-10 grid gap-8 md:grid-cols-2"
        data-icod-id="src_pages_about_tsx_02c7">
        <Card
          className="relative overflow-hidden p-8"
          data-icod-id="src_pages_about_tsx_d05a">
          <div
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#C9D0FC]/10 blur-2xl"
            data-icod-id="src_pages_about_tsx_dd5f" />
          <div
            className="relative z-10 space-y-4"
            data-icod-id="src_pages_about_tsx_8718">
            <div
              className="inline-flex rounded-xl bg-[#C9D0FC]/20 p-3"
              data-icod-id="src_pages_about_tsx_e06c">
              <Target
                className="h-6 w-6 text-[#C9D0FC]"
                data-icod-id="src_pages_about_tsx_ab68" />
            </div>
            <h3
              className="text-lg font-semibold"
              style={{ color: '#201034' }}
              data-icod-id="src_pages_about_tsx_7d49">What We Do</h3>
            <p
              className="text-sm leading-relaxed text-[#333]"
              data-icod-id="src_pages_about_tsx_73a6">
              LaunchLens AI is a product launch intelligence platform that helps e-commerce entrepreneurs
              evaluate product viability before investing in advertising. We combine unit economics analysis,
              delivery risk assessment, and market intelligence to provide data-driven launch recommendations
              tailored for COD (Cash on Delivery) markets.
            </p>
          </div>
        </Card>
        <Card
          className="relative overflow-hidden p-8"
          data-icod-id="src_pages_about_tsx_3dca">
          <div
            className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#DE85E2]/10 blur-2xl"
            data-icod-id="src_pages_about_tsx_0d25" />
          <div
            className="relative z-10 space-y-4"
            data-icod-id="src_pages_about_tsx_696a">
            <div
              className="inline-flex rounded-xl bg-[#DE85E2]/20 p-3"
              data-icod-id="src_pages_about_tsx_4c0e">
              <Globe
                className="h-6 w-6 text-[#DE85E2]"
                data-icod-id="src_pages_about_tsx_8be3" />
            </div>
            <h3
              className="text-lg font-semibold"
              style={{ color: '#201034' }}
              data-icod-id="src_pages_about_tsx_9e32">Who It&apos;s For</h3>
            <p
              className="text-sm leading-relaxed text-[#333]"
              data-icod-id="src_pages_about_tsx_f03e">
              Designed for Amazon sellers, Shopify store owners, and independent e-commerce businesses
              operating in markets with high COD adoption — especially Pakistan, South Asia, Middle East,
              and Latin America. Whether you are launching your first product or scaling an existing catalog,
              LaunchLens AI gives you the financial clarity to make confident decisions.
            </p>
          </div>
        </Card>
      </div>
      {/* Mission Section */}
      <div className="mt-12" data-icod-id="src_pages_about_tsx_076c">
        <Card
          className="relative overflow-hidden bg-gradient-to-br from-[#F3EEFF] to-[#FFF5D2] p-8"
          data-icod-id="src_pages_about_tsx_06cc">
          <div
            className="relative z-10 mx-auto max-w-3xl space-y-4 text-center"
            data-icod-id="src_pages_about_tsx_201e">
            <h3
              className="text-xl font-semibold"
              style={{ color: '#201034' }}
              data-icod-id="src_pages_about_tsx_55f0">Our Mission</h3>
            <p
              className="text-sm leading-relaxed text-[#333]"
              data-icod-id="src_pages_about_tsx_037d">
              We believe every e-commerce entrepreneur deserves access to the same level of financial
              analysis that large brands use. LaunchLens AI democratizes product launch intelligence,
              helping sellers avoid costly mistakes and focus their resources on products with the
              highest probability of success.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
