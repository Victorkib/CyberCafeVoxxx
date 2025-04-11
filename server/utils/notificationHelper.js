import Notification from '../models/notification.model.js';

/**
 * Create a notification for a user
 * @param {Object} options - Notification options
 * @param {string} options.userId - The ID of the user to notify
 * @param {string} options.title - The notification title
 * @param {string} options.message - The notification message
 * @param {string} options.type - The type of notification (order, payment, system, promotion)
 * @param {string} [options.link] - Optional link for the notification
 * @param {Object} [options.metadata] - Optional metadata for the notification
 * @returns {Promise<Object>} - The created notification
 */
export const createNotification = async ({
  userId,
  title,
  message,
  type,
  link = null,
  metadata = {}
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      metadata
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create an order notification
 * @param {Object} options - Order notification options
 * @param {string} options.userId - The ID of the user to notify
 * @param {string} options.orderId - The ID of the order
 * @param {string} options.status - The status of the order
 * @param {number} options.total - The total amount of the order
 * @returns {Promise<Object>} - The created notification
 */
export const createOrderNotification = async ({
  userId,
  orderId,
  status,
  total
}) => {
  let title, message;
  
  switch (status) {
    case 'pending':
      title = 'Order Placed';
      message = `Your order #${orderId} has been placed successfully. Total: $${total.toFixed(2)}`;
      break;
    case 'processing':
      title = 'Order Processing';
      message = `Your order #${orderId} is now being processed.`;
      break;
    case 'shipped':
      title = 'Order Shipped';
      message = `Your order #${orderId} has been shipped and is on its way to you.`;
      break;
    case 'delivered':
      title = 'Order Delivered';
      message = `Your order #${orderId} has been delivered. Enjoy your purchase!`;
      break;
    case 'cancelled':
      title = 'Order Cancelled';
      message = `Your order #${orderId} has been cancelled.`;
      break;
    default:
      title = 'Order Update';
      message = `Your order #${orderId} status has been updated to ${status}.`;
  }

  return createNotification({
    userId,
    title,
    message,
    type: 'order',
    link: `/orders/${orderId}`,
    metadata: { orderId, status, total }
  });
};

/**
 * Create a payment notification
 * @param {Object} options - Payment notification options
 * @param {string} options.userId - The ID of the user to notify
 * @param {string} options.orderId - The ID of the order
 * @param {string} options.status - The status of the payment
 * @param {number} options.amount - The amount paid
 * @returns {Promise<Object>} - The created notification
 */
export const createPaymentNotification = async ({
  userId,
  orderId,
  status,
  amount
}) => {
  let title, message;
  
  switch (status) {
    case 'succeeded':
      title = 'Payment Successful';
      message = `Your payment of $${amount.toFixed(2)} for order #${orderId} was successful.`;
      break;
    case 'failed':
      title = 'Payment Failed';
      message = `Your payment for order #${orderId} has failed. Please try again.`;
      break;
    case 'refunded':
      title = 'Payment Refunded';
      message = `Your payment of $${amount.toFixed(2)} for order #${orderId} has been refunded.`;
      break;
    default:
      title = 'Payment Update';
      message = `Your payment for order #${orderId} status has been updated to ${status}.`;
  }

  return createNotification({
    userId,
    title,
    message,
    type: 'payment',
    link: `/orders/${orderId}`,
    metadata: { orderId, status, amount }
  });
};

/**
 * Create a system notification
 * @param {Object} options - System notification options
 * @param {string} options.userId - The ID of the user to notify
 * @param {string} options.title - The notification title
 * @param {string} options.message - The notification message
 * @param {string} [options.link] - Optional link for the notification
 * @returns {Promise<Object>} - The created notification
 */
export const createSystemNotification = async ({
  userId,
  title,
  message,
  link = null
}) => {
  return createNotification({
    userId,
    title,
    message,
    type: 'system',
    link
  });
};

/**
 * Create a promotion notification
 * @param {Object} options - Promotion notification options
 * @param {string} options.userId - The ID of the user to notify
 * @param {string} options.title - The promotion title
 * @param {string} options.message - The promotion message
 * @param {string} [options.link] - Optional link for the promotion
 * @returns {Promise<Object>} - The created notification
 */
export const createPromotionNotification = async ({
  userId,
  title,
  message,
  link = null
}) => {
  return createNotification({
    userId,
    title,
    message,
    type: 'promotion',
    link
  });
}; 