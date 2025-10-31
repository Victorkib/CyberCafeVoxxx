import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import Mailjet from 'node-mailjet';

dotenv.config();

// Configurable email providers
const emailProviders = {
  mailjet: {
    isConfigured: () =>
      !!process.env.MAILJET_API_KEY && !!process.env.MAILJET_SECRET_KEY,
    createTransport: () => {
      try {
        const mailjet = Mailjet.apiConnect(
          process.env.MAILJET_API_KEY,
          process.env.MAILJET_SECRET_KEY
        );
        return {
          sendMail: async (options) => {
            const result = await mailjet
              .post('send', { version: 'v3.1' })
              .request({
                Messages: [
                  {
                    From: {
                      Email:
                        options.from.split('<')[1]?.replace('>', '') ||
                        process.env.MAILJET_FROM_EMAIL ||
                        process.env.EMAIL_FROM ||
                        'noreply@example.com',
                      Name:
                        options.from.split('<')[0]?.trim() ||
                        process.env.MAILJET_FROM_NAME ||
                        process.env.EMAIL_FROM_NAME ||
                        'E-commerce Store',
                    },
                    To: [
                      {
                        Email: options.to,
                        Name: options.to.split('@')[0],
                      },
                    ],
                    Subject: options.subject,
                    HTMLPart: options.html,
                  },
                ],
              });
            return { messageId: result.body.Messages[0].To[0].MessageID };
          },
        };
      } catch (error) {
        logger.error('Failed to initialize Mailjet:', error);
        return null;
      }
    },
  },
  nodemailer: {
    isConfigured: () => !!process.env.EMAIL_HOST && !!process.env.EMAIL_USER,
    createTransport: () => {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    },
  },
};

// Get a working email provider and its transporter
const getWorkingEmailProvider = async () => {
  // Try providers in order of preference
  const providerNames = ['mailjet', 'nodemailer'];

  for (const providerName of providerNames) {
    const provider = emailProviders[providerName];
    if (provider && provider.isConfigured()) {
      try {
        const transporter = provider.createTransport();
        // Test the connection if possible
        if (transporter && typeof transporter.verify === 'function') {
          await transporter.verify();
        }
        logger.info(`Using ${providerName} as email provider`);
        return { name: providerName, transporter };
      } catch (error) {
        logger.warn(`Failed to initialize ${providerName}:`, error.message);
      }
    }
  }

  // If in development, create ethereal test account as fallback
  if (process.env.NODE_ENV === 'development') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      logger.info('Created ethereal test account for emails');

      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      return { name: 'ethereal', transporter, testAccount };
    } catch (error) {
      logger.error('Failed to create ethereal account:', error.message);
    }
  }

  logger.error('No email provider available');
  return null;
};

// Cache the provider to avoid repeated initialization
let cachedProvider = null;

// Send email helper with provider fallback
const sendEmail = async (options) => {
  try {
    // Get or initialize provider
    if (!cachedProvider) {
      cachedProvider = await getWorkingEmailProvider();
    }

    if (!cachedProvider) {
      logger.error('No email provider available, skipping email send');
      return { skipped: true };
    }

    const { name, transporter, testAccount } = cachedProvider;

    const mailOptions = {
      from: `"${
        process.env.EMAIL_FROM_NAME ||
        process.env.MAILJET_FROM_NAME ||
        'E-commerce Store'
      }" <${
        process.env.EMAIL_FROM ||
        process.env.MAILJET_FROM_EMAIL ||
        'noreply@example.com'
      }>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully using ${name}`, {
      messageId: info.messageId,
      to: options.to,
    });

    // If using ethereal, log preview URL
    if (name === 'ethereal' && testAccount) {
      logger.info('Email preview URL', {
        previewUrl: nodemailer.getTestMessageUrl(info),
      });
    }

    return info;
  } catch (error) {
    // If sending fails, try to get a new provider
    cachedProvider = null;

    logger.error('Error sending email', {
      error: error.message,
      to: options.to,
      subject: options.subject,
    });

    throw error;
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (email, order) => {
  try {
    await sendEmail({
      to: email,
      subject: `Order Confirmation #${order.orderNumber}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order #${order.orderNumber} has been confirmed and is being processed.</p>
        <h2>Order Details</h2>
        <p>Total Amount: ${order.totalAmount}</p>
        <p>Payment Method: ${order.paymentMethod}</p>
        <p>Status: ${order.status}</p>
        <p>You can track your order status <a href="${process.env.FRONTEND_URL}/orders/${order._id}">here</a>.</p>
      `,
    });

    logger.info(`Order confirmation email sent to ${email}`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.error(`Error sending order confirmation email to ${email}`, {
      error: error.message,
      orderId: order._id,
    });
  }
};

// Send order shipped email
export const sendOrderShippedEmail = async (email, order, trackingNumber) => {
  try {
    await sendEmail({
      to: email,
      subject: `Your Order #${order.orderNumber} Has Been Shipped`,
      html: `
        <h1>Your Order Has Been Shipped!</h1>
        <p>Your order #${order.orderNumber} has been shipped and is on its way to you.</p>
        <h2>Tracking Information</h2>
        <p>Tracking Number: ${trackingNumber}</p>
        <p>You can track your shipment <a href="${process.env.FRONTEND_URL}/orders/${order._id}">here</a>.</p>
      `,
    });

    logger.info(`Order shipped email sent to ${email}`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      trackingNumber,
    });
  } catch (error) {
    logger.error(`Error sending order shipped email to ${email}`, {
      error: error.message,
      orderId: order._id,
    });
  }
};

// Send order delivered email
export const sendOrderDeliveredEmail = async (email, order) => {
  try {
    await sendEmail({
      to: email,
      subject: `Your Order #${order.orderNumber} Has Been Delivered`,
      html: `
        <h1>Your Order Has Been Delivered!</h1>
        <p>Your order #${order.orderNumber} has been delivered.</p>
        <p>We hope you enjoy your purchase!</p>
        <p>Please leave a review <a href="${process.env.FRONTEND_URL}/orders/${order._id}/review">here</a>.</p>
      `,
    });

    logger.info(`Order delivered email sent to ${email}`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.error(`Error sending order delivered email to ${email}`, {
      error: error.message,
      orderId: order._id,
    });
  }
};

// Send order cancelled email
export const sendOrderCancelledEmail = async (email, order) => {
  try {
    await sendEmail({
      to: email,
      subject: `Your Order #${order.orderNumber} Has Been Cancelled`,
      html: `
        <h1>Your Order Has Been Cancelled</h1>
        <p>Your order #${order.orderNumber} has been cancelled.</p>
        <p>If you did not request this cancellation, please contact our customer support.</p>
        <p>You can view your order details <a href="${process.env.FRONTEND_URL}/orders/${order._id}">here</a>.</p>
      `,
    });

    logger.info(`Order cancelled email sent to ${email}`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.error(`Error sending order cancelled email to ${email}`, {
      error: error.message,
      orderId: order._id,
    });
  }
};

// Send payment success email
export const sendPaymentSuccessEmail = async (email, order) => {
  try {
    await sendEmail({
      to: email,
      subject: `Payment Successful for Order #${order.orderNumber}`,
      html: `
        <h1>Payment Successful!</h1>
        <p>Your payment for order #${
          order.orderNumber
        } has been successfully processed.</p>
        <h2>Payment Details</h2>
        <p>Amount: ${order.totalAmount}</p>
        <p>Payment Method: ${order.paymentMethod}</p>
        <p>Transaction ID: ${order.paymentDetails?.transactionId || 'N/A'}</p>
        <p>You can view your order details <a href="${
          process.env.FRONTEND_URL
        }/orders/${order._id}">here</a>.</p>
      `,
    });

    logger.info(`Payment success email sent to ${email}`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.error(`Error sending payment success email to ${email}`, {
      error: error.message,
      orderId: order._id,
    });
  }
};

// Send payment failed email
export const sendPaymentFailedEmail = async (email, order) => {
  try {
    await sendEmail({
      to: email,
      subject: `Payment Failed for Order #${order.orderNumber}`,
      html: `
        <h1>Payment Failed</h1>
        <p>Your payment for order #${order.orderNumber} has failed.</p>
        <p>Please try again or use a different payment method.</p>
        <p>You can retry payment <a href="${process.env.FRONTEND_URL}/orders/${order._id}/pay">here</a>.</p>
      `,
    });

    logger.info(`Payment failed email sent to ${email}`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.error(`Error sending payment failed email to ${email}`, {
      error: error.message,
      orderId: order._id,
    });
  }
};

// Send admin order notification
export const sendAdminOrderNotification = async (order) => {
  try {
    if (!process.env.ADMIN_EMAIL) {
      logger.warn('Admin email not configured, skipping notification');
      return;
    }

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Order #${order.orderNumber}`,
      html: `
        <h1>New Order Received</h1>
        <p>A new order #${order.orderNumber} has been placed.</p>
        <h2>Order Details</h2>
        <p>Customer: ${order.user.name} (${order.user.email})</p>
        <p>Total Amount: ${order.totalAmount}</p>
        <p>Payment Method: ${order.paymentMethod}</p>
        <p>Status: ${order.status}</p>
        <p>You can view the order details <a href="${process.env.ADMIN_URL}/orders/${order._id}">here</a>.</p>
      `,
    });

    logger.info(`Admin order notification email sent`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.error(`Error sending admin order notification email`, {
      error: error.message,
      orderId: order._id,
    });
  }
};

// Send refund notification
export const sendRefundNotification = async (email, order, refundReason) => {
  try {
    await sendEmail({
      to: email,
      subject: `Refund Processed for Order #${order.orderNumber}`,
      html: `
        <h1>Refund Processed</h1>
        <p>Your refund for order #${order.orderNumber} has been processed.</p>
        <h2>Refund Details</h2>
        <p>Amount: ${order.totalAmount}</p>
        <p>Reason: ${refundReason}</p>
        <p>You can view your order details <a href="${process.env.FRONTEND_URL}/orders/${order._id}">here</a>.</p>
      `,
    });

    logger.info(`Refund notification email sent to ${email}`, {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.error(`Error sending refund notification email to ${email}`, {
      error: error.message,
      orderId: order._id,
    });
  }
};

// Send payment settings update email
export const sendPaymentSettingsUpdateEmail = async (settings) => {
  try {
    if (!process.env.ADMIN_EMAIL) {
      logger.warn('Admin email not configured, skipping notification');
      return;
    }

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Payment Settings Updated`,
      html: `
        <h1>Payment Settings Updated</h1>
        <p>The payment settings have been updated.</p>
        <h2>Updated Settings</h2>
        <pre>${JSON.stringify(settings, null, 2)}</pre>
        <p>You can view and manage payment settings <a href="${
          process.env.ADMIN_URL
        }/settings/payment">here</a>.</p>
      `,
    });

    logger.info(`Payment settings update email sent`);
  } catch (error) {
    logger.error(`Error sending payment settings update email`, {
      error: error.message,
    });
  }
};

// Initialize email service on startup
(async () => {
  try {
    cachedProvider = await getWorkingEmailProvider();
    logger.info('Email service initialized with available providers');
  } catch (error) {
    logger.error('Failed to initialize email service', {
      error: error.message,
    });
  }
})();
