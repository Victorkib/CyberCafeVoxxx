import mongoose from 'mongoose';
import {
  initializeMpesaPayment,
  initializePaystackPayment,
  initializePaypalPayment,
} from '../utils/payment.js';
import Order from '../models/order.model.js';
import Payment from '../models/payment.model.js';
import Product from '../models/product.model.js'; // Make sure this import exists
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

// Enhanced stock reduction function with better error handling
export const reduceStock = async (orderItems, session = null) => {
  let useExternalSession = false;
  if (session) {
    useExternalSession = true;
  } else {
    session = await mongoose.startSession();
    await session.startTransaction();
  }

  try {
    logger.info('Starting stock reduction process', {
      itemCount: orderItems.length,
      items: orderItems.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
      })),
    });

    // Group quantities by product to handle multiple items of same product
    const productQuantities = new Map();
    for (const item of orderItems) {
      const productId = item.product.toString();
      const quantity = item.quantity;
      const current = productQuantities.get(productId) || 0;
      productQuantities.set(productId, current + quantity);
    }

    logger.info('Grouped product quantities', {
      productQuantities: Array.from(productQuantities.entries()),
    });

    // Process each product
    for (const [productId, totalQuantity] of productQuantities) {
      const product = await Product.findById(productId).session(session);

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      logger.info('Processing product stock reduction', {
        productId,
        productName: product.name,
        currentStock: product.stock,
        quantityToReduce: totalQuantity,
      });

      // Check if sufficient stock is available
      if (product.stock < totalQuantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${totalQuantity}`
        );
      }

      // Reduce stock
      const newStock = product.stock - totalQuantity;
      product.stock = newStock;

      // Update status if stock depleted
      if (newStock === 0 && product.status === 'active') {
        product.status = 'out_of_stock';
        logger.info('Product marked as out of stock', {
          productId,
          productName: product.name,
        });
      }

      await product.save({ session });

      logger.info('Stock reduced successfully', {
        productId,
        productName: product.name,
        previousStock: product.stock + totalQuantity,
        newStock: product.stock,
        quantityReduced: totalQuantity,
      });
    }

    if (!useExternalSession) {
      await session.commitTransaction();
      logger.info('Stock reduction transaction committed successfully');
    }
  } catch (error) {
    logger.error('Error in stock reduction process', {
      error: error.message,
      stack: error.stack,
    });

    if (!useExternalSession) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (!useExternalSession) {
      session.endSession();
    }
  }
};

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
      supportsInline: true,
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
  const { orderId, method, phoneNumber, email, amount, reference } = req.body;
  const userId = req.user._id;

  logger.info(`Initializing payment for order ${orderId} using ${method}`, {
    userId,
    orderId,
    method,
    reference,
  });

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

    const transactionId = reference || generateTransactionId();

    const payment = new Payment({
      orderId: order._id,
      userId: order.user,
      amount: amount || order.totalAmount,
      method: method || PAYMENT_METHODS.MPESA,
      transactionId,
      metadata: new Map([
        ['orderNumber', order.orderNumber],
        [
          'items',
          order.items.map((item) => ({
            productId: item.product,
            quantity: item.quantity,
            price: item.price,
          })),
        ],
        ['phoneNumber', phoneNumber],
        ['email', email],
        ['isInlineCheckout', method === PAYMENT_METHODS.PAYSTACK && reference],
        ['paystackReference', reference],
      ]),
    });

    await payment.save({ session });

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
        payment.metadata.set(
          'checkoutRequestId',
          paymentInitResult.checkoutRequestId
        );
        break;

      // In the PAYSTACK case, make sure we return the reference
      case PAYMENT_METHODS.PAYSTACK:
        if (!email) {
          throw createError(400, 'Email is required for Paystack payments');
        }

        if (reference) {
          paymentInitResult = {
            reference: reference,
            amount: amount || order.totalAmount,
            email: email,
            inline: true,
            message: 'Inline checkout initialized',
          };
          payment.metadata.set('paystackReference', reference);
          payment.metadata.set('isInlineCheckout', true);
        } else {
          paymentInitResult = await initializePaystackPayment(order, email);
          payment.metadata.set(
            'paystackReference',
            paymentInitResult.reference
          );
        }
        break;

      case PAYMENT_METHODS.PAYPAL:
        paymentInitResult = await initializePaypalPayment(order);
        payment.metadata.set('paypalOrderId', paymentInitResult.paypalOrderId);
        break;

      default:
        throw createError(400, 'Invalid payment method');
    }

    await payment.save({ session });
    await session.commitTransaction();
    session.endSession();

    logger.info('Payment initialized successfully', {
      paymentId: payment._id,
      transactionId: payment.transactionId,
      paystackReference: payment.metadata.get('paystackReference'),
    });

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        amount: payment.amount,
        method: payment.method,
        transactionId: payment.transactionId,
        reference: payment.transactionId, // Add this line
        ...(method === PAYMENT_METHODS.MPESA && {
          checkoutRequestId: paymentInitResult.checkoutRequestId,
          message: paymentInitResult.message,
        }),
        ...(method === PAYMENT_METHODS.PAYSTACK && {
          authorizationUrl: paymentInitResult.authorizationUrl,
          reference: paymentInitResult.reference || payment.transactionId,
          inline: paymentInitResult.inline || false,
        }),
        ...(method === PAYMENT_METHODS.PAYPAL && {
          approvalUrl: paymentInitResult.approvalUrl,
          paypalOrderId: paymentInitResult.paypalOrderId,
        }),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// FIXED: Process inline payment callback with proper Map field handling
export const processInlineCallback = handleAsync(async (req, res) => {
  const { orderId, reference, status, transactionId, metadata } = req.body;
  const userId = req.user._id;

  logger.info(`Processing inline payment callback for order ${orderId}`, {
    reference,
    status,
    transactionId,
    userId,
  });

  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    await session.startTransaction();
    transactionStarted = true;

    const order = await Order.findOne({ _id: orderId, user: userId }).session(
      session
    );
    if (!order) {
      throw createError(404, 'Order not found');
    }

    // FIXED: Debug and find payment with proper Map field handling
    logger.info('Searching for payment record', {
      orderId,
      reference,
      searchCriteria: 'orderId and reference matching',
    });

    // First, let's find all payments for this order to debug
    const allPayments = await Payment.find({ orderId }).session(session);
    logger.info('All payments found for order', {
      orderId,
      paymentCount: allPayments.length,
      payments: allPayments.map((p) => ({
        id: p._id,
        transactionId: p.transactionId,
        metadata: p.metadata,
        metadataKeys: p.metadata ? Array.from(p.metadata.keys()) : [],
        paystackRef: p.metadata ? p.metadata.get('paystackReference') : null,
      })),
    });

    // FIXED: Use aggregation pipeline to properly query Map fields
    const paymentAggregation = await Payment.aggregate([
      {
        $match: {
          orderId: new mongoose.Types.ObjectId(orderId),
        },
      },
      {
        $addFields: {
          paystackRef: { $objectToArray: '$metadata' },
        },
      },
      {
        $match: {
          $or: [
            { transactionId: reference },
            {
              'paystackRef.k': 'paystackReference',
              'paystackRef.v': reference,
            },
          ],
        },
      },
    ]).session(session);

    let payment = null;
    if (paymentAggregation.length > 0) {
      payment = await Payment.findById(paymentAggregation[0]._id).session(
        session
      );
    }

    // Fallback: try to find by transactionId or direct metadata access
    if (!payment) {
      logger.info('Trying fallback payment search methods');

      // Try finding by transactionId
      payment = await Payment.findOne({
        orderId,
        transactionId: reference,
      }).session(session);

      // If still not found, try finding by orderId and check metadata manually
      if (!payment) {
        const orderPayments = await Payment.find({ orderId }).session(session);
        for (const p of orderPayments) {
          if (p.metadata && p.metadata.get('paystackReference') === reference) {
            payment = p;
            break;
          }
        }
      }
    }

    if (!payment) {
      logger.error('Payment record not found after all search attempts', {
        orderId,
        reference,
        allPaymentsForOrder: allPayments.length,
      });
      throw createError(404, 'Payment record not found');
    }

    logger.info('Payment record found', {
      paymentId: payment._id,
      transactionId: payment.transactionId,
      currentStatus: payment.status,
    });

    // Update payment status
    payment.status =
      status === 'success' ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;

    // Update metadata properly for Map field
    payment.metadata.set('inlineCallbackProcessed', true);
    payment.metadata.set('callbackTimestamp', new Date().toISOString());
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        payment.metadata.set(key, value);
      });
    }

    if (status === 'success') {
      logger.info('Processing successful payment - reducing stock', {
        orderId,
        orderItems: order.items.length,
      });

      // CRITICAL FIX: Reduce product stock using the enhanced function
      await reduceStock(order.items, session);

      // Update order status
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.paymentMethod = payment.method;
      order.status = 'processing';
      order.paymentDetails = {
        transactionId: transactionId || reference,
        method: payment.method,
        timestamp: new Date(),
        reference: reference,
      };

      await order.save({ session });
      await payment.save({ session });

      // Commit transaction
      await session.commitTransaction();
      transactionStarted = false;

      // Handle non-critical operations after transaction is committed
      try {
        const notificationPromise = createPaymentNotification({
          userId: payment.userId,
          title: 'Payment Successful',
          message: `Your payment of ${payment.amount} KES for Order #${order.orderNumber} was successful`,
          link: `/orders/${order._id}`,
          priority: PAYMENT_PRIORITY.HIGH,
        });

        const emailPromise = sendPaymentSuccessEmail(req.user.email, order);
        await Promise.all([notificationPromise, emailPromise]);
      } catch (notificationError) {
        logger.warn('Failed to send notifications after successful payment', {
          error: notificationError.message,
          orderId,
        });
      }

      logger.info(
        `Inline payment successful and stock reduced for order ${orderId}`,
        {
          paymentId: payment._id,
          reference,
        }
      );
    } else {
      // Handle failed payment
      payment.error = {
        code: PAYMENT_ERRORS.PAYMENT_FAILED,
        message: metadata?.error || 'Inline payment failed',
        details: metadata,
      };

      await payment.save({ session });
      await session.commitTransaction();
      transactionStarted = false;

      // Handle non-critical operations after transaction is committed
      try {
        const notificationPromise = createPaymentNotification({
          userId: payment.userId,
          title: 'Payment Failed',
          message: `Your payment of ${payment.amount} KES failed. Please try again.`,
          link: `/orders/${orderId}`,
          priority: PAYMENT_PRIORITY.HIGH,
        });

        const emailPromise = sendPaymentFailedEmail(req.user.email, order);
        await Promise.all([notificationPromise, emailPromise]);
      } catch (notificationError) {
        logger.warn('Failed to send notifications after failed payment', {
          error: notificationError.message,
          orderId,
        });
      }

      logger.warn(`Inline payment failed for order ${orderId}`, {
        paymentId: payment._id,
        error: payment.error,
      });
    }

    res.json({
      success: true,
      data: {
        payment,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          status: order.status,
        },
      },
    });
  } catch (error) {
    // Only abort transaction if it was started and not yet committed/aborted
    if (transactionStarted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        logger.warn(
          'Error aborting transaction (transaction may have already been aborted)',
          {
            abortError: abortError.message,
          }
        );
      }
    }

    logger.error(
      `Error processing inline payment callback for order ${orderId}`,
      {
        error: error.message,
        stack: error.stack,
      }
    );

    throw error;
  } finally {
    // Always end the session
    try {
      session.endSession();
    } catch (endError) {
      logger.warn('Error ending session', {
        endError: endError.message,
      });
    }
  }
});

// FIXED: Verify inline payment with proper transaction handling
export const verifyInlinePayment = handleAsync(async (req, res) => {
  const { reference, orderId } = req.body;
  const userId = req.user._id;

  logger.info(`Verifying inline payment for order ${orderId}`, {
    reference,
    userId,
  });

  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    await session.startTransaction();
    transactionStarted = true;

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { data: paystackData } = paystackResponse.data;

    // Find the payment record using the same method as processInlineCallback
    const paymentAggregation = await Payment.aggregate([
      {
        $match: {
          orderId: new mongoose.Types.ObjectId(orderId),
        },
      },
      {
        $addFields: {
          paystackRef: { $objectToArray: '$metadata' },
        },
      },
      {
        $match: {
          $or: [
            { transactionId: reference },
            {
              'paystackRef.k': 'paystackReference',
              'paystackRef.v': reference,
            },
          ],
        },
      },
    ]).session(session);

    let payment = null;
    if (paymentAggregation.length > 0) {
      payment = await Payment.findById(paymentAggregation[0]._id).session(
        session
      );
    }

    if (!payment) {
      throw createError(404, 'Payment record not found');
    }

    // Verify order ownership
    const order = await Order.findOne({ _id: orderId, user: userId }).session(
      session
    );
    if (!order) {
      throw createError(404, 'Order not found');
    }

    const isVerified = paystackData.status === 'success';
    const amountMatches = paystackData.amount === payment.amount * 100; // Paystack uses kobo

    if (isVerified && amountMatches) {
      // Update payment and order if not already updated
      if (payment.status !== PAYMENT_STATUS.PAID) {
        logger.info('Payment verified - reducing stock', {
          orderId,
          orderItems: order.items.length,
        });

        // CRITICAL FIX: Reduce stock when payment is verified
        await reduceStock(order.items, session);

        payment.status = PAYMENT_STATUS.PAID;
        payment.metadata.set('paystackVerified', true);
        payment.metadata.set('verificationTimestamp', new Date().toISOString());
        payment.metadata.set('paystackData', paystackData);
        await payment.save({ session });

        if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
          order.paymentStatus = PAYMENT_STATUS.PAID;
          order.paymentMethod = payment.method;
          order.status = 'processing';
          order.paymentDetails = {
            transactionId: paystackData.id,
            method: payment.method,
            timestamp: new Date(),
            reference: reference,
          };

          await order.save({ session });
        }

        await session.commitTransaction();
        transactionStarted = false;

        logger.info(`Payment verified and stock reduced for order ${orderId}`, {
          paymentId: payment._id,
          reference,
        });
      } else {
        await session.commitTransaction();
        transactionStarted = false;
      }

      res.json({
        success: true,
        data: {
          verified: true,
          payment,
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            status: order.status,
          },
        },
      });
    } else {
      await session.commitTransaction();
      transactionStarted = false;

      res.json({
        success: false,
        data: {
          verified: false,
          message: 'Payment verification failed',
          details: {
            paystackStatus: paystackData.status,
            amountMatches,
            expectedAmount: payment.amount * 100,
            actualAmount: paystackData.amount,
          },
        },
      });
    }
  } catch (error) {
    // Only abort transaction if it was started and not yet committed/aborted
    if (transactionStarted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        logger.warn(
          'Error aborting transaction (transaction may have already been aborted)',
          {
            abortError: abortError.message,
          }
        );
      }
    }

    logger.error(`Error verifying inline payment for order ${orderId}`, {
      error: error.message,
      reference,
    });

    throw createError(500, 'Payment verification failed');
  } finally {
    // Always end the session
    try {
      session.endSession();
    } catch (endError) {
      logger.warn('Error ending session', {
        endError: endError.message,
      });
    }
  }
});

// FIXED: Process payment callback with proper stock reduction
export const processPaymentCallback = handleAsync(async (req, res) => {
  const { paymentId, status, transactionId, metadata } = req.body;

  logger.info(`Processing payment callback for payment ${paymentId}`, {
    status,
    transactionId,
  });

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
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        payment.metadata.set(key, value);
      });
    }

    if (status === PAYMENT_STATUS.PAID) {
      const order = await Order.findById(payment.orderId).session(session);

      if (!order) {
        await session.abortTransaction();
        session.endSession();
        throw createError(404, 'Order not found');
      }

      logger.info('Payment callback successful - reducing stock', {
        orderId: order._id,
        orderItems: order.items.length,
      });

      // CRITICAL FIX: Reduce stock when payment is successful
      await reduceStock(order.items, session);

      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.paymentMethod = payment.method;
      order.status = 'processing';
      order.paymentDetails = {
        transactionId,
        method: payment.method,
        timestamp: new Date(),
      };

      await order.save({ session });
      await payment.save({ session });

      // Commit transaction first
      await session.commitTransaction();
      session.endSession();

      // Then handle non-critical operations
      const notificationPromise = createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Successful',
        message: `Your payment of ${payment.amount} KES for Order #${order.orderNumber} was successful`,
        link: `/orders/${order._id}`,
        priority: PAYMENT_PRIORITY.HIGH,
      });

      const emailPromise = sendPaymentSuccessEmail(req.user.email, order);

      await Promise.all([notificationPromise, emailPromise]);

      logger.info(
        `Payment successful and stock reduced for order ${payment.orderId}`,
        {
          paymentId: payment._id,
          transactionId,
        }
      );
    } else if (status === PAYMENT_STATUS.FAILED) {
      payment.error = {
        code: PAYMENT_ERRORS.PAYMENT_FAILED,
        message: metadata?.error || 'Payment failed',
        details: metadata,
      };

      await payment.save({ session });
      await session.commitTransaction();
      session.endSession();

      const notificationPromise = createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your payment of ${payment.amount} KES failed. Please try again.`,
        link: `/orders/${payment.orderId}`,
        priority: PAYMENT_PRIORITY.HIGH,
      });

      const emailPromise = sendPaymentFailedEmail(
        req.user.email,
        await Order.findById(payment.orderId)
      );

      await Promise.all([notificationPromise, emailPromise]);

      logger.warn(`Payment failed for order ${payment.orderId}`, {
        paymentId: payment._id,
        error: payment.error,
      });
    } else {
      await payment.save({ session });
      await session.commitTransaction();
      session.endSession();
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(`Error processing payment callback for payment ${paymentId}`, {
      error: error.message,
    });

    throw error;
  }
});

// FIXED: Enhanced checkPaymentStatus with proper transaction handling
export const checkPaymentStatus = handleAsync(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  logger.info(`Checking payment status for order ${orderId}`, { userId });

  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    await session.startTransaction();
    transactionStarted = true;

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw createError(404, 'Order not found');
    }

    // Authorization check
    if (
      order.user.toString() !== userId.toString() &&
      !['admin', 'super_admin'].includes(req.user.role)
    ) {
      throw createError(403, 'Not authorized to view this order');
    }

    const payment = await Payment.findOne({ orderId })
      .sort({ createdAt: -1 })
      .session(session);

    if (!payment) {
      throw createError(404, 'Payment not found for this order');
    }

    // Check payment expiration
    const isExpired = payment.expiresAt && payment.expiresAt < new Date();
    if (payment.status === PAYMENT_STATUS.PENDING && isExpired) {
      payment.status = PAYMENT_STATUS.EXPIRED;
      payment.error = {
        code: PAYMENT_ERRORS.TRANSACTION_EXPIRED,
        message: 'Payment transaction expired',
      };
      await payment.save({ session });
    }

    // Verify pending payments older than 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    let paymentVerified = false;

    if (
      payment.status === PAYMENT_STATUS.PENDING &&
      payment.createdAt < thirtySecondsAgo &&
      !isExpired
    ) {
      try {
        let verificationResult = { verified: false };

        switch (payment.method) {
          case PAYMENT_METHODS.MPESA:
            if (payment.metadata?.get('checkoutRequestId')) {
              verificationResult = await checkMpesaPaymentStatus(
                payment.metadata.get('checkoutRequestId')
              );
            }
            break;

          case PAYMENT_METHODS.PAYSTACK:
            if (
              payment.metadata?.get('paystackReference') &&
              payment.metadata?.get('isInlineCheckout')
            ) {
              const paystackResponse = await axios.get(
                `https://api.paystack.co/transaction/verify/${payment.metadata.get(
                  'paystackReference'
                )}`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                  },
                }
              );

              const { data: paystackData } = paystackResponse.data;
              verificationResult = {
                verified: true,
                status:
                  paystackData.status === 'success'
                    ? PAYMENT_STATUS.PAID
                    : PAYMENT_STATUS.FAILED,
                paystackData,
              };
            }
            break;
        }

        if (verificationResult.verified) {
          payment.status = verificationResult.status;

          if (verificationResult.resultCode) {
            payment.metadata.set('resultCode', verificationResult.resultCode);
            payment.metadata.set('resultDesc', verificationResult.resultDesc);
          }

          if (verificationResult.paystackData) {
            payment.metadata.set('paystackVerified', true);
            payment.metadata.set(
              'paystackData',
              verificationResult.paystackData
            );
          }

          await payment.save({ session });
          paymentVerified = true;
        }
      } catch (error) {
        logger.error('Error verifying payment with provider', {
          error: error.message,
        });
      }
    }

    // CRITICAL FIX: Process successful payments and reduce stock
    if (
      payment.status === PAYMENT_STATUS.PAID &&
      order.paymentStatus !== PAYMENT_STATUS.PAID
    ) {
      logger.info(
        'Payment status check found successful payment - reducing stock',
        {
          orderId: order._id,
          orderItems: order.items.length,
        }
      );

      // Reduce product stock
      await reduceStock(order.items, session);

      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.status = 'processing';
      await order.save({ session });

      logger.info(`Stock reduced during status check for order ${orderId}`, {
        paymentId: payment._id,
      });
    }

    await session.commitTransaction();
    transactionStarted = false;

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
          isExpired,
          metadata: payment.metadata,
        },
      },
    });
  } catch (error) {
    // Only abort transaction if it was started and not yet committed/aborted
    if (transactionStarted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        logger.warn(
          'Error aborting transaction (transaction may have already been aborted)',
          {
            abortError: abortError.message,
          }
        );
      }
    }
    throw error;
  } finally {
    // Always end the session
    try {
      session.endSession();
    } catch (endError) {
      logger.warn('Error ending session', {
        endError: endError.message,
      });
    }
  }
});

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

    const baseUrl =
      process.env.MPESA_ENV === 'sandbox' ||
      process.env.NODE_ENV !== 'production' ||
      process.env.PAYMENT_MODE === 'test'
        ? 'https://sandbox.safaricom.co.ke'
        : 'https://api.safaricom.co.ke';

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
    });
    return { verified: false };
  }
};

// Process refund
export const processRefund = handleAsync(async (req, res) => {
  const { paymentId, reason } = req.body;
  const adminId = req.user._id;

  logger.info(`Processing refund for payment ${paymentId}`, {
    adminId,
    reason,
  });

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

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    payment.refundedBy = adminId;

    await payment.save({ session });

    const order = await Order.findById(payment.orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Order not found');
    }

    // CRITICAL FIX: Restore stock when refunding
    logger.info('Processing refund - restoring stock', {
      orderId: order._id,
      orderItems: order.items.length,
    });

    // Restore stock by adding back the quantities
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        const newStock = product.stock + item.quantity;
        product.stock = newStock;

        // Update status if product was out of stock
        if (product.status === 'out_of_stock' && newStock > 0) {
          product.status = 'active';
        }

        await product.save({ session });

        logger.info('Stock restored for refund', {
          productId: item.product,
          productName: product.name,
          quantityRestored: item.quantity,
          newStock: newStock,
        });
      }
    }

    order.paymentStatus = PAYMENT_STATUS.REFUNDED;
    order.status = 'refunded';

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    const notificationPromise = createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Refunded',
      message: `Your payment of ${payment.amount} KES for Order #${order.orderNumber} has been refunded`,
      link: `/orders/${order._id}`,
      priority: PAYMENT_PRIORITY.HIGH,
    });

    const emailPromise = sendRefundNotification(
      await User.findById(payment.userId)
        .select('email')
        .then((user) => user.email),
      order,
      reason
    );

    await Promise.all([notificationPromise, emailPromise]);

    logger.info(
      `Refund processed and stock restored for payment ${paymentId}`,
      {
        orderId: payment.orderId,
      }
    );

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
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

  if (order.user.toString() !== userId.toString()) {
    throw createError(403, 'Not authorized to retry payment for this order');
  }

  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    throw createError(400, 'Order is already paid');
  }

  const maxRetries = 3;
  const retryCount = order.paymentRetryCount || 0;

  if (retryCount >= maxRetries) {
    throw createError(
      400,
      'Maximum retry attempts reached. Please contact support.'
    );
  }

  const existingPayment = await Payment.findOne({ orderId }).sort({
    createdAt: -1,
  });

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

  order.paymentRetryCount = retryCount + 1;
  await order.save();

  const transactionId = generateTransactionId();

  const payment = new Payment({
    orderId: order._id,
    userId: order.user,
    amount: order.totalAmount,
    method: method,
    transactionId,
    metadata: new Map([
      ['orderNumber', order.orderNumber],
      ['retryCount', order.paymentRetryCount],
      ['previousPaymentId', existingPayment ? existingPayment._id : null],
      ['phoneNumber', phoneNumber],
      ['email', email],
    ]),
  });

  await payment.save();

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

        if (!phoneNumber.match(/^254[0-9]{9}$/)) {
          throw createError(
            400,
            'Invalid phone number format. Must start with 254 followed by 9 digits'
          );
        }

        paymentResult = await initializeMpesaPayment(order, phoneNumber);
        payment.metadata.set(
          'checkoutRequestId',
          paymentResult.checkoutRequestId
        );
        await payment.save();
        break;

      case PAYMENT_METHODS.PAYSTACK:
        if (!email) {
          throw createError(400, 'Email is required for Paystack payments');
        }
        paymentResult = await initializePaystackPayment(order, email);
        payment.metadata.set('paystackReference', paymentResult.reference);
        await payment.save();
        break;

      case PAYMENT_METHODS.PAYPAL:
        paymentResult = await initializePaypalPayment(order);
        payment.metadata.set('paypalOrderId', paymentResult.paypalOrderId);
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

  const query = { userId: req.user._id };
  if (status) query.status = status;
  if (paymentMethod) query.method = paymentMethod;

  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number.parseInt(limit))
    .populate('orderId', 'orderNumber totalAmount status');

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

  const order = await Order.findOne({ _id: orderId, user: req.user._id })
    .populate('items.product', 'name images price')
    .populate('user', 'name email');

  if (!order) {
    throw createError(404, 'Order not found');
  }

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

  const payments = await Payment.find({
    userId: req.user._id,
    status: PAYMENT_STATUS.REFUNDED,
  })
    .sort({ refundedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number.parseInt(limit))
    .populate('orderId', 'orderNumber totalAmount');

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

  await createPaymentNotification({
    userId: req.user._id,
    title: 'Payment Settings Updated',
    message: 'Payment settings have been updated',
    link: '/admin/settings/payment',
    priority: PAYMENT_PRIORITY.MEDIUM,
    metadata: { settings: req.body },
  });

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
