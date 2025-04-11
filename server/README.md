# CyberCafe Shop Backend

This is the backend server for the CyberCafe Shop e-commerce platform.

## Features

- User authentication and authorization
- Product and category management
- Shopping cart functionality
- Order processing
- Multiple payment gateways (M-Pesa, Paystack, PayPal)
- Email notifications
- File uploads
- Security features

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example` and fill in your credentials:

```bash
cp .env.example .env
```

5. Start the development server:

```bash
npm run dev
```

## Environment Variables

The following environment variables are required:

- `PORT`: The port on which the server will run (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRE`: JWT token expiration time
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Email configuration
- `CLOUDINARY_*`: Cloudinary credentials for image uploads
- `MPESA_*`: M-Pesa (Daraja) credentials
- `PAYSTACK_*`: Paystack credentials
- `PAYPAL_*`: PayPal credentials

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/auth/me`: Get current user
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password/:token`: Reset password
- `PUT /api/auth/update-password`: Update password

### Users

- `GET /api/users/profile`: Get user profile
- `PUT /api/users/profile`: Update user profile
- `PUT /api/users/profile-image`: Update profile image

### Products

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get product by ID
- `GET /api/products/featured`: Get featured products
- `GET /api/products/category/:id`: Get products by category
- `GET /api/products/search`: Search products

### Categories

- `GET /api/categories`: Get all categories
- `GET /api/categories/:id`: Get category by ID
- `GET /api/categories/featured`: Get featured categories

### Cart

- `GET /api/cart`: Get cart
- `POST /api/cart`: Add item to cart
- `PUT /api/cart/:id`: Update cart item
- `DELETE /api/cart/:id`: Remove item from cart
- `DELETE /api/cart`: Clear cart

### Orders

- `POST /api/orders`: Create order
- `GET /api/orders`: Get all orders
- `GET /api/orders/:id`: Get order by ID
- `PUT /api/orders/:id/cancel`: Cancel order

### Payments

- `GET /api/payments/methods`: Get available payment methods
- `POST /api/payments/initialize`: Initialize payment
- `POST /api/payments/mpesa/callback`: M-Pesa callback
- `POST /api/payments/paystack/callback`: Paystack callback
- `POST /api/payments/paypal/capture`: PayPal capture

### Newsletter

- `POST /api/newsletter/subscribe`: Subscribe to newsletter
- `POST /api/newsletter/unsubscribe`: Unsubscribe from newsletter

### Special Offers

- `GET /api/special-offers`: Get all special offers
- `GET /api/special-offers/active`: Get active special offers

### Hero Slides

- `GET /api/hero-slides`: Get all hero slides
- `GET /api/hero-slides/active`: Get active hero slides

## License

This project is licensed under the ISC License. 