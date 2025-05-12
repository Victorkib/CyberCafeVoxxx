import { PAYMENT_ERRORS } from '../constants/payment.js';
import logger from '../utils/logger.js';

/**
 * Handle payment-specific errors
 */
export const handlePaymentError = (err, req, res, next) => {
  // Log the error for debugging
  logger.error('Payment Error:', {
    error: err.message,
    code: err.code,
    stack: err.stack,
  });

  // Handle specific payment errors
  switch (err.code) {
    case PAYMENT_ERRORS.INVALID_AMOUNT:
      return res.status(400).json({
        success: false,
        error: 'Invalid payment amount',
        details: err.message,
      });

    case PAYMENT_ERRORS.PAYMENT_FAILED:
      return res.status(400).json({
        success: false,
        error: 'Payment failed',
        details: err.message,
      });

    case PAYMENT_ERRORS.REFUND_FAILED:
      return res.status(400).json({
        success: false,
        error: 'Refund failed',
        details: err.message,
      });

    case PAYMENT_ERRORS.NETWORK_ERROR:
      return res.status(503).json({
        success: false,
        error: 'Payment service temporarily unavailable',
        details: err.message,
      });

    case PAYMENT_ERRORS.INVALID_PAYMENT_METHOD:
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method',
        details: err.message,
      });

    case PAYMENT_ERRORS.TRANSACTION_EXPIRED:
      return res.status(400).json({
        success: false,
        error: 'Payment transaction has expired',
        details: err.message,
      });

    default:
      // For unknown payment errors, pass to the next error handler
      next(err);
  }
};

/**
 * Handle payment provider-specific errors
 */
export const handleProviderError = (err, req, res, next) => {
  // Log the error for debugging
  logger.error('Payment Provider Error:', {
    error: err.message,
    provider: err.provider,
    stack: err.stack,
  });

  // Handle provider-specific errors
  if (err.provider) {
    switch (err.provider) {
      case 'mpesa':
        return res.status(400).json({
          success: false,
          error: 'M-Pesa payment error',
          details: err.message,
        });

      case 'paystack':
        return res.status(400).json({
          success: false,
          error: 'Paystack payment error',
          details: err.message,
        });

      case 'paypal':
        return res.status(400).json({
          success: false,
          error: 'PayPal payment error',
          details: err.message,
        });

      default:
        return res.status(500).json({
          success: false,
          error: 'Payment provider error',
          details:
            process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }
  }

  next(err);
};
