import { useState } from 'react';
import { Mail, MessageSquare, MapPin } from 'lucide-react';
import { Button, Card, Field, Input, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import { inputClass } from '@/components/ui/Input';
import apiClient from '@/services/apiClient';
import { useTranslation } from '@/utils/i18n';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post('/email/contact', {
        name: formState.name.trim(),
        email: formState.email.trim(),
        subject: formState.subject.trim(),
        message: formState.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-icod-id="src_pages_contact_tsx_0f67">
      <div
        className="space-y-2 text-center"
        data-icod-id="src_pages_contact_tsx_cf50">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: '#201034' }}
          data-icod-id="src_pages_contact_tsx_b8b2">{t('Contact Us')}</h1>
        <p
          className="text-sm text-[#555]"
          data-icod-id="src_pages_contact_tsx_6324">
          Have questions? We&apos;d love to hear from you.
        </p>
      </div>
      <div
        className="mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-2"
        data-icod-id="src_pages_contact_tsx_672b">
        {/* Contact Info */}
        <div className="space-y-6" data-icod-id="src_pages_contact_tsx_4580">
          <Card className="p-6" data-icod-id="src_pages_contact_tsx_ce8e">
            <div className="space-y-6" data-icod-id="src_pages_contact_tsx_71f1">
              <div
                className="flex items-start gap-4"
                data-icod-id="src_pages_contact_tsx_fa41">
                <div
                  className="rounded-xl bg-[#C9D0FC]/20 p-3"
                  data-icod-id="src_pages_contact_tsx_696c">
                  <Mail
                    className="h-6 w-6 text-[#C9D0FC]"
                    data-icod-id="src_pages_contact_tsx_703c" />
                </div>
                <div data-icod-id="src_pages_contact_tsx_6151">
                  <h3
                    className="font-semibold"
                    style={{ color: '#201034' }}
                    data-icod-id="src_pages_contact_tsx_c844">Email</h3>
                  <a
                    href="mailto:hello@launchlens.ai"
                    className="text-sm text-[#555] underline decoration-[#C9D0FC]/30 underline-offset-2 hover:text-[#DE85E2]"
                    data-icod-id="src_pages_contact_tsx_6097">
                    hello@launchlens.ai
                  </a>
                </div>
              </div>

              <div
                className="flex items-start gap-4"
                data-icod-id="src_pages_contact_tsx_edb4">
                <div
                  className="rounded-xl bg-[#DE85E2]/20 p-3"
                  data-icod-id="src_pages_contact_tsx_58a3">
                  <MessageSquare
                    className="h-6 w-6 text-[#DE85E2]"
                    data-icod-id="src_pages_contact_tsx_5934" />
                </div>
                <div data-icod-id="src_pages_contact_tsx_a7f9">
                  <h3
                    className="font-semibold"
                    style={{ color: '#201034' }}
                    data-icod-id="src_pages_contact_tsx_48be">Support</h3>
                  <p
                    className="text-sm text-[#333]"
                    data-icod-id="src_pages_contact_tsx_9be4">
                    Available Monday–Friday, 9 AM – 6 PM PKT
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-4"
                data-icod-id="src_pages_contact_tsx_859e">
                <div
                  className="rounded-xl bg-[#9DD37D]/20 p-3"
                  data-icod-id="src_pages_contact_tsx_d134">
                  <MapPin
                    className="h-6 w-6 text-[#9DD37D]"
                    data-icod-id="src_pages_contact_tsx_78b5" />
                </div>
                <div data-icod-id="src_pages_contact_tsx_9f39">
                  <h3
                    className="font-semibold"
                    style={{ color: '#201034' }}
                    data-icod-id="src_pages_contact_tsx_8b85">Location</h3>
                  <p
                    className="text-sm text-[#333]"
                    data-icod-id="src_pages_contact_tsx_fc1b">
                    Serving e-commerce sellers worldwide, focused on COD markets.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-6" data-icod-id="src_pages_contact_tsx_f001">
          {submitted ? (
            <div
              className="flex h-full flex-col items-center justify-center space-y-4 py-12 text-center"
              data-icod-id="src_pages_contact_tsx_efeb">
              <div
                className="rounded-full bg-[#9DD37D]/20 p-4"
                data-icod-id="src_pages_contact_tsx_8d23">
                <Mail
                  className="h-8 w-8 text-[#9DD37D]"
                  data-icod-id="src_pages_contact_tsx_cbfc" />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: '#201034' }}
                data-icod-id="src_pages_contact_tsx_8052">Message Sent!</h3>
              <p
                className="text-sm text-[#333]"
                data-icod-id="src_pages_contact_tsx_e4e6">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                data-icod-id="src_pages_contact_tsx_21ae">
                Send Another
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-icod-id="src_pages_contact_tsx_f7ce">
              {error && (
                <Alert variant="error" data-icod-id="src_pages_contact_tsx_err">{error}</Alert>
              )}
              <Field
                label="Name"
                htmlFor="contact-name"
                required
                data-icod-id="src_pages_contact_tsx_202b">
                <Input
                  id="contact-name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Your name"
                  required
                  disabled={loading}
                  data-icod-id="src_pages_contact_tsx_5104" />
              </Field>
              <Field
                label="Email"
                htmlFor="contact-email"
                required
                data-icod-id="src_pages_contact_tsx_6a8d">
                <Input
                  id="contact-email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  data-icod-id="src_pages_contact_tsx_7998" />
              </Field>
              <Field
                label="Subject"
                htmlFor="contact-subject"
                data-icod-id="src_pages_contact_tsx_subj">
                <Input
                  id="contact-subject"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  placeholder="What's this about?"
                  disabled={loading}
                  data-icod-id="src_pages_contact_tsx_subj_input" />
              </Field>
              <Field
                label="Message"
                htmlFor="contact-message"
                required
                data-icod-id="src_pages_contact_tsx_0e7b">
                <textarea
                  id="contact-message"
                  className={cn(inputClass('resize-none'), 'min-h-[120px]')}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="How can we help?"
                  required
                  disabled={loading}
                  data-icod-id="src_pages_contact_tsx_b31a" />
              </Field>
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                data-icod-id="src_pages_contact_tsx_7ef4">
                Send Message
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
