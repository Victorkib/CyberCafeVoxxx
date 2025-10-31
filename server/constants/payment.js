// Payment Status Constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PROCESSING: 'processing',
};

// Payment Method Constants
export const PAYMENT_METHODS = {
  MPESA: 'mpesa',
  PAYSTACK: 'paystack',
  PAYPAL: 'paypal',
  CREDIT_CARD: 'credit-card',
};

// Payment Error Types
export const PAYMENT_ERRORS = {
  INVALID_AMOUNT: 'Invalid amount',
  PAYMENT_FAILED: 'Payment failed',
  REFUND_FAILED: 'Refund failed',
  NETWORK_ERROR: 'Network error',
  INVALID_PAYMENT_METHOD: 'Invalid payment method',
  TRANSACTION_EXPIRED: 'Transaction expired',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  CARD_DECLINED: 'Card declined',
  INVALID_CARD: 'Invalid card details',
  INVALID_PHONE: 'Invalid phone number',
};

// Payment Notification Types
export const PAYMENT_NOTIFICATIONS = {
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  REFUND_PROCESSED: 'refund_processed',
  REFUND_FAILED: 'refund_failed',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_CANCELLED: 'payment_cancelled',
};

// Payment Priority Levels
export const PAYMENT_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Payment Validation Constants
export const PAYMENT_VALIDATION = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000,
  TRANSACTION_TIMEOUT_MINUTES: 30,
  MAX_REFUND_DAYS: 30,
};
