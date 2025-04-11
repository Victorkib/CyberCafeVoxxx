import axios from 'axios';
import crypto from 'crypto';
import paystack from 'paystack';
import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';
import Payment from '../models/payment.model.js';
import Order from '../models/order.model.js';

dotenv.config();

// Determine environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const isTestMode = process.env.PAYMENT_MODE === 'test';

// Initialize payment clients
const paystackClient = paystack(process.env.PAYSTACK_SECRET_KEY);

// Initialize PayPal
let paypalClient;
if (process.env.PAYPAL_MODE === 'sandbox' || isDevelopment || isTestMode) {
  paypalClient = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
} else {
  paypalClient = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
}
const paypalInstance = new paypal.core.PayPalHttpClient(paypalClient);

// M-Pesa (Daraja) Integration
export const mpesa = {
  // Generate access token
  getAccessToken: async () => {
    try {
      const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
      ).toString('base64');
      
      // Use sandbox URL in development/test mode
      const baseUrl = (process.env.MPESA_ENV === 'sandbox' || isDevelopment || isTestMode)
        ? 'https://sandbox.safaricom.co.ke'
        : 'https://api.safaricom.co.ke';
      
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
      console.error('M-Pesa access token error:', error);
      throw new Error('Failed to get M-Pesa access token');
    }
  },

  // Initiate STK Push (Lipa Na M-Pesa)
  initiateSTKPush: async (phoneNumber, amount, orderId) => {
    try {
      const accessToken = await mpesa.getAccessToken();
      
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
      ).toString('base64');
      
      // Use sandbox URL in development/test mode
      const baseUrl = (process.env.MPESA_ENV === 'sandbox' || isDevelopment || isTestMode)
        ? 'https://sandbox.safaricom.co.ke'
        : 'https://api.safaricom.co.ke';
      
      const response = await axios.post(
        `${baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: amount,
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
      
      return response.data;
    } catch (error) {
      console.error('M-Pesa STK Push error:', error);
      throw new Error('Failed to initiate M-Pesa payment');
    }
  },

  // Verify M-Pesa payment
  verifyPayment: async (data) => {
    try {
      // In development/test mode, simulate successful payment
      if (isDevelopment || isTestMode) {
        console.log('Development mode: Simulating successful M-Pesa payment');
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
      console.error('M-Pesa payment verification error:', error);
      throw new Error('Failed to verify M-Pesa payment');
    }
  },
};

// Paystack Integration
export const paystackPayment = {
  // Initialize Paystack payment
  initializePayment: async (email, amount, orderId) => {
    try {
      // In development/test mode, use test mode
      const isTestMode = process.env.PAYMENT_MODE === 'test' || isDevelopment;
      
      const response = await paystackClient.transaction.initialize({
        email,
        amount: amount * 100, // Paystack expects amount in kobo/cents
        reference: orderId,
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          orderId,
          environment: isTestMode ? 'test' : 'production',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Paystack payment initialization error:', error);
      throw new Error('Failed to initialize Paystack payment');
    }
  },

  // Verify Paystack payment
  verifyPayment: async (reference) => {
    try {
      // In development/test mode, simulate successful payment
      if (isDevelopment || isTestMode) {
        console.log('Development mode: Simulating successful Paystack payment');
        return {
          status: 'success',
          data: {
            reference,
            status: 'success',
            amount: 1000,
            id: `DEV_${Date.now()}`,
          },
        };
      }
      
      const response = await paystackClient.transaction.verify(reference);
      return response.data;
    } catch (error) {
      console.error('Paystack payment verification error:', error);
      throw new Error('Failed to verify Paystack payment');
    }
  },
};

// PayPal Integration
export const paypalPayment = {
  // Create PayPal order
  createOrder: async (amount, currency = 'USD') => {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString(),
          },
        }],
      });
      
      const order = await paypalInstance.execute(request);
      return order.result;
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw new Error('Failed to create PayPal order');
    }
  },

  // Capture PayPal payment
  capturePayment: async (orderId) => {
    try {
      // In development/test mode, simulate successful payment
      if (isDevelopment || isTestMode) {
        console.log('Development mode: Simulating successful PayPal payment');
        return {
          status: 'COMPLETED',
          id: orderId,
          purchase_units: [{
            payments: {
              captures: [{
                id: `DEV_${Date.now()}`,
                status: 'COMPLETED',
              }],
            },
          }],
        };
      }
      
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      const capture = await paypalInstance.execute(request);
      return capture.result;
    } catch (error) {
      console.error('PayPal payment capture error:', error);
      throw new Error('Failed to capture PayPal payment');
    }
  },
};

// Helper function to determine which payment method to use based on user preference
export const getPaymentMethod = (method, data) => {
  switch (method) {
    case 'mpesa':
      return mpesa.initiateSTKPush(data.phoneNumber, data.amount, data.orderId);
    case 'paystack':
      return paystackPayment.initializePayment(data.email, data.amount, data.orderId);
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
    // Create a payment record
    const payment = await Payment.create({
      order: order._id,
      user: order.user._id,
      amount: order.totalAmount,
      method: 'mpesa',
      status: 'pending',
      transactionId: `MPESA_${Date.now()}`,
      metadata: {
        phoneNumber,
        orderId: order._id,
      },
    });

    // Initiate M-Pesa payment
    const result = await mpesa.initiateSTKPush(
      phoneNumber,
      order.totalAmount,
      order._id.toString()
    );

    // Update payment record with M-Pesa response
    payment.metadata.set('mpesaResponse', result);
    await payment.save();

    return {
      success: true,
      paymentId: payment._id,
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
      message: 'M-Pesa payment initiated successfully',
    };
  } catch (error) {
    console.error('M-Pesa payment initialization error:', error);
    throw new Error('Failed to initialize M-Pesa payment');
  }
};

// Initialize Paystack payment
export const initializePaystackPayment = async (order) => {
  try {
    // Create a payment record
    const payment = await Payment.create({
      order: order._id,
      user: order.user._id,
      amount: order.totalAmount,
      method: 'paystack',
      status: 'pending',
      transactionId: `PAYSTACK_${Date.now()}`,
      metadata: {
        orderId: order._id,
      },
    });

    // Initiate Paystack payment
    const result = await paystackPayment.initializePayment(
      order.user.email,
      order.totalAmount,
      order._id.toString()
    );

    // Update payment record with Paystack response
    payment.metadata.set('paystackResponse', result);
    await payment.save();

    return {
      success: true,
      paymentId: payment._id,
      authorizationUrl: result.authorization_url,
      reference: result.reference,
      message: 'Paystack payment initiated successfully',
    };
  } catch (error) {
    console.error('Paystack payment initialization error:', error);
    throw new Error('Failed to initialize Paystack payment');
  }
};

// Initialize PayPal payment
export const initializePaypalPayment = async (order) => {
  try {
    // Create a payment record
    const payment = await Payment.create({
      order: order._id,
      user: order.user._id,
      amount: order.totalAmount,
      method: 'paypal',
      status: 'pending',
      transactionId: `PAYPAL_${Date.now()}`,
      metadata: {
        orderId: order._id,
      },
    });

    // Create PayPal order
    const result = await paypalPayment.createOrder(order.totalAmount);

    // Update payment record with PayPal response
    payment.metadata.set('paypalResponse', result);
    await payment.save();

    return {
      success: true,
      paymentId: payment._id,
      paypalOrderId: result.id,
      approvalUrl: result.links.find(link => link.rel === 'approve').href,
      message: 'PayPal payment initiated successfully',
    };
  } catch (error) {
    console.error('PayPal payment initialization error:', error);
    throw new Error('Failed to initialize PayPal payment');
  }
}; 