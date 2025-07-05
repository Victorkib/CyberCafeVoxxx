import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { Server } from 'socket.io';
import http from 'http';

// IMPROVEMENT 1: Load and validate environment variables first
dotenv.config();

// Set default for Redis usage
process.env.USE_REDIS = process.env.USE_REDIS || 'false';

// IMPROVEMENT 2: Environment variable validation
const validateEnvironment = () => {
  const requiredEnvVars = {
    MONGODB_URI: 'MongoDB connection string is required',
    JWT_SECRET: 'JWT secret is required',
    CLIENT_URL: 'Client URL is required',
  };

  const errors = [];
  const warnings = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, message]) => {
    if (!process.env[key]) {
      errors.push(`${key}: ${message}`);
    }
  });

  // Set defaults for optional variables
  const optionalDefaults = {
    NODE_ENV: 'development',
    PAYMENT_MODE: 'test',
    MPESA_ENV: 'sandbox',
    PAYMENT_TIMEOUT_MINUTES: '10',
    MAX_PAYMENT_RETRIES: '3',
    DEBUG_PAYMENTS: 'false',
    PORT: '5000',
  };

  Object.entries(optionalDefaults).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      warnings.push(`${key} not set, using default: ${defaultValue}`);
    }
  });

  // Validate URL formats
  const urlFields = [
    'CLIENT_URL',
    'MPESA_CALLBACK_URL',
    'PAYSTACK_CALLBACK_URL',
  ];
  urlFields.forEach((field) => {
    if (process.env[field]) {
      try {
        new URL(process.env[field]);
      } catch (error) {
        errors.push(`${field}: Invalid URL format`);
      }
    }
  });

  // Validate numeric fields
  const numericFields = [
    'PORT',
    'PAYMENT_TIMEOUT_MINUTES',
    'MAX_PAYMENT_RETRIES',
  ];
  numericFields.forEach((field) => {
    if (process.env[field] && isNaN(Number(process.env[field]))) {
      errors.push(`${field}: Must be a valid number`);
    }
  });

  // Environment-specific validations
  if (process.env.NODE_ENV === 'production') {
    if (process.env.MPESA_ENV === 'sandbox') {
      warnings.push('M-Pesa is in sandbox mode in production environment');
    }

    if (process.env.PAYMENT_MODE === 'test') {
      warnings.push('Payment mode is set to test in production environment');
    }
  }

  // Log results
  if (warnings.length > 0) {
    console.log('⚠️  Environment configuration warnings:', warnings);
  }

  if (errors.length > 0) {
    console.error('❌ Environment configuration errors:', errors);
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  console.log('✅ Environment validation passed');
  return true;
};

// IMPROVEMENT 3: Get payment configuration
const getPaymentConfig = () => {
  return {
    mpesa: {
      enabled: !!(
        process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET
      ),
      env: process.env.MPESA_ENV || 'sandbox',
      shortcode: process.env.MPESA_SHORTCODE,
      callbackUrl: process.env.MPESA_CALLBACK_URL,
    },
    paystack: {
      enabled: !!(
        process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_PUBLIC_KEY
      ),
      callbackUrl: process.env.PAYSTACK_CALLBACK_URL,
    },
    paypal: {
      enabled: !!(
        process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
      ),
      mode: process.env.PAYPAL_MODE || 'sandbox',
    },
    general: {
      mode: process.env.PAYMENT_MODE || 'test',
      timeoutMinutes: Number(process.env.PAYMENT_TIMEOUT_MINUTES) || 10,
      maxRetries: Number(process.env.MAX_PAYMENT_RETRIES) || 3,
      debug: process.env.DEBUG_PAYMENTS === 'true',
    },
  };
};

// Run environment validation
try {
  validateEnvironment();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

// IMPROVEMENT 4: Log payment configuration
const paymentConfig = getPaymentConfig();
console.log('💳 Payment Configuration:', {
  mpesa: paymentConfig.mpesa.enabled ? '✅ Enabled' : '❌ Disabled',
  paystack: paymentConfig.paystack.enabled ? '✅ Enabled' : '❌ Disabled',
  paypal: paymentConfig.paypal.enabled ? '✅ Enabled' : '❌ Disabled',
  mode: paymentConfig.general.mode,
});

const app = express();
const PORT = process.env.PORT || 5000;

// IMPROVEMENT 5: Enhanced raw body parser for webhooks
const rawBodyParser = express.raw({
  type: 'application/json',
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
});

// IMPROVEMENT 6: Enhanced security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// IMPROVEMENT 7: Enhanced rate limiting
const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(
      (Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000
    ),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: Number(process.env.PAYMENT_RATE_LIMIT_WINDOW) || 60000, // 1 minute
  max: Number(process.env.PAYMENT_RATE_LIMIT_MAX) || 10,
  message: {
    error: 'Too many payment requests, please try again later.',
    retryAfter: Math.ceil(
      (Number(process.env.PAYMENT_RATE_LIMIT_WINDOW) || 60000) / 1000
    ),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?.id || req.ip;
  },
});

// Apply rate limiting
app.use('/api/', generalLimiter);

// IMPROVEMENT 8: Enhanced CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-paystack-signature',
      'x-mpesa-signature',
      'x-paypal-auth-algo',
      'paypal-auth-version',
      'paypal-cert-id',
      'paypal-transmission-id',
      'paypal-transmission-sig',
      'paypal-transmission-time',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  })
);

// IMPROVEMENT 9: Enhanced middleware configuration
app.use(
  express.json({
    limit: '10kb',
    verify: (req, res, buf) => {
      // Store raw body for webhook signature verification
      if (req.originalUrl.includes('/webhooks/')) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Create HTTP server
const server = http.createServer(app);

// IMPROVEMENT 10: Enhanced Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// IMPROVEMENT 11: Enhanced notification service
import UnifiedNotificationService from './services/unified-notification.service.js';
import { initNotificationHelper } from './utils/notificationHelper.js';
import { notificationMiddleware } from './middleware/notification.middleware.js';

const notificationService = new UnifiedNotificationService(io);
app.set('notificationService', notificationService);
initNotificationHelper(notificationService);
app.use(notificationMiddleware);

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import specialOfferRoutes from './routes/specialOffer.routes.js';
import heroSlideRoutes from './routes/heroSlide.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reportRoutes from './routes/report.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import paymentWebhookRoutes from './routes/payment.webhooks.routes.js';

// Import error handlers
import { errorHandler } from './middleware/error.middleware.js';
import {
  handlePaymentError,
  handleProviderError,
} from './middleware/paymentErrorHandler.js';
import { authMiddleware } from './middleware/auth.middleware.js';

// Import payment webhooks
import {
  handleMpesaWebhook,
  handlePaystackWebhook,
  handlePaypalWebhook,
} from './controllers/payment.webhooks.js';

// IMPROVEMENT 12: Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    paymentMode: process.env.PAYMENT_MODE,
    services: {
      database:
        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      payments: {
        mpesa: paymentConfig.mpesa.enabled,
        paystack: paymentConfig.paystack.enabled,
        paypal: paymentConfig.paypal.enabled,
      },
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    },
  };

  res.json(healthCheck);
});

// IMPROVEMENT 13: API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'VoxCyber E-commerce API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      payments: '/api/payments',
      webhooks: '/api/webhooks',
      health: '/health',
    },
    documentation: 'https://your-docs-url.com',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', authMiddleware, cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentLimiter, paymentRoutes); // Apply payment rate limiting
app.use('/api/special-offers', specialOfferRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/webhooks', paymentWebhookRoutes);

// IMPROVEMENT 14: Enhanced webhook endpoints with better error handling
app.post('/webhooks/mpesa', rawBodyParser, (req, res, next) => {
  try {
    // Parse JSON body for M-Pesa webhook
    if (req.rawBody) {
      req.body = JSON.parse(req.rawBody);
    }
    handleMpesaWebhook(req, res, next);
  } catch (error) {
    console.error('Error parsing M-Pesa webhook:', error);
    res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
});

app.post('/webhooks/paystack', rawBodyParser, (req, res, next) => {
  try {
    // Parse JSON body for Paystack webhook
    if (req.rawBody) {
      req.body = JSON.parse(req.rawBody);
    }
    handlePaystackWebhook(req, res, next);
  } catch (error) {
    console.error('Error parsing Paystack webhook:', error);
    res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
});

app.post('/webhooks/paypal', rawBodyParser, (req, res, next) => {
  try {
    // Parse JSON body for PayPal webhook
    if (req.rawBody) {
      req.body = JSON.parse(req.rawBody);
    }
    handlePaypalWebhook(req, res, next);
  } catch (error) {
    console.error('Error parsing PayPal webhook:', error);
    res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
});

// IMPROVEMENT 15: 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      api: '/api',
      health: '/health',
      webhooks: ['/webhooks/mpesa', '/webhooks/paystack', '/webhooks/paypal'],
    },
  });
});

// Error handlers
app.use(handlePaymentError);
app.use(handleProviderError);
app.use(errorHandler);

// IMPROVEMENT 16: Enhanced MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    const mongoOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);

    console.log('✅ Connected to MongoDB');

    // Set up MongoDB event listeners
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔌 MongoDB reconnected');
    });

    return true;
  } catch (error) {
    console.error(
      `❌ MongoDB connection error (${retries} retries left):`,
      error.message
    );

    if (retries > 0) {
      console.log('⏳ Retrying MongoDB connection in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }

    throw error;
  }
};

// IMPROVEMENT 17: Enhanced server startup
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Initialize scheduled tasks
    try {
      const { initializeScheduledTasks } = await import('./utils/scheduler.js');
      initializeScheduledTasks();
      console.log('✅ Scheduled tasks initialized');
    } catch (error) {
      console.warn('⚠️  Scheduled tasks initialization failed:', error.message);
    }

    // Start server
    server.listen(PORT, () => {
      console.log('\n🚀 Server started successfully!');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`💳 Payment Mode: ${process.env.PAYMENT_MODE}`);

      if (process.env.NODE_ENV === 'development') {
        console.log(`\n📱 Frontend URL: ${process.env.CLIENT_URL}`);
        console.log(`🔗 API URL: http://localhost:${PORT}/api`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
        console.log(`📚 API Docs: http://localhost:${PORT}/api`);

        if (paymentConfig.mpesa.enabled) {
          console.log(
            `📱 M-Pesa Webhook: http://localhost:${PORT}/webhooks/mpesa`
          );
        }
        if (paymentConfig.paystack.enabled) {
          console.log(
            `💳 Paystack Webhook: http://localhost:${PORT}/webhooks/paystack`
          );
        }
        if (paymentConfig.paypal.enabled) {
          console.log(
            `🅿️  PayPal Webhook: http://localhost:${PORT}/webhooks/paypal`
          );
        }
      }

      console.log('\n✅ Server is ready to accept connections\n');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// IMPROVEMENT 18: Enhanced process error handling
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  console.error('Promise:', promise);

  // Close server gracefully
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// IMPROVEMENT 19: Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n📴 ${signal} received, shutting down gracefully...`);

  server.close(async () => {
    console.log('🔌 HTTP server closed');

    try {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error(
      '❌ Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

// Export for testing
export { app, server, io, notificationService };
