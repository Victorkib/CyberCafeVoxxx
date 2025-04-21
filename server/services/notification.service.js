import Notification from '../models/notification.model.js';
import { handleAsync } from '../utils/errorHandler.js';

export const createNotification = handleAsync(async (userId, { title, message, type = 'system', link, metadata, priority = 'medium', expiresAt = null }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
    metadata,
    priority,
    expiresAt
  });
  return notification;
});

export const createOrderNotification = async (userId, orderId, status) => {
  const title = 'Order Update';
  const message = `Your order #${orderId} has been ${status}`;
  const link = `/orders/${orderId}`;
  const priority = status === 'cancelled' || status === 'refunded' ? 'high' : 'medium';
  
  return createNotification(userId, { 
    title, 
    message, 
    type: 'order', 
    link, 
    metadata: { orderId, status },
    priority
  });
};

export const createPaymentNotification = async (userId, orderId, status, amount) => {
  const title = 'Payment Update';
  const message = `Payment of $${amount} for order #${orderId} has been ${status}`;
  const link = `/orders/${orderId}`;
  const priority = status === 'failed' ? 'high' : 'medium';
  
  return createNotification(userId, { 
    title, 
    message, 
    type: 'payment', 
    link, 
    metadata: { orderId, amount, status },
    priority
  });
};

export const createProductStockNotification = async (userId, productId, productName, currentStock, threshold) => {
  const title = 'Low Stock Alert';
  const message = `${productName} is running low on stock (${currentStock} remaining)`;
  const link = `/products/${productId}`;
  
  return createNotification(userId, { 
    title, 
    message, 
    type: 'product', 
    link, 
    metadata: { productId, currentStock, threshold },
    priority: 'high'
  });
};

export const createReviewNotification = async (userId, productId, productName, rating, comment) => {
  const title = 'New Review';
  const message = `Your review for ${productName} has been posted`;
  const link = `/products/${productId}`;
  
  return createNotification(userId, { 
    title, 
    message, 
    type: 'review', 
    link, 
    metadata: { productId, rating, comment }
  });
};

export const createWishlistNotification = async (userId, productId, productName, action) => {
  const title = 'Wishlist Update';
  const message = `${productName} has been ${action} your wishlist`;
  const link = `/products/${productId}`;
  
  return createNotification(userId, { 
    title, 
    message, 
    type: 'wishlist', 
    link, 
    metadata: { productId, action }
  });
};

export const createSecurityNotification = async (userId, event, details) => {
  const title = 'Security Alert';
  let message = '';
  let priority = 'high';
  
  switch (event) {
    case 'login_attempt':
      message = `New login attempt from ${details.ip} in ${details.location}`;
      break;
    case 'password_change':
      message = 'Your password has been changed successfully';
      priority = 'medium';
      break;
    case 'email_change':
      message = 'Your email address has been updated';
      break;
    case 'two_factor_enabled':
      message = 'Two-factor authentication has been enabled for your account';
      break;
    case 'two_factor_disabled':
      message = 'Two-factor authentication has been disabled for your account';
      break;
    default:
      message = details.message || 'Security event occurred';
  }
  
  return createNotification(userId, { 
    title, 
    message, 
    type: 'security', 
    metadata: { event, ...details },
    priority
  });
};

export const createPromotionNotification = async (userId, title, message, link = null, expiresAt = null) => {
  return createNotification(userId, { 
    title, 
    message, 
    type: 'promotion', 
    link,
    expiresAt
  });
};

export const getNotifications = handleAsync(async (userId, { page = 1, limit = 10, type = null, read = null }) => {
  const skip = (page - 1) * limit;
  const query = { user: userId };
  
  if (type) query.type = type;
  if (read !== null) query.read = read;
  
  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query)
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
});

export const markAsRead = handleAsync(async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  return notification;
});

export const markAllAsRead = handleAsync(async (userId, type = null) => {
  const query = { user: userId, read: false };
  if (type) query.type = type;
  
  await Notification.updateMany(query, { read: true });
});

export const deleteNotification = handleAsync(async (userId, notificationId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId
  });
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  return notification;
});

export const getUnreadCount = handleAsync(async (userId, type = null) => {
  const query = { user: userId, read: false };
  if (type) query.type = type;
  
  const count = await Notification.countDocuments(query);
  return count;
});

export const getNotificationStats = handleAsync(async (userId) => {
  const [totalCount, typeStats, readStats] = await Promise.all([
    Notification.countDocuments({ user: userId }),
    Notification.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    Notification.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$read', count: { $sum: 1 } } }
    ])
  ]);

  return {
    totalCount,
    typeStats,
    readStats
  };
}); 