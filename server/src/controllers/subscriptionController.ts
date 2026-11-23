import type { Request, Response, NextFunction } from 'express';
import * as subscriptionService from '../services/subscriptionService';

/**
 * POST /api/subscriptions/select-plan — record the user's chosen plan
 */
export async function selectPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }

    const { plan, billingCycle, paymentMethod, buyerName, buyerEmail, buyerPhone, businessName } = req.body;

    if (!plan || !['basic', 'standard', 'business'].includes(plan)) {
      res.status(400).json({ success: false, error: 'Valid plan is required (basic, standard, business)', statusCode: 400 });
      return;
    }

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      res.status(400).json({ success: false, error: 'Valid billing cycle is required (monthly, yearly)', statusCode: 400 });
      return;
    }

    const buyerDetails = {
      buyerName: buyerName || '',
      buyerEmail: buyerEmail || '',
      buyerPhone: buyerPhone || '',
      businessName: businessName || '',
    };

    const subscription = await subscriptionService.selectPlan(
      req.user._id.toString(),
      plan,
      billingCycle,
      paymentMethod || '',
      buyerDetails
    );

    res.json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/subscriptions/current — return the user's current subscription
 */
export async function getCurrentSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }

    const subscription = await subscriptionService.getCurrentSubscription(req.user._id.toString());
    res.json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/subscriptions/status — return whether payment processing is configured
 */
export async function getPaymentStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const configured = subscriptionService.isPaymentConfigured();
    res.json({ success: true, data: { paymentConfigured: configured } });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/subscriptions/change-plan — change the user's plan
 */
export async function changePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }

    const { plan, billingCycle } = req.body;

    if (!plan || !['basic', 'standard', 'business'].includes(plan)) {
      res.status(400).json({ success: false, error: 'Valid plan is required (basic, standard, business)', statusCode: 400 });
      return;
    }

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      res.status(400).json({ success: false, error: 'Valid billing cycle is required (monthly, yearly)', statusCode: 400 });
      return;
    }

    const subscription = await subscriptionService.changePlan(
      req.user._id.toString(),
      plan,
      billingCycle
    );

    if (!subscription) {
      res.status(404).json({ success: false, error: 'No active subscription found', statusCode: 404 });
      return;
    }

    res.json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/subscriptions/cancel — cancel the user's subscription
 */
export async function cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }

    const subscription = await subscriptionService.cancelSubscription(req.user._id.toString());

    if (!subscription) {
      res.status(404).json({ success: false, error: 'No active subscription found to cancel', statusCode: 404 });
      return;
    }

    res.json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/subscriptions/history — get subscription history
 */
export async function getSubscriptionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authorized', statusCode: 401 });
      return;
    }

    const history = await subscriptionService.getSubscriptionHistory(req.user._id.toString());
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}
