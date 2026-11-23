import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService';
import { seedDefaultProduct } from '../services/productService';

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Generate JWT token for a user
 */
function generateToken(id: string, role: string): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id, role }, jwtSecret, { expiresIn: '30d' });
}

/**
 * Register a new user
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
        statusCode: 400,
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'A user with this email already exists',
        statusCode: 409,
      });
      return;
    }

    // Create user - NEVER accept role from client
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user', // Always default to 'user'
    });

    // Generate email verification token (24-hour expiry)
    const verifyTokenRaw = crypto.randomBytes(32).toString('hex');
    const verifyTokenHash = crypto.createHash('sha256').update(verifyTokenRaw).digest('hex');
    user.emailVerificationToken = verifyTokenHash;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Seed default product for new user
    seedDefaultProduct(user._id.toString()).catch((err) => {
      console.error('[AUTH] Failed to seed default product:', err instanceof Error ? err.message : err);
    });

    // Send emails asynchronously — don't block registration response
    sendWelcomeEmail(user.email, user.name).catch((err) => {
      console.error('[AUTH] Failed to send welcome email:', err instanceof Error ? err.message : err);
    });
    sendVerificationEmail(user.email, user.name, verifyTokenRaw).catch((err) => {
      console.error('[AUTH] Failed to send verification email:', err instanceof Error ? err.message : err);
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt?.toISOString(),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login an existing user
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
        statusCode: 400,
      });
      return;
    }

    // Find user by email, include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401,
      });
      return;
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401,
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt?.toISOString(),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized',
        statusCode: 401,
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id.toString(),
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          createdAt: req.user.createdAt?.toISOString(),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Forgot password - generate reset token and send email
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required',
        statusCode: 400,
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal whether the email exists
    if (!user) {
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate random reset token (1-hour expiry)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (err) {
      console.error('[AUTH] Failed to send password reset email:', err instanceof Error ? err.message : err);
      // Clear tokens on email failure so stale tokens don't persist
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({
        success: false,
        error: 'Failed to send password reset email. Please try again later.',
        statusCode: 500,
      });
      return;
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reset password using token
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: 'Reset token and new password are required',
        statusCode: 400,
      });
      return;
    }

    // Hash the provided token to match stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
        statusCode: 400,
      });
      return;
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify email address using token from verification email link
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Verification token is required',
        statusCode: 400,
      });
      return;
    }

    // Hash the provided token to match stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
        statusCode: 400,
      });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout - client-side only operation
 * Server returns 200 OK for completeness
 */
export function logout(_req: Request, res: Response): void {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}
