import User from '../models/user.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendSecurityAlertEmail,
} from '../utils/email.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  // Validate password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
  }

  // Check rate limiting (max 10 registrations per 24 hours)
  const recentRegistrations = await User.countDocuments({
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  if (recentRegistrations >= 10) {
    res.status(429);
    throw new Error('Too many registrations in the last 24 hours');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: 'user', // Force role to be user for public registration
    emailVerificationToken: verificationToken,
    emailVerificationExpire: verificationExpire,
    isEmailVerified: false
  });

  if (user) {
    try {
      // Send verification email
      await sendVerificationEmail(
        user.email,
        user.name,
        `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`,
        false
      );

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        email: user.email
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Cleanup: Delete the user if email fails
      await User.findByIdAndDelete(user._id);
      res.status(500);
      throw new Error('Failed to send verification email');
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.body;

  const user = await User.findOne({
    emailVerificationToken: verificationToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  // Generate JWT token
  const verificationJwtToken = user.getSignedJwtToken();

  res.json({
    message: 'Email verified successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token: verificationJwtToken
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if account is locked
  if (user.isLocked) {
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil - new Date()) / (1000 * 60));
      res.status(403);
      throw new Error(`Account is locked. Please try again in ${minutesLeft} minutes. Reason: ${user.lockReason}`);
    } else {
      // Auto-unlock if lock duration has expired
      await user.unlockAccount();
    }
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    await user.incrementFailedLoginAttempts();
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Reset failed attempts on successful login
  await user.resetFailedLoginAttempts();

  // Check if email is verified
  if (!user.isEmailVerified) {
    // Generate new verification token if needed
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpire = Date.now() + 24 * 60 * 60 * 1000;

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpire = verificationExpire;
    await user.save();

    // Send new verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    try {
      await sendVerificationEmail(user.email, user.name, verificationUrl);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    res.status(403);
    throw new Error('Please verify your email address. A new verification email has been sent.');
  }

  // Update last login
  user.lastLogin = new Date();
  
  // Check for suspicious login
  const clientIP = req.ip;
  const userAgent = req.get('user-agent');
  
  // If this is a new device/IP, send security alert
  if (!user.knownDevices?.includes(userAgent)) {
    try {
      await sendSecurityAlertEmail(
        user.email,
        'New device login',
        new Date().toLocaleString(),
        clientIP
      );
    } catch (error) {
      console.error('Failed to send security alert email:', error);
    }

    // Add device to known devices
    if (!user.knownDevices) {
      user.knownDevices = [];
    }
    user.knownDevices.push(userAgent);
  }

  await user.save();

  // Generate token
  const loginToken = user.getSignedJwtToken();

  // Add session
  await user.addSession(loginToken, userAgent, clientIP);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: loginToken,
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (user && (await user.matchPassword(currentPassword))) {
    // Check if new password is in history
    if (await user.isPasswordInHistory(newPassword)) {
      res.status(400);
      throw new Error('Cannot use a previously used password');
    }

    // Add current password to history before changing
    await user.addToPasswordHistory(user.password);

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    await user.save();

    // Send security alert for password change
    try {
      await sendSecurityAlertEmail(
        user.email,
        'Password changed',
        new Date().toLocaleString(),
        req.ip
      );
    } catch (error) {
      console.error('Failed to send security alert email:', error);
    }

    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save();

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Send password reset email
  try {
    await sendPasswordResetEmail(email, resetUrl);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Send security alert for password reset
  try {
    await sendSecurityAlertEmail(
      user.email,
      'Password reset',
      new Date().toLocaleString(),
      req.ip
    );
  } catch (error) {
    console.error('Failed to send security alert email:', error);
  }

  res.json({ message: 'Password reset successful' });
});

// @desc    Get active sessions
// @route   GET /api/auth/sessions
// @access  Private
export const getActiveSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user.activeSessions);
});

// @desc    Revoke session
// @route   DELETE /api/auth/sessions/:token
// @access  Private
export const revokeSession = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const user = await User.findById(req.user._id);
  
  await user.removeSession(token);
  
  res.json({ message: 'Session revoked successfully' });
});

// @desc    Lock account (Admin only)
// @route   POST /api/auth/lock-account
// @access  Private/Admin
export const lockAccount = asyncHandler(async (req, res) => {
  const { userId, reason, durationMinutes } = req.body;

  // Check if user is admin
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    res.status(403);
    throw new Error('Not authorized to lock accounts');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.lockAccount(reason, durationMinutes);

  res.json({ message: 'Account locked successfully' });
});

// @desc    Unlock account (Admin only)
// @route   POST /api/auth/unlock-account
// @access  Private/Admin
export const unlockAccount = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Check if user is admin
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    res.status(403);
    throw new Error('Not authorized to unlock accounts');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.unlockAccount();

  res.json({ message: 'Account unlocked successfully' });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
}; 