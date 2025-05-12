import { handleAsync } from '../utils/errorHandler.js';
import Payment from '../models/payment.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import {
  verifyMpesaSignature,
  verifyPaystackSignature,
  verifyPaypalSignature,
} from '../utils/payment.js';
import { PAYMENT_STATUS } from '../constants/payment.js';
import { createError } from '../utils/error.js';
import {
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
} from '../services/email.service.js';
import { createPaymentNotification } from '../utils/notificationHelper.js';
import logger from '../utils/logger.js';

// Handle M-Pesa webhook
export const handleMpesaWebhook = handleAsync(async (req, res) => {
  const signature = req.headers['x-mpesa-signature'];
  const payload = req.body;

  logger.info('Received M-Pesa webhook', {
    Body: payload.Body,
  });

  // Verify webhook signature if available
  if (signature && !verifyMpesaSignature(payload, signature)) {
    logger.warn('Invalid M-Pesa webhook signature');
    return res
      .status(400)
      .json({ success: false, message: 'Invalid signature' });
  }

  try {
    // Extract data from the webhook payload
    if (!payload.Body || !payload.Body.stkCallback) {
      logger.warn('Invalid M-Pesa webhook payload format');
      return res
        .status(400)
        .json({ success: false, message: 'Invalid payload format' });
    }

    const { Body } = payload;
    const { stkCallback } = Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } =
      stkCallback;

    // Additional validation for required fields
    if (!CheckoutRequestID || ResultCode === undefined) {
      logger.warn('Missing required fields in M-Pesa webhook', {
        CheckoutRequestID,
        ResultCode,
      });
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' });
    }

    // Find the payment by the checkout request ID
    const payment = await Payment.findOne({
      'metadata.checkoutRequestId': CheckoutRequestID,
    });

    if (!payment) {
      logger.warn('Payment not found for M-Pesa webhook', {
        CheckoutRequestID,
      });
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' });
    }

    // Get the order and user
    const order = await Order.findById(payment.orderId);
    const user = await User.findById(payment.userId);

    if (!order || !user) {
      logger.warn('Order or user not found for M-Pesa webhook', {
        orderId: payment.orderId,
        userId: payment.userId,
      });
      return res
        .status(404)
        .json({ success: false, message: 'Order or user not found' });
    }

    // Extract callback metadata if available
    const callbackMetadata = {};
    if (stkCallback.CallbackMetadata && stkCallback.CallbackMetadata.Item) {
      stkCallback.CallbackMetadata.Item.forEach((item) => {
        if (item.Name && (item.Value !== undefined || item.Value !== null)) {
          callbackMetadata[item.Name] = item.Value;
        }
      });
    }

    // Process the payment result
    if (ResultCode === 0) {
      // Payment successful
      payment.status = PAYMENT_STATUS.PAID;
      payment.metadata = {
        ...payment.metadata,
        resultDesc: ResultDesc,
        callbackMetadata,
        mpesaReceiptNumber:
          callbackMetadata.MpesaReceiptNumber || callbackMetadata.TransactionID,
        transactionDate: callbackMetadata.TransactionDate,
        phoneNumber: callbackMetadata.PhoneNumber,
      };
      await payment.save();

      // Update order
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.status = 'processing';
      order.paymentDetails = {
        transactionId: callbackMetadata.MpesaReceiptNumber || MerchantRequestID,
        method: payment.method,
        timestamp: new Date(),
        mpesaReceiptNumber: callbackMetadata.MpesaReceiptNumber,
        phoneNumber: callbackMetadata.PhoneNumber,
      };
      await order.save();

      // Send success notification
      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Successful',
        message: `Your M-Pesa payment of ${payment.amount} KES for Order #${
          order.orderNumber
        } was successful. Receipt: ${
          callbackMetadata.MpesaReceiptNumber || 'N/A'
        }`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      // Send email notification
      await sendPaymentSuccessEmail(user.email, order);

      logger.info('M-Pesa payment successful', {
        paymentId: payment._id,
        orderId: order._id,
        mpesaReceiptNumber: callbackMetadata.MpesaReceiptNumber,
      });
    } else {
      // Payment failed
      payment.status = PAYMENT_STATUS.FAILED;
      payment.error = {
        code: ResultCode.toString(),
        message: ResultDesc,
        details: callbackMetadata,
      };
      await payment.save();

      // Send failure notification
      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your M-Pesa payment for Order #${order.orderNumber} failed: ${ResultDesc}`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      // Send email notification
      await sendPaymentFailedEmail(user.email, order);

      logger.warn('M-Pesa payment failed', {
        paymentId: payment._id,
        orderId: order._id,
        error: ResultDesc,
        code: ResultCode,
      });
    }

    // Acknowledge receipt of webhook
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error processing M-Pesa webhook', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Handle Paystack webhook
export const handlePaystackWebhook = handleAsync(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const payload = req.body;

  logger.info('Received Paystack webhook', {
    event: payload.event,
  });

  // Verify webhook signature
  if (!verifyPaystackSignature(payload, signature)) {
    logger.warn('Invalid Paystack webhook signature');
    return res
      .status(400)
      .json({ success: false, message: 'Invalid signature' });
  }

  try {
    // Only process charge.success events
    if (payload.event !== 'charge.success') {
      return res.status(200).json({ success: true, message: 'Event ignored' });
    }

    const { data } = payload;
    const { reference, status, amount } = data;

    // Find the payment by the reference
    const payment = await Payment.findOne({
      'metadata.paystackReference': reference,
    });

    if (!payment) {
      logger.warn('Payment not found for Paystack webhook', {
        reference,
      });
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' });
    }

    // Get the order and user
    const order = await Order.findById(payment.orderId);
    const user = await User.findById(payment.userId);

    if (!order || !user) {
      logger.warn('Order or user not found for Paystack webhook', {
        orderId: payment.orderId,
        userId: payment.userId,
      });
      return res
        .status(404)
        .json({ success: false, message: 'Order or user not found' });
    }

    // Process the payment result
    if (status === 'success') {
      // Payment successful
      payment.status = PAYMENT_STATUS.PAID;
      payment.metadata.paystackData = data;
      await payment.save();

      // Update order
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.status = 'processing';
      order.paymentDetails = {
        transactionId: reference,
        method: payment.method,
        timestamp: new Date(),
      };
      await order.save();

      // Send success notification
      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Successful',
        message: `Your payment of ${amount / 100} for Order #${
          order.orderNumber
        } was successful`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      // Send email notification
      await sendPaymentSuccessEmail(user.email, order);

      logger.info('Paystack payment successful', {
        paymentId: payment._id,
        orderId: order._id,
      });
    } else {
      // Payment failed
      payment.status = PAYMENT_STATUS.FAILED;
      payment.error = {
        code: 'PAYSTACK_FAILURE',
        message: 'Payment failed',
        details: data,
      };
      await payment.save();

      // Send failure notification
      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your payment for Order #${order.orderNumber} failed`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      // Send email notification
      await sendPaymentFailedEmail(user.email, order);

      logger.warn('Paystack payment failed', {
        paymentId: payment._id,
        orderId: order._id,
      });
    }

    // Acknowledge receipt of webhook
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error processing Paystack webhook', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Handle PayPal webhook
export const handlePaypalWebhook = handleAsync(async (req, res) => {
  const webhookId = req.headers['paypal-auth-algo'];
  const payload = req.body;

  logger.info('Received PayPal webhook', {
    event_type: payload.event_type,
  });

  // Verify webhook signature
  if (!verifyPaypalSignature(payload, webhookId)) {
    logger.warn('Invalid PayPal webhook signature');
    return res
      .status(400)
      .json({ success: false, message: 'Invalid signature' });
  }

  try {
    // Only process PAYMENT.CAPTURE.COMPLETED events
    if (payload.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return res.status(200).json({ success: true, message: 'Event ignored' });
    }

    const { resource } = payload;
    const { id, status, custom_id } = resource;

    // Find the payment by the PayPal order ID
    const payment = await Payment.findOne({
      'metadata.paypalOrderId': custom_id,
    });

    if (!payment) {
      logger.warn('Payment not found for PayPal webhook', {
        custom_id,
      });
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' });
    }

    // Get the order and user
    const order = await Order.findById(payment.orderId);
    const user = await User.findById(payment.userId);

    if (!order || !user) {
      logger.warn('Order or user not found for PayPal webhook', {
        orderId: payment.orderId,
        userId: payment.userId,
      });
      return res
        .status(404)
        .json({ success: false, message: 'Order or user not found' });
    }

    // Process the payment result
    if (status === 'COMPLETED') {
      // Payment successful
      payment.status = PAYMENT_STATUS.PAID;
      payment.metadata.paypalData = resource;
      await payment.save();

      // Update order
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.status = 'processing';
      order.paymentDetails = {
        transactionId: id,
        method: payment.method,
        timestamp: new Date(),
      };
      await order.save();

      // Send success notification
      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Successful',
        message: `Your payment for Order #${order.orderNumber} was successful`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      // Send email notification
      await sendPaymentSuccessEmail(user.email, order);

      logger.info('PayPal payment successful', {
        paymentId: payment._id,
        orderId: order._id,
      });
    } else {
      // Payment failed
      payment.status = PAYMENT_STATUS.FAILED;
      payment.error = {
        code: 'PAYPAL_FAILURE',
        message: 'Payment failed',
        details: resource,
      };
      await payment.save();

      // Send failure notification
      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your payment for Order #${order.orderNumber} failed`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      // Send email notification
      await sendPaymentFailedEmail(user.email, order);

      logger.warn('PayPal payment failed', {
        paymentId: payment._id,
        orderId: order._id,
      });
    }

    // Acknowledge receipt of webhook
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error processing PayPal webhook', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Verify payment status manually
export const verifyPaymentStatus = handleAsync(async (req, res) => {
  const { paymentId } = req.params;

  logger.info(`Manually verifying payment status for payment ${paymentId}`, {
    userId: req.user._id,
  });

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw createError(404, 'Payment not found');
  }

  // Check if user is authorized to verify this payment
  if (
    payment.userId.toString() !== req.user._id.toString() &&
    !['admin', 'super_admin'].includes(req.user.role)
  ) {
    throw createError(403, 'Not authorized to verify this payment');
  }

  // Get the order
  const order = await Order.findById(payment.orderId);

  if (!order) {
    throw createError(404, 'Order not found');
  }

  // Check if payment is already processed
  if (payment.status !== PAYMENT_STATUS.PENDING) {
    return res.json({
      success: true,
      data: {
        payment,
        order,
      },
    });
  }

  // Verify payment based on the payment method
  const verificationResult = {
    success: false,
    message: 'Verification not implemented for this payment method',
  };

  try {
    switch (payment.method) {
      case 'mpesa':
        // Implement M-Pesa verification logic
        // This would typically involve calling the M-Pesa API to check the status
        break;
      case 'paystack':
        // Implement Paystack verification logic
        // This would typically involve calling the Paystack API to check the status
        break;
      case 'paypal':
        // Implement PayPal verification logic
        // This would typically involve calling the PayPal API to check the status
        break;
      default:
        throw createError(400, 'Unsupported payment method');
    }

    res.json({
      success: true,
      data: {
        payment,
        order,
        verification: verificationResult,
      },
    });
  } catch (error) {
    logger.error(`Error verifying payment status for payment ${paymentId}`, {
      error: error.message,
    });
    throw error;
  }
});
