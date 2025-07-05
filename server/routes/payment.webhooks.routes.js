import express from 'express';
import {
  handleMpesaWebhook,
  handlePaystackWebhook,
  handlePaypalWebhook,
  verifyPaymentWithProvider,
} from '../controllers/payment.webhooks.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  validateWebhookSignature,
  validatePaymentStatusCheck,
} from '../middleware/paymentValidation.js';
import { handlePaymentError } from '../middleware/paymentErrorHandler.js';

const router = express.Router();

// Webhook endpoints (no authentication required)
router.post('/mpesa', validateWebhookSignature('mpesa'), handleMpesaWebhook);
router.post(
  '/paystack',
  validateWebhookSignature('paystack'),
  handlePaystackWebhook
);
router.post('/paypal', validateWebhookSignature('paypal'), handlePaypalWebhook);

// Protected verification endpoint
router.get(
  '/verify/:paymentId',
  authMiddleware,
  validatePaymentStatusCheck,
  verifyPaymentWithProvider
);

// Error handler
router.use(handlePaymentError);

export default router;
