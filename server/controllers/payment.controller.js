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
import {
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_ERRORS,
  PAYMENT_NOTIFICATIONS,
  PAYMENT_PRIORITY,
  PAYMENT_VALIDATION
} from '../constants/payment.js';
import User from '../models/user.model.js';

// Get payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const methods = Object.values(PAYMENT_METHODS).map(method => ({
      id: method,
      name: method.charAt(0).toUpperCase() + method.slice(1),
      enabled: true // This should come from settings
    }));

    res.json({ success: true, data: methods });
  } catch (error) {
    handleError(res, error);
  }
};

// Get all admin users (including super admins)
const getAdminUsers = async () => {
  return await User.find({ 
    role: { $in: ['admin', 'super_admin'] } 
  }).select('_id');
};

// Initialize payment
export const initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      return res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
    }

    const payment = new Payment({
      orderId: order._id,
      userId: order.user,
      amount: order.totalAmount,
      method: req.body.method || PAYMENT_METHODS.MPESA,
      transactionId: generateTransactionId(),
      metadata: {
        orderNumber: order.orderNumber,
        items: order.items.map(item => ({
          productId: item.product,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });

    await payment.save();

    // Get all admin users and create notifications for each
    const adminUsers = await getAdminUsers();
    await Promise.all(adminUsers.map(admin => 
      createPaymentNotification({
        userId: admin._id,
        title: 'New Payment Initialized',
        message: `Payment of ${payment.amount} KES initialized for Order #${order.orderNumber}`,
        link: `/admin/payments/${payment._id}`,
        priority: PAYMENT_PRIORITY.MEDIUM
      })
    ));

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        amount: payment.amount,
        method: payment.method,
        transactionId: payment.transactionId
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Process payment callback
export const processPaymentCallback = async (req, res) => {
  try {
    const { paymentId, status, transactionId, metadata } = req.body;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        error: 'Payment is not in pending state'
      });
    }

    payment.status = status;
    payment.metadata = { ...payment.metadata, ...metadata };

    if (status === PAYMENT_STATUS.PAID) {
      const order = await Order.findById(payment.orderId);
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.paymentMethod = payment.method;
      order.transactionId = transactionId;
      await order.save();

      // Create success notification
      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Successful',
        message: `Your payment of ${payment.amount} KES for Order #${order.orderNumber} was successful`,
        link: `/orders/${order._id}`,
        priority: PAYMENT_PRIORITY.HIGH
      });
    } else if (status === PAYMENT_STATUS.FAILED) {
      payment.error = {
        code: PAYMENT_ERRORS.PAYMENT_FAILED,
        message: metadata?.error || 'Payment failed',
        details: metadata
      };

      // Create failure notification
      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your payment of ${payment.amount} KES failed. Please try again.`,
        link: `/orders/${payment.orderId}`,
        priority: PAYMENT_PRIORITY.HIGH
      });
    }

    await payment.save();

    res.json({ success: true, data: payment });
  } catch (error) {
    handleError(res, error);
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const adminId = req.user._id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (!payment.canBeRefunded()) {
      return res.status(400).json({
        success: false,
        error: 'Payment cannot be refunded'
      });
    }

    await payment.processRefund(reason, adminId);

    const order = await Order.findById(payment.orderId);
    order.paymentStatus = PAYMENT_STATUS.REFUNDED;
  await order.save();

    // Create refund notification
  await createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Refunded',
      message: `Your payment of ${payment.amount} KES for Order #${order.orderNumber} has been refunded`,
      link: `/orders/${order._id}`,
      priority: PAYMENT_PRIORITY.HIGH
    });

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get payment analytics
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await Payment.getPaymentStats(
      new Date(startDate || 0),
      new Date(endDate || Date.now())
    );

    // Get payment method distribution
    const methodDistribution = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate || 0),
            $lte: new Date(endDate || Date.now())
          }
        }
      },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count'
        }
      }
    ]);

    // Get hourly distribution
    const hourlyDistribution = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate || 0),
            $lte: new Date(endDate || Date.now())
          }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          hour: '$_id',
          count: 1
        }
      },
      {
        $sort: { hour: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        paymentMethodDistribution: methodDistribution,
        hourlyDistribution
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Helper function to generate unique transaction ID
const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

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
      status: 'success'
    };
    await order.save();

    // Update payment record
    payment.status = 'success';
    payment.transactionId = transactionId;
    await payment.save();

    // Send success email
    await sendPaymentSuccessEmail(order.user.email, order);

    // Create success notification
    await createPaymentNotification(order.user._id, order._id, 'success', order.totalAmount);

    // Send admin notification
    await sendAdminOrderNotification(order);
  } else {
    // Update order payment status
    order.paymentStatus = 'failed';
    order.paymentDetails = {
      transactionId,
      method: 'mpesa',
      status: 'failed'
    };
    await order.save();

    // Update payment record
    payment.status = 'failed';
    payment.transactionId = transactionId;
    await payment.save();

    // Send failure email
    await sendPaymentFailedEmail(order.user.email, order);

    // Create failure notification
    await createPaymentNotification(order.user._id, order._id, 'failed', order.totalAmount);
  }

  res.json({ status: 'success' });
});

// Paystack callback
export const paystackCallback = handleAsync(async (req, res) => {
  const { reference, status } = req.body;

  const payment = await Payment.findOne({ 
    transactionId: reference,
    method: 'paystack'
  }).populate('order');

  if (!payment) {
    return res.status(404).json({ message: 'Payment record not found' });
  }

  const order = payment.order;

  if (status === 'success') {
    // Update order payment status
    order.paymentStatus = 'paid';
    order.paymentDetails = {
      transactionId: reference,
      method: 'paystack',
      status: 'success'
    };
    await order.save();

    // Update payment record
    payment.status = 'success';
    await payment.save();

    // Send success email
    await sendPaymentSuccessEmail(order.user.email, order);

    // Create success notification
    await createPaymentNotification(order.user._id, order._id, 'success', order.totalAmount);

    // Send admin notification
    await sendAdminOrderNotification(order);
  } else {
    // Update order payment status
    order.paymentStatus = 'failed';
    order.paymentDetails = {
      transactionId: reference,
      method: 'paystack',
      status: 'failed'
    };
    await order.save();

    // Update payment record
    payment.status = 'failed';
    await payment.save();

    // Send failure email
    await sendPaymentFailedEmail(order.user.email, order);

    // Create failure notification
    await createPaymentNotification(order.user._id, order._id, 'failed', order.totalAmount);
  }

  res.json({ status: 'success' });
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
    order: orderId,
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
      status: 'success'
    };
    await order.save();

    // Update payment record
    payment.status = 'success';
    payment.transactionId = paymentId;
    await payment.save();

    // Send success email
    await sendPaymentSuccessEmail(order.user.email, order);

    // Create success notification
    await createPaymentNotification(order.user._id, order._id, 'success', order.totalAmount);

    // Send admin notification
    await sendAdminOrderNotification(order);
  } else {
    // Update order payment status
    order.paymentStatus = 'failed';
    order.paymentDetails = {
      transactionId: paymentId,
      method: 'paypal',
      status: 'failed'
    };
    await order.save();

    // Update payment record
    payment.status = 'failed';
    payment.transactionId = paymentId;
    await payment.save();

    // Send failure email
    await sendPaymentFailedEmail(order.user.email, order);

    // Create failure notification
    await createPaymentNotification(order.user._id, order._id, 'failed', order.totalAmount);
  }

  res.json({ status: 'success' });
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