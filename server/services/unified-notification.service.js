import Notification from "../models/notification.model.js"
import jwt from "jsonwebtoken"
import { RateLimiter } from "../utils/rateLimiter.js"
import mongoose from "mongoose"

class UnifiedNotificationService {
  constructor(io) {
    this.io = io
    this.userSockets = new Map() // Map to store user ID to socket ID mapping
    this.rateLimiter = new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    })
    this.setupSocketHandlers()
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      // Handle user authentication with JWT
      socket.on("authenticate", async (token) => {
        try {
          // Verify JWT token
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          const userId = decoded.id

          // Store authenticated socket
          this.userSockets.set(userId, socket.id)
          socket.userId = userId // Store userId in socket for easy access

          // Send unread count on authentication
          const unreadCount = await this.getUnreadCount(userId)
          socket.emit("authenticated", {
            success: true,
            unreadCount,
          })

          console.log(`User ${userId} authenticated with socket ${socket.id}`)
        } catch (error) {
          console.error("Socket authentication error:", error)
          socket.emit("authenticated", {
            success: false,
            message: "Authentication failed",
          })
        }
      })

      // Handle disconnection
      socket.on("disconnect", () => {
        if (socket.userId) {
          this.userSockets.delete(socket.userId)
          console.log(`User ${socket.userId} disconnected`)
        }
      })

      // Handle notification acknowledgment
      socket.on("notification:ack", async ({ notificationId }) => {
        if (socket.userId) {
          try {
            await Notification.findOneAndUpdate({ _id: notificationId, user: socket.userId }, { delivered: true })
          } catch (error) {
            console.error("Error updating notification delivery status:", error)
          }
        }
      })
    })
  }

  // DATABASE OPERATIONS

  /**
   * Create a notification
   */
  async createNotification(
    userId,
    { title, message, type = "system", link, metadata = {}, priority = "medium", expiresAt = null },
  ) {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      metadata,
      priority,
      expiresAt,
      delivered: false,
      deliveryAttempts: 0,
    })

    // Attempt real-time delivery
    await this.deliverNotification(userId, notification)

    return notification
  }

  /**
   * Get notifications for a user with filtering
   */
  async getNotifications(userId, { page = 1, limit = 10, type = null, read = null }) {
    const skip = (page - 1) * limit
    const query = { user: userId }

    if (type) query.type = type
    if (read !== null) query.read = read

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true },
    )

    if (!notification) {
      throw new Error("Notification not found")
    }

    return notification
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId, type = null) {
    const query = { user: userId, read: false }
    if (type) query.type = type

    await Notification.updateMany(query, { read: true })
  }

  /**
   * Delete a notification
   */
  async deleteNotification(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    })

    if (!notification) {
      throw new Error("Notification not found")
    }

    return notification
  }

  /**
   * Delete a notification (admin version - no user check)
   */
  async deleteNotificationAdmin(notificationId) {
    const notification = await Notification.findByIdAndDelete(notificationId)
    return notification
  }

  /**
   * Delete notifications for specific users
   */
  async deleteNotificationsForUsers(userIds, type = null) {
    const query = { user: { $in: userIds } }
    if (type) query.type = type

    return await Notification.deleteMany(query)
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(type = null) {
    const query = type ? { type } : {}
    return await Notification.deleteMany(query)
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId, type = null) {
    const query = { user: userId, read: false }
    if (type) query.type = type

    return Notification.countDocuments(query)
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(userId) {
    const [totalCount, typeStats, readStats] = await Promise.all([
      Notification.countDocuments({ user: userId }),
      Notification.aggregate([{ $match: { user: userId } }, { $group: { _id: "$type", count: { $sum: 1 } } }]),
      Notification.aggregate([{ $match: { user: userId } }, { $group: { _id: "$read", count: { $sum: 1 } } }]),
    ])

    return {
      totalCount,
      typeStats,
      readStats,
    }
  }

  // ADMIN OPERATIONS

  /**
   * Get all notifications (admin only)
   */
  async getAllNotifications({
    page = 1,
    limit = 20,
    type = null,
    userId = null,
    priority = null,
    startDate = null,
    endDate = null,
  }) {
    const skip = (page - 1) * limit
    const query = {}

    if (type) query.type = type
    if (userId) query.user = userId
    if (priority) query.priority = priority
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get system-wide notification statistics (admin only)
   */
  async getSystemNotificationStats() {
    const [totalCount, typeStats, priorityStats, readStats, userStats] = await Promise.all([
      Notification.countDocuments({}),
      Notification.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      Notification.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Notification.aggregate([{ $group: { _id: "$read", count: { $sum: 1 } } }]),
      Notification.aggregate([
        { $group: { _id: "$user", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            userId: "$_id",
            count: 1,
            name: "$userDetails.name",
            email: "$userDetails.email",
            _id: 0,
          },
        },
      ]),
    ])

    return {
      totalCount,
      typeStats,
      priorityStats,
      readStats,
      topUsers: userStats,
    }
  }

  /**
   * Broadcast a notification to all users or a subset of users
   */
  async broadcastNotification({
    title,
    message,
    type = "system",
    link,
    metadata = {},
    priority = "medium",
    expiresAt = null,
    userIds = null, // If null, send to all users
  }) {
    try {
      // If userIds is provided, send only to those users
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        const notifications = []

        for (const userId of userIds) {
          try {
            const notification = await this.createNotification(userId, {
              title,
              message,
              type,
              link,
              metadata,
              priority,
              expiresAt,
            })
            notifications.push(notification)
          } catch (error) {
            console.error(`Error creating notification for user ${userId}:`, error)
          }
        }

        return {
          success: true,
          count: notifications.length,
          notifications,
        }
      }
      // Otherwise, get all users and send to everyone
      else {
        const User = mongoose.model("User")
        const users = await User.find({}, "_id")
        const userIds = users.map((user) => user._id)

        const notifications = []

        for (const userId of userIds) {
          try {
            const notification = await this.createNotification(userId, {
              title,
              message,
              type,
              link,
              metadata,
              priority,
              expiresAt,
            })
            notifications.push(notification)
          } catch (error) {
            console.error(`Error creating notification for user ${userId}:`, error)
          }
        }

        return {
          success: true,
          count: notifications.length,
          totalUsers: userIds.length,
        }
      }
    } catch (error) {
      console.error("Error broadcasting notification:", error)
      throw error
    }
  }

  // DELIVERY OPERATIONS

  /**
   * Deliver a notification to a user via socket.io
   */
  async deliverNotification(userId, notification) {
    const socketId = this.userSockets.get(userId)

    if (socketId) {
      try {
        // Emit with acknowledgment callback
        this.io.to(socketId).emit("notification", notification, (acknowledgment) => {
          if (acknowledgment && acknowledgment.received) {
            // Update delivery status
            notification.delivered = true
            notification.save()
          }
        })

        // Update delivery attempt count
        notification.deliveryAttempts += 1
        await notification.save()

        return true
      } catch (error) {
        console.error(`Error delivering notification to user ${userId}:`, error)
        return false
      }
    }

    return false
  }

  /**
   * Retry delivery for undelivered notifications
   */
  async retryUndeliveredNotifications() {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - 24) // Only retry notifications from the last 24 hours

    const undeliveredNotifications = await Notification.find({
      delivered: false,
      deliveryAttempts: { $lt: 3 }, // Max 3 attempts
      createdAt: { $gte: cutoffDate },
    })

    let successCount = 0

    for (const notification of undeliveredNotifications) {
      const success = await this.deliverNotification(notification.user, notification)
      if (success) successCount++
    }

    return {
      total: undeliveredNotifications.length,
      success: successCount,
    }
  }
}

export default UnifiedNotificationService
