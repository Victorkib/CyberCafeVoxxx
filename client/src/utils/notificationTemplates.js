// Notification template system
const templates = {
  order: {
    title: (data) => `Order #${data.orderId} ${data.status}`,
    message: (data) => {
      switch (data.status) {
        case "confirmed":
          return `Your order #${data.orderId} has been confirmed and is being processed.`
        case "shipped":
          return `Your order #${data.orderId} has been shipped and is on its way.`
        case "delivered":
          return `Your order #${data.orderId} has been delivered.`
        case "cancelled":
          return `Your order #${data.orderId} has been cancelled.`
        default:
          return `Update for your order #${data.orderId}`
      }
    },
    type: "order",
    priority: (data) => {
      switch (data.status) {
        case "cancelled":
          return "high"
        case "shipped":
          return "medium"
        default:
          return "low"
      }
    },
  },
  payment: {
    title: (data) => `Payment ${data.status}`,
    message: (data) => {
      switch (data.status) {
        case "successful":
          return `Payment of $${data.amount} was successful.`
        case "failed":
          return `Payment of $${data.amount} failed. Please try again.`
        case "refunded":
          return `Your payment of $${data.amount} has been refunded.`
        default:
          return `Payment update: $${data.amount}`
      }
    },
    type: "payment",
    priority: (data) => {
      switch (data.status) {
        case "failed":
          return "high"
        case "refunded":
          return "medium"
        default:
          return "low"
      }
    },
  },
  system: {
    title: (data) => `System ${data.event}`,
    message: (data) => {
      switch (data.event) {
        case "maintenance":
          return `System maintenance scheduled for ${data.time}.`
        case "update":
          return `System update completed successfully.`
        case "error":
          return `System error: ${data.message}`
        default:
          return `System notification: ${data.message}`
      }
    },
    type: "system",
    priority: (data) => {
      switch (data.event) {
        case "error":
          return "high"
        case "maintenance":
          return "medium"
        default:
          return "low"
      }
    },
  },
  promotion: {
    title: (data) => `${data.title}`,
    message: (data) => `${data.message}`,
    type: "promotion",
    priority: "low",
  },
  security: {
    title: (data) => `Security ${data.event}`,
    message: (data) => {
      switch (data.event) {
        case "login":
          return `New login detected from ${data.location}.`
        case "password":
          return `Your password was changed successfully.`
        case "verification":
          return `Please verify your email address.`
        default:
          return `Security notification: ${data.message}`
      }
    },
    type: "security",
    priority: "high",
  },
  product: {
    title: (data) => `Product ${data.event}`,
    message: (data) => {
      switch (data.event) {
        case "back_in_stock":
          return `${data.productName} is back in stock!`
        case "price_drop":
          return `Price dropped for ${data.productName}!`
        case "new":
          return `New product available: ${data.productName}`
        default:
          return `Product update: ${data.message}`
      }
    },
    type: "product",
    priority: (data) => {
      switch (data.event) {
        case "back_in_stock":
          return "medium"
        case "price_drop":
          return "medium"
        default:
          return "low"
      }
    },
  },
  review: {
    title: (data) => `New Review`,
    message: (data) => `New ${data.rating}-star review for ${data.productName}`,
    type: "review",
    priority: "low",
  },
  wishlist: {
    title: (data) => `Wishlist Update`,
    message: (data) => {
      switch (data.event) {
        case "price_drop":
          return `${data.productName} price dropped to $${data.price}!`
        case "back_in_stock":
          return `${data.productName} is back in stock!`
        default:
          return `Wishlist update: ${data.message}`
      }
    },
    type: "wishlist",
    priority: "low",
  },
  // Admin notification templates
  admin_alert: {
    title: (data) => `Admin Alert: ${data.title}`,
    message: (data) => `${data.message}`,
    type: "admin_alert",
    priority: "high",
  },
  system_status: {
    title: (data) => `System Status: ${data.status}`,
    message: (data) => `${data.message}`,
    type: "system_status",
    priority: (data) => (data.status === "critical" ? "high" : "medium"),
  },
  user_report: {
    title: (data) => `User Report: ${data.reportType}`,
    message: (data) => `${data.userName} has submitted a ${data.reportType} report.`,
    type: "user_report",
    priority: "medium",
  },
  inventory_alert: {
    title: (data) => `Inventory Alert`,
    message: (data) => `${data.productName} is low on stock (${data.currentStock} remaining).`,
    type: "inventory_alert",
    priority: "high",
  },
  sales_milestone: {
    title: (data) => `Sales Milestone Reached`,
    message: (data) => `${data.milestone}: ${data.value} in sales.`,
    type: "sales_milestone",
    priority: "medium",
  },
}

export const createNotification = (type, data) => {
  const template = templates[type]
  if (!template) {
    throw new Error(`Notification template not found for type: ${type}`)
  }

  return {
    title: typeof template.title === "function" ? template.title(data) : template.title,
    message: typeof template.message === "function" ? template.message(data) : template.message,
    type: template.type,
    priority: typeof template.priority === "function" ? template.priority(data) : template.priority,
    data,
    createdAt: new Date().toISOString(),
  }
}

export const getTemplateTypes = () => Object.keys(templates)

export const getTemplateFields = (type) => {
  const template = templates[type]
  if (!template) {
    throw new Error(`Template not found for type: ${type}`)
  }

  // Extract field names from the template functions
  const fields = new Set()
  if (typeof template.title === "function") {
    const titleParams = template.title.toString().match(/data\.(\w+)/g) || []
    titleParams.forEach((param) => fields.add(param.replace("data.", "")))
  }
  if (typeof template.message === "function") {
    const messageParams = template.message.toString().match(/data\.(\w+)/g) || []
    messageParams.forEach((param) => fields.add(param.replace("data.", "")))
  }
  if (typeof template.priority === "function") {
    const priorityParams = template.priority.toString().match(/data\.(\w+)/g) || []
    priorityParams.forEach((param) => fields.add(param.replace("data.", "")))
  }

  return Array.from(fields)
}
