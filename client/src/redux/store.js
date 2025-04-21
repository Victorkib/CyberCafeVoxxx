import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import paymentReducer from './slices/paymentSlice';
import specialOffersReducer from './slices/specialOffersSlice';
import heroSlidesReducer from './slices/heroSlidesSlice';
import notificationReducer from './slices/notificationSlice';
import adminReducer from './slices/adminSlice';
import newsletterReducer from './slices/newsletterSlice';
import adminNotificationReducer from './slices/adminNotificationSlice';

// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    cart: cartReducer,
    order: orderReducer,
    products: productsReducer,
    categories: categoriesReducer,
    payment: paymentReducer,
    specialOffers: specialOffersReducer,
    heroSlides: heroSlidesReducer,
    notifications: notificationReducer,
    admin: adminReducer,
    newsletter: newsletterReducer,
    adminNotifications: adminNotificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'payload.createdAt', 'payload.updatedAt'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export the store as default as well
export default store;
