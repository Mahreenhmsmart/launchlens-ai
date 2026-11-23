// Brand colours — LaunchLens AI
const BRAND = {
  plum: '#29213D',
  orchid: '#8B72E8',
  gold: '#D8B779',
  mint: '#9DDCC5',
  ivory: '#F7F5FA',
} as const;

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND.ivory}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, ${BRAND.plum}, ${BRAND.orchid}); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px 24px; color: ${BRAND.plum}; font-size: 15px; line-height: 1.6; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${BRAND.orchid}, ${BRAND.plum}); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
    @media only screen and (max-width: 620px) { .wrapper { border-radius: 0; } .body { padding: 24px 16px; } }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>LaunchLens AI</h1>
      <p>Smart tools for e-commerce sellers</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} LaunchLens AI. All rights reserved.<br/>
      This is an automated message — please do not reply directly.
    </div>
  </div>
</body>
</html>`;
}

export function welcomeEmail(name: string): { subject: string; html: string } {
  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px;">Welcome to <strong>LaunchLens AI</strong>! Your account has been created successfully.</p>
    <p style="margin:0 0 16px;">Here's what you can do right now:</p>
    <ul style="margin:0 0 24px; padding-left:20px; color:${BRAND.plum};">
      <li style="margin-bottom:8px;">Run a <strong>Launch Simulator</strong> to test product economics</li>
      <li style="margin-bottom:8px;">Discover trending products with <strong>Product Discovery</strong></li>
      <li style="margin-bottom:8px;">Get AI-powered insights tailored to your business</li>
    </ul>
    <p style="margin:0;">We're excited to help you launch smarter. Let's get started!</p>
  `;
  return { subject: 'Welcome to LaunchLens AI!', html: baseLayout(content) };
}

export function verificationEmail(name: string, token: string, appUrl: string): { subject: string; html: string } {
  const verifyLink = `${appUrl}/api/email/verify/${token}`;
  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px;">Please verify your email address to complete your LaunchLens AI registration.</p>
    <div style="text-align:center; margin:24px 0;">
      <a href="${verifyLink}" class="btn">Verify Email Address</a>
    </div>
    <p style="margin:0 0 8px; font-size:13px; color:#666;">If the button doesn't work, copy this link into your browser:</p>
    <p style="margin:0; font-size:13px; color:${BRAND.orchid}; word-break:break-all;">${verifyLink}</p>
    <p style="margin:16px 0 0; font-size:13px; color:#888;">This link expires in 24 hours.</p>
  `;
  return { subject: 'Verify your LaunchLens AI email', html: baseLayout(content) };
}

export function passwordResetEmail(name: string, token: string, appUrl: string): { subject: string; html: string } {
  const resetLink = `${appUrl}/auth?tab=reset&token=${token}`;
  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px;">We received a request to reset your LaunchLens AI password. Click the button below to set a new one.</p>
    <div style="text-align:center; margin:24px 0;">
      <a href="${resetLink}" class="btn">Reset Password</a>
    </div>
    <p style="margin:0 0 8px; font-size:13px; color:#666;">If the button doesn't work, copy this link into your browser:</p>
    <p style="margin:0; font-size:13px; color:${BRAND.orchid}; word-break:break-all;">${resetLink}</p>
    <p style="margin:16px 0 0; font-size:13px; color:#888;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `;
  return { subject: 'Reset your LaunchLens AI password', html: baseLayout(content) };
}

export function contactNotification(fromName: string, fromEmail: string, message: string): { subject: string; html: string } {
  const content = `
    <p style="margin:0 0 16px;"><strong>New contact form submission</strong></p>
    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
      <tr>
        <td style="padding:8px 12px; background:${BRAND.ivory}; border-radius:6px 0 0 6px; font-weight:600; width:100px; color:${BRAND.plum};">From</td>
        <td style="padding:8px 12px; background:${BRAND.ivory}; border-radius:0 6px 6px 0; color:${BRAND.plum};">${escapeHtml(fromName)} &lt;${escapeHtml(fromEmail)}&gt;</td>
      </tr>
    </table>
    <p style="margin:0 0 8px; font-weight:600; color:${BRAND.plum};">Message:</p>
    <div style="padding:16px; background:${BRAND.ivory}; border-radius:8px; border-left:3px solid ${BRAND.orchid}; white-space:pre-wrap; color:${BRAND.plum};">${escapeHtml(message)}</div>
  `;
  return { subject: `[LaunchLens] Contact: ${fromName}`, html: baseLayout(content) };
}

export function contactConfirmation(toName: string): { subject: string; html: string } {
  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${escapeHtml(toName)}</strong>,</p>
    <p style="margin:0 0 16px;">Thank you for reaching out to <strong>LaunchLens AI</strong>. We've received your message and will get back to you within 24 hours.</p>
    <p style="margin:0;">In the meantime, feel free to explore our <a href="#" style="color:${BRAND.orchid}; text-decoration:none;">Help Center</a> for quick answers.</p>
  `;
  return { subject: 'We received your message — LaunchLens AI', html: baseLayout(content) };
}

export function testEmail(): { subject: string; html: string } {
  const content = `
    <p style="margin:0 0 16px;">This is a test email from <strong>LaunchLens AI</strong>.</p>
    <p style="margin:0 0 16px;">If you received this, your SMTP configuration is working correctly.</p>
    <div style="padding:16px; background:${BRAND.ivory}; border-radius:8px; text-align:center;">
      <span style="font-size:24px;">&#10003;</span>
      <p style="margin:8px 0 0; font-weight:600; color:${BRAND.mint};">SMTP Connected</p>
    </div>
  `;
  return { subject: '[LaunchLens AI] Test Email', html: baseLayout(content) };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
