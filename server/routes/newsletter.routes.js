import express from 'express';
import { validateRequest } from '../middleware/validation.middleware.js';
import { newsletterValidationRules } from '../middleware/validation.middleware.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';
import {
  subscribe,
  unsubscribe,
  verifySubscription,
  getSubscribers,
  getSubscriptionStats,
  sendNewsletter,
} from '../controllers/newsletter.controller.js';

const router = express.Router();

// Public routes
router.post('/subscribe', validateRequest(newsletterValidationRules.subscribe), subscribe);
router.get('/verify/:token', verifySubscription);
router.get('/unsubscribe/:token', unsubscribe);

// Protected routes (admin only)
router.get('/subscribers', authMiddleware, authorize('admin', 'super_admin'), getSubscribers);
router.get('/stats', authMiddleware, authorize('admin', 'super_admin'), getSubscriptionStats);
router.post('/send', authMiddleware, authorize('admin', 'super_admin'), sendNewsletter);

export default router; 