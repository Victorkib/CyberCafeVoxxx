/**
 * Notification templates for consistent notification creation
 */
export const notificationTemplates = {
  // USER NOTIFICATIONS

  // Order notifications
  orderStatus: (orderId, status, orderNumber) => ({
    title: "Order Update",
    message: `Your order #${orderNumber || orderId} has been ${status}`,
    type: "order",
    link: `/orders/${orderId}`,
    priority: status === "cancelled" || status === "refunded" ? "high" : "medium",
    metadata: { orderId, status },
  }),

  // Payment notifications
  paymentStatus: (orderId, status, amount, orderNumber) => ({
    title: "Payment Update",
    message: `Payment of ${amount} for order #${orderNumber || orderId} has been ${status}`,
    type: "payment",
    link: `/orders/${orderId}`,
    priority: status === "failed" ? "high" : "medium",
    metadata: { orderId, amount, status },
  }),

  // Product notifications
  productRestock: (productId, productName) => ({
    title: "Product Back in Stock",
    message: `${productName} is now back in stock!`,
    type: "product",
    link: `/products/${productId}`,
    metadata: { productId },
  }),

  // Security notifications
  securityAlert: (event, details = {}) => {
    const title = "Security Alert"
    let message = ""
    let priority = "high"

    switch (event) {
      case "login_attempt":
        message = `New login attempt from ${details.ip || "unknown location"}`
        break
      case "password_change":
        message = "Your password has been changed successfully"
        priority = "medium"
        break
      case "email_change":
        message = "Your email address has been updated"
        break
      case "two_factor_enabled":
        message = "Two-factor authentication has been enabled for your account"
        priority = "medium"
        break
      case "two_factor_disabled":
        message = "Two-factor authentication has been disabled for your account"
        break
      default:
        message = details.message || "Security event occurred"
    }

    return {
      title,
      message,
      type: "security",
      metadata: { event, ...details },
      priority,
    }
  },

  // ADMIN NOTIFICATIONS

  // Inventory alerts
  lowInventory: (product, count, threshold) => ({
    title: "Low Inventory Alert",
    message: `${product.name} is low on stock (${count}/${threshold} remaining)`,
    type: "inventory_alert",
    link: `/admin/products/${product._id}`,
    priority: "high",
    metadata: { productId: product._id, count, threshold },
  }),

  // User reports
  userReport: (reportId, reportType, userId, userName) => ({
    title: "New User Report",
    message: `${reportType} report submitted by ${userName || userId}`,
    type: "user_report",
    link: `/admin/reports/${reportId}`,
    priority: "high",
    metadata: { reportId, reportType, userId },
  }),

  // Sales milestones
  salesMilestone: (milestone, value) => ({
    title: "Sales Milestone Reached",
    message: `${milestone}: ${value} in sales`,
    type: "sales_milestone",
    link: "/admin/dashboard",
    priority: "medium",
    metadata: { milestone, value },
  }),

  // System status
  systemStatus: (status, details) => ({
    title: "System Status Update",
    message: `${status}: ${details}`,
    type: "system_status",
    link: "/admin/system",
    priority: status === "error" ? "high" : "medium",
    metadata: { status, details },
  }),
}
