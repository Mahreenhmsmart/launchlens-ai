import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { type IUser } from '../models/User';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Protect middleware - verifies JWT token and attaches user to request.
 * Returns 401 if token is missing or invalid.
 */
export async function protect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Not authorized, no token provided',
        statusCode: 401,
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Find user by ID, exclude password
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        statusCode: 401,
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        statusCode: 401,
      });
      return;
    }
    next(err);
  }
}

/**
 * Admin-only middleware - ensures user has admin role.
 * Must be used after protect middleware.
 * Returns 403 if user is not an admin.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Not authorized',
      statusCode: 401,
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
      statusCode: 403,
    });
    return;
  }

  next();
}

/**
 * Check whether the authenticated user has admin role.
 * Useful in controllers/services that need to bypass plan restrictions for admins.
 */
export function isAdmin(req: Request): boolean {
  return req.user?.role === 'admin';
}
