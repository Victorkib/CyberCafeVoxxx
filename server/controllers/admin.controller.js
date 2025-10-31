import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Category from '../models/category.model.js';
import Settings from '../models/settings.model.js';
import { createError } from '../utils/error.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendAdminInvitationEmail } from '../utils/email.js';
import crypto from 'crypto';
import AdminInvitation from '../models/adminInvitation.model.js';
import { generateToken } from '../utils/jwt.js';
import { generateTempPassword } from '../utils/password.js';

// Dashboard Statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalSales = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    res.json({
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      totalProducts,
      totalCustomers
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {
      status: 'completed',
      ...(startDate && endDate && {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
    };

    const salesData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    next(error);
  }
};

export const getInventoryStats = async (req, res, next) => {
  try {
    const inventoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          lowStock: {
            $sum: {
              $cond: [{ $lt: ['$stock', 10] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json(inventoryStats);
  } catch (error) {
    next(error);
  }
};

export const getCustomerStats = async (req, res, next) => {
  try {
    const customerStats = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(customerStats);
  } catch (error) {
    next(error);
  }
};

// Product Management
export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort, filter } = req.query;
    const query = {};

    if (filter) {
      Object.keys(filter).forEach(key => {
        query[key] = filter[key];
      });
    }

    const products = await Product.find(query)
      .sort(sort || { createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('category');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      throw createError(404, 'Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      throw createError(404, 'Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw createError(404, 'Product not found');
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    );
    if (!product) {
      throw createError(404, 'Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!product) {
      throw createError(404, 'Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Order Management
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product');
    if (!order) {
      throw createError(404, 'Order not found');
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      throw createError(404, 'Order not found');
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderTracking = async (req, res, next) => {
  try {
    const { trackingNumber, trackingCompany } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { trackingNumber, trackingCompany },
      { new: true, runValidators: true }
    );
    if (!order) {
      throw createError(404, 'Order not found');
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw createError(404, 'Order not found');
    }
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const refundOrder = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw createError(404, 'Order not found');
    }
    // Implement refund logic here (e.g., payment gateway integration)
    order.status = 'refunded';
    order.refundDetails = { amount, reason, date: new Date() };
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Customer Management
export const getAllCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role: 'customer' });

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: 'customer'
    }).select('-password');
    if (!customer) {
      throw createError(404, 'Customer not found');
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer' },
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    if (!customer) {
      throw createError(404, 'Customer not found');
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const blockCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer' },
      { status: 'blocked' },
      { new: true, runValidators: true }
    ).select('-password');
    if (!customer) {
      throw createError(404, 'Customer not found');
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const unblockCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer' },
      { status: 'active' },
      { new: true, runValidators: true }
    ).select('-password');
    if (!customer) {
      throw createError(404, 'Customer not found');
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// User Management
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find({ role: { $ne: 'customer' } })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role: { $ne: 'customer' } });

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: { $ne: 'customer' } })
      .select('-password');
    if (!user) {
      throw createError(404, 'User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      throw createError(404, 'User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw createError(404, 'User not found');
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      throw createError(404, 'User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      throw createError(404, 'User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Category Management
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw createError(404, 'Category not found');
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      throw createError(404, 'Category not found');
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      throw createError(404, 'Category not found');
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Settings Management
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateGeneralSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { general: req.body } },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { payment: req.body } },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateShippingSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { shipping: req.body } },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateEmailSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { email: req.body } },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Reports
export const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {
      status: 'completed',
      ...(startDate && endDate && {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
    };

    const salesReport = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json(salesReport);
  } catch (error) {
    next(error);
  }
};

export const getInventoryReport = async (req, res, next) => {
  try {
    const inventoryReport = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          lowStock: {
            $sum: {
              $cond: [{ $lt: ['$stock', 10] }, 1, 0]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$stock', 0] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      }
    ]);

    res.json(inventoryReport);
  } catch (error) {
    next(error);
  }
};

export const getCustomerReport = async (req, res, next) => {
  try {
    const customerReport = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          blockedCustomers: {
            $sum: {
              $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(customerReport);
  } catch (error) {
    next(error);
  }
};

export const getOrderReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {
      ...(startDate && endDate && {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
    };

    const orderReport = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    res.json(orderReport);
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req, res, next) => {
  try {
    const { type, format } = req.params;
    let data;
    
    switch (type) {
      case 'sales':
        data = await getSalesReport(req, res, next);
        break;
      case 'inventory':
        data = await getInventoryReport(req, res, next);
        break;
      case 'customers':
        data = await getCustomerReport(req, res, next);
        break;
      case 'orders':
        data = await getOrderReport(req, res, next);
        break;
      default:
        throw createError(400, 'Invalid report type');
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);

    // Convert data to CSV and send
    // Note: You might want to use a library like csv-stringify for proper CSV conversion
    res.send(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Invite a new admin
// @route   POST /api/admin/invite
// @access  Private (Admin only)
export const inviteAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { email, name, role } = req.body;

    // Validate role
    if (role && role !== 'admin') {
      throw createError(400, 'Invalid role. Only admin role can be assigned through invitation');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw createError(400, 'User with this email already exists');
    }

    // Check if invitation already exists and is pending
    const existingInvitation = await AdminInvitation.findOne({
      email: email.toLowerCase(),
      status: 'pending'
    });
    if (existingInvitation) {
      throw createError(400, 'An invitation for this email already exists');
    }

    // Check rate limiting (max 5 invitations per 24 hours)
    const recentInvitations = await AdminInvitation.countDocuments({
      invitedBy: req.user._id,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    if (recentInvitations >= 5) {
      throw createError(429, 'Too many invitations sent in the last 24 hours');
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    // Create invitation
    const invitation = await AdminInvitation.create({
      email: email.toLowerCase(),
      name,
      role: 'admin', // Force role to be admin
      tempPassword,
      invitedBy: req.user._id
    });

    // Send invitation email
    await sendAdminInvitationEmail(email, name, invitation.token, tempPassword);

    res.status(201).json({
      status: 'success',
      message: 'Admin invitation sent successfully',
      data: {
        invitation: {
          email: invitation.email,
          name: invitation.name,
          role: invitation.role,
          expiresAt: invitation.expiresAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Accept admin invitation
// @route   POST /api/admin/accept-invitation
// @access  Public
export const acceptInvitation = asyncHandler(async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const invitation = await AdminInvitation.findOne({ token });
    if (!invitation) {
      throw createError(404, 'Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw createError(400, 'Invitation has already been used or expired');
    }

    if (invitation.isExpired()) {
      invitation.status = 'expired';
      await invitation.save();
      throw createError(400, 'Invitation has expired');
    }

    // Create new admin user
    const admin = await User.create({
      email: invitation.email,
      name: invitation.name,
      password,
      role: invitation.role,
      isEmailVerified: true
    });

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({
      status: 'success',
      message: 'Admin account created successfully',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify admin invitation token
// @route   GET /api/admin/verify-invitation/:token
// @access  Public
export const verifyInvitation = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req.params;

    console.log('verifyInvitation: Token:', token);

    // First check if this is an initial admin verification
    const initialAdmin = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() },
      role: 'super_admin'
    });

    console.log('verifyInvitation: Initial admin:', initialAdmin);

    if (initialAdmin) {
      // If already verified, return success
      if (initialAdmin.isEmailVerified) {
        return res.status(200).json({
          status: 'success',
          data: {
            invitation: {
              email: initialAdmin.email,
              name: initialAdmin.name,
              role: initialAdmin.role,
              type: 'super_admin',
              expiresAt: initialAdmin.emailVerificationExpire
            }
          }
        });
      }

      // Update the user's role to super_admin and mark as verified
      initialAdmin.role = 'super_admin';
      initialAdmin.isEmailVerified = true;
      initialAdmin.emailVerificationToken = undefined;
      initialAdmin.emailVerificationExpire = undefined;
      await initialAdmin.save();

      return res.status(200).json({
        status: 'success',
        data: {
          invitation: {
            email: initialAdmin.email,
            name: initialAdmin.name,
            role: initialAdmin.role,
            type: 'super_admin',
            expiresAt: initialAdmin.emailVerificationExpire
          }
        }
      });
    }

    // Check for regular admin invitation
    const invitation = await AdminInvitation.findOne({ token });
    if (!invitation) {
      throw createError(404, 'Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw createError(400, 'Invitation has already been used or expired');
    }

    if (invitation.isExpired()) {
      invitation.status = 'expired';
      await invitation.save();
      throw createError(400, 'Invitation has expired');
    }

    // Return invitation details
    res.status(200).json({
      status: 'success',
      data: {
        invitation: {
          email: invitation.email,
          name: invitation.name,
          role: invitation.role,
          type: 'invited_admin',
          expiresAt: invitation.expiresAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all admin invitations
// @route   GET /api/admin/invitations
// @access  Private (Admin only)
export const getAdminInvitations = asyncHandler(async (req, res, next) => {
  try {
    const invitations = await AdminInvitation.find()
      .populate('invitedBy', 'name email')
      .sort('-createdAt');

    res.json(invitations);
  } catch (error) {
    next(error);
  }
});

// @desc    Resend admin invitation
// @route   POST /api/admin/invitations/:id/resend
// @access  Private (Admin only)
export const resendInvitation = asyncHandler(async (req, res, next) => {
  try {
    const invitation = await AdminInvitation.findById(req.params.id);
    
    if (!invitation) {
      throw createError(404, 'Invitation not found');
    }
    
    if (invitation.status !== 'pending') {
      throw createError(400, 'Cannot resend invitation that is not pending');
    }
    
    // Update expiration date
    invitation.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await invitation.save();
    
    // Resend invitation email
    await sendAdminInvitationEmail(
      invitation.email, 
      invitation.name, 
      invitation.token, 
      invitation.tempPassword
    );
    
    res.json(invitation);
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel admin invitation
// @route   DELETE /api/admin/invitations/:id
// @access  Private (Admin only)
export const cancelInvitation = asyncHandler(async (req, res, next) => {
  try {
    const invitation = await AdminInvitation.findById(req.params.id);
    
    if (!invitation) {
      throw createError(404, 'Invitation not found');
    }
    
    if (invitation.status !== 'pending') {
      throw createError(400, 'Cannot cancel invitation that is not pending');
    }
    
    await invitation.remove();
    
    res.json({ message: 'Invitation cancelled successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

// @desc    Lock user account
// @route   POST /api/admin/lock-account
// @access  Private (Admin only)
export const lockAccount = asyncHandler(async (req, res, next) => {
  try {
    const { userId, reason, durationMinutes } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, 'User not found');
    }
    
    await user.lockAccount(reason, durationMinutes);
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @desc    Unlock user account
// @route   POST /api/admin/unlock-account
// @access  Private (Admin only)
export const unlockAccount = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, 'User not found');
    }
    
    await user.unlockAccount();
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @desc    Get all admin users
// @route   GET /api/admin/admins
// @access  Private (Admin only)
export const getAdmins = asyncHandler(async (req, res, next) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } })
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        admins
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update admin role
// @route   PUT /api/admin/admins/:adminId
// @access  Private (Admin only)
export const updateAdminRole = asyncHandler(async (req, res, next) => {
  try {
    const { role } = req.body;
    const adminId = req.params.id;

    if (!['admin', 'super_admin'].includes(role)) {
      throw createError(400, 'Invalid role');
    }

    const admin = await User.findById(adminId);
    if (!admin) {
      throw createError(404, 'Admin not found');
    }

    if (admin.role === 'super_admin' && req.user.role !== 'super_admin') {
      throw createError(403, 'Only super admins can modify super admin roles');
    }

    admin.role = role;
    await admin.save();

    res.status(200).json({
      status: 'success',
      message: 'Admin role updated successfully',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove admin
// @route   DELETE /api/admin/admins/:adminId
// @access  Private (Admin only)
export const removeAdmin = asyncHandler(async (req, res, next) => {
  try {
    const adminId = req.params.id;

    const admin = await User.findById(adminId);
    if (!admin) {
      throw createError(404, 'Admin not found');
    }

    if (admin.role === 'super_admin' && req.user.role !== 'super_admin') {
      throw createError(403, 'Only super admins can remove super admins');
    }

    await admin.remove();

    res.status(200).json({
      status: 'success',
      message: 'Admin removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin only)
export const updateAdminProfile = asyncHandler(async (req, res, next) => {
  const { name, currentPassword, newPassword } = req.body;

  const admin = await User.findById(req.user._id).select('+password');

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  // Update name if provided
  if (name) {
    admin.name = name;
  }

  // Update password if provided
  if (currentPassword && newPassword) {
    // Check current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    admin.password = newPassword;
  }

  await admin.save();

  res.json({
    message: 'Admin profile updated successfully',
    user: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
});

// @desc    Cleanup expired invitations
// @route   POST /api/admin/cleanup-invitations
// @access  Private (Admin only)
export const cleanupExpiredInvitations = asyncHandler(async (req, res, next) => {
  try {
    // Update expired invitations
    const updateResult = await AdminInvitation.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      {
        $set: { status: 'expired' }
      }
    );

    // Delete old expired invitations
    const deleteResult = await AdminInvitation.deleteMany({
      status: 'expired',
      updatedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      status: 'success',
      message: 'Invitations cleaned up successfully',
      data: {
        expired: updateResult.modifiedCount,
        deleted: deleteResult.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create admin user (super admin only)
// @route   POST /api/admin/create-admin-user
// @access  Private (Super Admin only)
export const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Name, email, password, and role are required');
  }

  // Validate role
  if (!['admin', 'moderator'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Only admin and moderator roles can be created');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Create new admin user
  const user = new User({
    name,
    email,
    password,
    role,
    status: 'active',
    isEmailVerified: true
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: `${role} user created successfully`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified
    }
  });
});

// @desc    Update user role (super admin only)
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Super Admin only)
export const adminUpdateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate role
  if (!['user', 'admin', 'moderator'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent changing super admin role
  if (user.role === 'super_admin') {
    res.status(403);
    throw new Error('Cannot change super admin role');
  }

  // Prevent non-super admin from creating super admin
  if (role === 'super_admin') {
    res.status(403);
    throw new Error('Cannot assign super admin role');
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: 'User role updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });
});