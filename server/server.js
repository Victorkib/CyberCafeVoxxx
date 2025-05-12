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

// Load environment variables
dotenv.config();

// Set default for Redis usage
process.env.USE_REDIS = process.env.USE_REDIS || 'false';

const app = express();
const PORT = process.env.PORT || 5000;

// Raw body parser for webhooks
const rawBodyParser = express.raw({ type: 'application/json' });

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use('/api/', limiter);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Create HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Unified notification service
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', authMiddleware, cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/special-offers', specialOfferRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/webhooks', paymentWebhookRoutes);

// Webhook endpoints without rate limiting
app.post('/webhooks/mpesa', rawBodyParser, handleMpesaWebhook);
app.post('/webhooks/paystack', rawBodyParser, handlePaystackWebhook);
app.post('/webhooks/paypal', rawBodyParser, handlePaypalWebhook);

// Error handlers
app.use(handlePaymentError);
app.use(handleProviderError);
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Scheduler
    import('./utils/scheduler.js').then(({ initializeScheduledTasks }) => {
      initializeScheduledTasks();
      console.log('Scheduled tasks initialized');

      server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Export for testing
export { app, server, io, notificationService };
