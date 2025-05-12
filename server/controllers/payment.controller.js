import mongoose from 'mongoose';
import {
  initializeMpesaPayment,
  initializePaystackPayment,
  initializePaypalPayment,
} from '../utils/payment.js';
import Order from '../models/order.model.js';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import { createError } from '../utils/error.js';
import { createPaymentNotification } from '../utils/notificationHelper.js';
import { handleAsync } from '../utils/errorHandler.js';
import {
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendRefundNotification,
  sendPaymentSettingsUpdateEmail,
} from '../services/email.service.js';
import {
  getPaymentSettings,
  updatePaymentSettings as updateSettings,
} from '../services/settings.service.js';
import {
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_ERRORS,
  PAYMENT_PRIORITY,
} from '../constants/payment.js';
import logger from '../utils/logger.js';
import axios from 'axios';
import { mpesa } from '../utils/payment.js';

// Get payment methods
export const getPaymentMethods = handleAsync(async (req, res) => {
  logger.info('Fetching available payment methods');

  const settings = await getPaymentSettings();

  const methods = [
    {
      id: PAYMENT_METHODS.MPESA,
      name: 'M-Pesa',
      enabled: settings.mpesaEnabled !== false,
      logo: '/images/payment/mpesa.png',
      requiresPhone: true,
    },
    {
      id: PAYMENT_METHODS.PAYSTACK,
      name: 'Paystack',
      enabled: settings.paystackEnabled !== false,
      logo: '/images/payment/paystack.png',
      requiresEmail: true,
    },
    {
      id: PAYMENT_METHODS.PAYPAL,
      name: 'PayPal',
      enabled: settings.paypalEnabled !== false,
      logo: '/images/payment/paypal.png',
    },
  ].filter((method) => method.enabled);

  res.json({
    success: true,
    data: methods,
    currency: settings.currency || { code: 'KES', symbol: 'KSh' },
  });
});

// Get all admin users (including super admins)
const getAdminUsers = async () => {
  return await User.find({
    role: { $in: ['admin', 'super_admin'] },
  }).select('_id');
};

// Initialize payment
export const initializePayment = handleAsync(async (req, res) => {
  const { orderId, method, phoneNumber, email } = req.body;
  const userId = req.user._id;

  logger.info(`Initializing payment for order ${orderId} using ${method}`, {
    userId,
    orderId,
    method,
  });

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, user: userId }).session(
      session
    );

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Order not found');
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      await session.abortTransaction();
      session.endSession();
      throw createError(400, 'Order is already paid');
    }

    // Generate a unique transaction ID
    const transactionId = generateTransactionId();

    // Create payment record
    const payment = new Payment({
      orderId: order._id,
      userId: order.user,
      amount: order.totalAmount,
      method: method || PAYMENT_METHODS.MPESA,
      transactionId,
      metadata: {
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          productId: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        phoneNumber,
        email,
      },
    });

    await payment.save({ session });

    // Get all admin users and create notifications for each
    const adminUsers = await getAdminUsers();

    // Create notifications (outside transaction since it's not critical)
    const notificationPromises = adminUsers.map((admin) =>
      createPaymentNotification({
        userId: admin._id,
        title: 'New Payment Initialized',
        message: `Payment of ${payment.amount} KES initialized for Order #${order.orderNumber}`,
        link: `/admin/payments/${payment._id}`,
        priority: PAYMENT_PRIORITY.MEDIUM,
      })
    );

    // Initialize payment with the appropriate gateway
    let paymentInitResult;

    switch (method) {
      case PAYMENT_METHODS.MPESA:
        if (!phoneNumber) {
          throw createError(
            400,
            'Phone number is required for M-Pesa payments'
          );
        }
        paymentInitResult = await initializeMpesaPayment(order, phoneNumber);
        payment.metadata.checkoutRequestId =
          paymentInitResult.checkoutRequestId;
        break;

      case PAYMENT_METHODS.PAYSTACK:
        if (!email) {
          throw createError(400, 'Email is required for Paystack payments');
        }
        paymentInitResult = await initializePaystackPayment(order, email);
        payment.metadata.paystackReference = paymentInitResult.reference;
        break;

      case PAYMENT_METHODS.PAYPAL:
        paymentInitResult = await initializePaypalPayment(order);
        payment.metadata.paypalOrderId = paymentInitResult.paypalOrderId;
        break;

      default:
        throw createError(400, 'Invalid payment method');
    }

    // Update payment with gateway-specific details
    await payment.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Process notifications after transaction is committed
    await Promise.all(notificationPromises);

    logger.info(`Payment initialized successfully for order ${orderId}`, {
      paymentId: payment._id,
      transactionId: payment.transactionId,
    });

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        amount: payment.amount,
        method: payment.method,
        transactionId: payment.transactionId,
        ...paymentInitResult,
      },
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error initializing payment for order ${orderId}`, {
      error: error.message,
      orderId,
      method,
    });

    throw error;
  }
});

// Process payment callback
export const processPaymentCallback = handleAsync(async (req, res) => {
  const { paymentId, status, transactionId, metadata } = req.body;

  logger.info(`Processing payment callback for payment ${paymentId}`, {
    status,
    transactionId,
  });

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);

    if (!payment) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Payment not found');
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      await session.abortTransaction();
      session.endSession();
      throw createError(400, 'Payment is not in pending state');
    }

    payment.status = status;
    payment.metadata = { ...payment.metadata, ...metadata };

    if (status === PAYMENT_STATUS.PAID) {
      const order = await Order.findById(payment.orderId).session(session);

      if (!order) {
        await session.abortTransaction();
        session.endSession();
        throw createError(404, 'Order not found');
      }

      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.paymentMethod = payment.method;
      order.paymentDetails = {
        transactionId,
        method: payment.method,
        timestamp: new Date(),
      };

      await order.save({ session });

      // Create success notification (outside transaction)
      const notificationPromise = createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Successful',
        message: `Your payment of ${payment.amount} KES for Order #${order.orderNumber} was successful`,
        link: `/orders/${order._id}`,
        priority: PAYMENT_PRIORITY.HIGH,
      });

      // Send email notification (outside transaction)
      const emailPromise = sendPaymentSuccessEmail(req.user.email, order);

      // Commit transaction first
      await payment.save({ session });
      await session.commitTransaction();
      session.endSession();

      // Then handle non-critical operations
      await Promise.all([notificationPromise, emailPromise]);

      logger.info(`Payment successful for order ${payment.orderId}`, {
        paymentId: payment._id,
        transactionId,
      });
    } else if (status === PAYMENT_STATUS.FAILED) {
      payment.error = {
        code: PAYMENT_ERRORS.PAYMENT_FAILED,
        message: metadata?.error || 'Payment failed',
        details: metadata,
      };

      // Create failure notification (outside transaction)
      const notificationPromise = createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your payment of ${payment.amount} KES failed. Please try again.`,
        link: `/orders/${payment.orderId}`,
        priority: PAYMENT_PRIORITY.HIGH,
      });

      // Send email notification (outside transaction)
      const emailPromise = sendPaymentFailedEmail(
        req.user.email,
        await Order.findById(payment.orderId)
      );

      // Commit transaction first
      await payment.save({ session });
      await session.commitTransaction();
      session.endSession();

      // Then handle non-critical operations
      await Promise.all([notificationPromise, emailPromise]);

      logger.warn(`Payment failed for order ${payment.orderId}`, {
        paymentId: payment._id,
        error: payment.error,
      });
    } else {
      // For other statuses, just save the payment
      await payment.save({ session });
      await session.commitTransaction();
      session.endSession();
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error processing payment callback for payment ${paymentId}`, {
      error: error.message,
    });

    throw error;
  }
});

// Process refund
export const processRefund = handleAsync(async (req, res) => {
  const { paymentId, reason } = req.body;
  const adminId = req.user._id;

  logger.info(`Processing refund for payment ${paymentId}`, {
    adminId,
    reason,
  });

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);

    if (!payment) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Payment not found');
    }

    if (!payment.canBeRefunded()) {
      await session.abortTransaction();
      session.endSession();
      throw createError(400, 'Payment cannot be refunded');
    }

    // Process the refund
    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    payment.refundedBy = adminId;

    await payment.save({ session });

    // Update the order status
    const order = await Order.findById(payment.orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Order not found');
    }

    order.paymentStatus = PAYMENT_STATUS.REFUNDED;
    order.status = 'refunded';

    await order.save({ session });

    // Create refund notification (outside transaction)
    const notificationPromise = createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Refunded',
      message: `Your payment of ${payment.amount} KES for Order #${order.orderNumber} has been refunded`,
      link: `/orders/${order._id}`,
      priority: PAYMENT_PRIORITY.HIGH,
    });

    // Send refund email notification (outside transaction)
    const emailPromise = sendRefundNotification(
      await User.findById(payment.userId)
        .select('email')
        .then((user) => user.email),
      order,
      reason
    );

    // Commit transaction first
    await session.commitTransaction();
    session.endSession();

    // Then handle non-critical operations
    await Promise.all([notificationPromise, emailPromise]);

    logger.info(`Refund processed successfully for payment ${paymentId}`, {
      orderId: payment.orderId,
    });

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error processing refund for payment ${paymentId}`, {
      error: error.message,
    });

    throw error;
  }
});

// Get payment analytics
export const getPaymentAnalytics = handleAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  logger.info('Fetching payment analytics', {
    startDate,
    endDate,
  });

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
          $lte: new Date(endDate || Date.now()),
        },
      },
    },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        value: '$count',
      },
    },
  ]);

  // Get hourly distribution
  const hourlyDistribution = await Payment.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate || 0),
          $lte: new Date(endDate || Date.now()),
        },
      },
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        hour: '$_id',
        count: 1,
      },
    },
    {
      $sort: { hour: 1 },
    },
  ]);

  res.json({
    success: true,
    data: {
      ...stats,
      paymentMethodDistribution: methodDistribution,
      hourlyDistribution,
    },
  });
});

// Helper function to generate unique transaction ID
const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

// Retry payment
// Enhance the retryPayment function with better M-Pesa handling
export const retryPayment = handleAsync(async (req, res) => {
  const { orderId, method, phoneNumber, email } = req.body;
  const userId = req.user._id;

  logger.info(`Retrying payment for order ${orderId} using ${method}`, {
    userId: req.user._id,
  });

  const order = await Order.findById(orderId);

  if (!order) {
    throw createError(404, 'Order not found');
  }

  // Verify order ownership
  if (order.user.toString() !== userId.toString()) {
    throw createError(403, 'Not authorized to retry payment for this order');
  }

  // Check if payment is already successful
  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    throw createError(400, 'Order is already paid');
  }

  // Check retry attempts
  const maxRetries = 3;
  const retryCount = order.paymentRetryCount || 0;

  if (retryCount >= maxRetries) {
    throw createError(
      400,
      'Maximum retry attempts reached. Please contact support.'
    );
  }

  // Get the latest payment for this order
  const existingPayment = await Payment.findOne({ orderId }).sort({
    createdAt: -1,
  });

  // Only allow retry if the payment is failed, expired, or has been pending for more than 2 minutes
  if (
    existingPayment &&
    existingPayment.status === PAYMENT_STATUS.PENDING &&
    existingPayment.createdAt > new Date(Date.now() - 2 * 60 * 1000)
  ) {
    throw createError(
      400,
      'Previous payment attempt is still being processed. Please wait a moment before retrying.'
    );
  }

  // Increment retry count
  order.paymentRetryCount = retryCount + 1;
  await order.save();

  // Generate a new transaction ID for this retry
  const transactionId = generateTransactionId();

  // Create a new payment record for this retry
  const payment = new Payment({
    orderId: order._id,
    userId: order.user,
    amount: order.totalAmount,
    method: method,
    transactionId,
    metadata: {
      orderNumber: order.orderNumber,
      retryCount: order.paymentRetryCount,
      previousPaymentId: existingPayment ? existingPayment._id : null,
      phoneNumber,
      email,
    },
  });

  await payment.save();

  // Initialize new payment attempt
  let paymentResult;

  try {
    switch (method) {
      case PAYMENT_METHODS.MPESA:
        if (!phoneNumber) {
          throw createError(
            400,
            'Phone number is required for M-Pesa payments'
          );
        }

        // Validate phone number format
        if (!phoneNumber.match(/^254[0-9]{9}$/)) {
          throw createError(
            400,
            'Invalid phone number format. Must start with 254 followed by 9 digits'
          );
        }

        paymentResult = await initializeMpesaPayment(order, phoneNumber);

        // Store the checkout request ID
        payment.metadata.checkoutRequestId = paymentResult.checkoutRequestId;
        await payment.save();

        break;

      case PAYMENT_METHODS.PAYSTACK:
        if (!email) {
          throw createError(400, 'Email is required for Paystack payments');
        }
        paymentResult = await initializePaystackPayment(order, email);

        // Store the reference
        payment.metadata.paystackReference = paymentResult.reference;
        await payment.save();

        break;

      case PAYMENT_METHODS.PAYPAL:
        paymentResult = await initializePaypalPayment(order);

        // Store the PayPal order ID
        payment.metadata.paypalOrderId = paymentResult.paypalOrderId;
        await payment.save();

        break;

      default:
        throw createError(400, 'Invalid payment method');
    }

    logger.info(`Payment retry initiated for order ${orderId}`, {
      method,
      retryCount: order.paymentRetryCount,
      paymentId: payment._id,
    });

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        ...paymentResult,
        retryCount: order.paymentRetryCount,
        maxRetries,
      },
    });
  } catch (error) {
    // If payment initialization fails, mark the payment as failed
    payment.status = PAYMENT_STATUS.FAILED;
    payment.error = {
      code: error.code || PAYMENT_ERRORS.PAYMENT_FAILED,
      message: error.message || 'Payment initialization failed',
    };
    await payment.save();

    logger.error(`Error retrying payment for order ${orderId}`, {
      error: error.message,
      method,
    });

    throw error;
  }
});

// Enhance the payment status checking for M-Pesa

// Add this function to check M-Pesa payment status directly with the API
const checkMpesaPaymentStatus = async (checkoutRequestId) => {
  try {
    const accessToken = await mpesa.getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    // Use sandbox URL in development/test mode
    const baseUrl =
      process.env.MPESA_ENV === 'sandbox' ||
      process.env.NODE_ENV !== 'production' ||
      process.env.PAYMENT_MODE === 'test'
        ? 'https://sandbox.safaricom.co.ke'
        : 'https://api.safaricom.co.ke';

    logger.info('Checking M-Pesa payment status', {
      checkoutRequestId,
      baseUrl,
    });

    const response = await axios.post(
      `${baseUrl}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('M-Pesa status check response', {
      ResponseCode: response.data.ResponseCode,
      ResponseDescription: response.data.ResponseDescription,
      checkoutRequestId,
    });

    return {
      verified: true,
      status:
        response.data.ResponseCode === '0'
          ? PAYMENT_STATUS.PAID
          : PAYMENT_STATUS.FAILED,
      resultCode: response.data.ResponseCode,
      resultDesc: response.data.ResponseDescription,
    };
  } catch (error) {
    logger.error('Error checking M-Pesa payment status', {
      error: error.message,
      checkoutRequestId,
    });

    return { verified: false };
  }
};

// Enhance the checkPaymentStatus function to use the direct M-Pesa status check
export const checkPaymentStatus = handleAsync(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  logger.info(`Checking payment status for order ${orderId}`, {
    userId: userId,
  });

  // Find the order and verify ownership
  const order = await Order.findById(orderId);

  if (!order) {
    throw createError(404, 'Order not found');
  }

  // Verify order ownership
  if (
    order.user.toString() !== userId.toString() &&
    !['admin', 'super_admin'].includes(req.user.role)
  ) {
    throw createError(403, 'Not authorized to view this order');
  }

  // Get the latest payment for this order
  const payment = await Payment.findOne({ orderId }).sort({ createdAt: -1 });

  if (!payment) {
    throw createError(404, 'Payment not found for this order');
  }

  // Check if payment is expired
  const isExpired = payment.expiresAt && payment.expiresAt < new Date();

  // If payment is still pending and expired, mark it as failed
  if (payment.status === PAYMENT_STATUS.PENDING && isExpired) {
    payment.status = PAYMENT_STATUS.EXPIRED;
    payment.error = {
      code: PAYMENT_ERRORS.TRANSACTION_EXPIRED,
      message: 'Payment transaction expired',
    };
    await payment.save();

    // Create payment failure notification
    await createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Expired',
      message: `Your payment for Order #${order.orderNumber} has expired. Please retry payment.`,
      link: `/orders/${order._id}`,
      priority: 'high',
    });
  }

  // If payment is still pending and it's been more than 30 seconds, check with the payment provider
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
  if (
    payment.status === PAYMENT_STATUS.PENDING &&
    payment.createdAt < thirtySecondsAgo &&
    !isExpired
  ) {
    // Attempt to verify payment with the provider
    try {
      let verificationResult = { verified: false };

      switch (payment.method) {
        case PAYMENT_METHODS.MPESA:
          if (payment.metadata && payment.metadata.checkoutRequestId) {
            logger.info(
              `Checking M-Pesa payment status for ${payment.metadata.checkoutRequestId}`
            );
            verificationResult = await checkMpesaPaymentStatus(
              payment.metadata.checkoutRequestId
            );
          }
          break;
        case PAYMENT_METHODS.PAYSTACK:
          if (payment.metadata && payment.metadata.paystackReference) {
            logger.info(
              `Checking Paystack payment status for ${payment.metadata.paystackReference}`
            );
            // Implementation would be similar to M-Pesa check
          }
          break;
        case PAYMENT_METHODS.PAYPAL:
          if (payment.metadata && payment.metadata.paypalOrderId) {
            logger.info(
              `Checking PayPal payment status for ${payment.metadata.paypalOrderId}`
            );
            // Implementation would be similar to M-Pesa check
          }
          break;
      }

      // If verification was successful, update payment status
      if (verificationResult.verified) {
        payment.status = verificationResult.status;

        if (verificationResult.resultCode) {
          payment.metadata = {
            ...payment.metadata,
            resultCode: verificationResult.resultCode,
            resultDesc: verificationResult.resultDesc,
          };
        }

        await payment.save();

        // If payment is now confirmed as paid, update the order
        if (payment.status === PAYMENT_STATUS.PAID) {
          order.paymentStatus = PAYMENT_STATUS.PAID;
          order.status = 'processing';
          order.paymentDetails = {
            transactionId: payment.transactionId,
            method: payment.method,
            timestamp: new Date(),
          };
          await order.save();

          // Create success notification
          await createPaymentNotification({
            userId: payment.userId,
            title: 'Payment Successful',
            message: `Your payment for Order #${order.orderNumber} was successful.`,
            link: `/orders/${order._id}`,
            priority: 'high',
          });

          // Send email notification
          try {
            await sendPaymentSuccessEmail(req.user.email, order);
          } catch (emailError) {
            logger.error(
              `Error sending payment success email: ${emailError.message}`
            );
          }
        } else if (payment.status === PAYMENT_STATUS.FAILED) {
          // Create failure notification
          await createPaymentNotification({
            userId: payment.userId,
            title: 'Payment Failed',
            message: `Your payment for Order #${order.orderNumber} failed: ${
              verificationResult.resultDesc || 'Unknown error'
            }`,
            link: `/orders/${order._id}`,
            priority: 'high',
          });
        }
      }
    } catch (error) {
      logger.error(
        `Error verifying payment status with provider for order ${orderId}`,
        {
          error: error.message,
          paymentId: payment._id,
        }
      );
      // Continue with the current status even if verification fails
    }
  }

  res.json({
    success: true,
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: payment.status,
      orderStatus: order.status,
      paymentMethod: payment.method,
      paymentDetails: {
        id: payment._id,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        createdAt: payment.createdAt,
        transactionId: payment.transactionId,
        isExpired: isExpired,
        metadata: payment.metadata,
      },
    },
  });
});

// Get payment history
export const getPaymentHistory = handleAsync(async (req, res) => {
  const { page = 1, limit = 10, status, paymentMethod } = req.query;

  logger.info('Fetching payment history', {
    userId: req.user._id,
    page,
    limit,
    status,
    paymentMethod,
  });

  // Build query
  const query = { userId: req.user._id };
  if (status) query.status = status;
  if (paymentMethod) query.method = paymentMethod;

  // Get paginated payments
  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number.parseInt(limit))
    .populate('orderId', 'orderNumber totalAmount status');

  // Get total count for pagination
  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get payment details
export const getPaymentDetails = handleAsync(async (req, res) => {
  const { orderId } = req.params;

  logger.info(`Fetching payment details for order ${orderId}`, {
    userId: req.user._id,
  });

  // Get order with populated fields
  const order = await Order.findOne({ _id: orderId, user: req.user._id })
    .populate('items.product', 'name images price')
    .populate('user', 'name email');

  if (!order) {
    throw createError(404, 'Order not found');
  }

  // Get payment details
  const payment = await Payment.findOne({ orderId });

  res.json({
    success: true,
    data: {
      order,
      payment,
    },
  });
});

// Get refund history
export const getRefundHistory = handleAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  logger.info('Fetching refund history', {
    userId: req.user._id,
    page,
    limit,
  });

  // Get paginated refunds
  const payments = await Payment.find({
    userId: req.user._id,
    status: PAYMENT_STATUS.REFUNDED,
  })
    .sort({ refundedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number.parseInt(limit))
    .populate('orderId', 'orderNumber totalAmount');

  // Get total count for pagination
  const total = await Payment.countDocuments({
    userId: req.user._id,
    status: PAYMENT_STATUS.REFUNDED,
  });

  res.json({
    success: true,
    data: {
      refunds: payments,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Update payment settings (admin only)
export const updatePaymentSettings = handleAsync(async (req, res) => {
  logger.info('Updating payment settings', {
    adminId: req.user._id,
  });

  const settings = await updateSettings(req.body);

  // Notify admins about settings update
  await createPaymentNotification({
    userId: req.user._id,
    title: 'Payment Settings Updated',
    message: 'Payment settings have been updated',
    link: '/admin/settings/payment',
    priority: PAYMENT_PRIORITY.MEDIUM,
    metadata: { settings: req.body },
  });

  // Send email notification to admins
  await sendPaymentSettingsUpdateEmail(req.body);

  logger.info('Payment settings updated successfully');

  res.json({
    success: true,
    data: settings,
  });
});

// Fetch payment settings (admin only)
export const fetchPaymentSettings = handleAsync(async (req, res) => {
  logger.info('Fetching payment settings', {
    adminId: req.user._id,
  });

  const settings = await getPaymentSettings();

  res.json({
    success: true,
    data: settings,
  });
});
