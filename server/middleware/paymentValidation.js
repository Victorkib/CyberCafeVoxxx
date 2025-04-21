import { PAYMENT_METHODS, PAYMENT_VALIDATION } from '../constants/payment.js';
import { createError } from '../utils/error.js';

/**
 * Validate payment initialization request
 */
export const validatePaymentInit = (req, res, next) => {
  try {
    const { orderId, method } = req.body;

    if (!orderId) {
      throw createError(400, 'Order ID is required');
    }

    if (!method || !Object.values(PAYMENT_METHODS).includes(method)) {
      throw createError(400, 'Invalid payment method');
    }

    // Validate method-specific requirements
    switch (method) {
      case PAYMENT_METHODS.MPESA:
        if (!req.body.phoneNumber) {
          throw createError(400, 'Phone number is required for M-Pesa payments');
        }
        if (!/^254[0-9]{9}$/.test(req.body.phoneNumber)) {
          throw createError(400, 'Invalid M-Pesa phone number format');
        }
        break;

      case PAYMENT_METHODS.PAYSTACK:
        if (!req.body.email) {
          throw createError(400, 'Email is required for Paystack payments');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
          throw createError(400, 'Invalid email format');
        }
        break;

      case PAYMENT_METHODS.PAYPAL:
        // PayPal doesn't require additional validation at this stage
        break;

      default:
        throw createError(400, 'Unsupported payment method');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate payment callback request
 */
export const validatePaymentCallback = (req, res, next) => {
  try {
    const { paymentId, status, transactionId } = req.body;

    if (!paymentId) {
      throw createError(400, 'Payment ID is required');
    }

    if (!status) {
      throw createError(400, 'Payment status is required');
    }

    if (!transactionId) {
      throw createError(400, 'Transaction ID is required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate refund request
 */
export const validateRefund = (req, res, next) => {
  try {
    const { paymentId, reason } = req.body;

    if (!paymentId) {
      throw createError(400, 'Payment ID is required');
    }

    if (!reason) {
      throw createError(400, 'Refund reason is required');
    }

    if (reason.length < 10) {
      throw createError(400, 'Refund reason must be at least 10 characters long');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate payment verification request
 */
export const validatePaymentVerification = (req, res, next) => {
  try {
    const { paymentId, transactionId } = req.body;

    if (!paymentId) {
      throw createError(400, 'Payment ID is required');
    }

    if (!transactionId) {
      throw createError(400, 'Transaction ID is required');
    }

    next();
  } catch (error) {
    next(error);
  }
}; 