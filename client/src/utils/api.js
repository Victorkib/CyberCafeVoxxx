import axios from 'axios';
import { showErrorToast } from './ui';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    showErrorToast(message);
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
  },
  products: {
    list: '/products',
    detail: (id) => `/products/${id}`,
    create: '/products',
    update: (id) => `/products/${id}`,
    delete: (id) => `/products/${id}`,
    categories: '/products/categories',
    search: '/products/search',
    newArrivals: '/products/new-arrivals',
    sale: '/products/sale',
    related: (id) => `/products/${id}/related`,
  },
  categories: {
    list: '/categories',
    detail: (id) => `/categories/${id}`,
    create: '/categories',
    update: (id) => `/categories/${id}`,
    delete: (id) => `/categories/${id}`,
    featured: '/categories/featured',
  },
  specialOffers: {
    list: '/special-offers',
    detail: (id) => `/special-offers/${id}`,
    create: '/special-offers',
    update: (id) => `/special-offers/${id}`,
    delete: (id) => `/special-offers/${id}`,
    active: '/special-offers/active',
  },
  heroSlides: {
    list: '/hero-slides',
    detail: (id) => `/hero-slides/${id}`,
    create: '/hero-slides',
    update: (id) => `/hero-slides/${id}`,
    delete: (id) => `/hero-slides/${id}`,
    active: '/hero-slides/active',
  },
  orders: {
    list: '/orders',
    detail: (id) => `/orders/${id}`,
    create: '/orders',
    update: (id) => `/orders/${id}`,
    cancel: (id) => `/orders/${id}/cancel`,
  },
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear',
  },
  coupons: {
    validate: '/coupons/validate',
    apply: '/coupons/apply',
  },
  checkout: {
    process: '/checkout/process',
    verify: '/checkout/verify',
  },
  reviews: {
    list: '/reviews',
    create: '/reviews',
    update: (id) => `/reviews/${id}`,
    delete: (id) => `/reviews/${id}`,
  },
  wishlist: {
    get: '/wishlist',
    add: '/wishlist/add',
    remove: '/wishlist/remove',
  },
  settings: {
    get: '/settings',
    update: '/settings',
  },
  reports: {
    sales: '/reports/sales',
    inventory: '/reports/inventory',
    customers: '/reports/customers',
    orders: '/reports/orders',
  },
  newsletter: {
    subscribe: '/newsletter/subscribe',
    verify: (token) => `/newsletter/verify/${token}`,
    unsubscribe: (token) => `/newsletter/unsubscribe/${token}`,
    subscribers: '/newsletter/subscribers',
    stats: '/newsletter/stats',
    send: '/newsletter/send',
  },
  notifications: {
    list: '/notifications',
    detail: (id) => `/notifications/${id}`,
    markAsRead: (id) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    delete: (id) => `/notifications/${id}`,
    adminList: '/admin/notifications',
    adminCreate: '/admin/notifications',
    adminBulkCreate: '/admin/notifications/bulk',
    adminDelete: (id) => `/admin/notifications/${id}`,
    adminDeleteAll: '/admin/notifications/delete-all'
  },
  payments: {
    methods: '/payments/methods',
    initialize: '/payments/initialize',
    retry: '/payments/retry',
    status: (orderId) => `/payments/status/${orderId}`,
    history: '/payments/history',
    details: (paymentId) => `/payments/details/${paymentId}`,
    analytics: '/payments/analytics',
    refund: (paymentId) => `/payments/refund/${paymentId}`,
    refundHistory: '/payments/refund-history',
    settings: '/payments/settings',
    updateSettings: '/payments/settings',
    mpesaCallback: '/payments/mpesa/callback',
    paystackCallback: '/payments/paystack/callback',
    paypalCallback: '/payments/paypal/callback',
  },
};

// API request functions
export const apiRequest = {
  // Auth
  login: (data) => api.post(endpoints.auth.login, data),
  register: (data) => api.post(endpoints.auth.register, data),
  logout: () => api.post(endpoints.auth.logout),
  refreshToken: () => api.post(endpoints.auth.refreshToken),
  forgotPassword: (email) => api.post(endpoints.auth.forgotPassword, { email }),
  resetPassword: (data) => api.post(endpoints.auth.resetPassword, data),
  getCurrentUser: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),

  // Users
  getProfile: () => api.get(endpoints.users.profile),
  updateProfile: (data) => api.put(endpoints.users.updateProfile, data),
  changePassword: (data) => api.post(endpoints.users.changePassword, data),

  // Products
  getProducts: (params) => api.get(endpoints.products.list, { params }),
  getProduct: (id) => api.get(endpoints.products.detail(id)),
  createProduct: (data) => api.post(endpoints.products.create, data),
  updateProduct: (id, data) => api.put(endpoints.products.update(id), data),
  deleteProduct: (id) => api.delete(endpoints.products.delete(id)),
  getCategories: () => api.get(endpoints.products.categories),
  searchProducts: (query) => api.get(endpoints.products.search, { params: { query } }),
  getNewArrivals: () => api.get(endpoints.products.newArrivals),
  getSaleProducts: () => api.get(endpoints.products.sale),
  getRelatedProducts: (id) => api.get(endpoints.products.related(id)),

  // Categories
  getCategories: () => api.get(endpoints.categories.list),
  getCategory: (id) => api.get(endpoints.categories.detail(id)),
  createCategory: (data) => api.post(endpoints.categories.create, data),
  updateCategory: (id, data) => api.put(endpoints.categories.update(id), data),
  deleteCategory: (id) => api.delete(endpoints.categories.delete(id)),

  // Special Offers
  getSpecialOffers: () => api.get(endpoints.specialOffers.list),
  getSpecialOffer: (id) => api.get(endpoints.specialOffers.detail(id)),
  createSpecialOffer: (data) => api.post(endpoints.specialOffers.create, data),
  updateSpecialOffer: (id, data) => api.put(endpoints.specialOffers.update(id), data),
  deleteSpecialOffer: (id) => api.delete(endpoints.specialOffers.delete(id)),
  getActiveSpecialOffers: () => api.get(endpoints.specialOffers.active),

  // Hero Slides
  getHeroSlides: () => api.get(endpoints.heroSlides.list),
  getHeroSlide: (id) => api.get(endpoints.heroSlides.detail(id)),
  createHeroSlide: (data) => api.post(endpoints.heroSlides.create, data),
  updateHeroSlide: (id, data) => api.put(endpoints.heroSlides.update(id), data),
  deleteHeroSlide: (id) => api.delete(endpoints.heroSlides.delete(id)),
  getActiveHeroSlides: () => api.get(endpoints.heroSlides.active),

  // Orders
  getOrders: (params) => api.get(endpoints.orders.list, { params }),
  getOrder: (id) => api.get(endpoints.orders.detail(id)),
  createOrder: (data) => api.post(endpoints.orders.create, data),
  updateOrder: (id, data) => api.put(endpoints.orders.update(id), data),
  cancelOrder: (id) => api.post(endpoints.orders.cancel(id)),

  // Cart
  getCart: () => api.get(endpoints.cart.get),
  addToCart: (data) => api.post(endpoints.cart.add, data),
  updateCart: (data) => api.put(endpoints.cart.update, data),
  removeFromCart: (productId) => api.delete(endpoints.cart.remove, { data: { productId } }),
  clearCart: () => api.delete(endpoints.cart.clear),
  validateCoupon: (data) => api.post(endpoints.coupons.validate, data),
  applyCoupon: (data) => api.post(endpoints.coupons.apply, data),

  // Checkout
  processCheckout: (data) => api.post(endpoints.checkout.process, data),
  verifyCheckout: (data) => api.post(endpoints.checkout.verify, data),

  // Reviews
  getReviews: (params) => api.get(endpoints.reviews.list, { params }),
  createReview: (data) => api.post(endpoints.reviews.create, data),
  updateReview: (id, data) => api.put(endpoints.reviews.update(id), data),
  deleteReview: (id) => api.delete(endpoints.reviews.delete(id)),

  // Wishlist
  getWishlist: () => api.get(endpoints.wishlist.get),
  addToWishlist: (productId) => api.post(endpoints.wishlist.add, { productId }),
  removeFromWishlist: (productId) => api.delete(endpoints.wishlist.remove, { data: { productId } }),

  // Settings
  getSettings: () => api.get(endpoints.settings.get),
  updateSettings: (data) => api.put(endpoints.settings.update, data),

  // Reports
  getSalesReport: (params) => api.get(endpoints.reports.sales, { params }),
  getInventoryReport: (params) => api.get(endpoints.reports.inventory, { params }),
  getCustomerReport: (params) => api.get(endpoints.reports.customers, { params }),
  getOrderReport: (params) => api.get(endpoints.reports.orders, { params }),

  // Newsletter
  subscribeToNewsletter: (data) => api.post(endpoints.newsletter.subscribe, data),
  verifyNewsletterSubscription: (token) => api.get(endpoints.newsletter.verify(token)),
  unsubscribeFromNewsletter: (token) => api.get(endpoints.newsletter.unsubscribe(token)),
  getNewsletterSubscribers: () => api.get(endpoints.newsletter.subscribers),
  getNewsletterStats: () => api.get(endpoints.newsletter.stats),
  sendNewsletter: (data) => api.post(endpoints.newsletter.send, data),

  // Notifications
  getNotifications: () => api.get(endpoints.notifications.list),
  getNotification: (id) => api.get(endpoints.notifications.detail(id)),
  markNotificationAsRead: (id) => api.patch(endpoints.notifications.markAsRead(id)),
  markAllNotificationsAsRead: () => api.patch(endpoints.notifications.markAllAsRead),
  deleteNotification: (id) => api.delete(endpoints.notifications.delete(id)),
  // Admin functions
  getAdminNotifications: () => api.get(endpoints.notifications.adminList),
  createAdminNotification: (data) => api.post(endpoints.notifications.adminCreate, data),
  createBulkAdminNotifications: (data) => api.post(endpoints.notifications.adminBulkCreate, data),
  deleteAdminNotification: (id) => api.delete(endpoints.notifications.adminDelete(id)),
  deleteAllAdminNotifications: () => api.delete(endpoints.notifications.adminDeleteAll),

  // Payments
  getPaymentMethods: () => api.get(endpoints.payments.methods),
  initializePayment: (data) => api.post(endpoints.payments.initialize, data),
  retryPayment: (data) => api.post(endpoints.payments.retry, data),
  checkPaymentStatus: (orderId) => api.get(endpoints.payments.status(orderId)),
  getPaymentHistory: () => api.get(endpoints.payments.history),
  getPaymentDetails: (paymentId) => api.get(endpoints.payments.details(paymentId)),
  getPaymentAnalytics: (params) => api.get(endpoints.payments.analytics, { params }),
  refundPayment: (paymentId, data) => api.post(endpoints.payments.refund(paymentId), data),
  getRefundHistory: () => api.get(endpoints.payments.refundHistory),
  getPaymentSettings: () => api.get(endpoints.payments.settings),
  updatePaymentSettings: (data) => api.put(endpoints.payments.updateSettings, data),
};

// Auth API functions - Using the same functions as apiRequest for auth operations
export const authAPI = apiRequest;

// Category API functions - Using the same functions as apiRequest for category operations
export const categoryAPI = {
  getAll: () => apiRequest.getCategories(),
  getFeatured: () => api.get(endpoints.categories.featured),
  getById: (id) => apiRequest.getCategory(id),
  create: (data) => apiRequest.createCategory(data),
  update: (id, data) => apiRequest.updateCategory(id, data),
  delete: (id) => apiRequest.deleteCategory(id),
};

// Special Offer API functions
export const specialOfferAPI = {
  getAll: () => apiRequest.getSpecialOffers(),
  getActive: () => apiRequest.getActiveSpecialOffers(),
  getById: (id) => apiRequest.getSpecialOffer(id),
  create: (data) => apiRequest.createSpecialOffer(data),
  update: (id, data) => apiRequest.updateSpecialOffer(id, data),
  delete: (id) => apiRequest.deleteSpecialOffer(id),
};

// Hero Slide API functions
export const heroSlideAPI = {
  getAll: () => apiRequest.getHeroSlides(),
  getActive: () => apiRequest.getActiveHeroSlides(),
  getById: (id) => apiRequest.getHeroSlide(id),
  create: (data) => apiRequest.createHeroSlide(data),
  update: (id, data) => apiRequest.updateHeroSlide(id, data),
  delete: (id) => apiRequest.deleteHeroSlide(id),
};

// Newsletter API functions
export const newsletterAPI = {
  subscribe: (data) => apiRequest.subscribeToNewsletter(data),
  verify: (token) => apiRequest.verifyNewsletterSubscription(token),
  unsubscribe: (token) => apiRequest.unsubscribeFromNewsletter(token),
  getSubscribers: () => apiRequest.getNewsletterSubscribers(),
  getStats: () => apiRequest.getNewsletterStats(),
  send: (data) => apiRequest.sendNewsletter(data),
};

// Notification API functions
export const notificationAPI = {
  getAll: () => apiRequest.getNotifications(),
  getById: (id) => apiRequest.getNotification(id),
  markAsRead: (id) => apiRequest.markNotificationAsRead(id),
  markAllAsRead: () => apiRequest.markAllNotificationsAsRead(),
  delete: (id) => apiRequest.deleteNotification(id),
  // Admin functions
  getAdminNotifications: () => apiRequest.getAdminNotifications(),
  create: (data) => apiRequest.createAdminNotification(data),
  createBulk: (data) => apiRequest.createBulkAdminNotifications(data),
  deleteAdmin: (id) => apiRequest.deleteAdminNotification(id),
  deleteAllAdmin: () => apiRequest.deleteAllAdminNotifications()
};

// Payment API functions
export const paymentAPI = {
  getMethods: () => apiRequest.getPaymentMethods(),
  initialize: (data) => apiRequest.initializePayment(data),
  retry: (data) => apiRequest.retryPayment(data),
  checkStatus: (orderId) => apiRequest.checkPaymentStatus(orderId),
  getHistory: () => apiRequest.getPaymentHistory(),
  getDetails: (paymentId) => apiRequest.getPaymentDetails(paymentId),
  getAnalytics: (params) => apiRequest.getPaymentAnalytics(params),
  refund: (paymentId, data) => apiRequest.refundPayment(paymentId, data),
  getRefundHistory: () => apiRequest.getRefundHistory(),
  getSettings: () => apiRequest.getPaymentSettings(),
  updateSettings: (data) => apiRequest.updatePaymentSettings(data),
};

// Error handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return { message: data.message || 'Bad request', errors: data.errors };
      case 401:
        return { message: 'Unauthorized access', errors: null };
      case 403:
        return { message: 'Access forbidden', errors: null };
      case 404:
        return { message: 'Resource not found', errors: null };
      case 422:
        return { message: 'Validation failed', errors: data.errors };
      case 500:
        return { message: 'Internal server error', errors: null };
      default:
        return { message: 'An unexpected error occurred', errors: null };
    }
  } else if (error.request) {
    // Request made but no response
    return { message: 'No response from server', errors: null };
  } else {
    // Error setting up request
    return { message: error.message, errors: null };
  }
};

// File upload helper
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Pagination helper
export const createPaginationParams = (page = 1, limit = 10, sort = 'createdAt', order = 'desc') => ({
  page,
  limit,
  sort,
  order,
});

// Search helper
export const createSearchParams = (query, filters = {}, pagination = {}) => ({
  query,
  ...filters,
  ...pagination,
});

export default api;
