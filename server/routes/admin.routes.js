import express from "express"
import { authMiddleware, adminRateLimiter } from "../middleware/auth.middleware.js"
import { isAdmin, isSuperAdmin } from "../middleware/admin.middleware.js"
import adminNotificationRoutes from "./admin-notification.routes.js"

// Import admin controllers
import {
  getDashboardStats,
  getSalesAnalytics,
  getInventoryStats,
  getCustomerStats,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  updateProductStatus,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  refundOrder,
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
  blockCustomer,
  unblockCustomer,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSettings,
  updateGeneralSettings,
  updatePaymentSettings,
  updateShippingSettings,
  updateEmailSettings,
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  getOrderReport,
  exportReport,
  // Admin invitation related controllers
  inviteAdmin,
  verifyInvitation,
  acceptInvitation,
  cleanupExpiredInvitations,
  getAdminInvitations,
  resendInvitation,
  cancelInvitation,
  lockAccount,
  unlockAccount
} from "../controllers/admin.controller.js"

const router = express.Router()

// Public routes (no auth required)
router.get("/verify-invitation/:token", verifyInvitation)
router.post("/accept-invitation", acceptInvitation)

// Apply authentication middleware to protected routes
router.use(authMiddleware)

// Admin invitation routes (protected)
router.post("/invite", isAdmin, adminRateLimiter, inviteAdmin)
router.get("/invitations", isAdmin, getAdminInvitations)
router.post("/invitations/:id/resend", isAdmin, adminRateLimiter, resendInvitation)
router.delete("/invitations/:id", isAdmin, adminRateLimiter, cancelInvitation)
router.post("/cleanup-invitations", isAdmin, adminRateLimiter, cleanupExpiredInvitations)
router.post("/lock-account", isAdmin, adminRateLimiter, lockAccount)
router.post("/unlock-account", isAdmin, adminRateLimiter, unlockAccount)

// Dashboard routes
router.get("/dashboard/stats", isAdmin, getDashboardStats)
router.get("/dashboard/sales-analytics", isAdmin, getSalesAnalytics)
router.get("/dashboard/inventory-stats", isAdmin, getInventoryStats)
router.get("/dashboard/customer-stats", isAdmin, getCustomerStats)

// Product management routes
router.get("/products", isAdmin, getAllProducts)
router.get("/products/:id", isAdmin, getProductById)
router.post("/products", isAdmin, adminRateLimiter, createProduct)
router.put("/products/:id", isAdmin, adminRateLimiter, updateProduct)
router.delete("/products/:id", isAdmin, adminRateLimiter, deleteProduct)
router.patch("/products/:id/stock", isAdmin, adminRateLimiter, updateProductStock)
router.patch("/products/:id/status", isAdmin, adminRateLimiter, updateProductStatus)

// Order management routes
router.get("/orders", isAdmin, getAllOrders)
router.get("/orders/:id", isAdmin, getOrderById)
router.patch("/orders/:id/status", isAdmin, adminRateLimiter, updateOrderStatus)
router.patch("/orders/:id/tracking", isAdmin, adminRateLimiter, updateOrderTracking)
router.post("/orders/:id/cancel", isAdmin, adminRateLimiter, cancelOrder)
router.post("/orders/:id/refund", isAdmin, adminRateLimiter, refundOrder)

// Customer management routes
router.get("/customers", isAdmin, getAllCustomers)
router.get("/customers/:id", isAdmin, getCustomerById)
router.patch("/customers/:id/status", isAdmin, adminRateLimiter, updateCustomerStatus)
router.post("/customers/:id/block", isAdmin, adminRateLimiter, blockCustomer)
router.post("/customers/:id/unblock", isAdmin, adminRateLimiter, unblockCustomer)

// User management routes
router.get("/users", isSuperAdmin, getAllUsers)
router.get("/users/:id", isSuperAdmin, getUserById)
router.post("/users", isSuperAdmin, adminRateLimiter, createUser)
router.put("/users/:id", isSuperAdmin, adminRateLimiter, updateUser)
router.delete("/users/:id", isSuperAdmin, adminRateLimiter, deleteUser)
router.patch("/users/:id/role", isSuperAdmin, adminRateLimiter, updateUserRole)
router.patch("/users/:id/status", isSuperAdmin, adminRateLimiter, updateUserStatus)

// Category management routes
router.get("/categories", isAdmin, getAllCategories)
router.get("/categories/:id", isAdmin, getCategoryById)
router.post("/categories", isAdmin, adminRateLimiter, createCategory)
router.put("/categories/:id", isAdmin, adminRateLimiter, updateCategory)
router.delete("/categories/:id", isAdmin, adminRateLimiter, deleteCategory)

// Settings management routes
router.get("/settings", isSuperAdmin, getSettings)
router.put("/settings/general", isSuperAdmin, adminRateLimiter, updateGeneralSettings)
router.put("/settings/payment", isSuperAdmin, adminRateLimiter, updatePaymentSettings)
router.put("/settings/shipping", isSuperAdmin, adminRateLimiter, updateShippingSettings)
router.put("/settings/email", isSuperAdmin, adminRateLimiter, updateEmailSettings)

// Report routes
router.get("/reports/sales", isAdmin, getSalesReport)
router.get("/reports/inventory", isAdmin, getInventoryReport)
router.get("/reports/customers", isAdmin, getCustomerReport)
router.get("/reports/orders", isAdmin, getOrderReport)
router.get("/reports/export/:type", isAdmin, exportReport)

// Use admin notification routes
router.use("/notifications", adminNotificationRoutes)

export default router