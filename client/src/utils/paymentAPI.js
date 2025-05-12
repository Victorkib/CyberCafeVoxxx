import { apiRequest } from './api';

/**
 * Payment API client that matches the server endpoints
 */
export const paymentAPI = {
  // Get available payment methods
  getMethods: () => apiRequest.get('/payments/methods'),

  // Initialize payment
  initialize: (paymentData) => {
    const { orderId, method, phoneNumber, email } = paymentData;
    return apiRequest.post('/payments/initialize', {
      orderId,
      method,
      phoneNumber,
      email,
    });
  },

  // Process payment callback
  processCallback: (callbackData) =>
    apiRequest.post('/payments/callback', callbackData),

  // Check payment status
  checkStatus: (orderId) => apiRequest.get(`/payments/status/${orderId}`),

  // Retry payment
  retry: (paymentData) => apiRequest.post('/payments/retry', paymentData),

  // Get payment history
  getHistory: (params = {}) => apiRequest.get('/payments/history', { params }),

  // Get payment details
  getDetails: (orderId) => apiRequest.get(`/payments/details/${orderId}`),

  // Process refund (admin only)
  refund: (paymentId, reason) =>
    apiRequest.post('/payments/admin/refund', { paymentId, reason }),

  // Get payment analytics (admin only)
  getAnalytics: (params = {}) =>
    apiRequest.get('/payments/admin/analytics', { params }),

  // Get refund history
  getRefundHistory: (params = {}) =>
    apiRequest.get('/payments/refunds', { params }),

  // Get payment settings (admin only)
  getSettings: () => apiRequest.get('/payments/admin/settings'),

  // Update payment settings (admin only)
  updateSettings: (settings) =>
    apiRequest.put('/payments/admin/settings', settings),
};

// Check payment status
export const checkStatus = async (orderId) => {
  try {
    const response = await apiRequest.get(`/payments/status/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

export default paymentAPI;
