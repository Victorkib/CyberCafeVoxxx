import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['payment', 'general', 'email', 'notification'],
      unique: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Method to validate settings based on type
settingsSchema.methods.validateSettings = function() {
  const errors = [];
  
  switch (this.type) {
    case 'payment':
      // Payment settings validation is handled in the service
      break;
    case 'general':
      if (!this.data.siteName || !this.data.siteDescription) {
        errors.push('Site name and description are required');
      }
      break;
    case 'email':
      if (!this.data.fromEmail || !this.data.fromName) {
        errors.push('From email and name are required');
      }
      break;
    case 'notification':
      if (typeof this.data.enabled !== 'boolean') {
        errors.push('Notification enabled status is required');
      }
      break;
  }
  
  return errors;
};

// Pre-save middleware to validate settings
settingsSchema.pre('save', function(next) {
  const errors = this.validateSettings();
  if (errors.length > 0) {
    next(new Error(errors.join(', ')));
  }
  next();
});

export default mongoose.model('Settings', settingsSchema); 