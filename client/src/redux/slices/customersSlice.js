import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../utils/api';

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.get('/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await apiRequest.get(`/users/${customerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ customerId, customerData }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.put(`/users/${customerId}`, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      await apiRequest.delete(`/users/${customerId}`);
      return customerId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCustomerOrders = createAsyncThunk(
  'customers/fetchCustomerOrders',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await apiRequest.get(`/users/${customerId}/orders`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCustomerStats = createAsyncThunk(
  'customers/fetchCustomerStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.get('/users/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  customers: [],
  selectedCustomer: null,
  customerOrders: [],
  customerStats: null,
  loading: false,
  error: null,
  totalCustomers: 0,
  currentPage: 1,
  customersPerPage: 10,
  filters: {
    role: 'all',
    status: 'all',
    searchTerm: '',
  },
};

// Slice
const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
      state.customerOrders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers;
        state.totalCustomers = action.payload.total;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch customers';
      })
      // Fetch Customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch customer';
      })
      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update customer';
      })
      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter((c) => c._id !== action.payload);
        state.totalCustomers -= 1;
        if (state.selectedCustomer?._id === action.payload) {
          state.selectedCustomer = null;
          state.customerOrders = [];
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete customer';
      })
      // Fetch Customer Orders
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.customerOrders = action.payload;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch customer orders';
      })
      // Fetch Customer Stats
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
        state.error = action.payload?.message || 'Failed to fetch customer stats';
      });
  },
});

export const { setFilters, clearFilters, setCurrentPage, clearSelectedCustomer } =
  customersSlice.actions;

export default customersSlice.reducer; 