import { Router } from 'express';
import {
  selectPlan,
  getCurrentSubscription,
  getPaymentStatus,
  changePlan,
  cancelSubscription,
  getSubscriptionHistory,
} from '../controllers/subscriptionController';
import { subscriptionRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/select-plan', subscriptionRateLimiter(10, 60000), selectPlan);
router.get('/current', getCurrentSubscription);
router.get('/status', getPaymentStatus);
router.put('/change-plan', subscriptionRateLimiter(5, 60000), changePlan);
router.post('/cancel', subscriptionRateLimiter(5, 60000), cancelSubscription);
router.get('/history', getSubscriptionHistory);

export default router;
