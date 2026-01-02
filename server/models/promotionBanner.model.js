import mongoose from 'mongoose';

const promotionBannerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Please add promotion text'],
      trim: true,
      maxlength: [200, 'Promotion text cannot be more than 200 characters'],
    },
    code: {
      type: String,
      trim: true,
      maxlength: [50, 'Promotion code cannot be more than 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    backgroundColor: {
      type: String,
      default: '#1e3a8a', // blue-900
    },
    textColor: {
      type: String,
      default: '#ffffff',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    link: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: '🔥',
    },
  },
  {
    timestamps: true,
  }
);

// Add method to check if banner is valid
promotionBannerSchema.methods.isValid = function () {
  const now = new Date();
  const isDateValid = !this.endDate || now <= this.endDate;
  return this.isActive && now >= this.startDate && isDateValid;
};

const PromotionBanner = mongoose.model('PromotionBanner', promotionBannerSchema);

export default PromotionBanner;
