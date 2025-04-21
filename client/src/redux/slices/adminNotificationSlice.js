import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { toast } from "react-toastify"
import apiRequest from "../../utils/api"

export const fetchAdminNotifications = createAsyncThunk(
  "adminNotifications/fetchAll",
  async ({ page = 1, limit = 10, type, priority, startDate, endDate, userId } = {}, { rejectWithValue }) => {
    try {
      let url = `/admin/notifications?page=${page}&limit=${limit}`
      if (type) url += `&type=${type}`
      if (priority) url += `&priority=${priority}`
      if (userId) url += `&userId=${userId}`
      if (startDate) url += `&startDate=${startDate}`
      if (endDate) url += `&endDate=${endDate}`

      const response = await apiRequest.get(url)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications")
    }
  }
)

export const createAdminNotification = createAsyncThunk(
  "adminNotifications/create",
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post("/admin/notifications", notificationData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create notification")
    }
  }
)

export const deleteAdminNotification = createAsyncThunk(
  "adminNotifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest.delete(`/admin/notifications/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete notification")
    }
  }
)

export const deleteAllAdminNotifications = createAsyncThunk(
  "adminNotifications/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      await apiRequest.delete("/admin/notifications")
      return null
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete all notifications")
    }
  }
)

export const fetchNotificationStats = createAsyncThunk(
  "adminNotifications/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.get("/admin/notifications/stats")
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notification stats")
    }
  }
)

export const retryUndeliveredNotifications = createAsyncThunk(
  "adminNotifications/retryDelivery",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post("/admin/notifications/retry-delivery")
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to retry undelivered notifications")
    }
  }
)

const adminNotificationSlice = createSlice({
  name: "adminNotifications",
  initialState: {
    notifications: [],
    stats: {},
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  },
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.notifications
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAdminNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || "Failed to fetch notifications")
      })
      .addCase(createAdminNotification.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAdminNotification.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.notifications.unshift(action.payload)
        }
        toast.success("Notification sent successfully")
      })
      .addCase(createAdminNotification.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || "Failed to create notification")
      })
      .addCase(deleteAdminNotification.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAdminNotification.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = state.notifications.filter((notification) => notification._id !== action.payload)
        toast.success("Notification deleted successfully")
      })
      .addCase(deleteAdminNotification.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || "Failed to delete notification")
      })
      .addCase(deleteAllAdminNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAllAdminNotifications.fulfilled, (state) => {
        state.loading = false
        state.notifications = []
        state.pagination.total = 0
        toast.success("All notifications deleted successfully")
      })
      .addCase(deleteAllAdminNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || "Failed to delete all notifications")
      })
      .addCase(fetchNotificationStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotificationStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchNotificationStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || "Failed to fetch notification stats")
      })
      .addCase(retryUndeliveredNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(retryUndeliveredNotifications.fulfilled, (state, action) => {
        state.loading = false
        toast.success(`Retried ${action.payload.total} notifications, ${action.payload.success} successful`)
      })
      .addCase(retryUndeliveredNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || "Failed to retry undelivered notifications")
      })
  },
})

export const { setPage, setLimit } = adminNotificationSlice.actions

export default adminNotificationSlice.reducer
