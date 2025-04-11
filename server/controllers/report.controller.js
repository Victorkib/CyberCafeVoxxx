import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import { handleAsync } from '../utils/errorHandler.js';

// Get sales report data
export const getSalesReport = handleAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalRevenue: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        status: { $ne: 'cancelled' }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $project: {
        name: '$productDetails.name',
        totalSold: 1,
        revenue: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      salesData,
      topProducts
    }
  });
});

// Get inventory report data
export const getInventoryReport = handleAsync(async (req, res) => {
  const stockLevels = await Product.aggregate([
    {
      $group: {
        _id: '$stockStatus',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
      }
    }
  ]);

  const lowStockItems = await Product.find({ stock: { $lt: 10 } })
    .select('name stock price category')
    .sort({ stock: 1 })
    .limit(10);

  res.status(200).json({
    status: 'success',
    data: {
      stockLevels,
      lowStockItems
    }
  });
});

// Get customer report data
export const getCustomerReport = handleAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const customerGrowth = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        role: 'customer'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const topCustomers = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        name: '$userDetails.name',
        email: '$userDetails.email',
        totalSpent: 1,
        orderCount: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      customerGrowth,
      topCustomers
    }
  });
});

// Get order report data
export const getOrderReport = handleAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const orderStatusDistribution = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const orderTrends = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      orderStatusDistribution,
      orderTrends
    }
  });
}); 