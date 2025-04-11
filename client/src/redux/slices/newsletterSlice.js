import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newsletterAPI } from '../../utils/api';

// Async thunks
export const subscribeToNewsletter = createAsyncThunk(
  'newsletter/subscribe',
  async (data, { rejectWithValue }) => {
    try {
      const response = await newsletterAPI.subscribe(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to subscribe to newsletter');
    }
  }
);

export const verifySubscription = createAsyncThunk(
  'newsletter/verify',
  async (token, { rejectWithValue }) => {
    try {
      const response = await newsletterAPI.verify(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify subscription');
    }
  }
);

export const unsubscribeFromNewsletter = createAsyncThunk(
  'newsletter/unsubscribe',
  async (token, { rejectWithValue }) => {
    try {
      const response = await newsletterAPI.unsubscribe(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unsubscribe from newsletter');
    }
  }
);

export const fetchSubscribers = createAsyncThunk(
  'newsletter/fetchSubscribers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await newsletterAPI.getSubscribers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscribers');
    }
  }
);

export const fetchNewsletterStats = createAsyncThunk(
  'newsletter/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await newsletterAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch newsletter statistics');
    }
  }
);

export const sendNewsletter = createAsyncThunk(
  'newsletter/send',
  async (data, { rejectWithValue }) => {
    try {
      const response = await newsletterAPI.send(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send newsletter');
    }
  }
);

const initialState = {
  subscribers: [],
  stats: null,
  loading: false,
  error: null,
  success: false,
  subscribeLoading: false,
  subscribeError: null,
  subscribeSuccess: false,
  verifyLoading: false,
  verifyError: null,
  verifySuccess: false,
  unsubscribeLoading: false,
  unsubscribeError: null,
  unsubscribeSuccess: false,
  sendLoading: false,
  sendError: null,
  sendSuccess: false,
};

const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.subscribeError = null;
      state.verifyError = null;
      state.unsubscribeError = null;
      state.sendError = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.subscribeSuccess = false;
      state.verifySuccess = false;
      state.unsubscribeSuccess = false;
      state.sendSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Subscribe
      .addCase(subscribeToNewsletter.pending, (state) => {
        state.subscribeLoading = true;
        state.subscribeError = null;
        state.subscribeSuccess = false;
      })
      .addCase(subscribeToNewsletter.fulfilled, (state) => {
        state.subscribeLoading = false;
        state.subscribeSuccess = true;
      })
      .addCase(subscribeToNewsletter.rejected, (state, action) => {
        state.subscribeLoading = false;
        state.subscribeError = action.payload;
      })
      // Verify
      .addCase(verifySubscription.pending, (state) => {
        state.verifyLoading = true;
        state.verifyError = null;
        state.verifySuccess = false;
      })
      .addCase(verifySubscription.fulfilled, (state) => {
        state.verifyLoading = false;
        state.verifySuccess = true;
      })
      .addCase(verifySubscription.rejected, (state, action) => {
        state.verifyLoading = false;
        state.verifyError = action.payload;
      })
      // Unsubscribe
      .addCase(unsubscribeFromNewsletter.pending, (state) => {
        state.unsubscribeLoading = true;
        state.unsubscribeError = null;
        state.unsubscribeSuccess = false;
      })
      .addCase(unsubscribeFromNewsletter.fulfilled, (state) => {
        state.unsubscribeLoading = false;
        state.unsubscribeSuccess = true;
      })
      .addCase(unsubscribeFromNewsletter.rejected, (state, action) => {
        state.unsubscribeLoading = false;
        state.unsubscribeError = action.payload;
      })
      // Fetch Subscribers
      .addCase(fetchSubscribers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscribers.fulfilled, (state, action) => {
        state.loading = false;
        state.subscribers = action.payload;
      })
      .addCase(fetchSubscribers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchNewsletterStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsletterStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchNewsletterStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Newsletter
      .addCase(sendNewsletter.pending, (state) => {
        state.sendLoading = true;
        state.sendError = null;
        state.sendSuccess = false;
      })
      .addCase(sendNewsletter.fulfilled, (state) => {
        state.sendLoading = false;
        state.sendSuccess = true;
      })
      .addCase(sendNewsletter.rejected, (state, action) => {
        state.sendLoading = false;
        state.sendError = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = newsletterSlice.actions;
export default newsletterSlice.reducer; 