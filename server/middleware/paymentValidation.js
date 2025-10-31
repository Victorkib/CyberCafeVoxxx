import { PAYMENT_METHODS } from '../constants/payment.js';
import { createError } from '../utils/error.js';
import logger from '../utils/logger.js';

// Enhanced phone number validation for different countries
const validatePhoneNumber = (phoneNumber, country = 'KE') => {
  const patterns = {
    KE: /^254[0-9]{9}$/, // Kenya
    UG: /^256[0-9]{9}$/, // Uganda
    TZ: /^255[0-9]{9}$/, // Tanzania
    NG: /^234[0-9]{10}$/, // Nigeria
    GH: /^233[0-9]{9}$/, // Ghana
  };

  const pattern = patterns[country] || patterns.KE;
  return pattern.test(phoneNumber);
};

// Enhanced email validation
const validateEmail = (email) => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Enhanced amount validation
const validateAmount = (amount) => {
  const numAmount = Number(amount);
  return (
    !isNaN(numAmount) &&
    numAmount > 0 &&
    numAmount <= 1000000 && // Max 1M
    Number.isFinite(numAmount)
  );
};

// Enhanced reference validation for Paystack
const validatePaystackReference = (reference) => {
  if (!reference || typeof reference !== 'string') {
    return false;
  }
  // Paystack references should be alphanumeric and between 6-100 characters
  return /^[a-zA-Z0-9_-]{6,100}$/.test(reference);
};

/**
 * Enhanced payment initialization validation
 */
export const validatePaymentInit = (req, res, next) => {
  try {
    const { orderId, method, phoneNumber, email, amount, reference } = req.body;

    logger.info('Validating payment initialization request', {
      orderId,
      method,
      hasPhoneNumber: !!phoneNumber,
      hasEmail: !!email,
      amount,
      hasReference: !!reference,
    });

    // Validate required fields
    if (!orderId) {
      throw createError(400, 'Order ID is required');
    }

    if (!method || !Object.values(PAYMENT_METHODS).includes(method)) {
      throw createError(
        400,
        `Invalid payment method. Supported methods: ${Object.values(
          PAYMENT_METHODS
        ).join(', ')}`
      );
    }

    // Validate amount if provided
    if (amount && !validateAmount(amount)) {
      throw createError(
        400,
        'Invalid amount. Must be a positive number not exceeding 1,000,000'
      );
    }

    // Method-specific validation with better error messages
    switch (method) {
      case PAYMENT_METHODS.MPESA:
        if (!phoneNumber) {
          throw createError(
            400,
            'Phone number is required for M-Pesa payments'
          );
        }

        // Auto-format phone number
        let formattedPhone = phoneNumber.toString().replace(/\s+/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '254' + formattedPhone.substring(1);
        } else if (
          formattedPhone.startsWith('7') ||
          formattedPhone.startsWith('1')
        ) {
          formattedPhone = '254' + formattedPhone;
        }

        if (!validatePhoneNumber(formattedPhone)) {
          throw createError(
            400,
            'Invalid M-Pesa phone number format. Use format: 254XXXXXXXXX'
          );
        }

        // Update the request body with formatted phone number
        req.body.phoneNumber = formattedPhone;
        break;

      case PAYMENT_METHODS.PAYSTACK:
        if (!email) {
          throw createError(400, 'Email is required for Paystack payments');
        }
        if (!validateEmail(email)) {
          throw createError(400, 'Invalid email format for Paystack payment');
        }

        // NEW: Validate reference for inline checkout
        if (reference) {
          if (!validatePaystackReference(reference)) {
            throw createError(400, 'Invalid Paystack reference format');
          }
          // Mark as inline checkout
          req.body.isInlineCheckout = true;
        }
        break;

      case PAYMENT_METHODS.PAYPAL:
        // PayPal doesn't require additional validation at initialization
        break;

      default:
        throw createError(400, `Unsupported payment method: ${method}`);
    }

    // Add request timestamp for tracking
    req.body.requestTimestamp = new Date().toISOString();

    next();
  } catch (error) {
    logger.warn('Payment initialization validation failed', {
      error: error.message,
      body: req.body,
    });
    next(error);
  }
};

/**
 * Enhanced payment callback validation
 */
export const validatePaymentCallback = (req, res, next) => {
  try {
    const { paymentId, status, transactionId, metadata } = req.body;

    logger.info('Validating payment callback request', {
      paymentId,
      status,
      hasTransactionId: !!transactionId,
    });

    if (!paymentId) {
      throw createError(400, 'Payment ID is required');
    }

    if (!status) {
      throw createError(400, 'Payment status is required');
    }

    // Validate status values
    const validStatuses = ['pending', 'paid', 'failed', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw createError(
        400,
        `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    if (!transactionId) {
      throw createError(400, 'Transaction ID is required');
    }

    // Validate metadata structure
    if (metadata && typeof metadata !== 'object') {
      throw createError(400, 'Metadata must be an object');
    }

    next();
  } catch (error) {
    logger.warn('Payment callback validation failed', {
      error: error.message,
      body: req.body,
    });
    next(error);
  }
};

/**
 * NEW: Validate inline callback for Paystack
 */
export const validateInlineCallback = (req, res, next) => {
  try {
    const { orderId, reference, status, transactionId, metadata } = req.body;

    logger.info('Validating inline payment callback request', {
      orderId,
      reference,
      status,
      hasTransactionId: !!transactionId,
    });

    if (!orderId) {
      throw createError(400, 'Order ID is required for inline callback');
    }

    if (!reference) {
      throw createError(
        400,
        'Payment reference is required for inline callback'
      );
    }

    if (!validatePaystackReference(reference)) {
      throw createError(400, 'Invalid Paystack reference format');
    }

    if (!status) {
      throw createError(400, 'Payment status is required');
    }

    // Validate status values for inline checkout
    const validStatuses = ['success', 'failed', 'cancelled', 'abandoned'];
    if (!validStatuses.includes(status)) {
      throw createError(
        400,
        `Invalid inline payment status. Must be one of: ${validStatuses.join(
          ', '
        )}`
      );
    }

    // Validate metadata structure
    if (metadata && typeof metadata !== 'object') {
      throw createError(400, 'Metadata must be an object');
    }

    // Add inline callback flag
    req.body.isInlineCallback = true;

    next();
  } catch (error) {
    logger.warn('Inline payment callback validation failed', {
      error: error.message,
      body: req.body,
    });
    next(error);
  }
};

/**
 * NEW: Validate inline payment verification
 */
export const validateInlineVerification = (req, res, next) => {
  try {
    const { reference, orderId } = req.body;

    logger.info('Validating inline payment verification request', {
      reference,
      orderId,
    });

    if (!reference) {
      throw createError(400, 'Payment reference is required for verification');
    }

    if (!validatePaystackReference(reference)) {
      throw createError(400, 'Invalid Paystack reference format');
    }

    if (!orderId) {
      throw createError(400, 'Order ID is required for verification');
    }

    // Validate orderId format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw createError(400, 'Invalid order ID format');
    }

    next();
  } catch (error) {
    logger.warn('Inline payment verification validation failed', {
      error: error.message,
      body: req.body,
    });
    next(error);
  }
};

/**
 * Enhanced refund validation
 */
export const validateRefund = (req, res, next) => {
  try {
    const { paymentId, reason, amount } = req.body;

    logger.info('Validating refund request', {
      paymentId,
      hasReason: !!reason,
      amount,
    });

    if (!paymentId) {
      throw createError(400, 'Payment ID is required');
    }

    if (!reason || typeof reason !== 'string') {
      throw createError(400, 'Refund reason is required and must be a string');
    }

    if (reason.trim().length < 10) {
      throw createError(
        400,
        'Refund reason must be at least 10 characters long'
      );
    }

    if (reason.length > 500) {
      throw createError(400, 'Refund reason cannot exceed 500 characters');
    }

    // Validate partial refund amount
    if (amount !== undefined) {
      if (!validateAmount(amount)) {
        throw createError(400, 'Invalid refund amount');
      }
    }

    next();
  } catch (error) {
    logger.warn('Refund validation failed', {
      error: error.message,
      body: req.body,
    });
    next(error);
  }
};

/**
 * Enhanced validation for payment retry
 */
export const validatePaymentRetry = (req, res, next) => {
  try {
    const { orderId, method, phoneNumber, email } = req.body;

    logger.info('Validating payment retry request', {
      orderId,
      method,
    });

    if (!orderId) {
      throw createError(400, 'Order ID is required for payment retry');
    }

    if (!method || !Object.values(PAYMENT_METHODS).includes(method)) {
      throw createError(400, 'Valid payment method is required for retry');
    }

    // Apply same validation as initialization
    req.body.isRetry = true;
    return validatePaymentInit(req, res, next);
  } catch (error) {
    logger.warn('Payment retry validation failed', {
      error: error.message,
      body: req.body,
    });
    next(error);
  }
};

/**
 * NEW: Validate webhook signature for different providers
 */
export const validateWebhookSignature = (provider) => {
  return (req, res, next) => {
    try {
      const signature = req.headers[`x-${provider}-signature`];
      const payload = req.body;

      logger.info(`Validating ${provider} webhook signature`, {
        hasSignature: !!signature,
        provider,
      });

      // In development mode, skip signature validation
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.PAYMENT_MODE === 'test'
      ) {
        logger.info(
          `Skipping ${provider} signature validation in development mode`
        );
        return next();
      }

      // Provider-specific signature validation
      switch (provider) {
        case 'paystack':
          if (!signature) {
            throw createError(400, 'Paystack signature is required');
          }
          // Additional Paystack signature validation would go here
          break;

        case 'mpesa':
          if (!signature) {
            throw createError(400, 'M-Pesa signature is required');
          }
          // Additional M-Pesa signature validation would go here
          break;

        case 'paypal':
          const authAlgo = req.headers['paypal-auth-algo'];
          if (!authAlgo) {
            throw createError(400, 'PayPal auth algorithm is required');
          }
          // Additional PayPal signature validation would go here
          break;

        default:
          throw createError(400, `Unsupported webhook provider: ${provider}`);
      }

      next();
    } catch (error) {
      logger.warn(`${provider} webhook signature validation failed`, {
        error: error.message,
        provider,
      });
      next(error);
    }
  };
};

/**
 * NEW: Validate payment status check request
 */
export const validatePaymentStatusCheck = (req, res, next) => {
  try {
    const { orderId } = req.params;

    logger.info('Validating payment status check request', {
      orderId,
    });

    if (!orderId) {
      throw createError(400, 'Order ID is required for status check');
    }

    // Validate orderId format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw createError(400, 'Invalid order ID format');
    }

    next();
  } catch (error) {
    logger.warn('Payment status check validation failed', {
      error: error.message,
      params: req.params,
    });
    next(error);
  }
};
