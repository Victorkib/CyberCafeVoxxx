import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        // User notifications
        "order",
        "payment",
        "system",
        "promotion",
        "security",
        "product",
        "review",
        "wishlist",
        // Admin notifications
        "admin_alert",
        "system_status",
        "user_report",
        "inventory_alert",
        "sales_milestone",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    link: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    expiresAt: {
      type: Date,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    deliveryAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, read: 1 })
notificationSchema.index({ user: 1, type: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification
