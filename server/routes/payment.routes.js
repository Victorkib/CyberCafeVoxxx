import express from 'express';
import {
  getPaymentMethods,
  initializePayment,
  processPaymentCallback,
  processInlineCallback, // NEW
  verifyInlinePayment, // NEW
  processRefund,
  getPaymentAnalytics,
  retryPayment,
  checkPaymentStatus,
  getPaymentHistory,
  getPaymentDetails,
  getRefundHistory,
  updatePaymentSettings,
  fetchPaymentSettings,
} from '../controllers/payment.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';
import {
  validatePaymentInit,
  validatePaymentCallback,
  validateRefund,
  validateInlineCallback, // NEW
  validateInlineVerification, // NEW
} from '../middleware/paymentValidation.js';
import {
  handlePaymentError,
  handleProviderError,
} from '../middleware/paymentErrorHandler.js';

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);

// Protected routes (require authentication)
router.use(authMiddleware);

// Payment initialization and processing
router.post('/initialize', validatePaymentInit, initializePayment);
router.post('/callback', validatePaymentCallback, processPaymentCallback);

// NEW: Inline checkout routes
router.post('/inline-callback', validateInlineCallback, processInlineCallback);
router.post('/verify-inline', validateInlineVerification, verifyInlinePayment);

router.post('/retry', retryPayment);
router.get('/status/:orderId', checkPaymentStatus);
router.get('/history', getPaymentHistory);
router.get('/details/:orderId', getPaymentDetails);
router.get('/refunds', getRefundHistory);

// Admin routes (require admin authorization)
router.use('/admin', authorize('admin', 'super_admin'));
router.post('/admin/refund', validateRefund, processRefund);
router.get('/admin/analytics', getPaymentAnalytics);
router.put('/admin/settings', updatePaymentSettings);
router.get('/admin/settings', fetchPaymentSettings);

// Error handlers specific to payment routes
router.use(handlePaymentError);
router.use(handleProviderError);

export default router;
