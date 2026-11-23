import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { verifyEmail } from '../controllers/authController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import { sendTestEmail, sendContactNotification, sendContactConfirmation } from '../services/emailService';

const router = Router();

// ─── Simple in-memory rate limiter ──────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate-limit middleware — max `limit` requests per `windowMs` per IP.
 * Uses an in-memory store suitable for single-instance deployments.
 */
function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= limit) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        statusCode: 429,
      });
      return;
    }

    entry.count += 1;
    next();
  };
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── GET /api/email/verify/:token ───────────────────────────────────────────
router.get('/verify/:token', verifyEmail);

// ─── POST /api/email/forgot-password ────────────────────────────────────────
// Re-exported from authController via authRoutes — this route delegates to
// the same handler but is also available under /api/email/ for convenience.
router.post(
  '/forgot-password',
  rateLimit(5, 60_000), // 5 per minute
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email || !EMAIL_REGEX.test(email)) {
        res.status(400).json({
          success: false,
          error: 'A valid email address is required',
          statusCode: 400,
        });
        return;
      }

      // Delegate to the auth controller's forgotPassword
      // We import dynamically to avoid circular deps at module level
      const { forgotPassword } = await import('../controllers/authController');
      await forgotPassword(req, res, next);
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /api/email/reset-password ─────────────────────────────────────────
router.post(
  '/reset-password',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resetPassword } = await import('../controllers/authController');
      await resetPassword(req, res, next);
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /api/email/test ───────────────────────────────────────────────────
// Admin-only test endpoint — requires authentication + admin role
router.post(
  '/test',
  protect,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { to } = req.body;

      if (!to || !EMAIL_REGEX.test(to)) {
        res.status(400).json({
          success: false,
          error: 'A valid recipient email address is required',
          statusCode: 400,
        });
        return;
      }

      await sendTestEmail(to);

      res.json({
        success: true,
        message: `Test email sent to ${to}`,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /api/email/contact ────────────────────────────────────────────────
// Public contact form submission — rate-limited
router.post(
  '/contact',
  rateLimit(5, 60_000), // 5 per minute
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({
          success: false,
          error: 'Name is required',
          statusCode: 400,
        });
        return;
      }

      if (!email || !EMAIL_REGEX.test(email)) {
        res.status(400).json({
          success: false,
          error: 'A valid email address is required',
          statusCode: 400,
        });
        return;
      }

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({
          success: false,
          error: 'Message is required',
          statusCode: 400,
        });
        return;
      }

      // Send notification to admin
      await sendContactNotification(name.trim(), email.trim(), message.trim());

      // Send confirmation to submitter (best-effort, don't fail the request)
      sendContactConfirmation(email.trim(), name.trim()).catch((err) => {
        console.error('[EMAIL] Failed to send contact confirmation:', err instanceof Error ? err.message : err);
      });

      res.json({
        success: true,
        message: 'Your message has been sent successfully. We\'ll get back to you within 24 hours.',
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
