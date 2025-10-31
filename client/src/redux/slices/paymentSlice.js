import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import paymentAPI from '../../utils/paymentAPI';

const NODE_ENV = import.meta.env.VITE_NODE_ENV || 'development';

// Async thunks
export const getPaymentMethods = createAsyncThunk(
  'payment/getMethods',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🌐 Redux: Fetching payment methods');
      const response = await paymentAPI.getMethods();
      const data = response.data?.data || response.data || [];
      console.log('✅ Redux: Payment methods fetched:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Redux: Failed to fetch payment methods:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch payment methods'
      );
    }
  }
);

export const initializePayment = createAsyncThunk(
  'payment/initialize',
  async (paymentData, { rejectWithValue }) => {
    try {
      console.log('🚀 Redux: Initializing payment with data:', paymentData);
      const response = await paymentAPI.initialize(paymentData);

      // Method-specific success messages
      const handleAsyncSuccess = (message, method = null) => {
        if (method) {
          switch (method) {
            case 'mpesa':
              toast.success('M-Pesa payment request sent. Check your phone.');
              break;
            case 'paystack':
              toast.success('Processing Paystack payment...');
              break;
            case 'paypal':
              toast.success('Redirecting to PayPal...');
              break;
            default:
              toast.success(message);
          }
        } else {
          toast.success(message);
        }
      };

      handleAsyncSuccess(
        'Payment initialized successfully',
        paymentData.method
      );

      const result = response.data?.data || response.data;
      console.log('✅ Redux: Payment initialized successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Redux: Payment initialization failed:', error);
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to initialize payment')
      );
    }
  }
);

// FIXED: Enhanced inline callback processing
export const processInlineCallback = createAsyncThunk(
  'payment/processInlineCallback',
  async (callbackData, { rejectWithValue }) => {
    try {
      console.log(
        '🔄 Redux: Processing inline callback with data:',
        callbackData
      );
      const response = await paymentAPI.processInlineCallback(callbackData);

      if (response.data?.success) {
        toast.success(
          'Payment completed successfully! Stock has been updated.'
        );
        console.log('✅ Redux: Inline callback processed - stock reduced');
      }

      const result = response.data?.data || response.data;
      console.log('✅ Redux: Inline callback processed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Redux: Inline callback processing failed:', error);
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to process payment callback')
      );
    }
  }
);

// FIXED: Enhanced inline payment verification
export const verifyInlinePayment = createAsyncThunk(
  'payment/verifyInlinePayment',
  async ({ reference, orderId }, { rejectWithValue }) => {
    try {
      console.log('🔍 Redux: Verifying inline payment:', {
        reference,
        orderId,
      });
      const response = await paymentAPI.verifyInlinePayment({
        reference,
        orderId,
      });

      if (response.data?.verified) {
        toast.success('Payment verified successfully! Stock has been updated.');
        console.log('✅ Redux: Payment verified - stock reduced');
      }

      const result = response.data?.data || response.data;
      console.log('✅ Redux: Payment verification completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Redux: Payment verification failed:', error);
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to verify payment')
      );
    }
  }
);

export const retryPayment = createAsyncThunk(
  'payment/retry',
  async (
    { orderId, method, phoneNumber, email, attempt = 1 },
    { rejectWithValue, getState }
  ) => {
    try {
      console.log('🔄 Redux: Retrying payment:', { orderId, method, attempt });
      const response = await paymentAPI.retry({
        orderId,
        method,
        phoneNumber,
        email,
      });

      toast.success(`Payment retry attempt ${attempt} initiated successfully`);

      const result = {
        ...(response.data?.data || response.data),
        attempt,
        retryTimestamp: new Date().toISOString(),
      };
      console.log('✅ Redux: Payment retry initiated:', result);
      return result;
    } catch (error) {
      console.error('❌ Redux: Payment retry failed:', error);
      const state = getState();
      const maxRetries = state.payment.maxRetryAttempts;
      const errorMessage =
        error.response?.data?.message || 'Failed to retry payment';

      if (attempt >= maxRetries) {
        toast.error('Maximum retry attempts reached. Please contact support.');
      } else {
        toast.error(
          `${errorMessage}. You can try ${maxRetries - attempt} more time(s).`
        );
      }

      return rejectWithValue({
        ...(error.response?.data || { message: errorMessage }),
        attempt,
        maxRetriesReached: attempt >= maxRetries,
      });
    }
  }
);

export const checkPaymentStatus = createAsyncThunk(
  'payment/checkStatus',
  async (orderId, { rejectWithValue, getState }) => {
    try {
      console.log('📊 Redux: Checking payment status for order:', orderId);
      const response = await paymentAPI.checkStatus(orderId);

      if (NODE_ENV === 'development') {
        console.log('✅ Redux: Payment status checked:', response.data);
      }

      const result = response.data?.data || response.data;

      // Log if payment was successful and stock should be reduced
      if (
        result.paymentStatus === 'paid' ||
        result.paymentDetails?.status === 'paid'
      ) {
        console.log(
          '✅ Redux: Payment confirmed as successful - stock should be reduced'
        );
      }

      return result;
    } catch (error) {
      console.error('❌ Redux: Error checking payment status:', error);
      return rejectWithValue(
        error.response?.data || { message: 'Failed to check payment status' }
      );
    }
  }
);

export const getPaymentHistory = createAsyncThunk(
  'payment/getHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getHistory(params);
      return response.data?.data || response.data;
    } catch (error) {
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to get payment history')
      );
    }
  }
);

export const getPaymentDetails = createAsyncThunk(
  'payment/getDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getDetails(orderId);
      return response.data?.data || response.data;
    } catch (error) {
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to get payment details')
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
      return response.data?.data || response.data;
    } catch (error) {
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to fetch payment analytics')
      );
    }
  }
);

export const processRefund = createAsyncThunk(
  'payment/refund',
  async ({ paymentId, reason }, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux: Processing refund:', { paymentId, reason });
      const response = await paymentAPI.refund(paymentId, reason);
      toast.success('Refund processed successfully. Stock has been restored.');
      console.log('✅ Redux: Refund processed - stock restored');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Redux: Refund processing failed:', error);
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to process refund')
      );
    }
  }
);

export const getRefundHistory = createAsyncThunk(
  'payment/getRefundHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getRefundHistory(params);
      return response.data?.data || response.data;
    } catch (error) {
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to get refund history')
      );
    }
  }
);

export const getPaymentSettings = createAsyncThunk(
  'payment/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getSettings();
      return response.data?.data || response.data;
    } catch (error) {
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to get payment settings')
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
      return response.data?.data || response.data;
    } catch (error) {
      const handleAsyncError = (error, defaultMessage) => {
        const message =
          error.response?.data?.message || error.message || defaultMessage;
        toast.error(message);
        return error.response?.data || { message };
      };
      return rejectWithValue(
        handleAsyncError(error, 'Failed to update payment settings')
      );
    }
  }
);

// Initial state
const initialState = {
  methods: [],
  selectedMethod: null,
  methodsLoading: false,
  methodsCacheTime: null,
  currentPayment: null,
  paymentHistory: [],
  refundHistory: [],
  analytics: null,
  settings: null,
  settingsCacheTime: null,
  loading: false,
  initializingPayment: false,
  checkingStatus: false,
  retryingPayment: false,
  processingRefund: false,
  processingInlineCallback: false,
  verifyingInlinePayment: false,
  inlineCheckoutActive: false,
  stockReductionProcessed: false,
  error: null,
  status: 'idle',
  retryAttempts: 0,
  maxRetryAttempts: 3,
  retryHistory: [],
  pagination: null,
  refundPagination: null,
  lastStatusCheck: null,
  statusCheckInterval: null,
  showRetryButton: false,
  paymentInProgress: false,
  inlineCheckoutData: null,
  inlineCheckoutError: null,
  lastStockReductionTimestamp: null,
};

// Payment slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
      state.inlineCheckoutError = null;
    },
    resetPaymentState: (state) => {
      const preservedData = {
        methods: state.methods,
        methodsCacheTime: state.methodsCacheTime,
        settings: state.settings,
        settingsCacheTime: state.settingsCacheTime,
      };
      Object.assign(state, initialState, preservedData);
    },
    updatePaymentStatus: (state, action) => {
      if (state.currentPayment) {
        state.currentPayment.status = action.payload;
        state.lastStatusCheck = new Date().toISOString();
        if (action.payload === 'paid' && !state.stockReductionProcessed) {
          state.stockReductionProcessed = true;
          state.lastStockReductionTimestamp = new Date().toISOString();
          console.log('✅ Redux: Stock reduction marked as processed');
        }
      }
    },
    incrementRetryAttempt: (state) => {
      state.retryAttempts = Math.min(
        state.retryAttempts + 1,
        state.maxRetryAttempts
      );
      state.showRetryButton = state.retryAttempts < state.maxRetryAttempts;
    },
    resetRetryAttempts: (state) => {
      state.retryAttempts = 0;
      state.retryHistory = [];
      state.showRetryButton = false;
    },
    setSelectedPaymentMethod: (state, action) => {
      state.selectedMethod = action.payload;
    },
    setPaymentInProgress: (state, action) => {
      state.paymentInProgress = action.payload;
      if (!action.payload) {
        state.initializingPayment = false;
        state.retryingPayment = false;
        state.inlineCheckoutActive = false;
      }
    },
    setInlineCheckoutActive: (state, action) => {
      state.inlineCheckoutActive = action.payload;
      if (action.payload) {
        state.paymentInProgress = true;
        state.stockReductionProcessed = false;
      }
    },
    setInlineCheckoutData: (state, action) => {
      state.inlineCheckoutData = action.payload;
    },
    clearInlineCheckoutData: (state) => {
      state.inlineCheckoutData = null;
      state.inlineCheckoutError = null;
      state.inlineCheckoutActive = false;
    },
    markStockReductionProcessed: (state) => {
      state.stockReductionProcessed = true;
      state.lastStockReductionTimestamp = new Date().toISOString();
      console.log('✅ Redux: Stock reduction manually marked as processed');
    },
    resetStockReductionFlag: (state) => {
      state.stockReductionProcessed = false;
      state.lastStockReductionTimestamp = null;
    },
    setStatusCheckInterval: (state, action) => {
      state.statusCheckInterval = action.payload;
    },
    clearStatusCheckInterval: (state) => {
      if (state.statusCheckInterval) {
        clearInterval(state.statusCheckInterval);
        state.statusCheckInterval = null;
      }
    },
    addRetryToHistory: (state, action) => {
      state.retryHistory.push({
        attempt: action.payload.attempt,
        timestamp: new Date().toISOString(),
        method: action.payload.method,
        status: action.payload.status || 'initiated',
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentMethods.pending, (state) => {
        state.methodsLoading = true;
        state.error = null;
      })
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.methodsLoading = false;
        state.methods = action.payload;
        state.methodsCacheTime = new Date().toISOString();
        if (state.methods.length > 0 && !state.selectedMethod) {
          state.selectedMethod = state.methods[0].id;
        }
      })
      .addCase(getPaymentMethods.rejected, (state, action) => {
        state.methodsLoading = false;
        state.error = action.payload;
        state.methods = [];
      })
      .addCase(initializePayment.pending, (state) => {
        state.initializingPayment = true;
        state.paymentInProgress = true;
        state.error = null;
        state.stockReductionProcessed = false;
      })
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.initializingPayment = false;
        state.currentPayment = action.payload;
        state.retryAttempts = 0;
        state.showRetryButton = false;
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.initializingPayment = false;
        state.paymentInProgress = false;
        state.error = action.payload;
        state.showRetryButton = true;
      })
      .addCase(processInlineCallback.pending, (state) => {
        state.processingInlineCallback = true;
        state.inlineCheckoutError = null;
        console.log('🔄 Redux state: Processing inline callback...');
      })
      .addCase(processInlineCallback.fulfilled, (state, action) => {
        state.processingInlineCallback = false;
        state.currentPayment = action.payload;
        state.inlineCheckoutActive = false;
        state.paymentInProgress = false;
        if (action.payload.status === 'paid') {
          state.showRetryButton = false;
          state.retryAttempts = 0;
          state.stockReductionProcessed = true;
          state.lastStockReductionTimestamp = new Date().toISOString();
          console.log(
            '✅ Redux state: Stock reduction processed via inline callback'
          );
        }
      })
      .addCase(processInlineCallback.rejected, (state, action) => {
        state.processingInlineCallback = false;
        state.inlineCheckoutError = action.payload;
        state.inlineCheckoutActive = false;
        state.paymentInProgress = false;
        state.showRetryButton = true;
        console.error('❌ Redux state: Inline callback processing failed');
      })
      .addCase(verifyInlinePayment.pending, (state) => {
        state.verifyingInlinePayment = true;
        state.inlineCheckoutError = null;
        console.log('🔍 Redux state: Verifying inline payment...');
      })
      .addCase(verifyInlinePayment.fulfilled, (state, action) => {
        state.verifyingInlinePayment = false;
        if (action.payload.verified) {
          state.currentPayment = action.payload.payment;
          state.paymentInProgress = false;
          state.inlineCheckoutActive = false;
          state.showRetryButton = false;
          state.retryAttempts = 0;
          state.stockReductionProcessed = true;
          state.lastStockReductionTimestamp = new Date().toISOString();
          console.log(
            '✅ Redux state: Stock reduction processed via payment verification'
          );
        }
      })
      .addCase(verifyInlinePayment.rejected, (state, action) => {
        state.verifyingInlinePayment = false;
        state.inlineCheckoutError = action.payload;
        state.showRetryButton = true;
        console.error('❌ Redux state: Payment verification failed');
      })
      .addCase(retryPayment.pending, (state) => {
        state.retryingPayment = true;
        state.paymentInProgress = true;
        state.error = null;
        state.showRetryButton = false;
        state.stockReductionProcessed = false;
      })
      .addCase(retryPayment.fulfilled, (state, action) => {
        state.retryingPayment = false;
        state.currentPayment = action.payload;
        state.retryAttempts = action.payload.attempt || 0;
        state.retryHistory.push({
          attempt: action.payload.attempt,
          timestamp: action.payload.retryTimestamp,
          status: 'success',
        });
        state.showRetryButton = false;
      })
      .addCase(retryPayment.rejected, (state, action) => {
        state.retryingPayment = false;
        state.paymentInProgress = false;
        state.error = action.payload;
        state.retryAttempts = action.payload.attempt || state.retryAttempts + 1;
        state.retryHistory.push({
          attempt: action.payload.attempt,
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: action.payload.message,
        });
        state.showRetryButton = !action.payload.maxRetriesReached;
      })
      .addCase(checkPaymentStatus.pending, (state) => {
        state.checkingStatus = true;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.checkingStatus = false;
        state.lastStatusCheck = new Date().toISOString();
        if (state.currentPayment && action.payload.orderId) {
          const paymentDetails = action.payload.paymentDetails;
          state.currentPayment = {
            ...state.currentPayment,
            ...paymentDetails,
          };
          if (paymentDetails.status === 'paid') {
            state.paymentInProgress = false;
            state.showRetryButton = false;
            state.retryAttempts = 0;
            state.inlineCheckoutActive = false;
            if (!state.stockReductionProcessed) {
              state.stockReductionProcessed = true;
              state.lastStockReductionTimestamp = new Date().toISOString();
              console.log(
                '✅ Redux state: Stock reduction processed via status check'
              );
            }
          } else if (
            paymentDetails.status === 'failed' ||
            paymentDetails.status === 'expired'
          ) {
            state.paymentInProgress = false;
            state.inlineCheckoutActive = false;
            state.showRetryButton =
              state.retryAttempts < state.maxRetryAttempts;
          }
        }
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        state.checkingStatus = false;
        console.error('❌ Redux state: Status check failed:', action.payload);
      })
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.payments) {
          state.paymentHistory = action.payload.payments;
        } else if (Array.isArray(action.payload)) {
          state.paymentHistory = action.payload;
        } else {
          state.paymentHistory = [];
        }
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.payment) {
          state.currentPayment = action.payload.payment;
        }
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
      .addCase(processRefund.pending, (state) => {
        state.processingRefund = true;
        state.error = null;
        console.log('🔄 Redux state: Processing refund...');
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.processingRefund = false;
        const index = state.paymentHistory.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.paymentHistory[index] = action.payload;
        }
        if (
          state.currentPayment &&
          state.currentPayment._id === action.payload._id
        ) {
          state.currentPayment = action.payload;
        }
        console.log(
          '✅ Redux state: Refund processed - stock should be restored'
        );
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.processingRefund = false;
        state.error = action.payload;
        console.error('❌ Redux state: Refund processing failed');
      })
      .addCase(getRefundHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRefundHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.refunds) {
          state.refundHistory = action.payload.refunds;
        } else if (Array.isArray(action.payload)) {
          state.refundHistory = action.payload;
        } else {
          state.refundHistory = [];
        }
        if (action.payload.pagination) {
          state.refundPagination = action.payload.pagination;
        }
      })
      .addCase(getRefundHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPaymentSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.settingsCacheTime = new Date().toISOString();
      })
      .addCase(getPaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePaymentSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.settingsCacheTime = new Date().toISOString();
      })
      .addCase(updatePaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPaymentError,
  resetPaymentState,
  updatePaymentStatus,
  incrementRetryAttempt,
  resetRetryAttempts,
  setSelectedPaymentMethod,
  setPaymentInProgress,
  setInlineCheckoutActive,
  setInlineCheckoutData,
  clearInlineCheckoutData,
  markStockReductionProcessed,
  resetStockReductionFlag,
  setStatusCheckInterval,
  clearStatusCheckInterval,
  addRetryToHistory,
} = paymentSlice.actions;

export default paymentSlice.reducer;
