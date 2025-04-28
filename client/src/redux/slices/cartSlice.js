import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../utils/api';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, size, color }, { rejectWithValue }) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required to add to cart');
      }

      // Ensure productId is a string
      const formattedProductId = String(productId);

      console.log(
        'Adding to cart with productId:',
        formattedProductId,
        'quantity:',
        quantity
      );

      const response = await apiRequest.addToCart({
        productId: formattedProductId,
        quantity,
        size,
        color,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return rejectWithValue(error.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required to update cart');
      }

      // Ensure productId is a string
      const formattedProductId = String(productId);

      const response = await apiRequest.updateCart({
        productId: formattedProductId,
        quantity,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required to remove from cart');
      }

      // Ensure productId is a string
      const formattedProductId = String(productId);

      const response = await apiRequest.removeFromCart(formattedProductId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.clearCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'cart/validateCoupon',
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.validateCoupon({ code, cartTotal });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to validate coupon');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.applyCoupon({ code, cartTotal });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to apply coupon');
    }
  }
);

export const decreaseQuantity = createAsyncThunk(
  'cart/decreaseQuantity',
  async ({ productId, currentQuantity }, { rejectWithValue, dispatch }) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required to decrease quantity');
      }

      // Ensure productId is a string
      const formattedProductId = String(productId);

      if (currentQuantity <= 1) {
        // If quantity is 1, remove the item instead of decreasing
        return dispatch(removeFromCart(formattedProductId)).unwrap();
      }

      const response = await apiRequest.updateCart({
        productId: formattedProductId,
        quantity: currentQuantity - 1,
      });
      return response.data;
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      return rejectWithValue(error.message || 'Failed to update cart');
    }
  }
);

const initialState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
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
      state.totalAmount = 0;
      state.itemCount = 0;
      state.discount = 0;
      state.shipping = 0;
      state.finalTotal = 0;
      state.appliedCoupon = null;
      state.error = null;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.discount = 0;
      state.finalTotal = state.totalAmount + state.shipping;
    },
    updateCartItemCount: (state) => {
      state.itemCount = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
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
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.finalTotal = state.totalAmount + state.shipping - state.discount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.finalTotal = state.totalAmount + state.shipping - state.discount;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Cart Item Quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.finalTotal = state.totalAmount + state.shipping - state.discount;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.finalTotal = state.totalAmount + state.shipping - state.discount;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalAmount = 0;
        state.itemCount = 0;
        state.discount = 0;
        state.finalTotal = 0;
        state.appliedCoupon = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Validate Coupon
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.appliedCoupon = action.payload.coupon;
        state.discount = action.payload.discount || 0;
        state.finalTotal = state.totalAmount + state.shipping - state.discount;
      })
      // Apply Coupon
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.appliedCoupon = action.payload.coupon;
        state.discount = action.payload.discount || 0;
        state.finalTotal = state.totalAmount + state.shipping - state.discount;
      })
      // Decrease Quantity
      .addCase(decreaseQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(decreaseQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.finalTotal = state.totalAmount + state.shipping - state.discount;
      })
      .addCase(decreaseQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCart, removeCoupon, updateCartItemCount } =
  cartSlice.actions;

export default cartSlice.reducer;
