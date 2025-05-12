import express from 'express';
import {
  handleMpesaWebhook,
  handlePaystackWebhook,
  handlePaypalWebhook,
  verifyPaymentStatus,
} from '../controllers/payment.webhooks.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Webhook routes (no authentication required as they are called by payment providers)
router.post('/mpesa/webhook', handleMpesaWebhook);
router.post('/paystack/webhook', handlePaystackWebhook);
router.post('/paypal/webhook', handlePaypalWebhook);

// Manual verification route (requires authentication)
router.get('/verify/:paymentId', authMiddleware, verifyPaymentStatus);

export default router;
