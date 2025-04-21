import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { apiRequest } from '../../utils/api';
import axios from 'axios'; // SOLUTION: Added for direct axios calls

// Constants
export const PASSWORD_EXPIRY_DAYS = 90;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MINUTES = 30;

// SOLUTION: Added refresh token thunk
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Refreshing token...');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      
      const { token } = response.data;
      
      if (token) {
        console.log('Token refreshed successfully');
        localStorage.setItem('token', token);
        localStorage.setItem('sessionStart', new Date().toISOString());
        return { token };
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh token');
    }
  }
);
// Existing async thunks...
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/auth/login', credentials);
      // Only store the necessary data from the response
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/auth/register', userData);
      toast.success(response.message || 'Registration successful');
      return response;
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
      const { user, token: authToken } = response;
      
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
      return response;
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
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user data');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiRequest.put('/auth/update-password', { currentPassword, newPassword });
      toast.success(response.message || 'Password updated successfully');
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
      const response = await apiRequest.post('/auth/forgot-password', { email });
      if (response.message) {
        toast.success(response.message);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to send reset email');
    }
  }
);

// Only showing the resetPassword function that needs to be fixed
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      // Validate token
      if (!token) {
        return rejectWithValue('Invalid or missing reset token');
      }
      
      // Validate password
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return rejectWithValue('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
      
      const response = await apiRequest.post('/auth/reset-password', { token, password });
      if (response.message) {
        toast.success(response.message);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to reset password');
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      // Only store the necessary data from the response
      const { user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.response?.data?.message || 'Authentication failed');
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
    return response;
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
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password validation failed');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  error: null,
  loading: false,
  registrationEmail: null,
  verificationPending: false,
  loginAttempts: 0,
  lastLoginAttempt: null,
  sessions: [],
  passwordExpiryDays: null,
  securityAlerts: [],
  isLocked: false,
  lockExpiresAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationEmail: (state) => {
      state.registrationEmail = null;
    },
    clearVerificationPending: (state) => {
      state.verificationPending = false;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.isLocked = false;
      state.lockExpiresAt = null;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      if (state.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        state.isLocked = true;
        state.lockExpiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000).toISOString();
      }
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
     // SOLUTION: Add cases for refreshToken
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
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
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Clear any existing auth state since user needs to login again
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Check Auth State
      .addCase(checkAuthState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
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
  resetLoginAttempts,
  incrementLoginAttempts,
  logout,
  addSecurityAlert,
} = authSlice.actions;

export default authSlice.reducer;
