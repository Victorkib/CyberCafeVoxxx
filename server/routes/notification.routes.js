import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import {
  getNotifications,
  getNotificationStats,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js"

const router = express.Router()

// All routes are protected and require authentication
router.use(authMiddleware)

// User routes
router.get("/", getNotifications)
router.get("/stats", getNotificationStats)
router.get("/unread-count", getUnreadCount)
router.patch("/:id/read", markAsRead)
router.patch("/read-all", markAllAsRead)
router.delete("/:id", deleteNotification)

export default router
