import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import apiRequest from '../../utils/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 20, type, read }, { rejectWithValue }) => {
    try {
      let url = `/notifications?page=${page}&limit=${limit}`;
      if (type) url += `&type=${type}`;
      if (read !== undefined) url += `&read=${read}`;

      const response = await apiRequest.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notifications'
      );
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await apiRequest.patch(
        `/notifications/${notificationId}/read`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark notification as read'
      );
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (type = null, { rejectWithValue }) => {
    try {
      const url = type
        ? `/notifications/read-all?type=${type}`
        : '/notifications/read-all';
      const response = await apiRequest.patch(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to mark all notifications as read'
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await apiRequest.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete notification'
      );
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (type = null, { rejectWithValue }) => {
    try {
      const url = type
        ? `/notifications/unread-count?type=${type}`
        : '/notifications/unread-count';
      const response = await apiRequest.get(url);
      return response.data.data.count;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get unread count'
      );
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // toast.error(action.payload || "Failed to fetch notifications")
      })
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.map((notification) =>
          notification._id === action.payload._id
            ? { ...notification, read: true }
            : notification
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to mark notification as read');
      })
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map((notification) => ({
          ...notification,
          read: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(
          action.payload || 'Failed to mark all notifications as read'
        );
      })
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        const deletedNotification = state.notifications.find(
          (n) => n._id === action.payload
        );
        state.notifications = state.notifications.filter(
          (notification) => notification._id !== action.payload
        );

        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to delete notification');
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { addNotification, setUnreadCount } = notificationSlice.actions;

export default notificationSlice.reducer;
