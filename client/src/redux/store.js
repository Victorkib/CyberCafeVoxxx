import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import ordersReducer from './slices/ordersSlice';
import paymentReducer from './slices/paymentSlice';
import specialOffersReducer from './slices/specialOffersSlice';
import heroSlidesReducer from './slices/heroSlidesSlice';
import notificationReducer from './slices/notificationSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    cart: cartReducer,
    orders: orderReducer,
    products: productsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    payment: paymentReducer,
    specialOffers: specialOffersReducer,
    heroSlides: heroSlidesReducer,
    notifications: notificationReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
