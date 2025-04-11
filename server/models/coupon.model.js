import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide a coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: [true, 'Please provide a discount value'],
      min: [0, 'Discount value cannot be negative'],
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    userUsageLimit: {
      type: Number,
      default: 1,
    },
    usedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
couponSchema.index({ code: 1, status: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function (userId, cartTotal) {
  const now = new Date();
  return (
    this.status === 'active' &&
    now >= this.startDate &&
    now <= this.endDate &&
    cartTotal >= this.minPurchase &&
    (!this.usageLimit || this.usedCount < this.usageLimit) &&
    (!this.userUsageLimit || !this.usedBy.includes(userId))
  );
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (cartTotal) {
  let discount = 0;
  if (this.type === 'percentage') {
    discount = (cartTotal * this.value) / 100;
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else {
    discount = this.value;
  }
  return Math.min(discount, cartTotal);
};

// Method to apply coupon
couponSchema.methods.apply = async function (userId) {
  this.usedCount += 1;
  this.usedBy.push(userId);
  return this.save();
};

export default mongoose.model('Coupon', couponSchema); 