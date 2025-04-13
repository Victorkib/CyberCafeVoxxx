import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
      enum: ['user', 'admin', 'super_admin', 'manager', 'staff'],
      default: 'user',
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
    activeSessions: [{
      token: String,
      deviceInfo: String,
      ipAddress: String,
      lastActivity: Date,
      createdAt: Date
    }]
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === 'admin' || this.role === 'super_admin';
};

// Check if user is manager or admin
userSchema.methods.isManagerOrAdmin = function () {
  return this.role === 'admin' || this.role === 'super_admin';
};

// Add new methods for security features
userSchema.methods.incrementFailedLoginAttempts = async function() {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) { // Lock after 5 failed attempts
    this.isLocked = true;
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
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

userSchema.methods.addToPasswordHistory = async function(password) {
  if (this.passwordHistory.length >= 5) { // Keep last 5 passwords
    this.passwordHistory.shift();
  }
  this.passwordHistory.push({
    password: await bcrypt.hash(password, 10),
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

userSchema.methods.addSession = async function(token, deviceInfo, ipAddress) {
  if (this.activeSessions.length >= 5) { // Limit to 5 active sessions
    this.activeSessions.shift();
  }
  this.activeSessions.push({
    token,
    deviceInfo,
    ipAddress,
    lastActivity: new Date(),
    createdAt: new Date()
  });
  await this.save();
};

userSchema.methods.removeSession = async function(token) {
  this.activeSessions = this.activeSessions.filter(session => session.token !== token);
  await this.save();
};

userSchema.methods.updateSessionActivity = async function(token) {
  const session = this.activeSessions.find(s => s.token === token);
  if (session) {
    session.lastActivity = new Date();
    await this.save();
  }
};

export default mongoose.model('User', userSchema); 