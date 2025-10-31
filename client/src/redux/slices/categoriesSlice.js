import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { categoryAPI } from '../../utils/api';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchFeaturedCategories = createAsyncThunk(
  'categories/fetchFeaturedCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getFeatured();
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching featured categories:', error);
      // Return empty array instead of rejecting to prevent errors
      return [];
    }
  }
);

export const getCategoryById = createAsyncThunk(
  'categories/getCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category details');
    }
  }
);

const initialState = {
  categories: [],
  featuredCategories: [],
  currentCategory: null,
  loading: false,
  error: null
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
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
        toast.error(action.payload);
      })
      // Fetch featured categories
      .addCase(fetchFeaturedCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredCategories = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchFeaturedCategories.rejected, (state, action) => {
        state.loading = false;
        // Don't set error for featured categories to prevent UI errors
        state.featuredCategories = [];
        state.error = null;
      })
      // Get category by ID
      .addCase(getCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const { clearError, clearCurrentCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer; 