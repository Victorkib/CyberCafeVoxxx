import { handleAsync } from "../utils/errorHandler.js"

// Get notification service from app
const getNotificationService = (req) => req.app.get("notificationService")

// @desc    Get all notifications for the current user with filtering
// @route   GET /api/notifications
// @access  Private
export const getNotifications = handleAsync(async (req, res) => {
  const { page = 1, limit = 10, type, read } = req.query
  const notificationService = getNotificationService(req)

  const result = await notificationService.getNotifications(req.user._id, {
    page: Number.parseInt(page),
    limit: Number.parseInt(limit),
    type,
    read: read === "true",
  })

  res.status(200).json({
    status: "success",
    data: result,
  })
})

// @desc    Get notification statistics for the current user
// @route   GET /api/notifications/stats
// @access  Private
export const getNotificationStats = handleAsync(async (req, res) => {
  const notificationService = getNotificationService(req)
  const stats = await notificationService.getNotificationStats(req.user._id)

  res.status(200).json({
    status: "success",
    data: stats,
  })
})

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = handleAsync(async (req, res, next) => {
  const notificationService = getNotificationService(req)
  const notification = await notificationService.markAsRead(req.user._id, req.params.id)

  res.status(200).json({
    status: "success",
    data: notification,
  })
})

// @desc    Mark all notifications as read (optionally filtered by type)
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = handleAsync(async (req, res) => {
  const { type } = req.query
  const notificationService = getNotificationService(req)
  await notificationService.markAllAsRead(req.user._id, type)

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  })
})

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = handleAsync(async (req, res, next) => {
  const notificationService = getNotificationService(req)
  await notificationService.deleteNotification(req.user._id, req.params.id)

  res.status(200).json({
    status: "success",
    message: "Notification deleted successfully",
  })
})

// @desc    Get unread notification count (optionally filtered by type)
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = handleAsync(async (req, res) => {
  const { type } = req.query
  const notificationService = getNotificationService(req)
  const count = await notificationService.getUnreadCount(req.user._id, type)

  res.status(200).json({
    status: "success",
    data: { count },
  })
})
