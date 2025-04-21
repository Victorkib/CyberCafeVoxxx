import { handleAsync } from '../utils/errorHandler.js';
import { createPaymentNotification } from '../utils/notificationHelper.js';
import { PAYMENT_STATUS, PAYMENT_PRIORITY } from '../constants/payment.js';
import Payment from '../models/payment.model.js';
import Order from '../models/order.model.js';
import { verifyPaystackSignature, verifyPaypalSignature } from '../utils/payment.js';

/**
 * Handle M-Pesa webhook
 */
export const handleMpesaWebhook = handleAsync(async (req, res) => {
  const { Body } = req.body;
  const { stkCallback } = Body;

  if (!stkCallback) {
    return res.status(400).json({ success: false, error: 'Invalid webhook payload' });
  }

  const { ResultCode, ResultDesc, CheckoutRequestID } = stkCallback;
  const payment = await Payment.findOne({ 'metadata.checkoutRequestId': CheckoutRequestID });

  if (!payment) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }

  if (ResultCode === 0) {
    // Payment successful
    payment.status = PAYMENT_STATUS.PAID;
    payment.metadata = {
      ...payment.metadata,
      mpesaReceiptNumber: stkCallback.CallbackMetadata?.Item?.find(item => item.Name === 'MpesaReceiptNumber')?.Value,
      phoneNumber: stkCallback.CallbackMetadata?.Item?.find(item => item.Name === 'PhoneNumber')?.Value
    };

    // Update order status
    const order = await Order.findById(payment.orderId);
    order.paymentStatus = PAYMENT_STATUS.PAID;
    await order.save();

    // Create success notification
    await createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Successful',
      message: `Your M-Pesa payment of ${payment.amount} KES was successful`,
      link: `/orders/${order._id}`,
      priority: PAYMENT_PRIORITY.HIGH
    });
  } else {
    // Payment failed
    payment.status = PAYMENT_STATUS.FAILED;
    payment.error = {
      code: 'mpesa_error',
      message: ResultDesc
    };

    // Create failure notification
    await createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Failed',
      message: `Your M-Pesa payment failed: ${ResultDesc}`,
      link: `/orders/${payment.orderId}`,
      priority: PAYMENT_PRIORITY.HIGH
    });
  }

  await payment.save();
  res.json({ success: true });
});

/**
 * Handle Paystack webhook
 */
export const handlePaystackWebhook = handleAsync(async (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-paystack-signature'];
  if (!verifyPaystackSignature(req.body, signature)) {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }

  const { event, data } = req.body;
  const payment = await Payment.findOne({ 'metadata.paystackReference': data.reference });

  if (!payment) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }

  if (event === 'charge.success') {
    // Payment successful
    payment.status = PAYMENT_STATUS.PAID;
    payment.metadata = {
      ...payment.metadata,
      paystackReference: data.reference,
      paystackId: data.id
    };

    // Update order status
    const order = await Order.findById(payment.orderId);
    order.paymentStatus = PAYMENT_STATUS.PAID;
    await order.save();

    // Create success notification
    await createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Successful',
      message: `Your Paystack payment of ${payment.amount} KES was successful`,
      link: `/orders/${order._id}`,
      priority: PAYMENT_PRIORITY.HIGH
    });
  } else if (event === 'charge.failed') {
    // Payment failed
    payment.status = PAYMENT_STATUS.FAILED;
    payment.error = {
      code: 'paystack_error',
      message: data.message
    };

    // Create failure notification
    await createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Failed',
      message: `Your Paystack payment failed: ${data.message}`,
      link: `/orders/${payment.orderId}`,
      priority: PAYMENT_PRIORITY.HIGH
    });
  }

  await payment.save();
  res.json({ success: true });
});

/**
 * Handle PayPal webhook
 */
export const handlePaypalWebhook = handleAsync(async (req, res) => {
  // Verify webhook signature
  const signature = req.headers['paypal-transmission-sig'];
  if (!verifyPaypalSignature(req.body, signature)) {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }

  const { event_type, resource } = req.body;
  const payment = await Payment.findOne({ 'metadata.paypalOrderId': resource.id });

  if (!payment) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }

  if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    // Payment successful
    payment.status = PAYMENT_STATUS.PAID;
    payment.metadata = {
      ...payment.metadata,
      paypalOrderId: resource.id,
      paypalCaptureId: resource.purchase_units[0].payments.captures[0].id
    };

    // Update order status
    const order = await Order.findById(payment.orderId);
    order.paymentStatus = PAYMENT_STATUS.PAID;
    await order.save();

    // Create success notification
    await createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Successful',
      message: `Your PayPal payment of ${payment.amount} KES was successful`,
      link: `/orders/${order._id}`,
      priority: PAYMENT_PRIORITY.HIGH
    });
  } else if (event_type === 'PAYMENT.CAPTURE.DENIED') {
    // Payment failed
    payment.status = PAYMENT_STATUS.FAILED;
    payment.error = {
      code: 'paypal_error',
      message: resource.status_details?.reason || 'Payment denied'
    };

    // Create failure notification
    await createPaymentNotification({
      userId: payment.userId,
      title: 'Payment Failed',
      message: `Your PayPal payment failed: ${payment.error.message}`,
      link: `/orders/${payment.orderId}`,
      priority: PAYMENT_PRIORITY.HIGH
    });
  }

  await payment.save();
  res.json({ success: true });
}); 