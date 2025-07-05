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
import { createSecurityNotification } from '../utils/notificationHelper.js';

// Validation constants
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REFRESH_TOKEN_EXPIRE = '7d'; // 7 days
const ACCESS_TOKEN_EXPIRE = '15m'; // 15 minutes

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  // Validate password strength
  if (!PASSWORD_REGEX.test(password)) {
    res.status(400);
    throw new Error(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    );
  }

  // Check rate limiting (max 10 registrations per 24 hours)
  const recentRegistrations = await User.countDocuments({
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
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
    isEmailVerified: false,
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
        message:
          'Registration successful. Please check your email to verify your account.',
        email: user.email,
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
    emailVerificationExpire: { $gt: Date.now() },
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

  // Create email verification notification
  await createSecurityNotification({
    userId: user._id,
    type: 'email_verification',
    details: 'Your email has been successfully verified',
  });

  res.json({
    message: 'Email verified successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: verificationJwtToken,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  // Find user by email and explicitly select the password field
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if password is correct
  if (await user.matchPassword(password)) {
    // Check if account is locked
    if (user.isLocked && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil - new Date()) / (1000 * 60)
      );
      res.status(401);
      throw new Error(
        `Account is locked. Please try again in ${minutesLeft} minutes.`
      );
    }

    // Reset failed login attempts if account was locked but lock period has expired
    if (user.isLocked && user.lockedUntil <= new Date()) {
      user.isLocked = false;
      user.lockedUntil = null;
      user.lockReason = null;
      user.failedLoginAttempts = 0;
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Add session
    const clientIP = req.ip;
    const userAgent = req.get('user-agent');
    await user.addSession(accessToken, { userAgent }, clientIP, refreshToken);

    // Update user's last login time
    user.lastLogin = new Date();
    user.failedLoginAttempts = 0;
    await user.save();

    // Return user data and token
    res.json({
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
      },
      message: 'Login successful',
    });
  } else {
    // Increment failed login attempts
    await user.incrementFailedLoginAttempts();

    // Check if account is now locked
    if (user.isLocked) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil - new Date()) / (1000 * 60)
      );
      res.status(401);
      throw new Error(
        `Too many failed login attempts. Account is locked for ${minutesLeft} minutes.`
      );
    }

    res.status(401);
    throw new Error('Invalid email or password');
  }
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

    // Add current password to history before changing - using newPassword to avoid double hashing
    await user.addToPasswordHistory(newPassword);

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

    // Create password change notification
    await createSecurityNotification({
      userId: req.user._id,
      type: 'password_change',
      details: 'Your password was successfully updated',
    });

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

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordExpire = resetTokenExpire;
  await user.save();

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
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
  const { token, password } = req.body;

  // Validate password strength
  if (!PASSWORD_REGEX.test(password)) {
    res.status(400);
    throw new Error(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    );
  }

  // Hash the token from the request
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user by hashed token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Check if new password is in history
  if (await user.isPasswordInHistory(password)) {
    res.status(400);
    throw new Error('Cannot use a previously used password');
  }

  // Update password
  user.password = password;
  user.passwordChangedAt = new Date();
  user.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
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

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Private
export const refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate new token
  const token = user.getSignedJwtToken();

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-access-token
// @access  Private
// SOLUTION: Updated refreshAccessToken function
export const refreshAccessToken = asyncHandler(async (req, res) => {
  console.log('Refresh token endpoint called');

  // Get refresh token from cookies
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.log('No refresh token provided');
    res.status(401);
    throw new Error('No refresh token provided');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log('Refresh token verified for user:', decoded.id);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found for refresh token');
      res.status(401);
      throw new Error('User not found');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Add new session or update existing one
    const clientIP = req.ip;
    const userAgent = req.get('user-agent');

    // Check if there's an existing session with this refresh token
    const existingSessionIndex = user.activeSessions.findIndex(
      (session) => session.refreshToken === refreshToken
    );

    if (existingSessionIndex >= 0) {
      // Update existing session
      user.activeSessions[existingSessionIndex].token = accessToken;
      user.activeSessions[existingSessionIndex].lastActivity = new Date();
    } else {
      // Add new session
      await user.addSession(accessToken, { userAgent }, clientIP, refreshToken);
    }

    await user.save();

    console.log('New access token generated successfully');

    res.json({
      token: accessToken,
      expiresIn: 900, // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const accessToken = req.headers.authorization?.split(' ')[1];

    // Remove the access token session if it exists
    if (accessToken) {
      const user = await User.findOne({ 'activeSessions.token': accessToken });
      if (user) {
        await user.removeSession(accessToken);
      }
    }

    // Clear refresh token cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });

    // If refresh token exists, increment token version to invalidate future sessions
    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        const user = await User.findById(decoded.id);
        if (user) {
          user.tokenVersion = (user.tokenVersion || 0) + 1;
          await user.save();
        }
      } catch (error) {
        console.warn(
          'Refresh token invalid during logout, ignoring:',
          error.message
        );
        // Intentionally ignoring invalid token during logout
      }
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500);
    throw new Error('Logout failed. Please try again.');
  }
});
