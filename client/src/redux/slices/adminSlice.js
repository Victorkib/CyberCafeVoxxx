import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import * as adminApi from '../../utils/adminApi';
import { apiRequest } from '../../utils/api';
import axios from 'axios';

// Dashboard Statistics
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getDashboardStats();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

export const fetchSalesAnalytics = createAsyncThunk(
  'admin/fetchSalesAnalytics',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await adminApi.getSalesAnalytics(startDate, endDate);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales analytics');
    }
  }
);

export const fetchInventoryStats = createAsyncThunk(
  'admin/fetchInventoryStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getInventoryStats();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory statistics');
    }
  }
);

export const fetchCustomerStats = createAsyncThunk(
  'admin/fetchCustomerStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getCustomerStats();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer statistics');
    }
  }
);

// Product Management
export const fetchProducts = createAsyncThunk(
  'admin/fetchProducts',
  async ({ page, limit, sort, filter } = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllProducts(page, limit, sort, filter);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);


export const fetchProductById = createAsyncThunk(
  'admin/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.getProductById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await adminApi.createProduct(productData);
      toast.success('Product created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateProduct(id, productData);
      toast.success('Product updated successfully');
      return response.data || response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteProduct(id);
      toast.success('Product deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const updateProductStock = createAsyncThunk(
  'admin/updateProductStock',
  async ({ id, stock }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateProductStock(id, stock);
      toast.success('Product stock updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product stock');
      return rejectWithValue(error.response?.data?.message || 'Failed to update product stock');
    }
  }
);

export const updateProductStatus = createAsyncThunk(
  'admin/updateProductStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateProductStatus(id, status);
      toast.success('Product status updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update product status');
    }
  }
);

// Order Management
export const fetchOrders = createAsyncThunk(
  'admin/fetchOrders',
  async ({ page, limit, status }, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllOrders(page, limit, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'admin/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.getOrderById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateOrderStatus(id, status);
      toast.success('Order status updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const updateOrderTracking = createAsyncThunk(
  'admin/updateOrderTracking',
  async ({ id, trackingNumber, trackingCompany }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateOrderTracking(id, trackingNumber, trackingCompany);
      toast.success('Order tracking updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order tracking');
      return rejectWithValue(error.response?.data?.message || 'Failed to update order tracking');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'admin/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.cancelOrder(id);
      toast.success('Order cancelled successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const refundOrder = createAsyncThunk(
  'admin/refundOrder',
  async ({ id, amount, reason }, { rejectWithValue }) => {
    try {
      const response = await adminApi.refundOrder(id, amount, reason);
      toast.success('Order refunded successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to refund order');
      return rejectWithValue(error.response?.data?.message || 'Failed to refund order');
    }
  }
);

// Customer Management
export const fetchCustomers = createAsyncThunk(
  'admin/fetchCustomers',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllCustomers(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'admin/fetchCustomerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.getCustomerById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
    }
  }
);

export const updateCustomerStatus = createAsyncThunk(
  'admin/updateCustomerStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateCustomerStatus(id, status);
      toast.success('Customer status updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update customer status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer status');
    }
  }
);

export const blockCustomer = createAsyncThunk(
  'admin/blockCustomer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.blockCustomer(id);
      toast.success('Customer blocked successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to block customer');
      return rejectWithValue(error.response?.data?.message || 'Failed to block customer');
    }
  }
);

export const unblockCustomer = createAsyncThunk(
  'admin/unblockCustomer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.unblockCustomer(id);
      toast.success('Customer unblocked successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unblock customer');
      return rejectWithValue(error.response?.data?.message || 'Failed to unblock customer');
    }
  }
);

// User Management
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllUsers(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.getUserById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await adminApi.createUser(userData);
      toast.success('User created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateUser(id, userData);
      toast.success('User updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateUserRole(id, role);
      toast.success('User role updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateUserStatus(id, status);
      toast.success('User status updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

// Admin Invitation Management
export const inviteAdmin = createAsyncThunk("admin/inviteAdmin", async (inviteData, { rejectWithValue }) => {
  try {
    const response = await adminApi.inviteAdmin(inviteData)
    toast.success("Admin invitation sent successfully")
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to send invitation")
    return rejectWithValue(error.response?.data?.message || "Failed to send invitation")
  }
})

export const fetchAdminInvitations = createAsyncThunk("admin/fetchAdminInvitations", async (_, { rejectWithValue }) => {
  try {
    const response = await adminApi.fetchAdminInvitations()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch invitations")
  }
})

export const resendInvitation = createAsyncThunk("admin/resendInvitation", async (id, { rejectWithValue }) => {
  try {
    const response = await adminApi.resendInvitation(id)
    toast.success("Invitation resent successfully")
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to resend invitation")
    return rejectWithValue(error.response?.data?.message || "Failed to resend invitation")
  }
})

export const cancelInvitation = createAsyncThunk("admin/cancelInvitation", async (id, { rejectWithValue }) => {
  try {
    await adminApi.cancelInvitation(id)
    toast.success("Invitation cancelled successfully")
    return id
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to cancel invitation")
    return rejectWithValue(error.response?.data?.message || "Failed to cancel invitation")
  }
})

export const lockAccount = createAsyncThunk("admin/lockAccount", async (lockData, { rejectWithValue }) => {
  try {
    const response = await adminApi.lockAccount(lockData)
    toast.success("Account locked successfully")
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to lock account")
    return rejectWithValue(error.response?.data?.message || "Failed to lock account")
  }
})

export const unlockAccount = createAsyncThunk("admin/unlockAccount", async (unlockData, { rejectWithValue }) => {
  try {
    const response = await adminApi.unlockAccount(unlockData)
    toast.success("Account unlocked successfully")
    return response.data
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to unlock account")
    return rejectWithValue(error.response?.data?.message || "Failed to unlock account")
  }
})

// Category Management
export const fetchCategories = createAsyncThunk(
  'admin/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAllCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'admin/fetchCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.getCategoryById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category');
    }
  }
);

export const createCategory = createAsyncThunk(
  'admin/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await adminApi.createCategory(categoryData);
      toast.success('Category created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'admin/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateCategory(id, categoryData);
      toast.success('Category updated successfully');
      return response.data || response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'admin/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteCategory(id);
      toast.success('Category deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// Settings Management
export const fetchSettings = createAsyncThunk(
  'admin/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateGeneralSettings = createAsyncThunk(
  'admin/updateGeneralSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateGeneralSettings(settings);
      toast.success('General settings updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update general settings');
      return rejectWithValue(error.response?.data?.message || 'Failed to update general settings');
    }
  }
);

export const updatePaymentSettings = createAsyncThunk(
  'admin/updatePaymentSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminApi.updatePaymentSettings(settings);
      toast.success('Payment settings updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment settings');
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment settings');
    }
  }
);

export const updateShippingSettings = createAsyncThunk(
  'admin/updateShippingSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateShippingSettings(settings);
      toast.success('Shipping settings updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update shipping settings');
      return rejectWithValue(error.response?.data?.message || 'Failed to update shipping settings');
    }
  }
);

export const updateEmailSettings = createAsyncThunk(
  'admin/updateEmailSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateEmailSettings(settings);
      toast.success('Email settings updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update email settings');
      return rejectWithValue(error.response?.data?.message || 'Failed to update email settings');
    }
  }
);

// Reports
export const fetchSalesReport = createAsyncThunk(
  'admin/fetchSalesReport',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await adminApi.getSalesReport(startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales report');
    }
  }
);

export const fetchInventoryReport = createAsyncThunk(
  'admin/fetchInventoryReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getInventoryReport();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory report');
    }
  }
);

export const fetchCustomerReport = createAsyncThunk(
  'admin/fetchCustomerReport',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await adminApi.getCustomerReport(startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer report');
    }
  }
);

export const fetchOrderReport = createAsyncThunk(
  'admin/fetchOrderReport',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await adminApi.getOrderReport(startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order report');
    }
  }
);

export const exportReport = createAsyncThunk(
  'admin/exportReport',
  async ({ type, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await adminApi.exportReport(type, startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export report');
    }
  }
);

// Admin Invitation Management
export const verifyAdminInvitation = createAsyncThunk(
  'admin/verifyInvitation',
  async (token, { rejectWithValue }) => {
    console.log('adminSlice: verifyAdminInvitation called with token:', token);
    try {
      console.log('adminSlice: Making API request to verify invitation');
      const response = await adminApi.verifyInvitation(token);
      console.log('adminSlice: API response received:', response);
      return response.data;
    } catch (error) {
      console.error('adminSlice: Error in verifyAdminInvitation:', error);
      return rejectWithValue(error.response?.data || {
        message: 'Invalid or expired invitation',
        type: error.response?.status === 400 ? 'EXPIRED' : 'ERROR'
      });
    }
  }
);

export const acceptAdminInvitation = createAsyncThunk(
  'admin/acceptInvitation',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await adminApi.acceptInvitation({ token, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || {
        message: 'Failed to accept invitation',
        type: 'ERROR'
      });
    }
  }
);

// Async thunks
export const cleanupExpiredInvitations = createAsyncThunk(
  'admin/cleanupExpiredInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/admin/cleanup-invitations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cleanup invitations');
    }
  }
);

// Bulk Product Operations
export const bulkDeleteProducts = createAsyncThunk(
  'admin/bulkDeleteProducts',
  async (productIds, { rejectWithValue }) => {
    try {
      const response = await adminApi.bulkDeleteProducts(productIds);
      toast.success('Products deleted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete products');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete products');
    }
  }
);

export const bulkUpdateProductStatus = createAsyncThunk(
  'admin/bulkUpdateProductStatus',
  async ({ ids, status, ...otherUpdates }, { rejectWithValue }) => {
    try {
      const response = await adminApi.bulkUpdateProductStatus({ ids, status, ...otherUpdates });
      toast.success(`${ids.length} products updated successfully`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product statuses');
      return rejectWithValue(error.response?.data?.message || 'Failed to update product statuses');
    }
  }
);

const initialState = {
  // Dashboard
  dashboardStats: null,
  salesAnalytics: null,
  inventoryStats: null,
  customerStats: null,
  
  // Products
  products: [],
  totalProducts: 0,
  currentProduct: null,
  currentPage: 1,
  totalPages: 1,
  
  // Orders
  orders: [],
  totalOrders: 0,
  currentOrder: null,
  
  // Customers
  customers: [],
  totalCustomers: 0,
  currentCustomer: null,
  
  // Users
  users: [],
  totalUsers: 0,
  currentUser: null,
  invitations: [],
  
  // Categories
  categories: [],
  currentCategory: null,
  
  // Settings
  settings: null,
  
  // Reports
  salesReport: null,
  inventoryReport: null,
  customerReport: null,
  orderReport: null,
  
  // UI State
  loading: false,
  error: null,
  invitation: null,
  success: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearAdminState: (state) => {
      state.invitation = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Sales Analytics
      .addCase(fetchSalesAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.salesAnalytics = action.payload;
      })
      .addCase(fetchSalesAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Inventory Stats
      .addCase(fetchInventoryStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryStats = action.payload;
      })
      .addCase(fetchInventoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Customer Stats
      .addCase(fetchCustomerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.customerStats = action.payload;
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
    })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.totalProducts += 1;
      })
      
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(product => product._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct && state.currentProduct._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      })
      
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(product => product._id !== action.payload);
        state.totalProducts -= 1;
        if (state.currentProduct && state.currentProduct._id === action.payload) {
          state.currentProduct = null;
        }
      })
      
      // Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.totalPages * action.payload.currentPage;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      
      .addCase(updateOrderTracking.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      
      .addCase(refundOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      
      // Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers;
        state.totalCustomers = action.payload.totalPages * action.payload.currentPage;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateCustomerStatus.fulfilled, (state, action) => {
        const index = state.customers.findIndex(customer => customer._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer && state.currentCustomer._id === action.payload._id) {
          state.currentCustomer = action.payload;
        }
      })
      
      .addCase(blockCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(customer => customer._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer && state.currentCustomer._id === action.payload._id) {
          state.currentCustomer = action.payload;
        }
      })
      
      .addCase(unblockCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(customer => customer._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer && state.currentCustomer._id === action.payload._id) {
          state.currentCustomer = action.payload;
        }
      })
      
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.totalPages * action.payload.currentPage;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
        state.totalUsers += 1;
      })
      
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })
      
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
        state.totalUsers -= 1;
        if (state.currentUser && state.currentUser._id === action.payload) {
          state.currentUser = null;
        }
      })
      
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })
      
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })

      //users admin
        .addCase(fetchAdminInvitations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminInvitations.fulfilled, (state, action) => {
        state.loading = false
        state.invitations = action.payload
      })
      .addCase(fetchAdminInvitations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(inviteAdmin.fulfilled, (state, action) => {
        if (action.payload) {
          state.invitations.unshift(action.payload)
        }
      })

      .addCase(resendInvitation.fulfilled, (state, action) => {
        const index = state.invitations.findIndex((invitation) => invitation._id === action.payload._id)
        if (index !== -1) {
          state.invitations[index] = action.payload
        }
      })

      .addCase(cancelInvitation.fulfilled, (state, action) => {
        state.invitations = state.invitations.filter((invitation) => invitation._id !== action.payload)
      })

      .addCase(lockAccount.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })

      .addCase(unlockAccount.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(category => category._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.currentCategory && state.currentCategory._id === action.payload._id) {
          state.currentCategory = action.payload;
        }
      })
      
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(category => category._id !== action.payload);
        if (state.currentCategory && state.currentCategory._id === action.payload) {
          state.currentCategory = null;
        }
      })
      
      // Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateGeneralSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      
      .addCase(updateShippingSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      
      .addCase(updateEmailSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      
      // Reports
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.salesReport = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchInventoryReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryReport.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryReport = action.payload;
      })
      .addCase(fetchInventoryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchCustomerReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerReport.fulfilled, (state, action) => {
        state.loading = false;
        state.customerReport = action.payload;
      })
      .addCase(fetchCustomerReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchOrderReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderReport.fulfilled, (state, action) => {
        state.loading = false;
        state.orderReport = action.payload;
      })
      .addCase(fetchOrderReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Accept Invitation
      .addCase(acceptAdminInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptAdminInvitation.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(acceptAdminInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Verify Invitation
      .addCase(verifyAdminInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyAdminInvitation.fulfilled, (state, action) => {
        state.loading = false;
        state.invitation = action.payload?.data?.invitation || null;
        state.error = null;
      })
      .addCase(verifyAdminInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.invitation = null;
      })
      // Cleanup Expired Invitations
      .addCase(cleanupExpiredInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cleanupExpiredInvitations.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(cleanupExpiredInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const {
  clearError,
  clearCurrentProduct,
  clearCurrentOrder,
  clearCurrentCustomer,
  clearCurrentUser,
  clearCurrentCategory,
  clearAdminState
} = adminSlice.actions;

export default adminSlice.reducer; 
