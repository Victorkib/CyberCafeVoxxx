import { apiRequest } from './api';

/**
 * Order API client that matches the server endpoints
 */
export const orderAPI = {
  // Create a new order
  createOrder: (orderData) => {
    return apiRequest.post('/orders', orderData).then((response) => {
      // Ensure we're returning the data in the expected format
      return {
        success: response.data.success,
        data: response.data.data,
      };
    });
  },

  // Get all orders for the current user
  getMyOrders: (params = {}) => apiRequest.get('/orders/myorders', { params }),

  // Get a specific order by ID
  getOrderById: (orderId) => {
    return apiRequest.get(`/orders/${orderId}`).then((response) => {
      // Ensure we're returning the data in the expected format
      return {
        success: response.data.success,
        data: response.data.data,
      };
    });
  },

  // Cancel an order
  cancelOrder: (orderId) => apiRequest.put(`/orders/${orderId}/cancel`),

  // Admin: Get all orders
  getAllOrders: (params = {}) => apiRequest.get('/orders', { params }),

  // Admin: Update order to paid
  updateOrderToPaid: (orderId, paymentDetails) =>
    apiRequest.put(`/orders/${orderId}/pay`, paymentDetails),

  // Admin: Update order to shipped
  updateOrderToShipped: (orderId, trackingData) =>
    apiRequest.put(`/orders/${orderId}/ship`, trackingData),

  // Admin: Update order to delivered
  updateOrderToDelivered: (orderId) =>
    apiRequest.put(`/orders/${orderId}/deliver`),

  // Admin: Update order status
  updateOrderStatus: (orderId, status) =>
    apiRequest.put(`/orders/${orderId}/status`, { status }),
};

export default orderAPI;
