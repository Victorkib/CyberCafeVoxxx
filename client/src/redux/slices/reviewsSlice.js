import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../utils/api';

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiRequest.getReviews({ productId });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProductReview = createAsyncThunk(
  'reviews/addProductReview',
  async ({ productId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.createReview({
        productId,
        rating,
        comment,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProductReview = createAsyncThunk(
  'reviews/updateProductReview',
  async ({ reviewId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.updateReview(reviewId, {
        rating,
        comment,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProductReview = createAsyncThunk(
  'reviews/deleteProductReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await apiRequest.deleteReview(reviewId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  reviews: [],
  loading: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Product Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Product Review
      .addCase(addProductReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(addProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Product Review
      .addCase(updateProductReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reviews.findIndex(
          (review) => review._id === action.payload._id
        );
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(updateProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Product Review
      .addCase(deleteProductReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter(
          (review) => review._id !== action.payload._id
        );
      })
      .addCase(deleteProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer; 