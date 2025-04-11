import {
  mpesa,
  paystackPayment,
  paypalPayment,
  getPaymentMethod,
  getPaymentEnvironment,
  initializeMpesaPayment,
  initializePaystackPayment,
  initializePaypalPayment
} from '../utils/payment.js';
import Order from '../models/order.model.js';
import Payment from '../models/payment.model.js';
import { handleError } from '../utils/error.js';
import { createPaymentNotification } from '../utils/notificationHelper.js';
import { handleAsync } from '../utils/errorHandler.js';
import { 
  sendPaymentSuccessEmail, 
  sendPaymentFailedEmail,
  sendAdminOrderNotification,
  sendRefundNotification,
  sendPaymentSettingsUpdateEmail
} from '../services/email.service.js';
import { getPaymentSettings, updatePaymentSettings as updateSettings } from '../services/settings.service.js';

// Get available payment methods
export const getPaymentMethods = handleAsync(async (req, res) => {
  const settings = await getPaymentSettings();
  const methods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay using M-Pesa mobile money',
      icon: 'mpesa-icon',
      enabled: settings.mpesaEnabled
    },
    {
      id: 'paystack',
      name: 'Paystack',
      description: 'Pay using Paystack',
      icon: 'paystack-icon',
      enabled: settings.paystackEnabled
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay using PayPal',
      icon: 'paypal-icon',
      enabled: settings.paypalEnabled
    }
  ].filter(method => method.enabled);

  res.json(methods);
});

// Initialize payment
export const initializePayment = handleAsync(async (req, res) => {
  const { orderId, method, phoneNumber } = req.body;

  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Verify order ownership
  if (order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to pay for this order' });
  }

  // Check if payment is already successful
  if (order.paymentStatus === 'paid') {
    return res.status(400).json({ message: 'Order is already paid' });
  }

  // Check payment method availability
  const settings = await getPaymentSettings();
  if (!settings[`${method}Enabled`]) {
    return res.status(400).json({ message: 'Payment method is currently unavailable' });
  }

  let paymentResult;

  switch (method) {
    case 'mpesa':
      paymentResult = await initializeMpesaPayment(order, phoneNumber);
      break;
    case 'paystack':
      paymentResult = await initializePaystackPayment(order);
      break;
    case 'paypal':
      paymentResult = await initializePaypalPayment(order);
      break;
    default:
      return res.status(400).json({ message: 'Invalid payment method' });
  }

  // Update order with payment method
  order.paymentMethod = method;
  await order.save();

  // Create notification for admin
  await createPaymentNotification({
    userId: null,
    orderId: order._id,
    status: 'paid',
    amount: order.totalAmount
  });

  res.json(paymentResult);
});

// Retry payment
export const retryPayment = handleAsync(async (req, res) => {
  const { orderId, method, phoneNumber } = req.body;

  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Verify order ownership
  if (order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to retry payment for this order' });
  }

  // Check if payment is already successful
  if (order.paymentStatus === 'paid') {
    return res.status(400).json({ message: 'Order is already paid' });
  }

  // Check retry attempts
  const maxRetries = 3;
  const retryCount = order.paymentRetryCount || 0;
  
  if (retryCount >= maxRetries) {
    return res.status(400).json({ 
      message: 'Maximum retry attempts reached. Please contact support.' 
    });
  }

  // Increment retry count
  order.paymentRetryCount = retryCount + 1;
  await order.save();

  // Initialize new payment attempt
  let paymentResult;

  switch (method) {
    case 'mpesa':
      paymentResult = await initializeMpesaPayment(order, phoneNumber);
      break;
    case 'paystack':
      paymentResult = await initializePaystackPayment(order);
      break;
    case 'paypal':
      paymentResult = await initializePaypalPayment(order);
      break;
    default:
      return res.status(400).json({ message: 'Invalid payment method' });
  }

  res.json({
    ...paymentResult,
    retryCount: order.paymentRetryCount,
    maxRetries
  });

  // Create notification for admin
  await createPaymentNotification({
    userId: order.user._id,
    orderId: order._id,
    status: 'paid',
    amount: order.totalAmount
  });
});

// M-Pesa callback
export const mpesaCallback = handleAsync(async (req, res) => {
  const { orderId, status, transactionId } = req.body;

  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Find the payment record
  const payment = await Payment.findOne({ 
    order: orderId,
    method: 'mpesa',
    status: 'pending'
  });

  if (!payment) {
    return res.status(404).json({ message: 'Payment record not found' });
  }

  if (status === 'success') {
    // Update order payment status
    order.paymentStatus = 'paid';
    order.paymentDetails = {
      transactionId,
      method: 'mpesa',
      timestamp: new Date(),
    };
    await order.save();

    // Update payment record
    payment.status = 'completed';
    payment.transactionId = transactionId;
    await payment.save();

    // Send success notifications
    try {
    await Promise.all([
      sendPaymentSuccessEmail(order),
        createPaymentNotification({
          userId: order.user._id,
          orderId: order._id,
          status: 'paid',
          amount: order.totalAmount
        }),
      sendAdminOrderNotification(order),
    ]);
    } catch (error) {
      console.error('Error sending payment success notifications:', error);
    }
  } else {
    // Update order payment status
    order.paymentStatus = 'failed';
    await order.save();

    // Update payment record
    payment.status = 'failed';
    await payment.save();

    // Send failure notifications
    try {
    await Promise.all([
      sendPaymentFailedEmail(order),
        createPaymentNotification({
          userId: order.user._id,
          orderId: order._id,
          status: 'failed',
          amount: order.totalAmount
        }),
      ]);
    } catch (error) {
      console.error('Error sending payment failure notifications:', error);
    }
  }

  res.json({ message: 'Payment status updated' });
});

// Paystack callback
export const paystackCallback = handleAsync(async (req, res) => {
  const { reference, status } = req.body;

  const order = await Order.findOne({ 'paymentDetails.transactionId': reference }).populate('user');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Find the payment record
  const payment = await Payment.findOne({ 
    order: order._id,
    method: 'paystack',
    status: 'pending'
  });

  if (!payment) {
    return res.status(404).json({ message: 'Payment record not found' });
  }

  if (status === 'success') {
    // Update order payment status
    order.paymentStatus = 'paid';
    order.paymentDetails = {
      transactionId: reference,
      method: 'paystack',
      timestamp: new Date(),
    };
    await order.save();

    // Update payment record
    payment.status = 'completed';
    payment.transactionId = reference;
    await payment.save();

    // Send success notifications
    try {
    await Promise.all([
      sendPaymentSuccessEmail(order),
        createPaymentNotification({
          userId: order.user._id,
          orderId: order._id,
          status: 'paid',
          amount: order.totalAmount
        }),
      sendAdminOrderNotification(order),
    ]);
    } catch (error) {
      console.error('Error sending payment success notifications:', error);
    }
  } else {
    // Update order payment status
    order.paymentStatus = 'failed';
    await order.save();

    // Update payment record
    payment.status = 'failed';
    await payment.save();

    // Send failure notifications
    try {
    await Promise.all([
      sendPaymentFailedEmail(order),
        createPaymentNotification({
          userId: order.user._id,
          orderId: order._id,
          status: 'failed',
          amount: order.totalAmount
        }),
      ]);
    } catch (error) {
      console.error('Error sending payment failure notifications:', error);
    }
  }

  res.json({ message: 'Payment status updated' });
});

// PayPal callback
export const paypalCallback = handleAsync(async (req, res) => {
  const { orderId, paymentId, status } = req.body;

  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Find the payment record
  const payment = await Payment.findOne({ 
    order: order._id,
    method: 'paypal',
    status: 'pending'
  });

  if (!payment) {
    return res.status(404).json({ message: 'Payment record not found' });
  }

  if (status === 'success') {
    // Update order payment status
    order.paymentStatus = 'paid';
    order.paymentDetails = {
      transactionId: paymentId,
      method: 'paypal',
      timestamp: new Date(),
    };
    await order.save();

    // Update payment record
    payment.status = 'completed';
    payment.transactionId = paymentId;
    await payment.save();

    // Send success notifications
    try {
    await Promise.all([
      sendPaymentSuccessEmail(order),
        createPaymentNotification({
          userId: order.user._id,
          orderId: order._id,
          status: 'paid',
          amount: order.totalAmount
        }),
      sendAdminOrderNotification(order),
    ]);
    } catch (error) {
      console.error('Error sending payment success notifications:', error);
    }
  } else {
    // Update order payment status
    order.paymentStatus = 'failed';
    await order.save();

    // Update payment record
    payment.status = 'failed';
    await payment.save();

    // Send failure notifications
    try {
    await Promise.all([
      sendPaymentFailedEmail(order),
        createPaymentNotification({
          userId: order.user._id,
          orderId: order._id,
          status: 'failed',
          amount: order.totalAmount
        }),
      ]);
    } catch (error) {
      console.error('Error sending payment failure notifications:', error);
    }
  }

  res.json({ message: 'Payment status updated' });
});

// Update payment settings (admin only)
export const updatePaymentSettings = handleAsync(async (req, res) => {
  const settings = await updateSettings(req.body);
  
  // Notify admins about settings update
  await createPaymentNotification({
    userId: null,
    orderId: null,
    status: 'payment_settings_updated',
    amount: 0,
    metadata: { settings: req.body }
  });
  
  // Send email notification to admins
  await sendPaymentSettingsUpdateEmail(req.body);

  res.json(settings);
});

// Fetch payment settings (admin only)
export const fetchPaymentSettings = handleAsync(async (req, res) => {
  const settings = await getPaymentSettings();
  res.json(settings);
});

// Check payment status
export const checkPaymentStatus = handleAsync(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Verify order ownership
  if (order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }

  res.json({
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentDetails: order.paymentDetails
  });
});

// Get payment analytics
export const getPaymentAnalytics = handleAsync(async (req, res) => {
  // Verify admin access
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to access payment analytics' });
  }

  const { startDate, endDate, paymentMethod } = req.query;
  
  // Build query
  const query = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  if (paymentMethod) {
    query.paymentMethod = paymentMethod;
  }
  
  // Get orders within date range
  const orders = await Order.find(query);

  // Calculate analytics
  const analytics = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length 
      : 0,
    paymentMethodBreakdown: orders.reduce((breakdown, order) => {
      breakdown[order.paymentMethod] = (breakdown[order.paymentMethod] || 0) + 1;
      return breakdown;
    }, {}),
    statusBreakdown: orders.reduce((breakdown, order) => {
      breakdown[order.paymentStatus] = (breakdown[order.paymentStatus] || 0) + 1;
      return breakdown;
    }, {})
  };
  
  res.json(analytics);
});

// Get payment history
export const getPaymentHistory = handleAsync(async (req, res) => {
  const { page = 1, limit = 10, status, paymentMethod } = req.query;
  
  // Build query
  const query = { user: req.user._id };
  if (status) query.paymentStatus = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  
  // Get paginated orders
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('items.product', 'name images');
    
  // Get total count for pagination
  const total = await Order.countDocuments(query);
  
  res.json({
    orders,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Get payment details
export const getPaymentDetails = handleAsync(async (req, res) => {
  const { orderId } = req.params;
  
  // Get order with populated fields
  const order = await Order.findOne({ _id: orderId, user: req.user._id })
    .populate('items.product', 'name images price')
    .populate('user', 'name email');
    
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  // Get payment details
  const payment = await Payment.findOne({ order: orderId });
  
  res.json({
    order,
    payment
  });
});

// Process refund
export const refund = handleAsync(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  
  // Get order and payment
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  const payment = await Payment.findOne({ order: orderId });
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  
  // Check if refund is possible
  if (payment.paymentStatus !== 'completed') {
    return res.status(400).json({ message: 'Payment must be completed to process refund' });
  }
  
  if (payment.refundStatus === 'refunded') {
    return res.status(400).json({ message: 'Payment has already been refunded' });
  }
  
  // Process refund based on payment method
  let refundResult;
  switch (payment.paymentMethod) {
    case 'mpesa':
      refundResult = await processMpesaRefund(payment);
      break;
    case 'paystack':
      refundResult = await processPaystackRefund(payment);
      break;
    case 'paypal':
      refundResult = await processPaypalRefund(payment);
      break;
    default:
      return res.status(400).json({ message: 'Unsupported payment method for refund' });
  }
  
  // Update payment record
  payment.refundStatus = 'refunded';
  payment.refundReason = reason;
  payment.refundDate = new Date();
  payment.refundDetails = refundResult;
  await payment.save();
  
  // Update order status
  order.status = 'refunded';
  await order.save();
  
  // Send notification
  await sendNotification({
    user: order.user,
    type: 'refund',
    title: 'Payment Refunded',
    message: `Your payment of ${order.totalAmount} has been refunded.`
  });
  
  res.json({
    message: 'Refund processed successfully',
    payment
  });
});

// Alias for refund function to maintain API consistency
export const refundPayment = refund;

// Get refund history
export const getRefundHistory = handleAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  // Get paginated refunds
  const payments = await Payment.find({
    user: req.user._id,
    refundStatus: 'refunded'
  })
    .sort({ refundDate: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('order', 'orderNumber totalAmount');
    
  // Get total count for pagination
  const total = await Payment.countDocuments({
    user: req.user._id,
    refundStatus: 'refunded'
  });
  
  res.json({
    refunds: payments,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
}); 