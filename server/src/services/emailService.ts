import nodemailer, { type Transporter } from 'nodemailer';
import {
  welcomeEmail,
  verificationEmail,
  passwordResetEmail,
  contactNotification,
  contactConfirmation,
  testEmail,
} from './emailTemplates';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): void {
  if (!EMAIL_REGEX.test(email)) {
    throw new Error(`Invalid email address: ${email}`);
  }
}

/**
 * Lazy-initialised transporter — ESM imports hoist above dotenv.config() in
 * index.ts, so process.env may be empty at module load time. We build the
 * transporter on first send, by which point env vars are populated.
 */
let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_EMAIL;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !port || !user || !pass) {
      throw new Error(
        'SMTP configuration incomplete. Required: SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD',
      );
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465 (implicit TLS), false for 587/25 (STARTTLS)
      auth: { user, pass },
    });
  }
  return transporter;
}

function getSenderEmail(): string {
  const email = process.env.SMTP_EMAIL;
  if (!email) throw new Error('SMTP_EMAIL is not configured');
  return email;
}

/** Derive the public-facing app URL from VITE_API_URL (strip trailing /api). */
function getAppUrl(): string {
  const apiUrl = process.env.VITE_API_URL || '';
  return apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:5173';
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  validateEmail(to);
  const from = getSenderEmail();
  const transport = getTransporter();

  try {
    const info = await transport.sendMail({
      from: `"LaunchLens AI" <${from}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent "${subject}" to ${to} — messageId: ${info.messageId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[EMAIL] Failed to send "${subject}" to ${to}: ${message}`);
    throw new Error(`Failed to send email: ${message}`);
  }
}

/* ─── Public API ────────────────────────────────────────────────────────────── */

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const { subject, html } = welcomeEmail(name);
  await sendMail(to, subject, html);
}

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const appUrl = getAppUrl();
  const { subject, html } = verificationEmail(name, token, appUrl);
  await sendMail(to, subject, html);
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const appUrl = getAppUrl();
  const { subject, html } = passwordResetEmail(name, token, appUrl);
  await sendMail(to, subject, html);
}

export async function sendContactNotification(
  fromName: string,
  fromEmail: string,
  message: string,
): Promise<void> {
  validateEmail(fromEmail);
  const adminEmail = getSenderEmail(); // send notification to the configured sender
  const { subject, html } = contactNotification(fromName, fromEmail, message);
  await sendMail(adminEmail, subject, html);
}

export async function sendContactConfirmation(to: string, name: string): Promise<void> {
  const { subject, html } = contactConfirmation(name);
  await sendMail(to, subject, html);
}

export async function sendTestEmail(to: string): Promise<void> {
  const { subject, html } = testEmail();
  await sendMail(to, subject, html);
}
