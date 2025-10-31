import mongoose from 'mongoose';
import {
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_VALIDATION,
} from '../constants/payment.js';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [
        PAYMENT_VALIDATION.MIN_AMOUNT,
        `Amount must be at least ${PAYMENT_VALIDATION.MIN_AMOUNT}`,
      ],
      max: [
        PAYMENT_VALIDATION.MAX_AMOUNT,
        `Amount cannot exceed ${PAYMENT_VALIDATION.MAX_AMOUNT}`,
      ],
    },
    method: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.MPESA,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    transactionId: {
      type: String,
      required: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    refundReason: {
      type: String,
      trim: true,
    },
    refundedAt: {
      type: Date,
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    error: {
      code: String,
      message: String,
      details: mongoose.Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
      default: () =>
        new Date(
          Date.now() + PAYMENT_VALIDATION.TRANSACTION_TIMEOUT_MINUTES * 60000
        ),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function (startDate, endDate) {
  const matchStage = {
    $match: {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    },
  };

  const groupStage = {
    $group: {
      _id: null,
      totalRevenue: {
        $sum: {
          $cond: [{ $eq: ['$status', PAYMENT_STATUS.PAID] }, '$amount', 0],
        },
      },
      totalTransactions: { $sum: 1 },
      successfulTransactions: {
        $sum: { $cond: [{ $eq: ['$status', PAYMENT_STATUS.PAID] }, 1, 0] },
      },
      failedTransactions: {
        $sum: { $cond: [{ $eq: ['$status', PAYMENT_STATUS.FAILED] }, 1, 0] },
      },
      refundedTransactions: {
        $sum: { $cond: [{ $eq: ['$status', PAYMENT_STATUS.REFUNDED] }, 1, 0] },
      },
      averageTransactionValue: {
        $avg: {
          $cond: [{ $eq: ['$status', PAYMENT_STATUS.PAID] }, '$amount', null],
        },
      },
    },
  };

  const projectStage = {
    $project: {
      _id: 0,
      totalRevenue: 1,
      totalTransactions: 1,
      successfulTransactions: 1,
      failedTransactions: 1,
      refundedTransactions: 1,
      averageTransactionValue: 1,
      successRate: {
        $cond: [
          { $eq: ['$totalTransactions', 0] },
          0,
          { $divide: ['$successfulTransactions', '$totalTransactions'] },
        ],
      },
    },
  };

  const result = await this.aggregate([matchStage, groupStage, projectStage]);

  return (
    result[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      refundedTransactions: 0,
      averageTransactionValue: 0,
      successRate: 0,
    }
  );
};

// Method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function () {
  const daysSincePayment = Math.floor(
    (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)
  );

  return (
    this.status === PAYMENT_STATUS.PAID &&
    !this.refundedAt &&
    daysSincePayment <= PAYMENT_VALIDATION.MAX_REFUND_DAYS
  );
};

// Method to process refund
paymentSchema.methods.processRefund = async function (
  reason,
  refundedBy,
  session = null
) {
  if (!this.canBeRefunded()) {
    throw new Error('Payment cannot be refunded');
  }

  this.status = PAYMENT_STATUS.REFUNDED;
  this.refundReason = reason;
  this.refundedAt = new Date();
  this.refundedBy = refundedBy;

  return session ? this.save({ session }) : this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
