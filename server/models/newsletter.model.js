import mongoose from 'mongoose';
import crypto from 'crypto';

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    status: {
      type: String,
      enum: ['subscribed', 'unsubscribed', 'pending'],
      default: 'pending',
    },
    source: {
      type: String,
      enum: ['landing_page', 'checkout', 'popup', 'footer'],
      default: 'landing_page',
    },
    preferences: {
      promotions: {
        type: Boolean,
        default: true,
      },
      news: {
        type: Boolean,
        default: true,
      },
      updates: {
        type: Boolean,
        default: true,
      },
    },
    lastEmailSent: Date,
    unsubscribeToken: String,
    verificationToken: String,
    verifiedAt: Date,
    unsubscribedAt: Date,
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate tokens
newsletterSchema.pre('save', function (next) {
  if (this.isNew) {
    this.verificationToken = crypto.randomBytes(32).toString('hex');
    this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Method to verify subscription
newsletterSchema.methods.verify = async function () {
  this.status = 'subscribed';
  this.verifiedAt = new Date();
  this.verificationToken = undefined;
  return this.save();
};

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = async function () {
  this.status = 'unsubscribed';
  this.unsubscribedAt = new Date();
  return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = async function () {
  this.status = 'subscribed';
  this.unsubscribedAt = undefined;
  return this.save();
};

// Static method to get active subscribers
newsletterSchema.statics.getActiveSubscribers = function () {
  return this.find({
    status: 'subscribed',
  }).select('email preferences');
};

// Static method to get subscription stats
newsletterSchema.statics.getSubscriptionStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
};

export default mongoose.model('Newsletter', newsletterSchema); 