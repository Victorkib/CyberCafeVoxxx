import nodemailer from 'nodemailer';
import Mailjet from 'node-mailjet';
import dotenv from 'dotenv';
import { createTransport } from 'nodemailer';

// Load environment variables
dotenv.config();

// Initialize environment variables
const MAILJET_API_KEY = process.env.MAILJET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY;
const MAILJET_FROM_EMAIL =
  process.env.MAILJET_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS;
const MAILJET_FROM_NAME =
  process.env.MAILJET_FROM_NAME ||
  process.env.EMAIL_FROM_NAME ||
  'CyberCafe Shop';

const NODEMAILER_EMAIL = process.env.AUTH_EMAIL || process.env.EMAIL_USERNAME;
const NODEMAILER_PASSWORD =
  process.env.AUTH_PASSWORD || process.env.EMAIL_PASSWORD;
const NODEMAILER_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const NODEMAILER_HOST = process.env.EMAIL_HOST;
const NODEMAILER_PORT = process.env.EMAIL_PORT;

const LOGO_URL = process.env.LOGO_URL || 'https://via.placeholder.com/150';

// Initialize Nodemailer transport
const createNodemailerTransport = () => {
  // If service is specified, use it
  if (NODEMAILER_SERVICE && NODEMAILER_SERVICE !== 'custom') {
    return nodemailer.createTransport({
      service: NODEMAILER_SERVICE,
      secure: false,
      auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Otherwise use custom SMTP settings
  return nodemailer.createTransport({
    host: NODEMAILER_HOST,
    port: NODEMAILER_PORT,
    secure: NODEMAILER_PORT === '465',
    auth: {
      user: NODEMAILER_EMAIL,
      pass: NODEMAILER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Initialize Mailjet client if credentials are available
const getMailjetClient = () => {
  if (MAILJET_API_KEY && MAILJET_SECRET_KEY) {
    return Mailjet.apiConnect(MAILJET_API_KEY, MAILJET_SECRET_KEY);
  }
  return null;
};

// Email templates
const emailTemplates = {
  // Base template with header and footer
  baseTemplate: (content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
       <img src="${LOGO_URL}" alt="CyberCafe Shop" style="max-width: 150px; height: auto;" />
    </div>
    ${content}
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 12px;">
      <p>© ${new Date().getFullYear()} CyberCafe Shop. All rights reserved.</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
`,

  // Welcome email template
  welcome: (name) => `
  <h2 style="color: #333; text-align: center;">Welcome to CyberCafe Shop!</h2>
  <p style="color: #555; font-size: 16px;">Hello ${name},</p>
  <p style="color: #555; font-size: 16px;">
    Thank you for creating an account with CyberCafe Shop. We're excited to have you as a customer!
  </p>
  <p style="color: #555; font-size: 16px;">
    You can now log in to your account to browse our products, place orders, and track your shipments.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Start Shopping
    </a>
  </div>
`,

  // Password reset template
  resetPassword: (resetLink) => `
  <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
  <p style="color: #555; font-size: 16px;">
    We received a request to reset your password. Click the button below to set a new password:
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${resetLink}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Reset Password
    </a>
  </div>
  <p style="color: #555; font-size: 14px;">
    If you did not request a password reset, please ignore this email or contact support if you have concerns.
  </p>
  <p style="color: #555; font-size: 14px;">
    This link will expire in 10 minutes for security reasons.
  </p>
`,

  // Email verification template
  verifyEmail: (verificationLink) => `
  <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
  <p style="color: #555; font-size: 16px;">
    Thank you for registering! Please verify your email address to complete your registration.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${verificationLink}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Verify Email
    </a>
  </div>
  <p style="color: #555; font-size: 14px;">
    If you did not create an account, please ignore this email.
  </p>
`,

  // Account notification template
  accountNotification: (message) => `
  <h2 style="color: #333; text-align: center;">Account Notification</h2>
  <p style="color: #555; font-size: 16px;">
    ${message}
  </p>
`,

  // Order confirmation template
  orderConfirmation: (order) => `
  <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
  <p style="color: #555; font-size: 16px;">Hello ${order.user.name},</p>
  <p style="color: #555; font-size: 16px;">
    Thank you for your order! We've received your order and will begin processing it shortly.
  </p>
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
    <h3 style="color: #0080ff; margin-top: 0;">Order Details:</h3>
    <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
    <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
    <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${order.totalPrice.toFixed(2)}</p>
  </div>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/orders/${order._id}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      View Order Details
    </a>
  </div>
`,

  // Order shipped template
  orderShipped: (order, trackingNumber) => `
  <h2 style="color: #333; text-align: center;">Your Order Has Been Shipped!</h2>
  <p style="color: #555; font-size: 16px;">Hello ${order.user.name},</p>
  <p style="color: #555; font-size: 16px;">
    Great news! Your order has been shipped and is on its way to you.
  </p>
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
    <h3 style="color: #0080ff; margin-top: 0;">Shipping Details:</h3>
    <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
    <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
    <p style="margin: 5px 0;"><strong>Shipping Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
  </div>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/orders/${order._id}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Track Your Order
    </a>
  </div>
`,

  // Order delivered template
  orderDelivered: (order) => `
  <h2 style="color: #333; text-align: center;">Your Order Has Been Delivered!</h2>
  <p style="color: #555; font-size: 16px;">Hello ${order.user.name},</p>
  <p style="color: #555; font-size: 16px;">
    Your order has been successfully delivered. We hope you enjoy your purchase!
  </p>
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
    <h3 style="color: #0080ff; margin-top: 0;">Delivery Details:</h3>
    <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
    <p style="margin: 5px 0;"><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
  </div>
  <p style="color: #555; font-size: 16px;">
    If you're satisfied with your purchase, we'd love to hear your feedback!
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/orders/${order._id}/review" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Leave a Review
    </a>
  </div>
`,

  // Account locked template
  accountLocked: (unlockTime) => `
  <h2 style="color: #333; text-align: center;">Account Temporarily Locked</h2>
  <p style="color: #555; font-size: 16px;">
    For security reasons, your account has been temporarily locked due to multiple failed login attempts.
  </p>
  <p style="color: #555; font-size: 16px;">
    You can try again after ${unlockTime} or use the password reset option below.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/forgot-password" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Reset Password
    </a>
  </div>
  <p style="color: #555; font-size: 14px;">
    If you did not attempt to log in, please reset your password immediately as someone may be trying to access your account.
  </p>
`,

  // Security alert template
  securityAlert: (activity, time, location) => `
  <h2 style="color: #333; text-align: center;">Security Alert</h2>
  <p style="color: #555; font-size: 16px;">
    We detected a security-related activity on your account that you should be aware of:
  </p>
  <div style="background-color: #fff4f4; border-left: 4px solid #ff4d4f; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; color: #333; font-weight: bold;">Activity: ${activity}</p>
    <p style="margin: 5px 0 0; color: #666;">Time: ${time}</p>
    <p style="margin: 5px 0 0; color: #666;">Location: ${location}</p>
  </div>
  <p style="color: #555; font-size: 16px;">
    If this was you, you can ignore this message. If you didn't perform this action, please secure your account immediately.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/reset-password" 
       style="background-color: #ff4d4f; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Secure My Account
    </a>
  </div>
`,

  // Admin invitation template
  adminInvitation: (data) => `
  <h2 style="color: #333; text-align: center;">Welcome to the Admin Team!</h2>
  <p style="color: #555; font-size: 16px;">Hello ${data.name},</p>
  <p style="color: #555; font-size: 16px;">
    You have been invited to join the admin team of our e-commerce platform. To complete your registration and set up your account, please follow these steps:
  </p>
  
  <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
    <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${data.tempPassword}</p>
    <p style="margin: 5px 0;"><strong>Important:</strong> This invitation link will expire in ${data.expiresIn}.</p>
  </div>
  
  <p style="color: #555; font-size: 16px;">Click the button below to accept the invitation and set up your account:</p>
  
  <div style="text-align: center; margin: 20px 0;">
    <a href="${data.invitationURL}" 
       style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Accept Invitation
    </a>
  </div>
  
  <p style="color: #555; font-size: 14px;">
    If the button doesn't work, you can copy and paste this link into your browser:
  </p>
  <p style="color: #555; font-size: 14px; word-break: break-all;">
    ${data.invitationURL}
  </p>
  
  <p style="color: #555; font-size: 14px;">
    After accepting the invitation, you'll be prompted to set a new password for your account.
  </p>
  
  <p style="color: #555; font-size: 14px;">
    If you did not expect this invitation, please ignore this email.
  </p>
`,

  // Newsletter subscription confirmation
  newsletterSubscription: (name) => `
  <h2 style="color: #333; text-align: center;">Newsletter Subscription Confirmed</h2>
  <p style="color: #555; font-size: 16px;">Hello ${name || 'there'},</p>
  <p style="color: #555; font-size: 16px;">
    Thank you for subscribing to our newsletter! You'll now receive updates about our latest products, special offers, and promotions.
  </p>
  <p style="color: #555; font-size: 16px;">
    We're excited to share our latest news and exclusive deals with you.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Visit Our Shop
    </a>
  </div>
`,

  // Special offer notification
  specialOffer: (offer) => `
  <h2 style="color: #333; text-align: center;">Special Offer: ${offer.title}</h2>
  <p style="color: #555; font-size: 16px;">Hello there,</p>
  <p style="color: #555; font-size: 16px;">
    We have a special offer just for you!
  </p>
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
    <h3 style="color: #0080ff; margin-top: 0;">Offer Details:</h3>
    <p style="margin: 5px 0;"><strong>${offer.title}</strong></p>
    <p style="margin: 5px 0;">${offer.description}</p>
    <p style="margin: 5px 0;"><strong>Discount:</strong> ${offer.discount}% off</p>
    <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${new Date(offer.endDate).toLocaleDateString()}</p>
  </div>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/special-offers/${offer._id}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Shop Now
    </a>
  </div>
`,

  // Abandoned cart reminder
  abandonedCart: (cart) => `
  <h2 style="color: #333; text-align: center;">Your Cart Awaits!</h2>
  <p style="color: #555; font-size: 16px;">Hello ${cart.user.name},</p>
  <p style="color: #555; font-size: 16px;">
    We noticed you left some items in your cart. Don't forget to complete your purchase!
  </p>
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
    <h3 style="color: #0080ff; margin-top: 0;">Cart Summary:</h3>
    <p style="margin: 5px 0;"><strong>Items in Cart:</strong> ${cart.items.length}</p>
    <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${cart.totalPrice.toFixed(2)}</p>
  </div>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/cart" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Complete Your Purchase
    </a>
  </div>
`,

  // Product back in stock notification
  backInStock: (product) => `
  <h2 style="color: #333; text-align: center;">Product Back in Stock!</h2>
  <p style="color: #555; font-size: 16px;">Hello there,</p>
  <p style="color: #555; font-size: 16px;">
    Good news! The product you were interested in is now back in stock.
  </p>
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
    <h3 style="color: #0080ff; margin-top: 0;">Product Details:</h3>
    <p style="margin: 5px 0;"><strong>${product.name}</strong></p>
    <p style="margin: 5px 0;"><strong>Price:</strong> $${product.price.toFixed(2)}</p>
    <p style="margin: 5px 0;"><strong>Stock:</strong> ${product.countInStock} units</p>
  </div>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/product/${product._id}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      View Product
    </a>
  </div>
`,

  // Admin verification template
  adminVerification: (name, verificationLink) => `
  <h2 style="color: #333; text-align: center;">Verify Your Admin Account</h2>
  <p style="color: #555; font-size: 16px;">Hello ${name},</p>
  <p style="color: #555; font-size: 16px;">
    Thank you for registering as an admin. Please verify your email address to complete your admin account setup.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${verificationLink}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Verify Admin Account
    </a>
  </div>
  <p style="color: #555; font-size: 14px;">
    This link will expire in 24 hours for security reasons.
  </p>
  <p style="color: #555; font-size: 14px;">
    If you did not request to create an admin account, please ignore this email and contact support immediately.
  </p>
`
};

// Admin verification email template
const adminVerificationTemplate = (name, verificationUrl) => `
  <h2 style="color: #333; text-align: center;">Welcome to CyberCafe Admin Panel!</h2>
  <p style="color: #555; font-size: 16px;">Hello ${name},</p>
  <p style="color: #555; font-size: 16px;">
    You have been granted super admin access to the CyberCafe platform. 
    Please verify your email address to activate your admin account.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${verificationUrl}" 
       style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
      Verify Email Address
    </a>
  </div>
  <p style="color: #555; font-size: 14px;">
    If you did not request this, please ignore this email.
  </p>
`;

// Send email using Mailjet
const sendMailjetEmail = async (to, subject, htmlContent) => {
  const mailjet = getMailjetClient();
  if (!mailjet) {
    console.warn('Mailjet credentials not found, falling back to Nodemailer');
    return sendNodemailerEmail(to, subject, htmlContent);
  }

  try {
    const data = {
    Messages: [
      {
        From: {
          Email: MAILJET_FROM_EMAIL,
          Name: MAILJET_FROM_NAME,
        },
        To: [
          {
            Email: to,
          },
        ],
        Subject: subject,
        HTMLPart: htmlContent,
      },
    ],
    };

    const result = await mailjet.post('send', { version: 'v3.1' }).request(data);
    return result;
  } catch (error) {
    console.error('Mailjet email error:', error);
    // Fallback to Nodemailer
    return sendNodemailerEmail(to, subject, htmlContent);
  }
};

// Send email using Nodemailer
const sendNodemailerEmail = async (to, subject, htmlContent) => {
  const transporter = createNodemailerTransport();

  try {
    const mailOptions = {
      from: `${MAILJET_FROM_NAME} <${NODEMAILER_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Nodemailer email error:', error);
    throw new Error('Failed to send email');
  }
};

// Main email sending function
export const sendEmail = async (options) => {
  const { to, subject, template, data } = options;

  if (!to || !subject || !template) {
    throw new Error('Missing required email parameters');
  }

  let htmlContent = '';

  // Generate HTML content based on template
  switch (template) {
    case 'welcome':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.welcome(data.name));
      break;
    case 'resetPassword':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.resetPassword(data.resetLink));
      break;
    case 'verifyEmail':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.verifyEmail(data.verificationLink));
      break;
    case 'adminVerification':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.adminVerification(data.name, data.verificationLink));
      break;
    case 'accountNotification':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.accountNotification(data.message));
      break;
    case 'orderConfirmation':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.orderConfirmation(data.order));
      break;
    case 'orderShipped':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.orderShipped(data.order, data.trackingNumber));
      break;
    case 'orderDelivered':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.orderDelivered(data.order));
      break;
    case 'accountLocked':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.accountLocked(data.unlockTime));
      break;
    case 'securityAlert':
      htmlContent = emailTemplates.baseTemplate(
        emailTemplates.securityAlert(data.activity, data.time, data.location)
      );
      break;
    case 'adminInvitation':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.adminInvitation(data));
      break;
    case 'newsletterSubscription':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.newsletterSubscription(data.name));
      break;
    case 'specialOffer':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.specialOffer(data.offer));
      break;
    case 'abandonedCart':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.abandonedCart(data.cart));
      break;
    case 'backInStock':
      htmlContent = emailTemplates.baseTemplate(emailTemplates.backInStock(data.product));
      break;
    default:
      throw new Error(`Unknown email template: ${template}`);
  }

  // Try to send email using Mailjet first, fall back to Nodemailer if needed
  try {
    return await sendMailjetEmail(to, subject, htmlContent);
    } catch (error) {
    console.error('Email sending error:', error);
      throw new Error('Failed to send email');
  }
};

// Convenience functions for common email types
export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to CyberCafe Shop!',
    template: 'welcome',
    data: { name },
  });
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      template: 'resetPassword',
      data: { 
        resetLink,
        name: 'User' // We'll update this with the actual name in the controller
      }
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email, name, verificationUrl, isAdmin = false) => {
  try {
    const subject = 'Verify Your Email Address';
    const template = isAdmin ? 'adminVerification' : 'verifyEmail';
    
    await sendEmail({
      to: email,
      subject,
      template,
      data: { 
        name,
        verificationLink: verificationUrl
      }
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendAccountNotification = async (email, message) => {
  return sendEmail({
    to: email,
    subject: 'Account Notification',
    template: 'accountNotification',
    data: { message },
  });
};

export const sendOrderConfirmationEmail = async (email, order) => {
  return sendEmail({
    to: email,
    subject: `Order Confirmation - Order #${order._id}`,
    template: 'orderConfirmation',
    data: { order },
  });
};

export const sendOrderShippedEmail = async (email, order, trackingNumber) => {
  return sendEmail({
    to: email,
    subject: `Your Order Has Been Shipped - Order #${order._id}`,
    template: 'orderShipped',
    data: { order, trackingNumber },
  });
};

export const sendOrderDeliveredEmail = async (email, order) => {
  return sendEmail({
    to: email,
    subject: `Your Order Has Been Delivered - Order #${order._id}`,
    template: 'orderDelivered',
    data: { order },
  });
};

export const sendAccountLockedEmail = async (email, unlockTime) => {
  return sendEmail({
    to: email,
    subject: 'Account Temporarily Locked',
    template: 'accountLocked',
    data: { unlockTime },
  });
};

export const sendSecurityAlertEmail = async (email, activity, time, location) => {
  return sendEmail({
    to: email,
    subject: 'Security Alert',
    template: 'securityAlert',
    data: { activity, time, location },
  });
};

export const sendAdminInvitationEmail = async (email, name, token, tempPassword) => {
  const invitationUrl = `${process.env.CLIENT_URL}/admin/invitation/${token}`;
  const subject = 'Admin Invitation - E-commerce Platform';
  
  return sendEmail({
    to: email,
    subject,
    template: 'adminInvitation',
    data: {
      name,
      invitationURL: invitationUrl,
      tempPassword,
      expiresIn: '24 hours'
    }
  });
};

export const sendNewsletterSubscriptionEmail = async (email, name) => {
  const subject = 'Welcome to Our Newsletter!';
  const content = `
    <h2 style="color: #333; text-align: center;">Welcome to Our Newsletter!</h2>
    <p style="color: #555; font-size: 16px;">Hello ${name},</p>
    <p style="color: #555; font-size: 16px;">
      Thank you for subscribing to our newsletter. We're excited to share our latest updates, promotions, and news with you!
    </p>
    <p style="color: #555; font-size: 16px;">
      You'll be receiving our newsletter at ${email}. If you have any questions or concerns, please don't hesitate to contact us.
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}" 
         style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
        Visit Our Website
      </a>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html: emailTemplates.baseTemplate(content)
  });
};

export const sendNewsletterVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/newsletter/verify/${verificationToken}`;
  const subject = 'Verify Your Newsletter Subscription';
  const content = `
    <h2 style="color: #333; text-align: center;">Verify Your Newsletter Subscription</h2>
    <p style="color: #555; font-size: 16px;">Hello ${name},</p>
    <p style="color: #555; font-size: 16px;">
      Thank you for subscribing to our newsletter. To complete your subscription, please verify your email address by clicking the button below.
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${verificationUrl}" 
         style="background-color: #0080ff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
        Verify Subscription
      </a>
    </div>
    <p style="color: #555; font-size: 16px;">
      If the button doesn't work, you can copy and paste the following link into your browser:
    </p>
    <p style="color: #555; font-size: 16px; word-break: break-all;">
      ${verificationUrl}
    </p>
    <p style="color: #555; font-size: 16px;">
      This verification link will expire in 24 hours. If you didn't request this subscription, you can safely ignore this email.
    </p>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html: emailTemplates.baseTemplate(content)
  });
};

export const sendSpecialOfferEmail = async (email, offer) => {
  return sendEmail({
    to: email,
    subject: `Special Offer: ${offer.title}`,
    template: 'specialOffer',
    data: { offer },
  });
};

export const sendAbandonedCartEmail = async (email, name, items) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Complete Your Purchase - Items Waiting in Your Cart',
    html: `
      <h2>Hi ${name},</h2>
      <p>We noticed you have some items in your cart that you haven't checked out yet.</p>
      <p>Here's what's waiting for you:</p>
      <ul>
        ${items.map(item => `<li>${item.name} - $${item.price}</li>`).join('')}
      </ul>
      <p>Don't miss out on these great items! Complete your purchase now.</p>
      <a href="${process.env.CLIENT_URL}/cart" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Cart</a>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>Your CyberCafe Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Abandoned cart email sent to ${email}`);
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
    throw error;
  }
};

export const sendBackInStockEmail = async (email, product) => {
  return sendEmail({
    to: email,
    subject: 'Product Back in Stock!',
    template: 'backInStock',
    data: { product },
  });
};

/**
 * Sends an admin invitation email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} invitationUrl - URL for the invitation
 * @param {string} inviterName - Name of the person sending the invitation
 * @returns {Promise<void>}
 */
export const sendAdminInvitation = async (email, name, invitationUrl, inviterName) => {
  const subject = 'Admin Invitation';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${LOGO_URL}" alt="Logo" style="max-width: 150px; height: auto;">
      </div>
      <h2 style="color: #333;">Admin Invitation</h2>
      <p>Hello ${name},</p>
      <p>You have been invited by ${inviterName} to join the admin team.</p>
      <p>Please click the button below to accept the invitation and set up your admin account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
      </div>
      <p>This invitation link will expire in 7 days.</p>
      <p>If you did not request this invitation, please ignore this email.</p>
      <p>Best regards,<br>The Admin Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html: htmlContent
  });
};
