import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { specialOfferAPI } from '../../utils/api';

// Async thunks for API calls
export const fetchSpecialOffers = createAsyncThunk(
  'specialOffers/fetchSpecialOffers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await specialOfferAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch special offers');
    }
  }
);

export const fetchActiveOffers = createAsyncThunk(
  'specialOffers/fetchActiveOffers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await specialOfferAPI.getActive();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active offers');
    }
  }
);

const initialState = {
  specialOffers: [],
  activeOffers: [],
  loading: false,
  error: null
};

const specialOffersSlice = createSlice({
  name: 'specialOffers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all special offers
      .addCase(fetchSpecialOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpecialOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.specialOffers = action.payload;
      })
      .addCase(fetchSpecialOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch active offers
      .addCase(fetchActiveOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.activeOffers = action.payload;
      })
      .addCase(fetchActiveOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const { clearError } = specialOffersSlice.actions;
export default specialOffersSlice.reducer; 