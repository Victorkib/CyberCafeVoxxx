"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useSelector } from "react-redux"
import { notificationClient } from "../services/notification.service"
import { toast } from "react-toastify"

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sound: true,
    desktop: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get authentication state from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  useEffect(() => {
    // Only initialize notifications if user is authenticated
    if (!isAuthenticated || !user) {
      return
    }

    // Initialize the notification service
    notificationClient.init()

    // Listen for unread count updates
    const unsubscribeCount = notificationClient.addEventListener("unreadCount", (count) => {
      setUnreadCount(count)
    })

    // Listen for new notifications
    const unsubscribeNotifications = notificationClient.addEventListener("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev])
    })

    // Try to fetch initial notifications only if authenticated
    fetchNotifications()

    return () => {
      // Clean up event listeners
      unsubscribeCount()
      unsubscribeNotifications()
      notificationClient.disconnect()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    // Load preferences from localStorage (this can run without authentication)
    const savedPreferences = localStorage.getItem("notificationPreferences")
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (error) {
        console.error("Error parsing notification preferences:", error)
      }
    }
  }, [])

  const fetchNotifications = async (options = {}) => {
    // Don't fetch if not authenticated
    if (!isAuthenticated || !user) {
      console.log("Not authenticated, skipping notification fetch")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await notificationClient.getNotifications({
        page: 1,
        limit: 10,
        ...options,
      })

      if (response.status === "success") {
        setNotifications(Array.isArray(response.data.notifications) ? response.data.notifications : [])
      } else {
        console.warn("Unexpected response format:", response)
        // Handle unexpected response format
        if (response.data?.notifications) {
          setNotifications(Array.isArray(response.data.notifications) ? response.data.notifications : [])
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setError(error.message || "Failed to fetch notifications")
      setNotifications([]) // Reset to empty array on error

      // Don't show error toast for authentication errors
      if (!error.message?.includes("mock") && !error.message?.includes("authorized") && !error.message?.includes("token")) {
        toast.error(`Failed to fetch notifications: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationClient.markAsRead(id)
      setNotifications((prev) =>
        prev.map((notification) => (notification._id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error(`Failed to mark notification as read: ${error.message}`)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationClient.markAllAsRead()
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast.error(`Failed to mark all notifications as read: ${error.message}`)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await notificationClient.deleteNotification(id)
      setNotifications((prev) => prev.filter((notification) => notification._id !== id))
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error(`Failed to delete notification: ${error.message}`)
    }
  }

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences)
    localStorage.setItem("notificationPreferences", JSON.stringify(newPreferences))
  }

  // Group notifications by type for analytics
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const type = notification.type || "unknown"
    if (!acc[type]) {
      acc[type] = []
    }

    acc[type].push(notification)
    return acc
  }, {})

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        preferences,
        loading,
        error,
        groupedNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
