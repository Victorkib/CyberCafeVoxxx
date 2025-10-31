import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import { handleAsync } from '../utils/errorHandler.js';
import { createError } from '../utils/error.js';
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from '../services/email.service.js';
import { createOrderNotification } from '../utils/notificationHelper.js';
import { notificationTemplates } from '../utils/notification-templates.js';
import logger from '../utils/logger.js';
import { createProductNotification } from '../utils/notificationHelper.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = handleAsync(async (req, res) => {
  const {
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  logger.info('Creating new order', { userId: req.user._id });

  if (orderItems && orderItems.length === 0) {
    throw createError(400, 'No order items');
  }

  // Ensure shippingAddress has all required fields
  if (!shippingAddress) {
    throw createError(400, 'Shipping address is required');
  }

  // Set default state if not provided
  if (!shippingAddress.state) {
    shippingAddress.state = 'N/A';
  }

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Process order items to ensure they have all required fields
    const processedItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product).session(session);

        if (!product) {
          throw createError(404, `Product not found: ${item.product}`);
        }

        if (product.countInStock < item.quantity) {
          throw createError(400, `Insufficient stock for ${product.name}`);
        }

        // Ensure each item has name and totalPrice
        return {
          ...item,
          name: item.name || product.name,
          price: item.price || product.price,
          totalPrice:
            item.totalPrice || (item.price || product.price) * item.quantity,
        };
      })
    );

    // Create order with processed items
    const order = new Order({
      user: req.user._id,
      orderNumber: generateOrderNumber(),
      items: processedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxAmount: taxPrice,
      shippingAmount: shippingPrice,
      totalAmount: totalPrice,
    });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      product.countInStock -= item.quantity;
      await product.save({ session });

      // Check if stock is low after this order
      if (product.countInStock <= product.lowStockThreshold) {
        // Create low stock notification (outside transaction)
        createProductNotification({
          productId: product._id,
          action: 'low_stock',
          details: `${product.name} is running low on stock (${product.countInStock} remaining)`,
        });
      }
    }

    const createdOrder = await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send order confirmation email (outside transaction)
    try {
      await sendOrderConfirmationEmail(req.user.email, createdOrder);
    } catch (error) {
      logger.error('Failed to send order confirmation email', {
        error: error.message,
        orderId: createdOrder._id,
      });
    }

    // Create order confirmation notification (outside transaction)
    await createOrderNotification({
      userId: req.user._id,
      title: 'Order Confirmed',
      message: `Your order #${createdOrder.orderNumber} has been confirmed and is being processed.`,
      link: `/orders/${createdOrder._id}`,
      priority: 'high',
    });

    logger.info('Order created successfully', {
      orderId: createdOrder._id,
      orderNumber: createdOrder.orderNumber,
    });

    res.status(201).json({
      success: true,
      data: createdOrder,
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error('Error creating order', {
      error: error.message,
      userId: req.user._id,
    });

    throw error;
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = handleAsync(async (req, res) => {
  logger.info(`Fetching order ${req.params.id}`, {
    userId: req.user._id,
  });

  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name price images');

  if (!order) {
    throw createError(404, 'Order not found');
  }

  // Check if the user is authorized to view this order
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !['admin', 'super_admin'].includes(req.user.role)
  ) {
    throw createError(403, 'Not authorized to view this order');
  }

  res.json({
    success: true,
    data: order,
  });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
export const updateOrderToPaid = handleAsync(async (req, res) => {
  logger.info(`Updating order ${req.params.id} to paid status`, {
    adminId: req.user._id,
  });

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'email')
      .session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Order not found');
    }

    order.paymentStatus = 'paid';
    order.paidAt = Date.now();
    order.status = 'processing';
    order.paymentDetails = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address,
    };

    const updatedOrder = await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Create order status update notification (outside transaction)
    await createOrderNotification({
      userId: order.user._id,
      title: 'Order Status Updated',
      message: `Your order #${updatedOrder.orderNumber} status has been updated to ${updatedOrder.status}.`,
      link: `/orders/${updatedOrder._id}`,
      priority: 'medium',
    });

    logger.info(`Order ${order._id} updated to paid status`, {
      orderNumber: order.orderNumber,
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error updating order ${req.params.id} to paid status`, {
      error: error.message,
    });

    throw error;
  }
});

// @desc    Update order to shipped
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin
export const updateOrderToShipped = handleAsync(async (req, res) => {
  logger.info(`Updating order ${req.params.id} to shipped status`, {
    adminId: req.user._id,
  });

  const { trackingNumber } = req.body;

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'email')
      .session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Order not found');
    }

    order.status = 'shipped';
    order.shippedAt = Date.now();
    order.trackingNumber = trackingNumber || order.generateTrackingNumber();

    const updatedOrder = await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send shipping notification email (outside transaction)
    try {
      await sendOrderShippedEmail(
        order.user.email,
        updatedOrder,
        order.trackingNumber
      );
    } catch (error) {
      logger.error('Failed to send shipping notification email', {
        error: error.message,
        orderId: order._id,
      });
    }

    // Create order status update notification (outside transaction)
    await createOrderNotification({
      userId: order.user._id,
      title: 'Order Shipped',
      message: `Your order #${updatedOrder.orderNumber} has been shipped. Tracking number: ${order.trackingNumber}`,
      link: `/orders/${updatedOrder._id}`,
      priority: 'high',
    });

    logger.info(`Order ${order._id} updated to shipped status`, {
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error updating order ${req.params.id} to shipped status`, {
      error: error.message,
    });

    throw error;
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = handleAsync(async (req, res) => {
  logger.info(`Updating order ${req.params.id} to delivered status`, {
    adminId: req.user._id,
  });

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'email')
      .session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Order not found');
    }

    order.status = 'delivered';
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send delivery notification email (outside transaction)
    try {
      await sendOrderDeliveredEmail(order.user.email, updatedOrder);
    } catch (error) {
      logger.error('Failed to send delivery notification email', {
        error: error.message,
        orderId: order._id,
      });
    }

    // Create order status update notification (outside transaction)
    await createOrderNotification({
      userId: order.user._id,
      title: 'Order Delivered',
      message: `Your order #${updatedOrder.orderNumber} has been delivered.`,
      link: `/orders/${updatedOrder._id}`,
      priority: 'high',
    });

    logger.info(`Order ${order._id} updated to delivered status`, {
      orderNumber: order.orderNumber,
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error updating order ${req.params.id} to delivered status`, {
      error: error.message,
    });

    throw error;
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = handleAsync(async (req, res) => {
  logger.info(`Cancelling order ${req.params.id}`, {
    userId: req.user._id,
  });

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Order not found');
    }

    // Check if the user is authorized to cancel this order
    if (
      order.user.toString() !== req.user._id.toString() &&
      !['admin', 'super_admin'].includes(req.user.role)
    ) {
      await session.abortTransaction();
      session.endSession();
      throw createError(403, 'Not authorized to cancel this order');
    }

    // Check if order can be cancelled
    if (
      ['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status)
    ) {
      await session.abortTransaction();
      session.endSession();
      throw createError(
        400,
        `Order cannot be cancelled in ${order.status} status`
      );
    }

    // Update order status
    order.status = 'cancelled';

    // If order was paid, mark for refund
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: item.quantity } },
        { session }
      );
    }

    const updatedOrder = await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send cancellation email (outside transaction)
    try {
      const user = await User.findById(order.user).select('email');
      await sendOrderCancelledEmail(user.email, updatedOrder);
    } catch (error) {
      logger.error('Failed to send order cancellation email', {
        error: error.message,
        orderId: order._id,
      });
    }

    // Create order cancellation notification (outside transaction)
    await createOrderNotification({
      userId: order.user,
      title: 'Order Cancelled',
      message: `Your order #${updatedOrder.orderNumber} has been cancelled.`,
      link: `/orders/${updatedOrder._id}`,
      priority: 'high',
    });

    logger.info(`Order ${order._id} cancelled successfully`, {
      orderNumber: order.orderNumber,
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error cancelling order ${req.params.id}`, {
      error: error.message,
    });

    throw error;
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = handleAsync(async (req, res) => {
  const { status } = req.body;

  logger.info(`Updating order ${req.params.id} status to ${status}`, {
    adminId: req.user._id,
  });

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'email')
      .session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Order not found');
    }

    // Update order status
    order.status = status;

    // Update related fields based on status
    switch (status) {
      case 'processing':
        // No additional fields to update
        break;
      case 'shipped':
        order.shippedAt = Date.now();
        if (!order.trackingNumber) {
          order.trackingNumber = order.generateTrackingNumber();
        }
        break;
      case 'delivered':
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        break;
      case 'cancelled':
        // Restore product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { countInStock: item.quantity } },
            { session }
          );
        }
        break;
      case 'refunded':
        order.paymentStatus = 'refunded';
        break;
    }

    const updatedOrder = await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Create order status update notification (outside transaction)
    await createOrderNotification({
      userId: order.user._id,
      ...notificationTemplates.orderStatus(
        order._id,
        status,
        order.orderNumber
      ),
    });

    logger.info(`Order ${order._id} status updated to ${status}`, {
      orderNumber: order.orderNumber,
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error updating order ${req.params.id} status`, {
      error: error.message,
    });

    throw error;
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = handleAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  logger.info('Fetching user orders', {
    userId: req.user._id,
    page,
    limit,
    status,
  });

  // Build query
  const query = { user: req.user._id };
  if (status) query.status = status;

  // Get paginated orders
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number.parseInt(limit))
    .populate('items.product', 'name images');

  // Get total count for pagination
  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = handleAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  logger.info('Fetching all orders', {
    adminId: req.user._id,
    page,
    limit,
    status,
    paymentStatus,
  });

  // Build query
  const query = {};
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  // Search by order number or customer name/email
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');

    const userIds = users.map((user) => user._id);

    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { user: { $in: userIds } },
    ];
  }

  // Determine sort order
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Get paginated orders
  const orders = await Order.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number.parseInt(limit))
    .populate('user', 'name email')
    .populate('items.product', 'name images');

  // Get total count for pagination
  const total = await Order.countDocuments(query);

  // Get order statistics
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);

  const orderStats = stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount,
    };
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / limit),
      },
      stats: orderStats,
    },
  });
});

// Helper function to generate order number
const generateOrderNumber = () => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};
