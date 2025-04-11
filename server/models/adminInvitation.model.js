import mongoose from 'mongoose';
import crypto from 'crypto';

const adminInvitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  token: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  tempPassword: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}, {
  timestamps: true
});

// Index for faster queries
adminInvitationSchema.index({ email: 1, status: 1 });
adminInvitationSchema.index({ token: 1 });

// Method to check if invitation is expired
adminInvitationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Pre-save middleware to update status if expired
adminInvitationSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'pending') {
    this.status = 'expired';
  }
  next();
});

const AdminInvitation = mongoose.model('AdminInvitation', adminInvitationSchema);

export default AdminInvitation; 