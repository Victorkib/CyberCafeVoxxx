import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendOrderConfirmationEmail, sendOrderShippedEmail, sendOrderDeliveredEmail } from '../utils/email.js';
import { createOrderNotification } from '../utils/notificationHelper.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Create order
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  // Update product stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock -= item.quantity;
      await product.save();
    }
  }

  // Send order confirmation email
  try {
    await sendOrderConfirmationEmail(req.user.email, createdOrder);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }

  // Create order confirmation notification
  await createOrderNotification({
    userId: req.user._id,
    title: 'Order Confirmed',
    message: `Your order #${createdOrder.orderNumber} has been confirmed and is being processed.`,
    link: `/orders/${createdOrder._id}`,
    priority: 'high'
  });

  res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email');

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    // Create order status update notification
    await createOrderNotification({
      userId: order.user,
      title: 'Order Status Updated',
      message: `Your order #${updatedOrder.orderNumber} status has been updated to ${updatedOrder.status}.`,
      link: `/orders/${updatedOrder._id}`,
      priority: 'medium'
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to shipped
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin
export const updateOrderToShipped = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email');
  const { trackingNumber } = req.body;

  if (order) {
    order.isShipped = true;
    order.shippedAt = Date.now();
    order.trackingNumber = trackingNumber;

    const updatedOrder = await order.save();

    // Send shipping notification email
    try {
      await sendOrderShippedEmail(order.user.email, updatedOrder, trackingNumber);
    } catch (error) {
      console.error('Failed to send shipping notification email:', error);
    }

    // Create order status update notification
    await createOrderNotification({
      userId: order.user,
      title: 'Order Status Updated',
      message: `Your order #${updatedOrder.orderNumber} status has been updated to ${updatedOrder.status}.`,
      link: `/orders/${updatedOrder._id}`,
      priority: 'medium'
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email');

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    // Send delivery notification email
    try {
      await sendOrderDeliveredEmail(order.user.email, updatedOrder);
    } catch (error) {
      console.error('Failed to send delivery notification email:', error);
    }

    // Create order status update notification
    await createOrderNotification({
      userId: order.user,
      title: 'Order Status Updated',
      message: `Your order #${updatedOrder.orderNumber} status has been updated to ${updatedOrder.status}.`,
      link: `/orders/${updatedOrder._id}`,
      priority: 'medium'
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
}); 