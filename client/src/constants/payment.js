/**
 * Available payment methods
 */
export const PAYMENT_METHODS = {
  MPESA: 'mpesa',
  PAYSTACK: 'paystack',
  PAYPAL: 'paypal'
};

/**
 * Payment status values
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

/**
 * Payment method display names
 */
export const PAYMENT_METHOD_NAMES = {
  [PAYMENT_METHODS.MPESA]: 'M-Pesa',
  [PAYMENT_METHODS.PAYSTACK]: 'Paystack',
  [PAYMENT_METHODS.PAYPAL]: 'PayPal'
};

/**
 * Payment status display names
 */
export const PAYMENT_STATUS_NAMES = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PROCESSING]: 'Processing',
  [PAYMENT_STATUS.COMPLETED]: 'Completed',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [PAYMENT_STATUS.CANCELLED]: 'Cancelled'
};

/**
 * Payment status color classes
 */
export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'text-yellow-600 bg-yellow-100',
  [PAYMENT_STATUS.PROCESSING]: 'text-blue-600 bg-blue-100',
  [PAYMENT_STATUS.COMPLETED]: 'text-green-600 bg-green-100',
  [PAYMENT_STATUS.FAILED]: 'text-red-600 bg-red-100',
  [PAYMENT_STATUS.REFUNDED]: 'text-purple-600 bg-purple-100',
  [PAYMENT_STATUS.CANCELLED]: 'text-gray-600 bg-gray-100'
};

/**
 * Payment error messages
 */
export const PAYMENT_ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Invalid payment amount',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_EMAIL: 'Invalid email address',
  PAYMENT_FAILED: 'Payment processing failed',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT: 'Payment request timed out',
  INVALID_METHOD: 'Invalid payment method',
  ORDER_NOT_FOUND: 'Order not found',
  PAYMENT_EXPIRED: 'Payment session expired',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  TRANSACTION_LIMIT: 'Transaction limit exceeded'
};

/**
 * Payment validation patterns
 */
export const PAYMENT_VALIDATION = {
  MPESA_PHONE: /^254[0-9]{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/
};

/**
 * Payment configuration
 */
export const PAYMENT_CONFIG = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000 // 5 seconds
};

export const PAYMENT_ERRORS = {
  INITIALIZATION_FAILED: 'Payment initialization failed',
  PROCESSING_FAILED: 'Payment processing failed',
  CALLBACK_FAILED: 'Payment callback failed',
  REFUND_FAILED: 'Payment refund failed',
  INVALID_REFERENCE: 'Invalid payment reference',
  INVALID_CALLBACK: 'Invalid payment callback',
  INVALID_ORDER: 'Invalid order',
  INVALID_USER: 'Invalid user',
  INVALID_CARD: 'Invalid card details',
  INVALID_PAYPAL: 'Invalid PayPal details',
  INVALID_MPESA: 'Invalid M-Pesa details',
  INVALID_PAYSTACK: 'Invalid Paystack details'
}; 