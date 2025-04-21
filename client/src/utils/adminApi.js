import { apiRequest } from './api';
import api from './api';

// Dashboard Statistics
export const getDashboardStats = () => apiRequest.get('/admin/dashboard/stats');
export const getSalesAnalytics = (startDate, endDate) => 
  apiRequest.get('/admin/dashboard/sales-analytics', { params: { startDate, endDate } });
export const getInventoryStats = () => apiRequest.get('/admin/dashboard/inventory-stats');
export const getCustomerStats = () => apiRequest.get('/admin/dashboard/customer-stats');

// Product Management
//the first get products needs special attention. 
export const getAllProducts = (page = 1, limit = 10, sort, filter) => 
  apiRequest.get('/products', { params: { page, limit, sort, filter } });
export const getProductById = (id) => apiRequest.get(`/admin/products/${id}`);
export const createProduct = (productData) => apiRequest.post('/admin/products', productData);
export const updateProduct = (id, productData) => apiRequest.put(`/admin/products/${id}`, productData);
export const deleteProduct = (id) => apiRequest.delete(`/admin/products/${id}`);
export const updateProductStock = (id, stock) => apiRequest.patch(`/admin/products/${id}/stock`, { stock });
export const updateProductStatus = (id, status) => apiRequest.patch(`/admin/products/${id}/status`, { status });

// Bulk Product Operations
export const bulkDeleteProducts = (productIds) => 
  apiRequest.post('/admin/products/bulk-delete', { productIds });

export const bulkUpdateProductStatus = (data) => 
  apiRequest.post('/admin/products/bulk-update-status', data);

// Order Management
export const getAllOrders = (page = 1, limit = 10, status) => 
  apiRequest.get('/admin/orders', { params: { page, limit, status } });
export const getOrderById = (id) => apiRequest.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => apiRequest.patch(`/admin/orders/${id}/status`, { status });
export const updateOrderTracking = (id, trackingNumber, trackingCompany) => 
  apiRequest.patch(`/admin/orders/${id}/tracking`, { trackingNumber, trackingCompany });
export const cancelOrder = (id) => apiRequest.post(`/admin/orders/${id}/cancel`);
export const refundOrder = (id, amount, reason) => 
  apiRequest.post(`/admin/orders/${id}/refund`, { amount, reason });

// Customer Management
export const getAllCustomers = (page = 1, limit = 10) => 
  apiRequest.get('/admin/customers', { params: { page, limit } });
export const getCustomerById = (id) => apiRequest.get(`/admin/customers/${id}`);
export const updateCustomerStatus = (id, status) => 
  apiRequest.patch(`/admin/customers/${id}/status`, { status });
export const blockCustomer = (id) => apiRequest.post(`/admin/customers/${id}/block`);
export const unblockCustomer = (id) => apiRequest.post(`/admin/customers/${id}/unblock`);

// Admin Invitation Management
export const inviteAdmin = (inviteData) => apiRequest.post("/admin/invite", inviteData)
export const fetchAdminInvitations = () => apiRequest.get("/admin/invitations")
export const resendInvitation = (id) => apiRequest.post(`/admin/invitations/${id}/resend`)
export const cancelInvitation = (id) => apiRequest.delete(`/admin/invitations/${id}`)
export const lockAccount = (lockData) => apiRequest.post("/admin/lock-account", lockData)
export const unlockAccount = (unlockData) => apiRequest.post("/admin/unlock-account", unlockData)

// User Management
export const getAllUsers = (page = 1, limit = 10) => 
  apiRequest.get('/admin/users', { params: { page, limit } });
export const getUserById = (id) => apiRequest.get(`/admin/users/${id}`);
export const createUser = (userData) => apiRequest.post('/admin/users', userData);
export const updateUser = (id, userData) => apiRequest.put(`/admin/users/${id}`, userData);
export const deleteUser = (id) => apiRequest.delete(`/admin/users/${id}`);
export const updateUserRole = (id, role) => apiRequest.patch(`/admin/users/${id}/role`, { role });
export const updateUserStatus = (id, status) => apiRequest.patch(`/admin/users/${id}/status`, { status });

// Category Management
export const getAllCategories = () => apiRequest.get('/admin/categories');
export const getCategoryById = (id) => apiRequest.get(`/admin/categories/${id}`);
export const createCategory = (categoryData) => apiRequest.post('/admin/categories', categoryData);
export const updateCategory = (id, categoryData) => apiRequest.put(`/admin/categories/${id}`, categoryData);
export const deleteCategory = (id) => apiRequest.delete(`/admin/categories/${id}`);

// Settings Management
export const getSettings = () => apiRequest.get('/admin/settings');
export const updateGeneralSettings = (settings) => apiRequest.put('/admin/settings/general', settings);
export const updatePaymentSettings = (settings) => apiRequest.put('/admin/settings/payment', settings);
export const updateShippingSettings = (settings) => apiRequest.put('/admin/settings/shipping', settings);
export const updateEmailSettings = (settings) => apiRequest.put('/admin/settings/email', settings);

// Reports
export const getSalesReport = (startDate, endDate) => 
  apiRequest.get('/admin/reports/sales', { params: { startDate, endDate } });
export const getInventoryReport = () => apiRequest.get('/admin/reports/inventory');
export const getCustomerReport = (startDate, endDate) => 
  apiRequest.get('/admin/reports/customers', { params: { startDate, endDate } });
export const getOrderReport = (startDate, endDate) => 
  apiRequest.get('/admin/reports/orders', { params: { startDate, endDate } });
export const exportReport = (type, startDate, endDate) => 
  apiRequest.get(`/admin/reports/export/${type}`, { params: { startDate, endDate } });

// Notification Management
export const getAdminNotifications = async ({ page = 1, limit = 10, type, priority, startDate, endDate } = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(type && { type }),
    ...(priority && { priority }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });
  return api.get(`/admin/notifications?${params.toString()}`);
};

export const createAdminNotification = async (notificationData) => {
  return api.post('/admin/notifications', notificationData);
};

export const deleteAdminNotification = async (id) => {
  return api.delete(`/admin/notifications/${id}`);
};

export const deleteAllAdminNotifications = async () => {
  return api.delete('/admin/notifications');
};

export const getNotificationStats = async () => {
  return api.get('/admin/notifications/stats');
};

export const verifyInvitation = (token) => api.get(`/admin/verify-invitation/${token}`);
export const acceptInvitation = (invitationData) => api.post('/admin/accept-invitation', invitationData);

// Payment Management
export const getPaymentMethods = () => api.get('/payments/methods');

export const initializePayment = (paymentData) => 
  api.post('/payments/initialize', paymentData);

export const processPaymentCallback = (callbackData) => 
  api.post('/payments/callback', callbackData);

export const processRefund = (refundData) => 
  api.post('/payments/refund', refundData);

export const getPaymentAnalytics = (dateRange) => {
  const params = new URLSearchParams();
  if (dateRange?.startDate) {
    params.append('startDate', dateRange.startDate.toISOString());
  }
  if (dateRange?.endDate) {
    params.append('endDate', dateRange.endDate.toISOString());
  }
  return api.get(`/payments/analytics?${params.toString()}`);
};

// Export all admin API functions
export default {
  getAdminNotifications,
  createAdminNotification,
  deleteAdminNotification,
  deleteAllAdminNotifications,
  getNotificationStats,
  // Payment Management
  getPaymentMethods,
  initializePayment,
  processPaymentCallback,
  processRefund,
  getPaymentAnalytics
};