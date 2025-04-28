import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { openAuthModal } from '../redux/slices/uiSlice';

// Create a function to configure the API with dispatch
export const createApi = (dispatch) => {
  // Create axios instance with default config
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
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
    (response) => {
      // Show success messages if present
      if (response.status && response?.data?.message) {
        toast.success(response?.data?.message || 'Operation successful');
      }
      // Return the full response object, not just response.data
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle token expiration
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Clear token if it's invalid
        if (error.response?.data?.message?.includes('invalid token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('sessionStart');
          dispatch(openAuthModal('login'));
          return Promise.reject(error);
        }

        try {
          // Try to refresh the token
          const response = await api.post('/auth/refresh-token');
          const { token } = response.data;

          if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('sessionStart', new Date().toISOString());
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear everything and show login
          localStorage.removeItem('token');
          localStorage.removeItem('sessionStart');
          dispatch(openAuthModal('login'));
          return Promise.reject(refreshError);
        }
      }

      // Extract error message from response
      const message =
        error?.response?.data?.message || error?.message || 'An error occurred';
      const errors =
        error?.response?.data?.errors || error?.response?.data?.error;

      // Show error toast
      if (message) {
        toast.error(message);
      }

      return Promise.reject(message);
    }
  );

  return api;
};

// Create a default instance without dispatch for non-Redux usage
const defaultApi = createApi();

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
    unreadCount: '/notifications/unread-count',
    stats: '/notifications/stats',
    // Admin endpoints
    adminList: '/admin/notifications',
    adminCreate: '/admin/notifications',
    adminStats: '/admin/notifications/stats',
    adminDelete: (id) => `/admin/notifications/${id}`,
    adminDeleteAll: '/admin/notifications',
    adminRetryDelivery: '/admin/notifications/retry-delivery',
  },
  payments: {
    methods: '/payments/methods',
    initialize: '/payments/initialize',
    callback: '/payments/callback',
    refund: '/payments/refund',
    analytics: '/payments/analytics',
  },
};

// Create the API request object with all methods
const apiRequest = {
  // Generic HTTP methods
  get: (url, config) => defaultApi.get(url, config),
  post: (url, data, config) => defaultApi.post(url, data, config),
  put: (url, data, config) => defaultApi.put(url, data, config),
  delete: (url, config) => defaultApi.delete(url, config),
  patch: (url, data, config) => defaultApi.patch(url, data, config),

  // Auth
  login: (data) => defaultApi.post(endpoints.auth.login, data),
  register: (data) => defaultApi.post(endpoints.auth.register, data),
  logout: () => defaultApi.post(endpoints.auth.logout),
  refreshToken: () => defaultApi.post(endpoints.auth.refreshToken),
  forgotPassword: (email) =>
    defaultApi.post(endpoints.auth.forgotPassword, { email }),
  resetPassword: (data) => defaultApi.post(endpoints.auth.resetPassword, data),
  getCurrentUser: () => defaultApi.get('/auth/me'),
  updatePassword: (data) => defaultApi.put('/auth/update-password', data),
  verifyAdminInvitation: (token) =>
    defaultApi.get(`/admin/verify-invitation/${token}`),

  // Users
  getProfile: () => defaultApi.get(endpoints.users.profile),
  updateProfile: (data) => defaultApi.put(endpoints.users.updateProfile, data),
  changePassword: (data) =>
    defaultApi.post(endpoints.users.changePassword, data),

  // Products
  getProducts: (params) => defaultApi.get(endpoints.products.list, { params }),
  getProduct: (id) => defaultApi.get(endpoints.products.detail(id)),
  createProduct: (data) => defaultApi.post(endpoints.products.create, data),
  updateProduct: (id, data) =>
    defaultApi.put(endpoints.products.update(id), data),
  deleteProduct: (id) => defaultApi.delete(endpoints.products.delete(id)),
  getCategories: () => defaultApi.get(endpoints.products.categories),
  searchProducts: (query) =>
    defaultApi.get(endpoints.products.search, { params: { q: query } }),
  getNewArrivals: () => defaultApi.get(endpoints.products.newArrivals),
  getSaleProducts: () => defaultApi.get(endpoints.products.sale),
  getRelatedProducts: (id) => defaultApi.get(endpoints.products.related(id)),

  // Categories
  getCategories: () => defaultApi.get(endpoints.categories.list),
  getCategory: (id) => defaultApi.get(endpoints.categories.detail(id)),
  createCategory: (data) => defaultApi.post(endpoints.categories.create, data),
  updateCategory: (id, data) =>
    defaultApi.put(endpoints.categories.update(id), data),
  deleteCategory: (id) => defaultApi.delete(endpoints.categories.delete(id)),

  // Special Offers
  getSpecialOffers: () => defaultApi.get(endpoints.specialOffers.list),
  getActiveSpecialOffers: () => defaultApi.get(endpoints.specialOffers.active),
  getSpecialOffer: (id) => defaultApi.get(endpoints.specialOffers.detail(id)),
  createSpecialOffer: (data) =>
    defaultApi.post(endpoints.specialOffers.create, data),
  updateSpecialOffer: (id, data) =>
    defaultApi.put(endpoints.specialOffers.update(id), data),
  deleteSpecialOffer: (id) =>
    defaultApi.delete(endpoints.specialOffers.delete(id)),

  // Hero Slides
  getHeroSlides: () => defaultApi.get(endpoints.heroSlides.list),
  getActiveHeroSlides: () => defaultApi.get(endpoints.heroSlides.active),
  getHeroSlide: (id) => defaultApi.get(endpoints.heroSlides.detail(id)),
  createHeroSlide: (data) => defaultApi.post(endpoints.heroSlides.create, data),
  updateHeroSlide: (id, data) =>
    defaultApi.put(endpoints.heroSlides.update(id), data),
  deleteHeroSlide: (id) => defaultApi.delete(endpoints.heroSlides.delete(id)),

  // Orders
  getOrders: (params) => defaultApi.get(endpoints.orders.list, { params }),
  getOrder: (id) => defaultApi.get(endpoints.orders.detail(id)),
  createOrder: (data) => defaultApi.post(endpoints.orders.create, data),
  updateOrder: (id, data) => defaultApi.put(endpoints.orders.update(id), data),
  cancelOrder: (id) => defaultApi.post(endpoints.orders.cancel(id)),

  // Cart
  getCart: () => defaultApi.get(endpoints.cart.get),
  addToCart: (data) => {
    if (!data || !data.productId) {
      console.error('Invalid cart data:', data);
      throw new Error('Product ID is required to add to cart');
    }

    // Ensure productId is a string before sending the request
    const payload = {
      ...data,
      productId: String(data.productId),
    };

    console.log('Sending cart request with payload:', payload);
    return defaultApi.post(endpoints.cart.add, payload);
  },
  updateCart: (data) => {
    if (!data || !data.productId) {
      throw new Error('Product ID is required for cart update');
    }

    // Ensure productId is a string
    const payload = {
      ...data,
      productId: String(data.productId),
    };

    return defaultApi.put(`${endpoints.cart.update}/${payload.productId}`, {
      quantity: payload.quantity,
    });
  },
  removeFromCart: (productId) => {
    if (!productId) {
      throw new Error('Product ID is required to remove from cart');
    }

    // Ensure productId is a string
    const formattedProductId = String(productId);

    return defaultApi.delete(`${endpoints.cart.remove}/${formattedProductId}`);
  },
  clearCart: () => defaultApi.delete(endpoints.cart.clear),
  getCartSummary: () => defaultApi.get(`${endpoints.cart}/summary`),
  validateCoupon: (data) => defaultApi.post(endpoints.coupons.validate, data),
  applyCoupon: (data) => defaultApi.post(endpoints.coupons.apply, data),

  // Checkout
  processCheckout: (data) => defaultApi.post(endpoints.checkout.process, data),
  verifyCheckout: (data) => defaultApi.post(endpoints.checkout.verify, data),

  // Reviews
  getReviews: (params) => defaultApi.get(endpoints.reviews.list, { params }),
  createReview: (data) => defaultApi.post(endpoints.reviews.create, data),
  updateReview: (id, data) =>
    defaultApi.put(endpoints.reviews.update(id), data),
  deleteReview: (id) => defaultApi.delete(endpoints.reviews.delete(id)),

  // Wishlist
  getWishlist: () => defaultApi.get(endpoints.wishlist.get),
  addToWishlist: (productId) =>
    defaultApi.post(endpoints.wishlist.add, { productId: String(productId) }),
  removeFromWishlist: (productId) =>
    defaultApi.delete(endpoints.wishlist.remove, {
      data: { productId: String(productId) },
    }),

  // Settings
  getSettings: () => defaultApi.get(endpoints.settings.get),
  updateSettings: (data) => defaultApi.put(endpoints.settings.update, data),

  // Reports
  getSalesReport: (params) =>
    defaultApi.get(endpoints.reports.sales, { params }),
  getInventoryReport: (params) =>
    defaultApi.get(endpoints.reports.inventory, { params }),
  getCustomerReport: (params) =>
    defaultApi.get(endpoints.reports.customers, { params }),
  getOrderReport: (params) =>
    defaultApi.get(endpoints.reports.orders, { params }),

  // Newsletter
  subscribeToNewsletter: (data) =>
    defaultApi.post(endpoints.newsletter.subscribe, data),
  verifyNewsletterSubscription: (token) =>
    defaultApi.get(endpoints.newsletter.verify(token)),
  unsubscribeFromNewsletter: (token) =>
    defaultApi.get(endpoints.newsletter.unsubscribe(token)),
  getNewsletterSubscribers: () =>
    defaultApi.get(endpoints.newsletter.subscribers),
  getNewsletterStats: () => defaultApi.get(endpoints.newsletter.stats),
  sendNewsletter: (data) => defaultApi.post(endpoints.newsletter.send, data),

  // Notifications
  getNotifications: () => defaultApi.get(endpoints.notifications.list),
  getNotification: (id) => defaultApi.get(endpoints.notifications.detail(id)),
  markNotificationAsRead: (id) =>
    defaultApi.patch(endpoints.notifications.markAsRead(id)),
  markAllNotificationsAsRead: () =>
    defaultApi.patch(endpoints.notifications.markAllAsRead),
  deleteNotification: (id) =>
    defaultApi.delete(endpoints.notifications.delete(id)),
  // Admin functions
  getAdminNotifications: () =>
    defaultApi.get(endpoints.notifications.adminList),
  createAdminNotification: (data) =>
    defaultApi.post(endpoints.notifications.adminCreate, data),
  createBulkAdminNotifications: (data) =>
    defaultApi.post(endpoints.notifications.adminBulkCreate, data),
  deleteAdminNotification: (id) =>
    defaultApi.delete(endpoints.notifications.adminDelete(id)),
  deleteAllAdminNotifications: () =>
    defaultApi.delete(endpoints.notifications.adminDeleteAll),

  // Payments
  getPaymentMethods: () => defaultApi.get(endpoints.payments.methods),
  initializePayment: (data) =>
    defaultApi.post(endpoints.payments.initialize, data),
  processCallback: (data) => defaultApi.post(endpoints.payments.callback, data),
  getPaymentAnalytics: (params) =>
    defaultApi.get(endpoints.payments.analytics, { params }),
  refundPayment: (data) => defaultApi.post(endpoints.payments.refund, data),
};

// Category API
export const categoryAPI = {
  getAll: () => defaultApi.get(endpoints.categories.list),
  getById: (id) => defaultApi.get(endpoints.categories.detail(id)),
  create: (data) => defaultApi.post(endpoints.categories.create, data),
  update: (id, data) => defaultApi.put(endpoints.categories.update(id), data),
  delete: (id) => defaultApi.delete(endpoints.categories.delete(id)),
  getFeatured: () => defaultApi.get(endpoints.categories.featured),
};

// Special Offer API
export const specialOfferAPI = {
  getAll: () => defaultApi.get(endpoints.specialOffers.list),
  getById: (id) => defaultApi.get(endpoints.specialOffers.detail(id)),
  create: (data) => defaultApi.post(endpoints.specialOffers.create, data),
  update: (id, data) =>
    defaultApi.put(endpoints.specialOffers.update(id), data),
  delete: (id) => defaultApi.delete(endpoints.specialOffers.delete(id)),
  getActive: () => defaultApi.get(endpoints.specialOffers.active),
};

// Hero Slide API
export const heroSlideAPI = {
  getAll: () => defaultApi.get(endpoints.heroSlides.list),
  getById: (id) => defaultApi.get(endpoints.heroSlides.detail(id)),
  create: (data) => defaultApi.post(endpoints.heroSlides.create, data),
  update: (id, data) => defaultApi.put(endpoints.heroSlides.update(id), data),
  delete: (id) => defaultApi.delete(endpoints.heroSlides.delete(id)),
  getActive: () => defaultApi.get(endpoints.heroSlides.active),
};

// Order API
export const orderAPI = {
  getAll: (params) => defaultApi.get(endpoints.orders.list, { params }),
  getById: (id) => defaultApi.get(endpoints.orders.detail(id)),
  create: (data) => defaultApi.post(endpoints.orders.create, data),
  update: (id, data) => defaultApi.put(endpoints.orders.update(id), data),
  cancel: (id) => defaultApi.post(endpoints.orders.cancel(id)),
};

// Cart API
export const cartAPI = {
  get: () => defaultApi.get(endpoints.cart.get),
  add: (data) => {
    if (!data || !data.productId) {
      console.error('Invalid cart data:', data);
      throw new Error('Product ID is required to add to cart');
    }

    // Ensure productId is a string before sending the request
    const payload = {
      ...data,
      productId: String(data.productId),
    };

    console.log('Sending cart request with payload:', payload);
    return defaultApi.post(endpoints.cart.add, payload);
  },
  update: (data) => {
    if (!data || !data.productId) {
      throw new Error('Product ID is required for cart update');
    }

    // Ensure productId is a string
    const payload = {
      ...data,
      productId: String(data.productId),
    };

    return defaultApi.put(`${endpoints.cart}/${payload.productId}`, {
      quantity: payload.quantity,
    });
  },
  remove: (productId) => {
    if (!productId) {
      throw new Error('Product ID is required to remove from cart');
    }

    // Ensure productId is a string
    const formattedProductId = String(productId);

    return defaultApi.delete(`${endpoints.cart}/${formattedProductId}`);
  },
  clear: () => defaultApi.delete(endpoints.cart.clear),
  getSummary: () => defaultApi.get(`${endpoints.cart}/summary`),
};

// Review API
export const reviewAPI = {
  getAll: (params) => defaultApi.get(endpoints.reviews.list, { params }),
  create: (data) => defaultApi.post(endpoints.reviews.create, data),
  update: (id, data) => defaultApi.put(endpoints.reviews.update(id), data),
  delete: (id) => defaultApi.delete(endpoints.reviews.delete(id)),
};

// Wishlist API
export const wishlistAPI = {
  get: () => defaultApi.get(endpoints.wishlist.get),
  add: (productId) =>
    defaultApi.post(endpoints.wishlist.add, { productId: String(productId) }),
  remove: (productId) =>
    defaultApi.delete(endpoints.wishlist.remove, {
      data: { productId: String(productId) },
    }),
};

// Settings API
export const settingsAPI = {
  get: () => defaultApi.get(endpoints.settings.get),
  update: (data) => defaultApi.put(endpoints.settings.update, data),
};

// Reports API
export const reportsAPI = {
  getSales: (params) => defaultApi.get(endpoints.reports.sales, { params }),
  getInventory: (params) =>
    defaultApi.get(endpoints.reports.inventory, { params }),
  getCustomers: (params) =>
    defaultApi.get(endpoints.reports.customers, { params }),
  getOrders: (params) => defaultApi.get(endpoints.reports.orders, { params }),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (data) => defaultApi.post(endpoints.newsletter.subscribe, data),
  verify: (token) => defaultApi.get(endpoints.newsletter.verify(token)),
  unsubscribe: (token) =>
    defaultApi.get(endpoints.newsletter.unsubscribe(token)),
  getSubscribers: () => defaultApi.get(endpoints.newsletter.subscribers),
  getStats: () => defaultApi.get(endpoints.newsletter.stats),
  send: (data) => defaultApi.post(endpoints.newsletter.send, data),
};

// Notifications API
export const notificationAPI = {
  getAll: (params) => defaultApi.get(endpoints.notifications.list, { params }),
  getById: (id) => defaultApi.get(endpoints.notifications.detail(id)),
  markAsRead: (id) => defaultApi.patch(endpoints.notifications.markAsRead(id)),
  markAllAsRead: (type) =>
    defaultApi.patch(endpoints.notifications.markAllAsRead, { type }),
  delete: (id) => defaultApi.delete(endpoints.notifications.delete(id)),
  getUnreadCount: (type) =>
    defaultApi.get(endpoints.notifications.unreadCount, { params: { type } }),
  getStats: () => defaultApi.get(endpoints.notifications.stats),
  // Admin functions
  getAdminList: (params) =>
    defaultApi.get(endpoints.notifications.adminList, { params }),
  createAdmin: (data) =>
    defaultApi.post(endpoints.notifications.adminCreate, data),
  getAdminStats: () => defaultApi.get(endpoints.notifications.adminStats),
  deleteAdmin: (id) =>
    defaultApi.delete(endpoints.notifications.adminDelete(id)),
  deleteAllAdmin: () =>
    defaultApi.delete(endpoints.notifications.adminDeleteAll),
  retryDelivery: () =>
    defaultApi.post(endpoints.notifications.adminRetryDelivery),
};

// Payments API
export const paymentAPI = {
  getMethods: () => defaultApi.get(endpoints.payments.methods),
  initialize: (data) => defaultApi.post(endpoints.payments.initialize, data),
  processCallback: (data) => defaultApi.post(endpoints.payments.callback, data),
  getAnalytics: (params) =>
    defaultApi.get(endpoints.payments.analytics, { params }),
  refund: (data) => defaultApi.post(endpoints.payments.refund, data),
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
    const response = await defaultApi.post(endpoint, formData, {
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
export const createPaginationParams = (
  page = 1,
  limit = 10,
  sort = 'createdAt',
  order = 'desc'
) => ({
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

// Export the apiRequest object
export { apiRequest, defaultApi };

// Export the default instance
export default apiRequest;
