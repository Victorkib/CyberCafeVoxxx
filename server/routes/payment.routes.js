import express from 'express';
import {
  getPaymentMethods,
  initializePayment,
  processPaymentCallback,
  processRefund,
  getPaymentAnalytics
} from '../controllers/payment.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);

// Protected routes (require authentication)
router.use(authMiddleware);

// Payment initialization and processing
router.post('/initialize', initializePayment);
router.post('/callback', processPaymentCallback);

// Admin routes (require admin authorization)
router.use(authorize(['admin']));

// Payment management
router.post('/refund', processRefund);
router.get('/analytics', getPaymentAnalytics);

export default router; 