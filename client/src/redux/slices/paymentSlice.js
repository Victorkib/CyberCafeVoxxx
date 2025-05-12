import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAPI } from '../../utils/paymentAPI';
import { toast } from 'react-toastify';

// User payment thunks
export const getPaymentMethods = createAsyncThunk(
  'payment/getMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getMethods();
      return response.data.data; // Server returns { success: true, data: [...] }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch payment methods'
      );
      return rejectWithValue(
        error.response?.data || 'Failed to fetch payment methods'
      );
    }
  }
);

export const initializePayment = createAsyncThunk(
  'payment/initialize',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.initialize(paymentData);
      toast.success('Payment initialized successfully');
      return response.data.data; // Server returns { success: true, data: {...} }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to initialize payment'
      );
      return rejectWithValue(
        error.response?.data || 'Failed to initialize payment'
      );
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
      toast.success('Payment retry initiated');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to retry payment');
      return rejectWithValue(error.response?.data || 'Failed to retry payment');
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
      console.error('Error checking payment status:', error);
      return rejectWithValue(
        error.response?.data || 'Failed to check payment status'
      );
    }
  }
);

export const getPaymentHistory = createAsyncThunk(
  'payment/getHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getHistory(params);
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to get payment history'
      );
      return rejectWithValue(
        error.response?.data || 'Failed to get payment history'
      );
    }
  }
);

export const getPaymentDetails = createAsyncThunk(
  'payment/getDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getDetails(orderId);
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to get payment details'
      );
      return rejectWithValue(
        error.response?.data || 'Failed to get payment details'
      );
    }
  }
);

// Admin payment thunks
export const getPaymentAnalytics = createAsyncThunk(
  'payment/getAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getAnalytics(params);
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch payment analytics'
      );
      return rejectWithValue(
        error.response?.data || 'Failed to fetch payment analytics'
      );
    }
  }
);

export const processRefund = createAsyncThunk(
  'payment/refund',
  async ({ paymentId, reason }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.refund(paymentId, reason);
      toast.success('Refund processed successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process refund');
      return rejectWithValue(
        error.response?.data || 'Failed to process refund'
      );
    }
  }
);

export const getRefundHistory = createAsyncThunk(
  'payment/getRefundHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getRefundHistory(params);
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to get refund history'
      );
      return rejectWithValue(
        error.response?.data || 'Failed to get refund history'
      );
    }
  }
);

export const getPaymentSettings = createAsyncThunk(
  'payment/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getSettings();
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to get payment settings'
      );
      return rejectWithValue(
        error.response?.data || 'Failed to get payment settings'
      );
    }
  }
);

export const updatePaymentSettings = createAsyncThunk(
  'payment/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.updateSettings(settings);
      toast.success('Payment settings updated successfully');
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update payment settings'
      );
      return rejectWithValue(
        error.response?.data || 'Failed to update payment settings'
      );
    }
  }
);

const initialState = {
  methods: [],
  currentPayment: null,
  paymentHistory: [],
  refundHistory: [],
  analytics: null,
  settings: null,
  loading: false,
  error: null,
  status: 'idle',
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    resetPaymentState: (state) => {
      return initialState;
    },
    updatePaymentStatus: (state, action) => {
      if (state.currentPayment) {
        state.currentPayment.status = action.payload;
      }
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      })
      // Get Payment History
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload.payments;
        // If pagination is included in the response
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Payment Details
      .addCase(getPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Payment Analytics
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
        state.error = action.payload;
      })
      // Process Refund
      .addCase(processRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.loading = false;
        // Update payment history if needed
        const index = state.paymentHistory.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.paymentHistory[index] = action.payload;
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Refund History
      .addCase(getRefundHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRefundHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.refundHistory = action.payload.refunds;
        // If pagination is included in the response
        if (action.payload.pagination) {
          state.refundPagination = action.payload.pagination;
        }
      })
      .addCase(getRefundHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Payment Settings
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
        state.error = action.payload;
      })
      // Update Payment Settings
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
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, resetPaymentState, updatePaymentStatus } =
  paymentSlice.actions;
export default paymentSlice.reducer;
