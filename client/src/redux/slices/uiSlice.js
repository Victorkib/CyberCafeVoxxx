import { createSlice } from '@reduxjs/toolkit';
import { loginUser, registerUser, logoutUser } from './authSlice';

const initialState = {
  isAuthModalOpen: false,
  authModalView: 'login', // 'login' or 'register'
  isLoading: false,
  darkMode: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAuthModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.authModalView = action.payload || 'login';
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    setAuthModalView: (state, action) => {
      state.authModalView = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Close modal on successful login/register
      .addCase(loginUser.fulfilled, (state) => {
        state.isAuthModalOpen = false;
        state.isLoading = false; // Fix: Combined the loading state here instead of adding a separate case
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isAuthModalOpen = false;
        state.isLoading = false; // Fix: Combined the loading state here instead of adding a separate case
      })
      // Set loading states
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  setAuthModalView,
  toggleDarkMode,
  setLoading,
} = uiSlice.actions;
export default uiSlice.reducer;
