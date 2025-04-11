import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAPI } from '../../utils/api';

// User payment thunks
export const getPaymentMethods = createAsyncThunk(
  'payment/getMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getMethods();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch payment methods');
    }
  }
);

export const initializePayment = createAsyncThunk(
  'payment/initialize',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.initialize(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to initialize payment');
    }
  }
);

export const retryPayment = createAsyncThunk(
  'payment/retry',
  async ({ orderId, method, ...paymentData }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.retry({
        orderId,
        method,
        ...paymentData,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to retry payment' });
    }
  }
);

export const checkPaymentStatus = createAsyncThunk(
  'payment/checkStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.checkStatus(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to check payment status');
    }
  }
);

export const getPaymentHistory = createAsyncThunk(
  'payment/getHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getHistory();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to get payment history' });
    }
  }
);

export const getPaymentDetails = createAsyncThunk(
  'payment/getDetails',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getDetails(paymentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to get payment details' });
    }
  }
);

// Admin payment thunks
export const getPaymentAnalytics = createAsyncThunk(
  'payment/getAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch payment analytics');
    }
  }
);

export const processRefund = createAsyncThunk(
  'payment/refund',
  async ({ paymentId, reason }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.refund(paymentId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to process refund');
    }
  }
);

export const getRefundHistory = createAsyncThunk(
  'payment/getRefundHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getRefundHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch refund history');
    }
  }
);

export const getPaymentSettings = createAsyncThunk(
  'payment/getSettings',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if user is admin
      const { auth } = getState();
      if (auth.user?.role !== 'admin') {
        return rejectWithValue({ message: 'Unauthorized: Admin access required' });
      }
      
      const response = await paymentAPI.getSettings();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to get payment settings' });
    }
  }
);

export const updatePaymentSettings = createAsyncThunk(
  'payment/updateSettings',
  async (settings, { rejectWithValue, getState }) => {
    try {
      // Check if user is admin
      const { auth } = getState();
      if (auth.user?.role !== 'admin') {
        return rejectWithValue({ message: 'Unauthorized: Admin access required' });
      }
      
      const response = await paymentAPI.updateSettings(settings);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update payment settings' });
    }
  }
);

const initialState = {
  methods: [],
  currentPayment: null,
  paymentHistory: [],
  paymentDetails: null,
  analytics: null,
  refundHistory: [],
  settings: null,
  loading: false,
  error: null,
  environment: null,
  isAdmin: false, // Track if current user is admin
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    setPaymentError: (state, action) => {
      state.error = action.payload;
    },
    clearPaymentError: (state) => {
      state.error = null;
    },
    setAdminStatus: (state, action) => {
      state.isAdmin = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Payment Methods
      .addCase(getPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.methods = action.payload;
      })
      .addCase(getPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get payment methods';
      })
      // Initialize Payment
      .addCase(initializePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to initialize payment';
      })
      // Retry Payment
      .addCase(retryPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(retryPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to retry payment';
      })
      // Check Payment Status
      .addCase(checkPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentPayment) {
          state.currentPayment.status = action.payload.status;
        }
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to check payment status';
      })
      // Get Payment History
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get payment history';
      })
      // Get Payment Details
      .addCase(getPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentDetails = action.payload;
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get payment details';
      })
      // Get Payment Analytics (Admin only)
      .addCase(getPaymentAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getPaymentAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get payment analytics';
      })
      // Refund Payment (Admin only)
      .addCase(processRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.loading = false;
        // Update payment details if it's the current payment
        if (state.paymentDetails && state.paymentDetails._id === action.payload.paymentId) {
          state.paymentDetails.status = 'refunded';
          state.paymentDetails.refundReason = action.payload.reason;
          state.paymentDetails.refundedAt = new Date().toISOString();
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to process refund';
      })
      // Get Refund History (Admin only)
      .addCase(getRefundHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRefundHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.refundHistory = action.payload;
      })
      .addCase(getRefundHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get refund history';
      })
      // Get Payment Settings (Admin only)
      .addCase(getPaymentSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(getPaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get payment settings';
      })
      // Update Payment Settings (Admin only)
      .addCase(updatePaymentSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updatePaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update payment settings';
      });
  },
});

export const { clearCurrentPayment, setPaymentError, clearPaymentError, setAdminStatus } = paymentSlice.actions;
export default paymentSlice.reducer; 