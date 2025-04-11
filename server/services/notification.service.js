import Notification from '../models/notification.model.js';
import { handleAsync } from '../utils/errorHandler.js';

export const createNotification = handleAsync(async (userId, { title, message, type = 'system', link, metadata }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
    metadata
  });
  return notification;
});

export const createOrderNotification = async (userId, orderId, status) => {
  const title = 'Order Update';
  const message = `Your order #${orderId} has been ${status}`;
  const link = `/orders/${orderId}`;
  
  return createNotification(userId, { title, message, type: 'order', link, metadata: { orderId } });
};

export const createPaymentNotification = async (userId, orderId, status, amount) => {
  const title = 'Payment Update';
  const message = `Payment of $${amount} for order #${orderId} has been ${status}`;
  const link = `/orders/${orderId}`;
  
  return createNotification(userId, { title, message, type: 'payment', link, metadata: { orderId, amount } });
};

export const createPromotionNotification = async (userId, title, message, link = null) => {
  return createNotification(userId, { title, message, type: 'promotion', link });
};

export const getNotifications = handleAsync(async (userId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  
  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: userId })
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

export const markAllAsRead = handleAsync(async (userId) => {
  await Notification.updateMany(
    { user: userId, read: false },
    { read: true }
  );
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

export const getUnreadCount = handleAsync(async (userId) => {
  const count = await Notification.countDocuments({
    user: userId,
    read: false
  });
  
  return count;
}); 