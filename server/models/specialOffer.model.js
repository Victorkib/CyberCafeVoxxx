import mongoose from 'mongoose';

const specialOfferSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    discountPercentage: {
      type: Number,
      required: [true, 'Please add a discount percentage'],
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot be more than 100'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    terms: {
      type: String,
      maxlength: [1000, 'Terms cannot be more than 1000 characters'],
    },
    maxUses: {
      type: Number,
      min: [0, 'Max uses cannot be less than 0'],
    },
    currentUses: {
      type: Number,
      default: 0,
      min: [0, 'Current uses cannot be less than 0'],
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying of active offers
specialOfferSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

// Add method to check if offer is valid
specialOfferSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (!this.maxUses || this.currentUses < this.maxUses)
  );
};

const SpecialOffer = mongoose.model('SpecialOffer', specialOfferSchema);

export default SpecialOffer; 