import User from '../models/user.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { sendAccountNotification, sendAdminInvitation } from '../utils/email.js';
import jwt from 'jsonwebtoken';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const oldEmail = user.email;
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  // Send notification if email was changed
  if (oldEmail !== updatedUser.email) {
    try {
      await sendAccountNotification(
        oldEmail,
        'Your email address has been updated. If you did not make this change, please contact support immediately.'
      );
      await sendAccountNotification(
        updatedUser.email,
        'Your email address has been successfully updated.'
      );
    } catch (error) {
      console.error('Failed to send email change notification:', error);
    }
  }

  res.json({
    success: true,
    data: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isEmailVerified: updatedUser.isEmailVerified,
    },
  });
});

// @desc    Update user profile image
// @route   PUT /api/users/profile/image
// @access  Private
export const updateProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Handle file upload
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image',
      });
    }

    user.profileImage = req.file.path;
    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
      },
    });
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Send notification before deletion
  try {
    await sendAccountNotification(
      user.email,
      'Your account has been deleted. If you did not request this action, please contact support immediately.'
    );
  } catch (error) {
    console.error('Failed to send account deletion notification:', error);
  }

  await user.remove();

  res.json({
    success: true,
    data: {},
  });
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const customerUsers = await User.countDocuments({ role: 'customer' });

  res.json({
    success: true,
    data: {
      total: totalUsers,
      verified: verifiedUsers,
      admins: adminUsers,
      customers: customerUsers,
    },
  });
});

// @desc    Invite admin user
// @route   POST /api/users/invite-admin
// @access  Private/Admin
export const inviteAdmin = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      error: 'User already exists',
    });
  }

  // Generate invitation token
  const invitationToken = jwt.sign(
    { email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Create invitation URL
  const invitationURL = `${process.env.CLIENT_URL}/admin/setup/${invitationToken}`;

  // Send invitation email
  try {
    await sendAdminInvitation(
      email,
      name,
      invitationURL,
      req.user.name
    );

    res.json({
      success: true,
      message: 'Admin invitation sent successfully',
    });
  } catch (error) {
    console.error('Failed to send admin invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send invitation email',
    });
  }
}); 