import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { apiRequest } from '../../utils/api';

// Constants
export const PASSWORD_EXPIRY_DAYS = 90;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MINUTES = 30;

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiRequest.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Check account status
      if (user.isLocked) {
        const lockExpiry = new Date(user.lockExpiresAt);
        if (lockExpiry > new Date()) {
          const minutesLeft = Math.ceil((lockExpiry - new Date()) / (1000 * 60));
          throw new Error(`Account is locked. Please try again in ${minutesLeft} minutes.`);
        }
      }

      // Check password expiration
      const passwordLastChanged = new Date(user.passwordLastChanged || user.createdAt);
      const daysUntilExpiry = PASSWORD_EXPIRY_DAYS - Math.floor((new Date() - passwordLastChanged) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        toast.warning(`Your password will expire in ${daysUntilExpiry} days. Please change it soon.`);
      } else if (daysUntilExpiry <= 0) {
        throw new Error('Your password has expired. Please reset your password.');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('sessionStart', new Date().toISOString());
      
      // Create session
      dispatch(createSession());
      
      toast.success(`Welcome back, ${user.name}!`);
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      
      // Handle failed login attempts
      if (error.response?.status === 401) {
        dispatch(incrementLoginAttempts());
      }
      
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/auth/register', userData);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/auth/verify-email', {
        verificationToken: token
      });
      const { user, token: authToken } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', authToken);
      
      toast.success('Email verified successfully! Welcome to VoxCyber!');
      return user;
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/auth/resendVerification', { email });
      toast.success('Verification email sent successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification email';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Show success message
      toast.success('Logged out successfully');
      
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user data');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.put('/auth/updatePassword', { currentPassword, newPassword }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update password');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/auth/forgotPassword', { email });
      toast.success('Password reset email sent');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/auth/resetPassword', { token, password });
      toast.success('Password reset successfully');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkState',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      // Verify token and get user data
      const response = await apiRequest.get('/auth/me');
      return response.data;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('token');
      return rejectWithValue('Session expired');
    }
  }
);

// New thunks for security features
export const createSession = createAsyncThunk(
  'auth/createSession',
  async (_, { getState }) => {
    const { user } = getState().auth;
    const sessionData = {
      userId: user.id,
      startTime: new Date().toISOString(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
    };
    
    const response = await apiRequest.post('/auth/sessions', sessionData);
    return response.data;
  }
);

export const checkPasswordExpiry = createAsyncThunk(
  'auth/checkPasswordExpiry',
  async (_, { getState }) => {
    const { user } = getState().auth;
    if (!user) return null;
    
    const passwordLastChanged = new Date(user.passwordLastChanged || user.createdAt);
    const daysUntilExpiry = PASSWORD_EXPIRY_DAYS - Math.floor((new Date() - passwordLastChanged) / (1000 * 60 * 60 * 24));
    
    return { daysUntilExpiry };
  }
);

export const validatePasswordHistory = createAsyncThunk(
  'auth/validatePasswordHistory',
  async (newPassword, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/auth/validate-password-history', { newPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password validation failed');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
  registrationEmail: null,
  verificationPending: false,
  loginAttempts: 0,
  lastLoginAttempt: null,
  sessions: [],
  passwordExpiryDays: null,
  securityAlerts: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationEmail: (state) => {
      state.registrationEmail = null;
    },
    clearVerificationPending: (state) => {
      state.verificationPending = false;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      state.lastLoginAttempt = new Date().toISOString();
      
      if (state.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        state.user = {
          ...state.user,
          isLocked: true,
          lockExpiresAt: new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000).toISOString(),
        };
      }
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    addSecurityAlert: (state, action) => {
      state.securityAlerts.push({
        ...action.payload,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.verificationPending = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationEmail = action.payload.email;
        state.verificationPending = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = localStorage.getItem('token');
        state.verificationPending = false;
        state.registrationEmail = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Resend Verification
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        toast.success('Password updated successfully');
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        toast.success('Password reset email sent');
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        toast.success('Password reset successfully');
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Check Auth State
      .addCase(checkAuthState.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      // Create Session
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
      })
      // Check Password Expiry
      .addCase(checkPasswordExpiry.fulfilled, (state, action) => {
        if (action.payload) {
          state.passwordExpiryDays = action.payload.daysUntilExpiry;
        }
      })
      // Validate Password History
      .addCase(validatePasswordHistory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearRegistrationEmail,
  clearVerificationPending,
  incrementLoginAttempts,
  resetLoginAttempts,
  addSecurityAlert,
} = authSlice.actions;

export default authSlice.reducer;
