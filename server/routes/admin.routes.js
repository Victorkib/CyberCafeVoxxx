import express from 'express';
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
  cleanupExpiredInvitations
} from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdmin, isSuperAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/verify-invitation/:token', verifyInvitation);
router.post('/accept-invitation', acceptInvitation);

// Apply authentication middleware to protected routes
router.use(authMiddleware);

// Admin invitation routes (protected)
router.post('/invite', isAdmin, inviteAdmin);
router.post('/cleanup-invitations', isAdmin, cleanupExpiredInvitations);

// Dashboard routes
router.get('/dashboard/stats', isAdmin, getDashboardStats);
router.get('/dashboard/sales-analytics', isAdmin, getSalesAnalytics);
router.get('/dashboard/inventory-stats', isAdmin, getInventoryStats);
router.get('/dashboard/customer-stats', isAdmin, getCustomerStats);

// Product management routes
router.get('/products', isAdmin, getAllProducts);
router.get('/products/:id', isAdmin, getProductById);
router.post('/products', isAdmin, createProduct);
router.put('/products/:id', isAdmin, updateProduct);
router.delete('/products/:id', isAdmin, deleteProduct);
router.patch('/products/:id/stock', isAdmin, updateProductStock);
router.patch('/products/:id/status', isAdmin, updateProductStatus);

// Order management routes
router.get('/orders', isAdmin, getAllOrders);
router.get('/orders/:id', isAdmin, getOrderById);
router.patch('/orders/:id/status', isAdmin, updateOrderStatus);
router.patch('/orders/:id/tracking', isAdmin, updateOrderTracking);
router.post('/orders/:id/cancel', isAdmin, cancelOrder);
router.post('/orders/:id/refund', isAdmin, refundOrder);

// Customer management routes
router.get('/customers', isAdmin, getAllCustomers);
router.get('/customers/:id', isAdmin, getCustomerById);
router.patch('/customers/:id/status', isAdmin, updateCustomerStatus);
router.post('/customers/:id/block', isAdmin, blockCustomer);
router.post('/customers/:id/unblock', isAdmin, unblockCustomer);

// User management routes
router.get('/users', isSuperAdmin, getAllUsers);
router.get('/users/:id', isSuperAdmin, getUserById);
router.post('/users', isSuperAdmin, createUser);
router.put('/users/:id', isSuperAdmin, updateUser);
router.delete('/users/:id', isSuperAdmin, deleteUser);
router.patch('/users/:id/role', isSuperAdmin, updateUserRole);
router.patch('/users/:id/status', isSuperAdmin, updateUserStatus);

// Category management routes
router.get('/categories', isAdmin, getAllCategories);
router.get('/categories/:id', isAdmin, getCategoryById);
router.post('/categories', isAdmin, createCategory);
router.put('/categories/:id', isAdmin, updateCategory);
router.delete('/categories/:id', isAdmin, deleteCategory);

// Settings management routes
router.get('/settings', isSuperAdmin, getSettings);
router.put('/settings/general', isSuperAdmin, updateGeneralSettings);
router.put('/settings/payment', isSuperAdmin, updatePaymentSettings);
router.put('/settings/shipping', isSuperAdmin, updateShippingSettings);
router.put('/settings/email', isSuperAdmin, updateEmailSettings);

// Report routes
router.get('/reports/sales', isAdmin, getSalesReport);
router.get('/reports/inventory', isAdmin, getInventoryReport);
router.get('/reports/customers', isAdmin, getCustomerReport);
router.get('/reports/orders', isAdmin, getOrderReport);
router.get('/reports/export/:type', isAdmin, exportReport);

export default router; 