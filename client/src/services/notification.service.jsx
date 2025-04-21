import { io } from "socket.io-client"
import { toast } from "react-toastify"
import { notificationAPI } from "../utils/api"

class NotificationClient {
  constructor() {
    this.socket = null
    this.connected = false
    this.listeners = new Map()
    this.notificationQueue = []
    this.unreadCount = 0
    this.token = null
    this.apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
  }

  // Initialize the socket connection
  init(serverUrl = null) {
    // Get the token from localStorage
    this.token = localStorage.getItem("token")

    if (!this.token) {
      console.warn("No token provided for socket authentication")
      return
    }

    if (this.socket) {
      this.socket.disconnect()
    }

    // Use the environment variable or default to localhost
    const socketUrl = serverUrl || this.apiBaseUrl

    this.socket = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    })

    this.setupEventHandlers()
    this.connect()
  }

  // Connect and authenticate
  connect() {
    if (!this.socket) return

    this.socket.connect()

    this.socket.on("connect", () => {
      console.log("Socket connected")
      this.connected = true

      // Authenticate with JWT token
      if (this.token) {
        this.socket.emit("authenticate", this.token)
      } else {
        console.warn("No token provided for socket authentication")
      }

      // Process any queued notifications
      this.processNotificationQueue()
    })
  }

  // Setup socket event handlers
  setupEventHandlers() {
    this.socket.on("authenticated", (response) => {
      if (response.success) {
        console.log("Socket authenticated")
        this.unreadCount = response.unreadCount || 0
        this.notifyListeners("unreadCount", this.unreadCount)
      } else {
        console.error("Socket authentication failed:", response.message)
      }
    })

    this.socket.on("notification", (notification, callback) => {
      console.log("Received notification:", notification)

      // Store the notification
      this.addNotification(notification)

      // Display toast notification
      this.showToast(notification)

      // Send acknowledgment
      if (typeof callback === "function") {
        callback({ received: true })
      } else {
        // If no callback, send explicit acknowledgment
        this.socket.emit("notification:ack", { notificationId: notification._id })
      }
    })

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected")
      this.connected = false
    })

    this.socket.on("error", (error) => {
      console.error("Socket error:", error)
    })
  }

  // Add a notification to the queue/store
  addNotification(notification) {
    // Add to queue if not connected
    if (!this.connected) {
      this.notificationQueue.push(notification)
      return
    }

    // Update unread count
    this.unreadCount++
    this.notifyListeners("unreadCount", this.unreadCount)

    // Notify listeners of new notification
    this.notifyListeners("notification", notification)
  }

  // Process queued notifications
  processNotificationQueue() {
    if (this.notificationQueue.length > 0) {
      console.log(`Processing ${this.notificationQueue.length} queued notifications`)

      this.notificationQueue.forEach((notification) => {
        this.notifyListeners("notification", notification)
      })

      // Update unread count
      this.unreadCount += this.notificationQueue.length
      this.notifyListeners("unreadCount", this.unreadCount)

      // Clear the queue
      this.notificationQueue = []
    }
  }

  // Show toast notification
  showToast(notification) {
    const { title, message, priority } = notification

    // Map priority to toast type
    const toastType = priority === "high" ? "error" : priority === "medium" ? "info" : "success"

    toast[toastType](
      <div>
        <h4 className="font-bold">{title}</h4>
        <p>{message}</p>
      </div>,
      {
        autoClose: priority === "high" ? false : 5000,
        closeOnClick: true,
        pauseOnHover: true,
      },
    )
  }

  // Add event listener
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    this.listeners.get(event).push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event) || []
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Notify all listeners of an event
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event) || []
    callbacks.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in ${event} listener:`, error)
      }
    })
  }

  // Disconnect the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.connected = false
    }
  }

  // API Methods

  // Mark a notification as read
  async markAsRead(notificationId) {
    try {
      // Use the notificationAPI from api.service.js
      const response = await notificationAPI.markAsRead(notificationId)

      // Update unread count
      this.unreadCount = Math.max(0, this.unreadCount - 1)
      this.notifyListeners("unreadCount", this.unreadCount)

      return response.data
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  // Mark all notifications as read
  async markAllAsRead(type = null) {
    try {
      // Use the notificationAPI from api.service.js
      const response = await notificationAPI.markAllAsRead(type)

      // Update unread count
      this.unreadCount = 0
      this.notifyListeners("unreadCount", this.unreadCount)

      return response.data
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  }

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      // Use the notificationAPI from api.service.js
      const response = await notificationAPI.delete(notificationId)
      return response.data
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw error
    }
  }

  // Get notifications with filtering
  async getNotifications(options = {}) {
    try {
      console.log("Fetching notifications with options:", options)

      // Use the notificationAPI from api.service.js
      const response = await notificationAPI.getAll(options)

      console.log("Notification API response:", response)

      // If we get a successful response, return it
      if (response && response.data) {
        return {
          status: "success",
          data: {
            notifications: response.data.notifications || response.data,
            total: response.data.total || response.data.length,
            page: response.data.page || 1,
            limit: response.data.limit || 10,
          },
        }
      }

      // If API call fails or returns unexpected format, use mock data
      console.warn("API returned unexpected format. Using mock data.")
      return this.getMockNotifications()
    } catch (error) {
      console.error("Error fetching notifications:", error)

      // Return mock data for development
      console.warn("Returning mock data due to API error")
      return this.getMockNotifications()
    }
  }

  // Get mock notifications for development
  getMockNotifications() {
    return {
      status: "success",
      data: {
        notifications: [
          {
            _id: "mock1",
            title: "Mock Notification",
            message: "This is a mock notification for development",
            type: "system",
            priority: "medium",
            read: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "mock2",
            title: "Welcome",
            message: "Welcome to the notification system",
            type: "welcome",
            priority: "low",
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      },
    }
  }

  // Get unread count
  async getUnreadCount(type = null) {
    try {
      // Use the notificationAPI from api.service.js
      const response = await notificationAPI.getUnreadCount(type)

      if (response && response.data) {
        const count = response.data.count || 0
        this.unreadCount = count
        this.notifyListeners("unreadCount", count)
        return count
      }

      // If API call fails or returns unexpected format, use mock data
      const mockCount = 3
      this.unreadCount = mockCount
      this.notifyListeners("unreadCount", mockCount)
      return mockCount
    } catch (error) {
      console.error("Error fetching unread count:", error)

      // Return mock data for development
      const mockCount = 3
      this.unreadCount = mockCount
      this.notifyListeners("unreadCount", mockCount)
      return mockCount
    }
  }
}

// Create singleton instance
const notificationClient = new NotificationClient()

export { notificationClient }
