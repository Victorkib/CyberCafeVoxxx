import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderToShipped,
  getMyOrders,
  getOrders,
  cancelOrder,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';
import {
  validateOrderCreate,
  validateOrderUpdate,
} from '../middleware/orderValidation.js';

const router = express.Router();

// All order routes are protected
router.use(authMiddleware);

// Customer routes
router.post('/', validateOrderCreate, createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', authorize('admin', 'super_admin'), getOrders);
router.put('/:id/pay', authorize('admin', 'super_admin'), updateOrderToPaid);
router.put(
  '/:id/ship',
  authorize('admin', 'super_admin'),
  updateOrderToShipped
);
router.put(
  '/:id/deliver',
  authorize('admin', 'super_admin'),
  updateOrderToDelivered
);
router.put(
  '/:id/status',
  authorize('admin', 'super_admin'),
  validateOrderUpdate,
  updateOrderStatus
);

export default router;
