import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { authorize } from "../middleware/auth.middleware.js"
import {
  getAllNotifications,
  createNotification,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats,
  retryUndeliveredNotifications,
} from "../controllers/admin-notification.controller.js"

const router = express.Router()

// All routes are protected and require admin authentication
router.use(authMiddleware)
router.use(authorize("admin","super_admin"))

// Admin notification routes
router.get("/", getAllNotifications)
router.post("/", createNotification)
router.delete("/:id", deleteNotification)
router.delete("/", deleteAllNotifications)
router.get("/stats", getNotificationStats)
router.post("/retry-delivery", retryUndeliveredNotifications)

export default router
