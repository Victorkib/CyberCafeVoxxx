import Notification from '../models/notification.model.js';
import { handleAsync } from '../utils/errorHandler.js';
import { AppError } from '../utils/appError.js';
import * as notificationService from '../services/notification.service.js';
import { handleError } from '../utils/error.js';

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = handleAsync(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: notifications
  });
});

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = handleAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    status: 'success',
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = handleAsync(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = handleAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully'
  });
});

export const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    handleError(res, error);
  }
}; 