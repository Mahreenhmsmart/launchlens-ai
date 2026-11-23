import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/utils/i18n';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'What is LaunchLens AI and how does it work?',
    answer: 'LaunchLens AI is a product launch intelligence platform that helps e-commerce entrepreneurs evaluate product viability before investing in advertising. It analyzes your unit economics, delivery risks, and market conditions to provide data-driven launch recommendations.',
  },
  {
    question: 'How does the Product Launch Decision Engine analyze my product?',
    answer: 'The Decision Engine evaluates multiple factors including your profit margins, competitive landscape, delivery success rates, and return risk. It combines these metrics into a comprehensive readiness score that tells you whether to launch, test further, or reconsider.',
  },
  {
    question: 'What is COD profitability and why does it matter?',
    answer: 'COD (Cash on Delivery) profitability accounts for the unique risks of cash-on-delivery markets where return rates and delivery failures directly impact your bottom line. Understanding true COD profitability prevents costly surprises from rejected deliveries and returns.',
  },
  {
    question: 'How are break-even CPA and ROAS calculated?',
    answer: 'Break-Even ROAS = (Delivery Rate \u00d7 Selling Price) / Expected Contribution per Placed Order. Break-Even CPA = Expected Contribution per Placed Order. The delivery rate appears in the ROAS formula because it determines how many placed orders actually result in delivered, paid orders \u2014 a lower delivery rate means fewer completed sales for the same ad spend, raising the minimum ROAS needed to break even.',
  },
  {
    question: 'Is my data secure and private?',
    answer: 'Yes, all data is processed securely and stored with industry-standard encryption. We never share your product information or business data with third parties. Your analysis results are visible only to your account.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_faq_tsx_8c4a">
      <div className="space-y-2 text-center" data-icod-id="src_pages_faq_tsx_79c8">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_faq_tsx_f730">{t('Frequently Asked Questions')}</h1>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_faq_tsx_e86b">
          {t('Everything you need to know about LaunchLens AI.')}
        </p>
      </div>
      <div
        className="mx-auto mt-10 max-w-3xl space-y-3 rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #FFF0F5 50%, #FFF5D2 100%)' }}
        data-icod-id="src_pages_faq_tsx_e2e2">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={cn(
                'overflow-hidden rounded-xl border transition-all duration-200',
                isOpen ? 'border-[#C9D0FC] shadow-md' : 'border-[#E8E0F0] shadow-sm hover:border-[#C9D0FC]/60'
              )}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              data-icod-id={`src_pages_faq_tsx_e006_${index}`}>
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[#F3EEFF]/50"
                aria-expanded={isOpen}
                data-icod-id={`src_pages_faq_tsx_e5b9_${index}`}>
                <span
                  className="pr-4 text-sm font-semibold"
                  style={{ color: '#201034' }}
                  data-icod-id={`src_pages_faq_tsx_21a2_${index}`}>{t(item.question)}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200',
                    isOpen ? 'rotate-180 text-[#DE85E2]' : 'text-[#C9D0FC]'
                  )}
                  data-icod-id={`src_pages_faq_tsx_c5f2_${index}`} />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-200 ease-in-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
                data-icod-id={`src_pages_faq_tsx_f9ca_${index}`}>
                <div
                  className="overflow-hidden"
                  data-icod-id={`src_pages_faq_tsx_5e42_${index}`}>
                  <p
                    className="px-4 pb-4 text-sm leading-relaxed text-[#333]"
                    data-icod-id={`src_pages_faq_tsx_f54e_${index}`}>
                    {t(item.answer)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
