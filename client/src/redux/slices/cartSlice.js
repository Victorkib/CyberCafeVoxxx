import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../utils/api';


// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.getCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity, size, color }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.addToCart({ productId, quantity, size, color });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.updateCart({ itemId, quantity });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiRequest.removeFromCart(productId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.clearCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'cart/validateCoupon',
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.validateCoupon({ code, cartTotal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.applyCoupon({ code, cartTotal });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const decreaseQuantity = createAsyncThunk(
  'cart/decreaseQuantity',
  async ({ itemId, currentQuantity }, { rejectWithValue }) => {
    try {
      if (currentQuantity <= 1) {
        return rejectWithValue('Cannot decrease quantity below 1');
      }
      const response = await apiRequest.updateCart({ itemId, quantity: currentQuantity - 1 });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  discount: 0,
  shipping: 0,
  finalTotal: 0,
  appliedCoupon: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.total = 0;
      state.discount = 0;
      state.shipping = 0;
      state.finalTotal = 0;
      state.appliedCoupon = null;
      state.error = null;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.discount = 0;
      state.finalTotal = state.total + state.shipping;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.totalAmount;
        state.finalTotal = action.payload.totalAmount + state.shipping - state.discount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.totalAmount;
        state.finalTotal = action.payload.totalAmount + state.shipping - state.discount;
      })
      // Update Cart Item Quantity
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.totalAmount;
        state.finalTotal = action.payload.totalAmount + state.shipping - state.discount;
      })
      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.totalAmount;
        state.finalTotal = action.payload.totalAmount + state.shipping - state.discount;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
        state.discount = 0;
        state.finalTotal = 0;
        state.appliedCoupon = null;
      })
      // Validate Coupon
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.appliedCoupon = action.payload.coupon;
        state.discount = action.payload.coupon.discount;
        state.finalTotal = state.total + state.shipping - state.discount;
      })
      // Apply Coupon
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.appliedCoupon = action.payload.coupon;
        state.discount = action.payload.coupon.discount;
        state.finalTotal = state.total + state.shipping - state.discount;
      })
      // Decrease Quantity
      .addCase(decreaseQuantity.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.totalAmount;
        state.finalTotal = action.payload.totalAmount + state.shipping - state.discount;
      })
      .addCase(decreaseQuantity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetCart, removeCoupon } = cartSlice.actions;

export default cartSlice.reducer;
