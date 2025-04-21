import { handleAsync } from "../utils/errorHandler.js"
import { AppError } from "../utils/appError.js"

// Get notification service from app
const getNotificationService = (req) => req.app.get("notificationService")

// @desc    Get all notifications (admin view)
// @route   GET /api/admin/notifications
// @access  Admin
export const getAllNotifications = handleAsync(async (req, res, next) => {
  const { page = 1, limit = 10, type, priority, startDate, endDate, userId } = req.query
  const query = {}

  if (type) query.type = type
  if (priority) query.priority = priority
  if (userId) query.user = userId
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    }
  }

  const notificationService = getNotificationService(req)
  const result = await notificationService.getAllNotifications({
    page: Number.parseInt(page),
    limit: Number.parseInt(limit),
    ...query,
  })

  res.status(200).json({
    status: "success",
    data: result,
  })
})

// @desc    Create notification(s) for specific users or all users
// @route   POST /api/admin/notifications
// @access  Admin
export const createNotification = handleAsync(async (req, res, next) => {
  const { title, message, type = "system", priority = "medium", link, metadata = {}, expiresAt, userIds } = req.body

  if (!title || !message) {
    throw new AppError("Title and message are required", 400)
  }

  const notificationService = getNotificationService(req)

  // Use the broadcast method from our unified service
  const result = await notificationService.broadcastNotification({
    title,
    message,
    type,
    link,
    metadata,
    priority,
    expiresAt,
    userIds, // If null, will send to all users
  })

  res.status(201).json({
    status: "success",
    data: result,
  })
})

// @desc    Delete a notification
// @route   DELETE /api/admin/notifications/:id
// @access  Admin
export const deleteNotification = handleAsync(async (req, res, next) => {
  const notificationService = getNotificationService(req)

  // Admin can delete any notification regardless of user
  const deleted = await notificationService.deleteNotificationAdmin(req.params.id)

  if (!deleted) {
    throw new AppError("Notification not found", 404)
  }

  res.status(200).json({
    status: "success",
    message: "Notification deleted successfully",
  })
})

// @desc    Delete all notifications
// @route   DELETE /api/admin/notifications
// @access  Admin
export const deleteAllNotifications = handleAsync(async (req, res, next) => {
  const { userIds, type } = req.query
  const notificationService = getNotificationService(req)

  let result
  if (userIds) {
    // Delete notifications for specific users
    result = await notificationService.deleteNotificationsForUsers(userIds.split(","), type)
  } else {
    // Delete all notifications
    result = await notificationService.deleteAllNotifications(type)
  }

  res.status(200).json({
    status: "success",
    message: "Notifications deleted successfully",
    data: { count: result.deletedCount },
  })
})

// @desc    Get notification statistics
// @route   GET /api/admin/notifications/stats
// @access  Admin
export const getNotificationStats = handleAsync(async (req, res, next) => {
  const notificationService = getNotificationService(req)
  const stats = await notificationService.getSystemNotificationStats()

  res.status(200).json({
    status: "success",
    data: stats,
  })
})

// @desc    Retry delivery for undelivered notifications
// @route   POST /api/admin/notifications/retry-delivery
// @access  Admin
export const retryUndeliveredNotifications = handleAsync(async (req, res) => {
  const notificationService = getNotificationService(req)
  const result = await notificationService.retryUndeliveredNotifications()

  res.status(200).json({
    status: "success",
    data: result,
  })
})
