import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot be more than 200 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    mobileImage: {
      type: String,
      required: [true, 'Please add a mobile image URL'],
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: [50, 'Button text cannot be more than 50 characters'],
    },
    buttonLink: {
      type: String,
      trim: true,
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
    order: {
      type: Number,
      default: 0,
    },
    backgroundColor: {
      type: String,
      default: '#000000',
    },
    textColor: {
      type: String,
      default: '#FFFFFF',
    },
    animation: {
      type: String,
      enum: ['fade', 'slide', 'zoom', 'none'],
      default: 'fade',
    },
    animationDuration: {
      type: Number,
      default: 1000,
      min: [0, 'Animation duration cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying of active slides
heroSlideSchema.index({ startDate: 1, endDate: 1, isActive: 1, order: 1 });

// Add method to check if slide is valid
heroSlideSchema.methods.isValid = function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);

export default HeroSlide; 