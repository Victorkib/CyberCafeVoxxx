import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: function () {
      return this.price * this.quantity;
    },
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['mpesa', 'paystack', 'paypal', 'stripe'],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      transactionId: String,
      method: String,
      timestamp: Date,
    },
    paymentRetryCount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    trackingNumber: String,
    estimatedDelivery: Date,
    notes: String,
    paidAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate item totals if not provided
orderSchema.pre('save', function (next) {
  // Calculate totalPrice for each item if not set
  this.items.forEach((item) => {
    if (!item.totalPrice) {
      item.totalPrice = item.price * item.quantity;
    }
  });

  // Only calculate order total if items have changed
  if (this.isModified('items') || this.isNew) {
    this.totalAmount =
      this.items.reduce((total, item) => total + item.totalPrice, 0) +
      this.taxAmount +
      this.shippingAmount;
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = async function (newStatus, session = null) {
  this.status = newStatus;

  // If order is cancelled or refunded, update product stock
  if (newStatus === 'cancelled' || newStatus === 'refunded') {
    const Product = mongoose.model('Product');
    for (const item of this.items) {
      if (session) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { countInStock: item.quantity } },
          { session }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { countInStock: item.quantity },
        });
      }
    }
  }

  return session ? this.save({ session }) : this.save();
};

// Method to generate tracking number
orderSchema.methods.generateTrackingNumber = function () {
  const prefix = 'VOX';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  this.trackingNumber = `${prefix}${timestamp}${random}`;
  return this.trackingNumber;
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount,
    };
    return acc;
  }, {});
};

export default mongoose.model('Order', orderSchema);
