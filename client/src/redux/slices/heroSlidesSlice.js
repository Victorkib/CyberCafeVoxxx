import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { heroSlideAPI } from '../../utils/api';

// Async thunks for API calls
export const fetchHeroSlides = createAsyncThunk(
  'heroSlides/fetchHeroSlides',
  async (_, { rejectWithValue }) => {
    try {
      const response = await heroSlideAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hero slides');
    }
  }
);

export const fetchActiveSlides = createAsyncThunk(
  'heroSlides/fetchActiveSlides',
  async (_, { rejectWithValue }) => {
    try {
      const response = await heroSlideAPI.getActive();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active slides');
    }
  }
);

const initialState = {
  heroSlides: [],
  activeSlides: [],
  loading: false,
  error: null
};

const heroSlidesSlice = createSlice({
  name: 'heroSlides',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all hero slides
      .addCase(fetchHeroSlides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroSlides.fulfilled, (state, action) => {
        state.loading = false;
        state.heroSlides = action.payload;
      })
      .addCase(fetchHeroSlides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch active slides
      .addCase(fetchActiveSlides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSlides.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSlides = action.payload;
      })
      .addCase(fetchActiveSlides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const { clearError } = heroSlidesSlice.actions;
export default heroSlidesSlice.reducer; 