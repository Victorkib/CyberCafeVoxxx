import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { isAdmin, isSuperAdmin, isAdminOrManager } from '../middleware/admin.middleware.js';
import { authMiddleware, rateLimiter, adminRateLimiter } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authMiddleware);
router.use(adminRateLimiter);

// Dashboard Statistics
router.get('/dashboard/stats', isAdmin, adminController.getDashboardStats);
router.get('/dashboard/sales-analytics', isAdmin, adminController.getSalesAnalytics);
router.get('/dashboard/inventory-stats', isAdmin, adminController.getInventoryStats);
router.get('/dashboard/customer-stats', isAdmin, adminController.getCustomerStats);

// Product Management
router.get('/products', isAdminOrManager, adminController.getAllProducts);
router.get('/products/:id', isAdminOrManager, adminController.getProductById);
router.post('/products', isAdmin, adminController.createProduct);
router.put('/products/:id', isAdmin, adminController.updateProduct);
router.delete('/products/:id', isAdmin, adminController.deleteProduct);
router.patch('/products/:id/stock', isAdminOrManager, adminController.updateProductStock);
router.patch('/products/:id/status', isAdminOrManager, adminController.updateProductStatus);

// Order Management
router.get('/orders', isAdminOrManager, adminController.getAllOrders);
router.get('/orders/:id', isAdminOrManager, adminController.getOrderById);
router.patch('/orders/:id/status', isAdminOrManager, adminController.updateOrderStatus);
router.patch('/orders/:id/tracking', isAdminOrManager, adminController.updateOrderTracking);
router.post('/orders/:id/cancel', isAdminOrManager, adminController.cancelOrder);
router.post('/orders/:id/refund', isAdmin, adminController.refundOrder);

// Customer Management
router.get('/customers', isAdminOrManager, adminController.getAllCustomers);
router.get('/customers/:id', isAdminOrManager, adminController.getCustomerById);
router.patch('/customers/:id/status', isAdminOrManager, adminController.updateCustomerStatus);
router.post('/customers/:id/block', isAdmin, adminController.blockCustomer);
router.post('/customers/:id/unblock', isAdmin, adminController.unblockCustomer);

// User Management
router.get('/users', isAdmin, adminController.getAllUsers);
router.get('/users/:id', isAdmin, adminController.getUserById);
router.post('/users', isAdmin, adminController.createUser);
router.put('/users/:id', isAdmin, adminController.updateUser);
router.delete('/users/:id', isAdmin, adminController.deleteUser);
router.patch('/users/:id/role', isAdmin, adminController.updateUserRole);
router.patch('/users/:id/status', isAdmin, adminController.updateUserStatus);

// Category Management
router.get('/categories', isAdminOrManager, adminController.getAllCategories);
router.get('/categories/:id', isAdminOrManager, adminController.getCategoryById);
router.post('/categories', isAdmin, adminController.createCategory);
router.put('/categories/:id', isAdmin, adminController.updateCategory);
router.delete('/categories/:id', isAdmin, adminController.deleteCategory);

// Settings Management
router.get('/settings', isAdmin, adminController.getSettings);
router.put('/settings/general', isAdmin, adminController.updateGeneralSettings);
router.put('/settings/payment', isAdmin, adminController.updatePaymentSettings);
router.put('/settings/shipping', isAdmin, adminController.updateShippingSettings);
router.put('/settings/email', isAdmin, adminController.updateEmailSettings);

// Reports
router.get('/reports/sales', isAdmin, adminController.getSalesReport);
router.get('/reports/inventory', isAdmin, adminController.getInventoryReport);
router.get('/reports/customers', isAdmin, adminController.getCustomerReport);
router.get('/reports/orders', isAdmin, adminController.getOrderReport);
router.get('/reports/export/:type', isAdmin, adminController.exportReport);

// Admin invitation routes
router.post('/invite', isSuperAdmin, adminController.inviteAdmin);
router.post('/accept-invitation', adminController.acceptInvitation);
router.get('/verify-invitation/:token', adminController.verifyInvitation);

// Admin management routes
router.get('/admins', isSuperAdmin, adminController.getAdmins);
router.patch('/admins/:id/role', isSuperAdmin, adminController.updateAdminRole);
router.delete('/admins/:id', isSuperAdmin, adminController.removeAdmin);

export default router; 