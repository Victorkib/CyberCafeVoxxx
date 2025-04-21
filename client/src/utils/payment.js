import { PAYMENT_METHODS, PAYMENT_STATUS, PAYMENT_ERRORS } from '../constants/payment';

/**
 * Validates phone number for M-Pesa
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const validateMpesaPhone = (phone) => {
  const phoneRegex = /^254[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates email for Paystack
 * @param {string} email - Email to validate
 * @param {string} amount - Amount to validate
 * @returns {boolean} - Whether the email and amount are valid
 */
export const validatePaystackDetails = (email, amount) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const amountRegex = /^\d+(\.\d{1,2})?$/;
  return emailRegex.test(email) && amountRegex.test(amount);
};

/**
 * Formats amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted amount
 */
export const formatAmount = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Gets payment method display name
 * @param {string} method - Payment method code
 * @returns {string} - Display name
 */
export const getPaymentMethodName = (method) => {
  switch (method) {
    case PAYMENT_METHODS.MPESA:
      return 'M-Pesa';
    case PAYMENT_METHODS.PAYSTACK:
      return 'Paystack';
    case PAYMENT_METHODS.PAYPAL:
      return 'PayPal';
    default:
      return 'Unknown';
  }
};

/**
 * Gets payment status display name
 * @param {string} status - Payment status code
 * @returns {string} - Display name
 */
export const getPaymentStatusName = (status) => {
  switch (status) {
    case PAYMENT_STATUS.PENDING:
      return 'Pending';
    case PAYMENT_STATUS.PROCESSING:
      return 'Processing';
    case PAYMENT_STATUS.COMPLETED:
      return 'Completed';
    case PAYMENT_STATUS.FAILED:
      return 'Failed';
    case PAYMENT_STATUS.REFUNDED:
      return 'Refunded';
    default:
      return 'Unknown';
  }
};

/**
 * Gets payment status color
 * @param {string} status - Payment status code
 * @returns {string} - Color class
 */
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case PAYMENT_STATUS.PENDING:
      return 'text-yellow-600';
    case PAYMENT_STATUS.PROCESSING:
      return 'text-blue-600';
    case PAYMENT_STATUS.COMPLETED:
      return 'text-green-600';
    case PAYMENT_STATUS.FAILED:
      return 'text-red-600';
    case PAYMENT_STATUS.REFUNDED:
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Gets payment error message
 * @param {string} error - Error code
 * @returns {string} - Error message
 */
export const getPaymentErrorMessage = (error) => {
  return PAYMENT_ERRORS[error] || 'An unknown error occurred';
}; 