import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks for API calls
export const fetchActivePromotionBanner = createAsyncThunk(
  'promotionBanner/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/promotion-banner/active');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotion banner');
    }
  }
);

const initialState = {
  banner: null,
  loading: false,
  error: null,
};

const promotionBannerSlice = createSlice({
  name: 'promotionBanner',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivePromotionBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivePromotionBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banner = action.payload;
      })
      .addCase(fetchActivePromotionBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = promotionBannerSlice.actions;
export default promotionBannerSlice.reducer;
