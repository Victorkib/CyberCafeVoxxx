import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderAPI } from '../../utils/orderAPI';
import { toast } from 'react-toastify';

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createOrder(orderData);
      toast.success('Order created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
      return rejectWithValue(error.response?.data || 'Failed to create order');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getMyOrders(params);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
      return rejectWithValue(error.response?.data || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderById(orderId);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch order');
      return rejectWithValue(error.response?.data || 'Failed to fetch order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
      return rejectWithValue(error.response?.data || 'Failed to cancel order');
    }
  }
);

// Admin thunks
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAllOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getAllOrders(params);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
      return rejectWithValue(error.response?.data || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update order status'
      );
      return rejectWithValue(
        error.response?.data || 'Failed to update order status'
      );
    }
  }
);

// Initial state
const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
  filters: {
    status: null,
    dateRange: {
      start: null,
      end: null,
    },
    searchTerm: '',
  },
};

// Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
        state.orders.unshift(action.payload.data);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create order';
      })

      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data.orders;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch orders';
      })

      // Fetch Order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both direct data and nested data structures
        const orderData = action.payload.data || action.payload;
        console.log('Order data received in slice:', orderData);
        state.currentOrder = orderData;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch order';
        state.currentOrder = null; // Clear current order on error
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Update the order in the orders array
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
        // Update current order if it's the same one
        if (state.currentOrder?._id === action.payload.data._id) {
          state.currentOrder = action.payload.data;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to cancel order';
      })

      // Admin: Fetch All Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data.orders;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch orders';
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the order in the orders array
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.data._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
        // Update current order if it's the same one
        if (state.currentOrder?._id === action.payload.data._id) {
          state.currentOrder = action.payload.data;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to update order status';
      });
  },
});

export const { clearCurrentOrder, setFilters, clearFilters, setPage } =
  orderSlice.actions;
export default orderSlice.reducer;
