import express from 'express';
import {
  getPaymentMethods,
  initializePayment,
  mpesaCallback,
  paystackCallback,
  paypalCallback,
  checkPaymentStatus,
  retryPayment,
  getPaymentAnalytics,
  getPaymentHistory,
  getPaymentDetails,
  refundPayment,
  getRefundHistory,
  fetchPaymentSettings,
  updatePaymentSettings
} from '../controllers/payment.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);

// Callback routes (no auth required as they're called by payment providers)
router.post('/mpesa/callback', mpesaCallback);
router.post('/paystack/callback', paystackCallback);
router.post('/paypal/callback', paypalCallback);

// User routes (authenticated)
router.post('/initialize', authMiddleware, initializePayment);
router.post('/retry', authMiddleware, retryPayment);
router.get('/status/:orderId', authMiddleware, checkPaymentStatus);
router.get('/history', authMiddleware, getPaymentHistory);
router.get('/details/:paymentId', authMiddleware, getPaymentDetails);

// Admin routes
router.get('/analytics', authMiddleware, authorize('admin'), getPaymentAnalytics);
router.post('/refund/:paymentId', authMiddleware, authorize('admin'), refundPayment);
router.get('/refund-history', authMiddleware, authorize('admin'), getRefundHistory);
router.get('/settings', authMiddleware, authorize('admin'), fetchPaymentSettings);
router.put('/settings', authMiddleware, authorize('admin'), updatePaymentSettings);

export default router; 