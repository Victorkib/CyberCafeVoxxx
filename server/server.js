import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import mongoSanitize from "express-mongo-sanitize"
import xss from "xss-clean"
import hpp from "hpp"
import cookieParser from "cookie-parser"
import { Server } from "socket.io"
import http from "http"

// Import the unified notification service
import UnifiedNotificationService from "./services/unified-notification.service.js"
import { initNotificationHelper } from "./utils/notificationHelper.js"
import { notificationMiddleware } from "./middleware/notification.middleware.js"

// Import routes
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import productRoutes from "./routes/product.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import orderRoutes from "./routes/order.routes.js"
import specialOfferRoutes from "./routes/specialOffer.routes.js"
import heroSlideRoutes from "./routes/heroSlide.routes.js"
import newsletterRoutes from "./routes/newsletter.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import reportRoutes from "./routes/report.routes.js"
import settingsRoutes from "./routes/settings.routes.js"
import couponRoutes from "./routes/coupon.routes.js"

// Import middleware
import { errorHandler } from "./middleware/error.middleware.js"
import { authMiddleware } from "./middleware/auth.middleware.js"

// Import scheduler
import { initializeScheduledTasks } from "./utils/scheduler.js"

// Load environment variables
dotenv.config()

// Set default for Redis usage
process.env.USE_REDIS = process.env.USE_REDIS || "false"

const app = express()
const PORT = process.env.PORT || 5000

// Security Middleware
app.use(helmet())
app.use(mongoSanitize())
app.use(xss())
app.use(hpp())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
})
app.use("/api/", limiter)

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5175",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
)
app.use(express.json({ limit: "10kb" }))
app.use(morgan("dev"))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))
app.use(cookieParser())
app.use(compression())

// Static files
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
app.use("/uploads", express.static(join(__dirname, "uploads")))

// Create HTTP server
const server = http.createServer(app)

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5175",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Initialize the unified notification service
const notificationService = new UnifiedNotificationService(io)

// Make the notification service available to other modules
app.set("notificationService", notificationService)

// Initialize the notification helper with the notification service
initNotificationHelper(notificationService)

// Add notification middleware
app.use(notificationMiddleware)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/cart", authMiddleware, cartRoutes)
app.use("/api/orders", authMiddleware, orderRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/special-offers", specialOfferRoutes)
app.use("/api/hero-slides", heroSlideRoutes)
app.use("/api/newsletter", newsletterRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/coupons", couponRoutes)

// Error handling
app.use(errorHandler)

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    // Initialize scheduled tasks
    initializeScheduledTasks()
    console.log("Scheduled tasks initialized")
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
  // Close server & exit process
  process.exit(1)
})

// Export for testing
export { app, server, io, notificationService }
