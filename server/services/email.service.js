import nodemailer from 'nodemailer';
import { handleAsync } from '../utils/errorHandler.js';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const templates = {
  paymentSuccess: (order) => ({
    subject: `Payment Successful - Order #${order._id}`,
    html: `
      <h1>Payment Successful</h1>
      <p>Your payment for order #${order._id} has been processed successfully.</p>
      <p>Amount: $${order.totalPrice}</p>
      <p>Payment Method: ${order.paymentMethod}</p>
      <p>Thank you for your purchase!</p>
    `,
  }),
  paymentFailed: (order) => ({
    subject: `Payment Failed - Order #${order._id}`,
    html: `
      <h1>Payment Failed</h1>
      <p>We were unable to process your payment for order #${order._id}.</p>
      <p>Amount: $${order.totalPrice}</p>
      <p>Payment Method: ${order.paymentMethod}</p>
      <p>Please try again or contact support if the problem persists.</p>
    `,
  }),
  orderConfirmation: (order) => ({
    subject: `Order Confirmation - #${order._id}`,
    html: `
      <h1>Order Confirmation</h1>
      <p>Your order #${order._id} has been confirmed.</p>
      <p>Items:</p>
      <ul>
        ${order.items.map(item => `
          <li>${item.name} x ${item.quantity} - $${item.price}</li>
        `).join('')}
      </ul>
      <p>Total: $${order.totalPrice}</p>
      <p>Shipping Address:</p>
      <p>${order.shippingAddress.street}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
      ${order.shippingAddress.country}</p>
    `,
  }),
  orderStatusUpdate: (order) => ({
    subject: `Order Status Update - #${order._id}`,
    html: `
      <h1>Order Status Update</h1>
      <p>Your order #${order._id} status has been updated to: ${order.status}</p>
      <p>Track your order here: <a href="${process.env.CLIENT_URL}/orders/${order._id}">Track Order</a></p>
    `,
  }),
};

// Send email function
export const sendEmail = handleAsync(async (to, template, data) => {
  const { subject, html } = templates[template](data);
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
});

// Payment notification emails
export const sendPaymentSuccessEmail = (order) => {
  return sendEmail(order.user.email, 'paymentSuccess', order);
};

export const sendPaymentFailedEmail = (order) => {
  return sendEmail(order.user.email, 'paymentFailed', order);
};

// Order notification emails
export const sendOrderConfirmationEmail = (order) => {
  return sendEmail(order.user.email, 'orderConfirmation', order);
};

export const sendOrderStatusUpdateEmail = (order) => {
  return sendEmail(order.user.email, 'orderStatusUpdate', order);
};

// Admin notification emails
export const sendAdminOrderNotification = async (order) => {
  const adminEmails = process.env.ADMIN_EMAILS.split(',');
  const promises = adminEmails.map(email => 
    sendEmail(email, 'orderConfirmation', order)
  );
  return Promise.all(promises);
};

// Payment settings update notification
export const sendPaymentSettingsUpdateEmail = async (settings) => {
  const adminEmails = process.env.ADMIN_EMAILS.split(',');
  const template = {
    subject: 'Payment Settings Updated',
    html: `
      <h1>Payment Settings Updated</h1>
      <p>The payment settings have been updated with the following changes:</p>
      <ul>
        ${Object.entries(settings).map(([key, value]) => `
          <li><strong>${key}:</strong> ${value}</li>
        `).join('')}
      </ul>
      <p>Please review these changes to ensure they are correct.</p>
    `
  };
  
  const promises = adminEmails.map(email => 
    transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: template.subject,
      html: template.html
    })
  );
  
  return Promise.all(promises);
};

// Refund notification
export const sendRefundNotification = async (email, payment) => {
  const template = {
    subject: `Refund Processed - Payment #${payment._id}`,
    html: `
      <h1>Refund Processed</h1>
      <p>Your refund for payment #${payment._id} has been processed.</p>
      <p>Amount: $${payment.amount}</p>
      <p>Payment Method: ${payment.method}</p>
      <p>Refund Date: ${new Date().toLocaleDateString()}</p>
      <p>Thank you for your patience!</p>
    `
  };
  
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: template.subject,
    html: template.html
  });
}; 