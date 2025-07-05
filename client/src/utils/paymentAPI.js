// Import the existing API setup
import { defaultApi, endpoints } from './api.js';

// ENHANCED: Extend the existing endpoints with additional payment endpoints
const paymentEndpoints = {
  ...endpoints.payments,
  // FIXED: Update inline checkout endpoints to match backend
  inlineCallback: '/payments/inline-callback',
  inlineVerify: '/payments/verify-inline',
  retry: '/payments/retry',
  status: (orderId) => `/payments/status/${orderId}`,
  history: '/payments/history',
  details: (orderId) => `/payments/details/${orderId}`,
  refunds: '/payments/refunds',
  // Admin endpoints
  adminAnalytics: '/payments/analytics',
  adminRefund: '/payments/refund',
  adminSettings: '/payments/settings',
};

export const paymentAPI = {
  // Get available payment methods
  getMethods: () => {
    console.log('🌐 API: Fetching payment methods');
    return defaultApi.get(paymentEndpoints.methods);
  },

  // Initialize payment
  initialize: (paymentData) => {
    console.log('🌐 API: Initializing payment with data:', paymentData);
    return defaultApi.post(paymentEndpoints.initialize, paymentData);
  },

  // FIXED: Process inline callback (critical for stock reduction)
  processInlineCallback: (callbackData) => {
    console.log('🌐 API: Processing inline callback with data:', callbackData);
    return defaultApi.post(paymentEndpoints.inlineCallback, callbackData);
  },

  // FIXED: Verify inline payment (critical for stock reduction)
  verifyInlinePayment: (verificationData) => {
    console.log(
      '🌐 API: Verifying inline payment with data:',
      verificationData
    );
    return defaultApi.post(paymentEndpoints.inlineVerify, verificationData);
  },

  // Retry payment
  retry: (retryData) => {
    console.log('🌐 API: Retrying payment with data:', retryData);
    return defaultApi.post(paymentEndpoints.retry, retryData);
  },

  // Check payment status
  checkStatus: (orderId) => {
    console.log('🌐 API: Checking payment status for order:', orderId);
    return defaultApi.get(paymentEndpoints.status(orderId));
  },

  // Get payment history
  getHistory: (params) => {
    console.log('🌐 API: Fetching payment history with params:', params);
    return defaultApi.get(paymentEndpoints.history, { params });
  },

  // Get payment details
  getDetails: (orderId) => {
    console.log('🌐 API: Fetching payment details for order:', orderId);
    return defaultApi.get(paymentEndpoints.details(orderId));
  },

  // Get refund history
  getRefundHistory: (params) => {
    console.log('🌐 API: Fetching refund history with params:', params);
    return defaultApi.get(paymentEndpoints.refunds, { params });
  },

  // ENHANCED: Admin endpoints with better logging
  getAnalytics: (params) => {
    console.log('🌐 API: Fetching payment analytics with params:', params);
    return defaultApi.get(paymentEndpoints.adminAnalytics, { params });
  },

  refund: (paymentId, reason) => {
    console.log('🌐 API: Processing refund:', { paymentId, reason });
    return defaultApi.post(paymentEndpoints.adminRefund, { paymentId, reason });
  },

  getSettings: () => {
    console.log('🌐 API: Fetching payment settings');
    return defaultApi.get(paymentEndpoints.adminSettings);
  },

  updateSettings: (settings) => {
    console.log('🌐 API: Updating payment settings with data:', settings);
    return defaultApi.put(paymentEndpoints.adminSettings, settings);
  },

  // ENHANCED: Additional utility methods for better integration
  verifyPaymentWithProvider: (paymentId) => {
    console.log(
      '🌐 API: Verifying payment with provider for payment:',
      paymentId
    );
    return defaultApi.post(`/payments/verify-provider/${paymentId}`);
  },

  // Webhook endpoints (for admin use)
  processWebhook: (provider, webhookData) => {
    console.log('🌐 API: Processing webhook for provider:', provider);
    return defaultApi.post(`/payments/webhooks/${provider}`, webhookData);
  },
};

export default paymentAPI;
