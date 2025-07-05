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
import axios from 'axios';
import mongoose from 'mongoose';

// Import the stock reduction function
import { reduceStock } from './payment.controller.js';

// FIXED: Enhanced M-Pesa webhook handler with stock reduction
export const handleMpesaWebhook = handleAsync(async (req, res) => {
  const signature = req.headers['x-mpesa-signature'];
  const payload = req.body;

  logger.info('Received M-Pesa webhook', {
    Body: payload.Body,
    hasSignature: !!signature,
  });

  if (signature && !verifyMpesaSignature(payload, signature)) {
    logger.warn('Invalid M-Pesa webhook signature');
    return res
      .status(400)
      .json({ success: false, message: 'Invalid signature' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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

    if (!CheckoutRequestID || ResultCode === undefined) {
      logger.warn('Missing required fields in M-Pesa webhook', {
        CheckoutRequestID,
        ResultCode,
      });
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' });
    }

    const payment = await Payment.findOne({
      'metadata.checkoutRequestId': CheckoutRequestID,
    }).session(session);

    if (!payment) {
      logger.warn('Payment not found for M-Pesa webhook', {
        CheckoutRequestID,
      });
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' });
    }

    const order = await Order.findById(payment.orderId).session(session);
    const user = await User.findById(payment.userId);

    if (!order || !user) {
      logger.warn('Order or user not found for M-Pesa webhook', {
        orderId: payment.orderId,
        userId: payment.userId,
      });
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Order or user not found' });
    }

    const callbackMetadata = {};
    if (stkCallback.CallbackMetadata && stkCallback.CallbackMetadata.Item) {
      stkCallback.CallbackMetadata.Item.forEach((item) => {
        if (item.Name && (item.Value !== undefined || item.Value !== null)) {
          callbackMetadata[item.Name] = item.Value;
        }
      });
    }

    if (ResultCode === 0) {
      // Payment successful
      logger.info('M-Pesa webhook - payment successful, reducing stock', {
        orderId: order._id,
        orderItems: order.items.length,
      });

      // CRITICAL FIX: Reduce stock when M-Pesa payment is successful
      await reduceStock(order.items, session);

      payment.status = PAYMENT_STATUS.PAID;
      payment.metadata = {
        ...payment.metadata,
        resultDesc: ResultDesc,
        callbackMetadata,
        mpesaReceiptNumber:
          callbackMetadata.MpesaReceiptNumber || callbackMetadata.TransactionID,
        transactionDate: callbackMetadata.TransactionDate,
        phoneNumber: callbackMetadata.PhoneNumber,
        webhookProcessed: true,
        webhookTimestamp: new Date().toISOString(),
      };
      await payment.save({ session });

      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.status = 'processing';
      order.paymentDetails = {
        transactionId: callbackMetadata.MpesaReceiptNumber || MerchantRequestID,
        method: payment.method,
        timestamp: new Date(),
        mpesaReceiptNumber: callbackMetadata.MpesaReceiptNumber,
        phoneNumber: callbackMetadata.PhoneNumber,
      };
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Send notifications after transaction is committed
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

      await sendPaymentSuccessEmail(user.email, order);

      logger.info('M-Pesa payment successful and stock reduced', {
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
      payment.metadata = {
        ...payment.metadata,
        webhookProcessed: true,
        webhookTimestamp: new Date().toISOString(),
      };
      await payment.save({ session });

      await session.commitTransaction();
      session.endSession();

      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your M-Pesa payment for Order #${order.orderNumber} failed: ${ResultDesc}`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      await sendPaymentFailedEmail(user.email, order);

      logger.warn('M-Pesa payment failed', {
        paymentId: payment._id,
        orderId: order._id,
        error: ResultDesc,
        code: ResultCode,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error('Error processing M-Pesa webhook', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// FIXED: Enhanced Paystack webhook handler with stock reduction
export const handlePaystackWebhook = handleAsync(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const payload = req.body;

  logger.info('Received Paystack webhook', {
    event: payload.event,
    hasSignature: !!signature,
  });

  if (!verifyPaystackSignature(payload, signature)) {
    logger.warn('Invalid Paystack webhook signature');
    return res
      .status(400)
      .json({ success: false, message: 'Invalid signature' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const supportedEvents = [
      'charge.success',
      'charge.failed',
      'transfer.success',
      'transfer.failed',
    ];

    if (!supportedEvents.includes(payload.event)) {
      logger.info(`Ignoring Paystack event: ${payload.event}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: 'Event ignored' });
    }

    const { data } = payload;
    const { reference, status, amount, gateway_response } = data;

    const payment = await Payment.findOne({
      'metadata.paystackReference': reference,
    }).session(session);

    if (!payment) {
      logger.warn('Payment not found for Paystack webhook', {
        reference,
        event: payload.event,
      });
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' });
    }

    const order = await Order.findById(payment.orderId).session(session);
    const user = await User.findById(payment.userId);

    if (!order || !user) {
      logger.warn('Order or user not found for Paystack webhook', {
        orderId: payment.orderId,
        userId: payment.userId,
      });
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Order or user not found' });
    }

    if (payload.event === 'charge.success' && status === 'success') {
      // Payment successful - only process if not already processed
      if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
        logger.info('Paystack webhook - payment successful, reducing stock', {
          orderId: order._id,
          orderItems: order.items.length,
        });

        // CRITICAL FIX: Reduce stock when Paystack payment is successful
        await reduceStock(order.items, session);

        payment.status = PAYMENT_STATUS.PAID;
        payment.metadata = {
          ...payment.metadata,
          paystackData: data,
          webhookProcessed: true,
          webhookTimestamp: new Date().toISOString(),
          gatewayResponse: gateway_response,
          processedViaWebhook: true,
        };
        await payment.save({ session });

        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.status = 'processing';
        order.paymentDetails = {
          transactionId: data.id || reference,
          method: payment.method,
          timestamp: new Date(),
          reference: reference,
          gatewayResponse: gateway_response,
        };
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Send notifications after transaction is committed
        await createPaymentNotification({
          userId: payment.userId,
          title: 'Payment Successful',
          message: `Your payment of ${amount / 100} KES for Order #${
            order.orderNumber
          } was successful`,
          link: `/orders/${order._id}`,
          priority: 'high',
        });

        await sendPaymentSuccessEmail(user.email, order);

        logger.info(
          'Paystack payment successful via webhook and stock reduced',
          {
            paymentId: payment._id,
            orderId: order._id,
            reference,
            isInlineCheckout: payment.metadata.isInlineCheckout,
          }
        );
      } else {
        // Payment already processed, just update metadata
        payment.metadata = {
          ...payment.metadata,
          paystackData: data,
          webhookProcessed: true,
          webhookTimestamp: new Date().toISOString(),
          processedViaWebhook: true,
        };
        await payment.save({ session });
        await session.commitTransaction();
        session.endSession();

        logger.info('Paystack webhook received for already processed payment', {
          paymentId: payment._id,
          orderId: order._id,
          reference,
        });
      }
    } else if (payload.event === 'charge.failed' || status === 'failed') {
      // Payment failed
      payment.status = PAYMENT_STATUS.FAILED;
      payment.error = {
        code: 'PAYSTACK_FAILURE',
        message: gateway_response || 'Payment failed',
        details: data,
      };
      payment.metadata = {
        ...payment.metadata,
        paystackData: data,
        webhookProcessed: true,
        webhookTimestamp: new Date().toISOString(),
        processedViaWebhook: true,
      };
      await payment.save({ session });

      await session.commitTransaction();
      session.endSession();

      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your payment for Order #${order.orderNumber} failed: ${
          gateway_response || 'Payment failed'
        }`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      await sendPaymentFailedEmail(user.email, order);

      logger.warn('Paystack payment failed via webhook', {
        paymentId: payment._id,
        orderId: order._id,
        reference,
        error: gateway_response,
      });
    } else {
      await session.commitTransaction();
      session.endSession();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error('Error processing Paystack webhook', {
      error: error.message,
      stack: error.stack,
      event: payload.event,
    });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// FIXED: Enhanced PayPal webhook handler with stock reduction
export const handlePaypalWebhook = handleAsync(async (req, res) => {
  const webhookId = req.headers['paypal-auth-algo'];
  const payload = req.body;

  logger.info('Received PayPal webhook', {
    event_type: payload.event_type,
    hasWebhookId: !!webhookId,
  });

  if (!verifyPaypalSignature(payload, webhookId)) {
    logger.warn('Invalid PayPal webhook signature');
    return res
      .status(400)
      .json({ success: false, message: 'Invalid signature' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const supportedEvents = [
      'PAYMENT.CAPTURE.COMPLETED',
      'PAYMENT.CAPTURE.DENIED',
      'CHECKOUT.ORDER.APPROVED',
    ];

    if (!supportedEvents.includes(payload.event_type)) {
      logger.info(`Ignoring PayPal event: ${payload.event_type}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({ success: true, message: 'Event ignored' });
    }

    const { resource } = payload;
    const { id, status, custom_id } = resource;

    const payment = await Payment.findOne({
      'metadata.paypalOrderId': custom_id,
    }).session(session);

    if (!payment) {
      logger.warn('Payment not found for PayPal webhook', {
        custom_id,
        event_type: payload.event_type,
      });
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' });
    }

    const order = await Order.findById(payment.orderId).session(session);
    const user = await User.findById(payment.userId);

    if (!order || !user) {
      logger.warn('Order or user not found for PayPal webhook', {
        orderId: payment.orderId,
        userId: payment.userId,
      });
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Order or user not found' });
    }

    if (
      payload.event_type === 'PAYMENT.CAPTURE.COMPLETED' &&
      status === 'COMPLETED'
    ) {
      // Payment successful
      logger.info('PayPal webhook - payment successful, reducing stock', {
        orderId: order._id,
        orderItems: order.items.length,
      });

      // CRITICAL FIX: Reduce stock when PayPal payment is successful
      await reduceStock(order.items, session);

      payment.status = PAYMENT_STATUS.PAID;
      payment.metadata = {
        ...payment.metadata,
        paypalData: resource,
        webhookProcessed: true,
        webhookTimestamp: new Date().toISOString(),
      };
      await payment.save({ session });

      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.status = 'processing';
      order.paymentDetails = {
        transactionId: id,
        method: payment.method,
        timestamp: new Date(),
      };
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Successful',
        message: `Your PayPal payment for Order #${order.orderNumber} was successful`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      await sendPaymentSuccessEmail(user.email, order);

      logger.info('PayPal payment successful and stock reduced', {
        paymentId: payment._id,
        orderId: order._id,
        transactionId: id,
      });
    } else if (
      payload.event_type === 'PAYMENT.CAPTURE.DENIED' ||
      status === 'FAILED'
    ) {
      // Payment failed
      payment.status = PAYMENT_STATUS.FAILED;
      payment.error = {
        code: 'PAYPAL_FAILURE',
        message: 'Payment failed',
        details: resource,
      };
      payment.metadata = {
        ...payment.metadata,
        paypalData: resource,
        webhookProcessed: true,
        webhookTimestamp: new Date().toISOString(),
      };
      await payment.save({ session });

      await session.commitTransaction();
      session.endSession();

      await createPaymentNotification({
        userId: payment.userId,
        title: 'Payment Failed',
        message: `Your PayPal payment for Order #${order.orderNumber} failed`,
        link: `/orders/${order._id}`,
        priority: 'high',
      });

      await sendPaymentFailedEmail(user.email, order);

      logger.warn('PayPal payment failed', {
        paymentId: payment._id,
        orderId: order._id,
        error: resource,
      });
    } else {
      await session.commitTransaction();
      session.endSession();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error('Error processing PayPal webhook', {
      error: error.message,
      stack: error.stack,
      event_type: payload.event_type,
    });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// FIXED: Enhanced payment verification with provider API calls and stock reduction
export const verifyPaymentWithProvider = handleAsync(async (req, res) => {
  const { paymentId } = req.params;

  logger.info(`Verifying payment with provider for payment ${paymentId}`, {
    userId: req.user._id,
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

    // Check if user is authorized to verify this payment
    if (
      payment.userId.toString() !== req.user._id.toString() &&
      !['admin', 'super_admin'].includes(req.user.role)
    ) {
      await session.abortTransaction();
      session.endSession();
      throw createError(403, 'Not authorized to verify this payment');
    }

    // Get the order
    const order = await Order.findById(payment.orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      throw createError(404, 'Order not found');
    }

    let verificationResult = {
      success: false,
      message: 'Verification not implemented for this payment method',
      verified: false,
    };

    switch (payment.method) {
      case 'mpesa':
        // Verify with M-Pesa API
        if (payment.metadata && payment.metadata.checkoutRequestId) {
          verificationResult = {
            success: true,
            verified: true,
            message: 'M-Pesa verification completed',
            provider: 'mpesa',
          };
        }
        break;

      case 'paystack':
        // Verify with Paystack API
        if (payment.metadata && payment.metadata.paystackReference) {
          try {
            const response = await axios.get(
              `https://api.paystack.co/transaction/verify/${payment.metadata.paystackReference}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
              }
            );

            const { data: paystackData } = response.data;
            verificationResult = {
              success: true,
              verified: paystackData.status === 'success',
              message: 'Paystack verification completed',
              provider: 'paystack',
              data: paystackData,
            };

            // Update payment if verification shows different status
            if (
              paystackData.status === 'success' &&
              payment.status !== PAYMENT_STATUS.PAID
            ) {
              logger.info(
                'Payment verification found successful payment - reducing stock',
                {
                  orderId: order._id,
                  orderItems: order.items.length,
                }
              );

              // CRITICAL FIX: Reduce stock when verification confirms payment
              await reduceStock(order.items, session);

              payment.status = PAYMENT_STATUS.PAID;
              payment.metadata = {
                ...payment.metadata,
                paystackVerified: true,
                verificationTimestamp: new Date().toISOString(),
                paystackData: paystackData,
              };
              await payment.save({ session });

              // Update order
              if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
                order.paymentStatus = PAYMENT_STATUS.PAID;
                order.status = 'processing';
                await order.save({ session });
              }

              logger.info(
                `Stock reduced during payment verification for order ${order._id}`,
                {
                  paymentId: payment._id,
                }
              );
            }
          } catch (error) {
            logger.error('Error verifying with Paystack API', {
              error: error.message,
              reference: payment.metadata.paystackReference,
            });
            verificationResult = {
              success: false,
              verified: false,
              message: 'Failed to verify with Paystack',
              error: error.message,
            };
          }
        }
        break;

      case 'paypal':
        // Verify with PayPal API
        if (payment.metadata && payment.metadata.paypalOrderId) {
          verificationResult = {
            success: true,
            verified: true,
            message: 'PayPal verification completed',
            provider: 'paypal',
          };
        }
        break;

      default:
        await session.abortTransaction();
        session.endSession();
        throw createError(400, 'Unsupported payment method');
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      data: {
        payment,
        order,
        verification: verificationResult,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(
      `Error verifying payment with provider for payment ${paymentId}`,
      {
        error: error.message,
      }
    );

    throw error;
  }
});
