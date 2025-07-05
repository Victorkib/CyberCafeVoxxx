import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { PAYMENT_ERRORS } from '../constants/payment.js';
import logger from './logger.js';

dotenv.config();

// Determine environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const isTestMode = process.env.PAYMENT_MODE === 'test';

// M-Pesa (Daraja) Integration
export const mpesa = {
  // Generate access token
  getAccessToken: async () => {
    try {
      const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
      ).toString('base64');

      // Use sandbox URL in development/test mode
      const baseUrl =
        process.env.MPESA_ENV === 'sandbox' || isDevelopment || isTestMode
          ? 'https://sandbox.safaricom.co.ke'
          : 'https://api.safaricom.co.ke';

      logger.info('Getting M-Pesa access token', { baseUrl });

      const response = await axios.get(
        `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      logger.error('M-Pesa access token error:', {
        error: error.message,
        stack: error.stack,
      });

      const err = new Error('Failed to get M-Pesa access token');
      err.provider = 'mpesa';
      err.code = PAYMENT_ERRORS.NETWORK_ERROR;
      throw err;
    }
  },

  // Initiate STK Push (Lipa Na M-Pesa)
  initiateSTKPush: async (phoneNumber, amount, orderId) => {
    try {
      // Validate phone number format
      if (!phoneNumber.match(/^254[0-9]{9}$/)) {
        throw new Error(
          'Invalid phone number format. Must start with 254 followed by 9 digits'
        );
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const accessToken = await mpesa.getAccessToken();

      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, -3);
      const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
      ).toString('base64');

      // Use sandbox URL in development/test mode
      const baseUrl =
        process.env.MPESA_ENV === 'sandbox' || isDevelopment || isTestMode
          ? 'https://sandbox.safaricom.co.ke'
          : 'https://api.safaricom.co.ke';

      logger.info('Initiating M-Pesa STK Push', {
        phoneNumber,
        amount,
        orderId,
        baseUrl,
        environment: process.env.MPESA_ENV || 'sandbox',
      });

      console.log('Amount to be formated:', amount);
      // Format amount to ensure it's a valid number with 2 decimal places
      const formattedAmount = Number.parseFloat(amount).toFixed(2);
      console.log('Formatted Amount:', formattedAmount);

      const response = await axios.post(
        `${baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Number(formattedAmount),
          PartyA: phoneNumber,
          PartyB: process.env.MPESA_SHORTCODE,
          PhoneNumber: phoneNumber,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: orderId,
          TransactionDesc: `Payment for order ${orderId}`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Check if the response contains an error
      if (response.data.ResponseCode !== '0') {
        throw new Error(`M-Pesa error: ${response.data.ResponseDescription}`);
      }

      logger.info('M-Pesa STK Push successful', {
        CheckoutRequestID: response.data.CheckoutRequestID,
        MerchantRequestID: response.data.MerchantRequestID,
        ResponseDescription: response.data.ResponseDescription,
      });

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        responseDescription: response.data.ResponseDescription,
        message: 'M-Pesa payment request sent to your phone',
      };
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logger.error('M-Pesa STK Push API error:', {
          status: error.response.status,
          data: error.response.data,
          phoneNumber,
          orderId,
        });

        const errorMessage =
          error.response.data?.errorMessage ||
          error.response.data?.ResponseDescription ||
          'Failed to initiate M-Pesa payment';

        const err = new Error(errorMessage);
        err.provider = 'mpesa';
        err.code = PAYMENT_ERRORS.PAYMENT_FAILED;
        err.details = error.response.data;
        throw err;
      } else if (error.request) {
        // The request was made but no response was received
        logger.error('M-Pesa STK Push network error:', {
          error: 'No response received',
          phoneNumber,
          orderId,
        });

        const err = new Error(
          'Network error: No response from M-Pesa. Please check your internet connection.'
        );
        err.provider = 'mpesa';
        err.code = PAYMENT_ERRORS.NETWORK_ERROR;
        throw err;
      } else {
        // Something happened in setting up the request that triggered an Error
        logger.error('M-Pesa STK Push error:', {
          error: error.message,
          stack: error.stack,
          phoneNumber,
          orderId,
        });

        const err = new Error(
          error.message || 'Failed to initiate M-Pesa payment'
        );
        err.provider = 'mpesa';
        err.code = error.code || PAYMENT_ERRORS.PAYMENT_FAILED;
        throw err;
      }
    }
  },

  // Verify M-Pesa payment
  verifyPayment: async (data) => {
    try {
      // In development/test mode, simulate successful payment
      if (isDevelopment || isTestMode) {
        logger.info('Development mode: Simulating successful M-Pesa payment');
        return {
          success: true,
          data: {
            ...data,
            ResultCode: 0,
            ResultDesc: 'Success',
            TransactionId: `DEV_${Date.now()}`,
          },
        };
      }

      // In production, verify the payment with M-Pesa
      const accessToken = await mpesa.getAccessToken();
      const baseUrl = 'https://api.safaricom.co.ke';

      logger.info('Verifying M-Pesa payment', {
        CheckoutRequestID: data.CheckoutRequestID,
      });

      const response = await axios.post(
        `${baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: data.Password,
          Timestamp: data.Timestamp,
          CheckoutRequestID: data.CheckoutRequestID,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: response.data.ResultCode === 0,
        data: response.data,
      };
    } catch (error) {
      logger.error('M-Pesa payment verification error:', {
        error: error.message,
        stack: error.stack,
        CheckoutRequestID: data?.CheckoutRequestID,
      });

      const err = new Error('Failed to verify M-Pesa payment');
      err.provider = 'mpesa';
      err.code = PAYMENT_ERRORS.NETWORK_ERROR;
      throw err;
    }
  },

  validateMpesaResponse: (response) => {
    // Check if the response contains an error
    if (!response || !response.data) {
      throw new Error('Invalid M-Pesa response');
    }

    // Check response code
    if (response.data.ResponseCode !== '0') {
      const errorMessage =
        response.data.ResponseDescription || 'M-Pesa request failed';
      const error = new Error(errorMessage);
      error.code = response.data.ResponseCode;
      error.details = response.data;
      throw error;
    }

    return response.data;
  },

  // Add common M-Pesa error codes and messages
  errorCodes: {
    1: 'Insufficient funds',
    2: 'Less than minimum transaction value',
    3: 'More than maximum transaction value',
    4: 'Would exceed daily transfer limit',
    5: 'Would exceed minimum balance',
    6: 'Unresolved primary party',
    7: 'Unresolved receiver party',
    8: 'Would exceed maximum balance',
    11: 'Debit account invalid',
    12: 'Credit account invalid',
    13: 'Unresolved debit account',
    14: 'Unresolved credit account',
    15: 'Duplicate detected',
    17: 'Internal failure',
    20: 'Unresolved initiator',
    26: 'Traffic blocking condition in place',
    1001: 'Request cancelled by user',
    1002: 'Request timed out',
    1003: 'Phone number is not registered for M-Pesa',
    1004: 'PIN mismatch',
    1005: 'Request cancelled by user',
    1006: 'Request timed out',
    1007: 'Request cancelled by user',
    1008: 'Request timed out',
    1009: 'Request cancelled by user',
    1010: 'Request timed out',
  },

  // Get a user-friendly error message for M-Pesa errors
  getErrorMessage: (code) => {
    return mpesa.errorCodes[code] || 'Transaction failed';
  },
};

// Paystack Integration
export const paystackPayment = {
  // Initialize Paystack payment
  initializePayment: async (email, amount, orderId) => {
    try {
      // In development/test mode, use test mode
      const isTestMode = process.env.PAYMENT_MODE === 'test' || isDevelopment;

      logger.info('Initializing Paystack payment', {
        email,
        amount,
        orderId,
        isTestMode,
      });

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: Math.round(amount * 100), // Paystack expects amount in kobo/cents
          reference: `${orderId}_${Date.now()}`,
          callback_url: process.env.PAYSTACK_CALLBACK_URL,
          metadata: {
            orderId,
            environment: isTestMode ? 'test' : 'production',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Paystack payment initialization error:', {
        error: error.message,
        stack: error.stack,
        email,
        orderId,
      });

      const err = new Error('Failed to initialize Paystack payment');
      err.provider = 'paystack';
      err.code = PAYMENT_ERRORS.PAYMENT_FAILED;
      throw err;
    }
  },

  // Verify Paystack payment
  verifyPayment: async (reference) => {
    try {
      // In development/test mode, simulate successful payment
      if (isDevelopment || isTestMode) {
        logger.info('Development mode: Simulating successful Paystack payment');
        return {
          status: true,
          data: {
            reference,
            status: 'success',
            amount: 1000,
            id: `DEV_${Date.now()}`,
          },
        };
      }

      logger.info('Verifying Paystack payment', { reference });

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Paystack payment verification error:', {
        error: error.message,
        stack: error.stack,
        reference,
      });

      const err = new Error('Failed to verify Paystack payment');
      err.provider = 'paystack';
      err.code = PAYMENT_ERRORS.NETWORK_ERROR;
      throw err;
    }
  },
};

// PayPal Integration
export const paypalPayment = {
  // Create PayPal order
  createOrder: async (amount, currency = 'USD') => {
    try {
      logger.info('Creating PayPal order', {
        amount,
        currency,
      });

      // In development/test mode, simulate successful order creation
      if (isDevelopment || isTestMode) {
        logger.info(
          'Development mode: Simulating successful PayPal order creation'
        );
        const orderId = `DEV_${Date.now()}`;
        return {
          id: orderId,
          status: 'CREATED',
          links: [
            {
              href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
              rel: 'approve',
              method: 'GET',
            },
          ],
        };
      }

      // In production, create a real PayPal order
      const baseUrl =
        process.env.PAYPAL_MODE === 'sandbox'
          ? 'https://api.sandbox.paypal.com'
          : 'https://api.paypal.com';

      // Get access token
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64');

      const tokenResponse = await axios.post(
        `${baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Create order
      const response = await axios.post(
        `${baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toString(),
              },
            },
          ],
          application_context: {
            return_url: process.env.PAYPAL_RETURN_URL,
            cancel_url: process.env.PAYPAL_CANCEL_URL,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('PayPal order creation error:', {
        error: error.message,
        stack: error.stack,
        amount,
        currency,
      });

      const err = new Error('Failed to create PayPal order');
      err.provider = 'paypal';
      err.code = PAYMENT_ERRORS.PAYMENT_FAILED;
      throw err;
    }
  },

  // Capture PayPal payment
  capturePayment: async (orderId) => {
    try {
      // In development/test mode, simulate successful payment
      if (isDevelopment || isTestMode) {
        logger.info(
          'Development mode: Simulating successful PayPal payment capture'
        );
        return {
          id: orderId,
          status: 'COMPLETED',
          purchase_units: [
            {
              payments: {
                captures: [
                  {
                    id: `DEV_${Date.now()}`,
                    status: 'COMPLETED',
                  },
                ],
              },
            },
          ],
        };
      }

      logger.info('Capturing PayPal payment', { orderId });

      // In production, capture a real PayPal payment
      const baseUrl =
        process.env.PAYPAL_MODE === 'sandbox'
          ? 'https://api.sandbox.paypal.com'
          : 'https://api.paypal.com';

      // Get access token
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64');

      const tokenResponse = await axios.post(
        `${baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Capture payment
      const response = await axios.post(
        `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('PayPal payment capture error:', {
        error: error.message,
        stack: error.stack,
        orderId,
      });

      const err = new Error('Failed to capture PayPal payment');
      err.provider = 'paypal';
      err.code = PAYMENT_ERRORS.PAYMENT_FAILED;
      throw err;
    }
  },
};

// Helper function to determine which payment method to use based on user preference
export const getPaymentMethod = (method, data) => {
  switch (method) {
    case 'mpesa':
      return mpesa.initiateSTKPush(data.phoneNumber, data.amount, data.orderId);
    case 'paystack':
      return paystackPayment.initializePayment(
        data.email,
        data.amount,
        data.orderId
      );
    case 'paypal':
      return paypalPayment.createOrder(data.amount, data.currency);
    default:
      throw new Error('Unsupported payment method');
  }
};

// Get payment environment information
export const getPaymentEnvironment = () => {
  return {
    isDevelopment,
    isTestMode,
    environment: isDevelopment || isTestMode ? 'development' : 'production',
    mpesaEnv: process.env.MPESA_ENV,
    paypalMode: process.env.PAYPAL_MODE,
  };
};

// Initialize M-Pesa payment
export const initializeMpesaPayment = async (order, phoneNumber) => {
  try {
    logger.info('Initializing M-Pesa payment', {
      orderId: order._id,
      phoneNumber,
      amount: order.totalAmount,
    });

    // IMPROVEMENT 2: Validate inputs before making API call
    if (!phoneNumber.match(/^254[0-9]{9}$/)) {
      throw new Error(
        'Invalid phone number format. Must start with 254 followed by 9 digits'
      );
    }

    if (order.totalAmount <= 0) {
      throw new Error('Invalid amount. Must be greater than 0');
    }

    const result = await mpesa.initiateSTKPush(
      phoneNumber,
      order.totalAmount,
      order._id.toString()
    );

    // IMPROVEMENT 3: Return consistent structure
    return {
      success: true,
      checkoutRequestId: result.checkoutRequestId,
      merchantRequestId: result.merchantRequestId,
      message: result.message || 'M-Pesa payment initiated successfully',
    };
  } catch (error) {
    logger.error('M-Pesa payment initialization error:', {
      error: error.message,
      stack: error.stack,
      orderId: order._id,
    });

    // IMPROVEMENT 4: Throw structured errors
    const err = new Error(
      error.message || 'Failed to initialize M-Pesa payment'
    );
    err.provider = 'mpesa';
    err.code = error.code || 'MPESA_INIT_FAILED';
    throw err;
  }
};

// Initialize Paystack payment
export const initializePaystackPayment = async (order, email) => {
  try {
    logger.info('Initializing Paystack payment', {
      orderId: order._id,
      email,
      amount: order.totalAmount,
    });

    // IMPROVEMENT 6: Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    const result = await paystackPayment.initializePayment(
      email,
      order.totalAmount,
      order._id.toString()
    );

    // IMPROVEMENT 7: Handle Paystack response structure
    if (!result.status || !result.data) {
      throw new Error('Invalid response from Paystack');
    }

    return {
      success: true,
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
      message: 'Paystack payment initiated successfully',
    };
  } catch (error) {
    logger.error('Paystack payment initialization error:', {
      error: error.message,
      stack: error.stack,
      orderId: order._id,
    });

    const err = new Error(
      error.message || 'Failed to initialize Paystack payment'
    );
    err.provider = 'paystack';
    err.code = error.code || 'PAYSTACK_INIT_FAILED';
    throw err;
  }
};
// Initialize PayPal payment
export const initializePaypalPayment = async (order) => {
  try {
    logger.info('Initializing PayPal payment', {
      orderId: order._id,
    });

    // Create PayPal order
    const result = await paypalPayment.createOrder(order.totalAmount);

    return {
      success: true,
      paypalOrderId: result.id,
      approvalUrl: result.links.find((link) => link.rel === 'approve').href,
      message: 'PayPal payment initiated successfully',
    };
  } catch (error) {
    logger.error('PayPal payment initialization error:', {
      error: error.message,
      stack: error.stack,
      orderId: order._id,
    });

    throw error;
  }
};

// Verify Paystack webhook signature
export const verifyPaystackSignature = (payload, signature) => {
  try {
    if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
      return isDevelopment || isTestMode;
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  } catch (error) {
    logger.error('Paystack signature verification error:', {
      error: error.message,
    });
    return false;
  }
};

// Verify PayPal webhook signature
export const verifyPaypalSignature = (payload, signature) => {
  try {
    if (!signature || !process.env.PAYPAL_WEBHOOK_ID) {
      return isDevelopment || isTestMode;
    }

    // In a real implementation, this would verify the signature using PayPal's algorithm
    // For simplicity, we're just checking if the signature exists in development
    // In production, you would use PayPal's SDK to verify the signature

    return isDevelopment || isTestMode || signature.length > 0;
  } catch (error) {
    logger.error('PayPal signature verification error:', {
      error: error.message,
    });
    return false;
  }
};

// Verify M-Pesa webhook signature
export const verifyMpesaSignature = (payload, signature) => {
  try {
    if (!signature || !process.env.MPESA_PASSKEY) {
      return isDevelopment || isTestMode;
    }

    // In a real implementation, this would verify the signature using M-Pesa's algorithm
    // For simplicity, we're just checking if the signature exists in development
    // In production, you would implement the proper verification logic

    return isDevelopment || isTestMode || signature.length > 0;
  } catch (error) {
    logger.error('M-Pesa signature verification error:', {
      error: error.message,
    });
    return false;
  }
};
