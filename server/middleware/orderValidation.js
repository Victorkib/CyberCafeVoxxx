import { createError } from '../utils/error.js';

/**
 * Validate order creation request
 */
export const validateOrderCreate = (req, res, next) => {
  try {
    const { items: orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      throw createError(400, 'No order items provided');
    }

    if (!shippingAddress) {
      throw createError(400, 'Shipping address is required');
    }

    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country
    ) {
      throw createError(400, 'Incomplete shipping address');
    }

    // Make state optional by providing a default if missing
    if (!shippingAddress.state) {
      shippingAddress.state = 'N/A';
    }

    if (!paymentMethod) {
      throw createError(400, 'Payment method is required');
    }

    // Validate each order item
    for (const item of orderItems) {
      if (!item.product || !item.quantity || !item.price) {
        throw createError(400, 'Invalid order item');
      }

      if (item.quantity <= 0) {
        throw createError(400, 'Item quantity must be greater than 0');
      }

      // Add default name if missing
      if (!item.name) {
        item.name = 'Product';
      }

      // Calculate totalPrice if missing
      if (!item.totalPrice) {
        item.totalPrice = item.price * item.quantity;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate order update request
 */
export const validateOrderUpdate = (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      throw createError(400, 'Order status is required');
    }

    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];

    if (!validStatuses.includes(status)) {
      throw createError(400, 'Invalid order status');
    }

    next();
  } catch (error) {
    next(error);
  }
};
