// Import the existing API setup
import { apiRequest, endpoints } from './api.js';

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
    return apiRequest.get(paymentEndpoints.methods);
  },

  // Initialize payment
  initialize: (paymentData) => {
    console.log('🌐 API: Initializing payment with data:', paymentData);
    return apiRequest.post(paymentEndpoints.initialize, paymentData);
  },

  // FIXED: Process inline callback (critical for stock reduction)
  processInlineCallback: (callbackData) => {
    console.log('🌐 API: Processing inline callback with data:', callbackData);
    return apiRequest.post(paymentEndpoints.inlineCallback, callbackData);
  },

  // FIXED: Verify inline payment (critical for stock reduction)
  verifyInlinePayment: (verificationData) => {
    console.log(
      '🌐 API: Verifying inline payment with data:',
      verificationData
    );
    return apiRequest.post(paymentEndpoints.inlineVerify, verificationData);
  },

  // Retry payment
  retry: (retryData) => {
    console.log('🌐 API: Retrying payment with data:', retryData);
    return apiRequest.post(paymentEndpoints.retry, retryData);
  },

  // Check payment status
  checkStatus: (orderId) => {
    console.log('🌐 API: Checking payment status for order:', orderId);
    return apiRequest.get(paymentEndpoints.status(orderId));
  },

  // Get payment history
  getHistory: (params) => {
    console.log('🌐 API: Fetching payment history with params:', params);
    return apiRequest.get(paymentEndpoints.history, { params });
  },

  // Get payment details
  getDetails: (orderId) => {
    console.log('🌐 API: Fetching payment details for order:', orderId);
    return apiRequest.get(paymentEndpoints.details(orderId));
  },

  // Get refund history
  getRefundHistory: (params) => {
    console.log('🌐 API: Fetching refund history with params:', params);
    return apiRequest.get(paymentEndpoints.refunds, { params });
  },

  // ENHANCED: Admin endpoints with better logging
  getAnalytics: (params) => {
    console.log('🌐 API: Fetching payment analytics with params:', params);
    return apiRequest.get(paymentEndpoints.adminAnalytics, { params });
  },

  refund: (paymentId, reason) => {
    console.log('🌐 API: Processing refund:', { paymentId, reason });
    return apiRequest.post(paymentEndpoints.adminRefund, { paymentId, reason });
  },

  getSettings: () => {
    console.log('🌐 API: Fetching payment settings');
    return apiRequest.get(paymentEndpoints.adminSettings);
  },

  updateSettings: (settings) => {
    console.log('🌐 API: Updating payment settings with data:', settings);
    return apiRequest.put(paymentEndpoints.adminSettings, settings);
  },

  // ENHANCED: Additional utility methods for better integration
  verifyPaymentWithProvider: (paymentId) => {
    console.log(
      '🌐 API: Verifying payment with provider for payment:',
      paymentId
    );
    return apiRequest.post(`/payments/verify-provider/${paymentId}`);
  },

  // Webhook endpoints (for admin use)
  processWebhook: (provider, webhookData) => {
    console.log('🌐 API: Processing webhook for provider:', provider);
    return apiRequest.post(`/payments/webhooks/${provider}`, webhookData);
  },
};

export default paymentAPI;
