import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin', 'moderator', 'manager', 'staff'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    lastLogin: {
      type: Date,
      default: null,
    },
    knownDevices: [{
      type: String,
    }],
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    lockedUntil: Date,
    lockReason: String,
    passwordHistory: [{
      password: String,
      changedAt: Date
    }],
    passwordChangedAt: Date,
    passwordExpiresAt: Date,
    tokenVersion: {
      type: Number,
      default: 0
    },
    activeSessions: [{
      token: {
        type: String,
        required: true
      },
      refreshToken: {
        type: String,
        required: true
      },
      deviceInfo: {
        userAgent: String,
        platform: String,
        browser: String
      },
      ipAddress: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      lastActivity: {
        type: Date,
        default: Date.now
      },
      expiresAt: Date
    }],
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sound: {
        type: Boolean,
        default: true
      },
      desktop: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true,
  }
);

// 🔐 Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🧹 Clean up expired sessions and tokens before saving
userSchema.pre('save', async function(next) {
  if (this.activeSessions?.length > 0) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.activeSessions = this.activeSessions.filter(
      session => !session.expiresAt || session.expiresAt > oneDayAgo
    );
  }

  if (this.emailVerificationExpire && this.emailVerificationExpire < new Date()) {
    this.emailVerificationToken = undefined;
    this.emailVerificationExpire = undefined;
  }

  if (this.resetPasswordExpire && this.resetPasswordExpire < new Date()) {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpire = undefined;
  }

  next();
});

// JWT generation
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Role checks
userSchema.methods.isAdmin = function () {
  return this.role === 'admin' || this.role === 'super_admin';
};

userSchema.methods.isManagerOrAdmin = function () {
  return this.role === 'admin' || this.role === 'super_admin';
};

// Session management methods
userSchema.methods.addSession = async function(token, deviceInfo, ipAddress, refreshToken) {
  if (this.activeSessions.length >= 10) {
    this.activeSessions.sort((a, b) => a.createdAt - b.createdAt);
    this.activeSessions.shift();
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Access token expiry (15 mins)

  this.activeSessions.push({
    token,
    refreshToken,
    deviceInfo,
    ipAddress,
    createdAt: new Date(),
    lastActivity: new Date(),
    expiresAt
  });

  return this.save();
};

userSchema.methods.updateSessionActivity = async function(token) {
  const session = this.activeSessions.find(s => s.token === token);
  if (session) {
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours activity timeout
    await this.save();
  }
  return session;
};

userSchema.methods.removeSession = async function(token) {
  this.activeSessions = this.activeSessions.filter(session => session.token !== token);
  await this.save();
};

// Account lock and login security
userSchema.methods.incrementFailedLoginAttempts = async function() {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.isLocked = true;
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lock
    this.lockReason = 'Too many failed login attempts';
  }
  await this.save();
};

userSchema.methods.resetFailedLoginAttempts = async function() {
  this.failedLoginAttempts = 0;
  await this.save();
};

userSchema.methods.lockAccount = async function(reason, durationMinutes = 30) {
  this.isLocked = true;
  this.lockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
  this.lockReason = reason;
  await this.save();
};

userSchema.methods.unlockAccount = async function() {
  this.isLocked = false;
  this.lockedUntil = undefined;
  this.lockReason = undefined;
  this.failedLoginAttempts = 0;
  await this.save();
};

// Password history
userSchema.methods.addToPasswordHistory = async function(password) {
  if (!password) return;
  const hashedPassword = password.startsWith('$2') ? password : await bcrypt.hash(password, 10);

  if (this.passwordHistory.length >= 5) {
    this.passwordHistory.shift();
  }

  this.passwordHistory.push({
    password: hashedPassword,
    changedAt: new Date()
  });

  await this.save();
};

userSchema.methods.isPasswordInHistory = async function(password) {
  for (const history of this.passwordHistory) {
    if (await bcrypt.compare(password, history.password)) {
      return true;
    }
  }
  return false;
};

// Password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = resetToken;
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

export default mongoose.model('User', userSchema);
