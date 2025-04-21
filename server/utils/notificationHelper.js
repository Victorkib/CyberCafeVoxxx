import { notificationTemplates } from "./notification-templates.js"

/**
 * Helper functions to create notifications for different parts of the system
 * These functions use the unified notification service
 */

/**
 * Get the notification service from the app
 * @param {Object} req - Express request object (if available)
 * @returns {Object} Notification service instance
 */
const getNotificationService = (req) => {
  if (req && req.app) {
    return req.app.get("notificationService")
  }

  // If req is not available, get from global (for use in services/utils)
  if (global.notificationService) {
    return global.notificationService
  }

  throw new Error("Notification service not available")
}

/**
 * Create a product-related notification
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} Created notification
 */
export const createProductNotification = async (options) => {
  try {
    const { userId, productId, action, details } = options

    let template
    switch (action) {
      case "create":
        template = {
          title: "New Product Added",
          message: details || "A new product has been added to the store",
          type: "product",
          link: `/products/${productId}`,
          priority: "medium",
          metadata: { productId, action },
        }
        break
      case "update":
        template = {
          title: "Product Updated",
          message: details || "A product has been updated",
          type: "product",
          link: `/products/${productId}`,
          priority: "low",
          metadata: { productId, action },
        }
        break
      case "low_stock":
        template = {
          title: "Low Stock Alert",
          message: details || "A product is running low on stock",
          type: "inventory_alert",
          link: `/admin/products/${productId}`,
          priority: "high",
          metadata: { productId, action },
        }
        break
      default:
        template = {
          title: "Product Notification",
          message: details || "Product notification",
          type: "product",
          link: `/products/${productId}`,
          priority: "medium",
          metadata: { productId, action },
        }
    }

    // If this is called from a service/util without req
    if (global.notificationService) {
      return await global.notificationService.createNotification(userId, template)
    }

    // Otherwise, try to get from req in the next call
    return template
  } catch (error) {
    console.error("Error creating product notification:", error)
    return null
  }
}

/**
 * Create an order-related notification
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} Created notification
 */
export const createOrderNotification = async (options) => {
  try {
    const { userId, title, message, link, priority = "medium", metadata = {} } = options

    const template = {
      title,
      message,
      type: "order",
      link,
      priority,
      metadata,
    }

    // If this is called from a service/util without req
    if (global.notificationService) {
      return await global.notificationService.createNotification(userId, template)
    }

    // Otherwise, try to get from req in the next call
    return template
  } catch (error) {
    console.error("Error creating order notification:", error)
    return null
  }
}

/**
 * Create a security-related notification
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} Created notification
 */
export const createSecurityNotification = async (options) => {
  try {
    const { userId, type, details } = options

    // Use the security alert template from notification-templates.js
    const template = notificationTemplates.securityAlert(type, { message: details })

    // If this is called from a service/util without req
    if (global.notificationService) {
      return await global.notificationService.createNotification(userId, template)
    }

    // Otherwise, try to get from req in the next call
    return template
  } catch (error) {
    console.error("Error creating security notification:", error)
    return null
  }
}

/**
 * Create a payment-related notification
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} Created notification
 */
export const createPaymentNotification = async (options) => {
  try {
    const { userId, title, message, link, priority = "medium", metadata = {} } = options

    const template = {
      title,
      message,
      type: "payment",
      link,
      priority,
      metadata,
    }

    // If this is called from a service/util without req
    if (global.notificationService) {
      return await global.notificationService.createNotification(userId, template)
    }

    // Otherwise, try to get from req in the next call
    return template
  } catch (error) {
    console.error("Error creating payment notification:", error)
    return null
  }
}

/**
 * Create a promotion-related notification
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} Created notification or array of notifications
 */
export const createPromotionNotification = async (options) => {
  try {
    const { userId, title, message, link, priority = "medium", metadata = {} } = options

    const template = {
      title,
      message,
      type: "promotion",
      link,
      priority,
      metadata,
    }

    // If userId is not provided, broadcast to all users
    if (!userId) {
      if (global.notificationService) {
        return await global.notificationService.broadcastNotification(template)
      }
      return template
    }

    // Otherwise, send to specific user
    if (global.notificationService) {
      return await global.notificationService.createNotification(userId, template)
    }

    // Otherwise, try to get from req in the next call
    return template
  } catch (error) {
    console.error("Error creating promotion notification:", error)
    return null
  }
}

/**
 * Create a notification using a middleware approach
 * This function is designed to be used in Express middleware
 * @param {Object} req - Express request object
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} Created notification
 */
export const createNotificationMiddleware = async (req, options) => {
  try {
    const { userId, title, message, type, link, priority = "medium", metadata = {} } = options

    const template = {
      title,
      message,
      type,
      link,
      priority,
      metadata,
    }

    const notificationService = getNotificationService(req)
    return await notificationService.createNotification(userId, template)
  } catch (error) {
    console.error("Error creating notification in middleware:", error)
    return null
  }
}

/**
 * Initialize the notification helper with the notification service
 * This should be called when the app starts
 * @param {Object} notificationService - The notification service instance
 */
export const initNotificationHelper = (notificationService) => {
  global.notificationService = notificationService
}
