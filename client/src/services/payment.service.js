import api from '../utils/api';
import { PAYMENT_METHODS } from '../constants/payment';

/**
 * Get available payment methods
 * @returns {Promise<Object>} - Available payment methods
 */
export const getPaymentMethods = async () => {
  const response = await api.get('/payment/methods');
  return response.data;
};

/**
 * Initialize a payment
 * @param {Object} paymentData - Payment initialization data
 * @param {string} paymentData.method - Payment method
 * @param {string} paymentData.orderId - Order ID
 * @param {Object} paymentData.details - Payment method specific details
 * @returns {Promise<Object>} - Payment initialization response
 */
export const initializePayment = async (paymentData) => {
  const response = await api.post('/payment/initialize', paymentData);
  return response.data;
};

/**
 * Process M-Pesa payment
 * @param {Object} paymentData - M-Pesa payment data
 * @param {string} paymentData.phone - Phone number
 * @param {string} paymentData.amount - Amount
 * @param {string} paymentData.orderId - Order ID
 * @returns {Promise<Object>} - Payment processing response
 */
export const processMpesaPayment = async (paymentData) => {
  const response = await api.post('/payment/mpesa', paymentData);
  return response.data;
};

/**
 * Process Paystack payment
 * @param {Object} paymentData - Paystack payment data
 * @param {string} paymentData.email - Email address
 * @param {string} paymentData.amount - Amount
 * @param {string} paymentData.orderId - Order ID
 * @returns {Promise<Object>} - Payment processing response
 */
export const processPaystackPayment = async (paymentData) => {
  const response = await api.post('/payment/paystack', paymentData);
  return response.data;
};

/**
 * Process PayPal payment
 * @param {Object} paymentData - PayPal payment data
 * @param {string} paymentData.orderId - Order ID
 * @returns {Promise<Object>} - Payment processing response
 */
export const processPaypalPayment = async (paymentData) => {
  const response = await api.post('/payment/paypal', paymentData);
  return response.data;
};

/**
 * Verify payment status
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} - Payment verification response
 */
export const verifyPayment = async (paymentId) => {
  const response = await api.get(`/payment/verify/${paymentId}`);
  return response.data;
};

/**
 * Get payment history
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Payment status filter
 * @returns {Promise<Object>} - Payment history
 */
export const getPaymentHistory = async (params = {}) => {
  const response = await api.get('/payment/history', { params });
  return response.data;
};

/**
 * Request payment refund
 * @param {string} paymentId - Payment ID
 * @param {Object} refundData - Refund data
 * @param {number} refundData.amount - Refund amount
 * @param {string} refundData.reason - Refund reason
 * @returns {Promise<Object>} - Refund request response
 */
export const requestRefund = async (paymentId, refundData) => {
  const response = await api.post(`/payment/${paymentId}/refund`, refundData);
  return response.data;
};

/**
 * Get payment details
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} - Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  const response = await api.get(`/payment/${paymentId}`);
  return response.data;
}; 