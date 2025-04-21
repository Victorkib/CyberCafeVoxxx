/**
 * Middleware to attach notification methods to the request object
 * This makes it easier to create notifications from controllers
 */
export const notificationMiddleware = (req, res, next) => {
  // Get the notification service from the app
  const notificationService = req.app.get("notificationService")

  if (!notificationService) {
    console.warn("Notification service not available in middleware")
    return next()
  }

  // Attach notification methods to the request object
  req.notifications = {
    /**
     * Create a notification for a user
     * @param {string} userId - User ID
     * @param {Object} options - Notification options
     * @returns {Promise<Object>} Created notification
     */
    create: async (userId, options) => {
      try {
        return await notificationService.createNotification(userId, options)
      } catch (error) {
        console.error("Error creating notification:", error)
        return null
      }
    },

    /**
     * Broadcast a notification to all users or a subset of users
     * @param {Object} options - Notification options
     * @param {Array<string>} [userIds] - Optional array of user IDs to send to
     * @returns {Promise<Object>} Result of the broadcast operation
     */
    broadcast: async (options, userIds = null) => {
      try {
        return await notificationService.broadcastNotification({
          ...options,
          userIds,
        })
      } catch (error) {
        console.error("Error broadcasting notification:", error)
        return null
      }
    },

    /**
     * Get notifications for a user
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Notifications and pagination info
     */
    getForUser: async (userId, options = {}) => {
      try {
        return await notificationService.getNotifications(userId, options)
      } catch (error) {
        console.error("Error getting notifications:", error)
        return { notifications: [], pagination: { total: 0, page: 1, pages: 0 } }
      }
    },

    /**
     * Mark a notification as read
     * @param {string} userId - User ID
     * @param {string} notificationId - Notification ID
     * @returns {Promise<Object>} Updated notification
     */
    markAsRead: async (userId, notificationId) => {
      try {
        return await notificationService.markAsRead(userId, notificationId)
      } catch (error) {
        console.error("Error marking notification as read:", error)
        return null
      }
    },
  }

  next()
}
