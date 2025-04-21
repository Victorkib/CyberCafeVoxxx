import { io } from "socket.io-client"
import { store } from "../redux/store"
import { addNotification, setUnreadCount } from "../redux/slices/notificationSlice"
import { toast } from "react-toastify"

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.token = null
  }

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
    const socketUrl = serverUrl || import.meta.env.VITE_API_URL || "http://localhost:5000"

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
    })
  }

  setupEventHandlers() {
    this.socket.on("authenticated", (response) => {
      if (response.success) {
        console.log("Socket authenticated")
        store.dispatch(setUnreadCount(response.unreadCount || 0))
      } else {
        console.error("Socket authentication failed:", response.message)
      }
    })

    this.socket.on("notification", (notification, callback) => {
      console.log("Received notification:", notification)

      // Add notification to Redux store
      store.dispatch(addNotification(notification))

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
      }
    )
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.connected = false
    }
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService
