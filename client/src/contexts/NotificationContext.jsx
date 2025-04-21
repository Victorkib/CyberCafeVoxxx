"use client"

import { createContext, useState, useEffect, useContext } from "react"
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

  useEffect(() => {
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

    // Try to fetch initial notifications
    fetchNotifications()

    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem("notificationPreferences")
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (error) {
        console.error("Error parsing notification preferences:", error)
      }
    }

    return () => {
      // Clean up event listeners
      unsubscribeCount()
      unsubscribeNotifications()
      notificationClient.disconnect()
    }
  }, [])

  const fetchNotifications = async (options = {}) => {
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

      // Show error toast only if it's not a development mock data situation
      if (!error.message?.includes("mock")) {
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
