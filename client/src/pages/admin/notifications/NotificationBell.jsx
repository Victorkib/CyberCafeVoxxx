"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Bell, XIcon as XMarkIcon } from 'lucide-react'
import { formatDistanceToNow } from "date-fns"
import { fetchAdminNotifications } from "../../../redux/slices/adminNotificationSlice"

const AdminNotificationBell = () => {
  const dispatch = useDispatch()
  const { notifications, loading } = useSelector((state) => state.adminNotifications)
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  // Fetch notifications on mount
  useEffect(() => {
    if (showDropdown) {
      dispatch(
        fetchAdminNotifications({
          page: 1,
          limit: 5,
          priority: "high", // Only show high priority notifications in the dropdown
        })
      )
    }
  }, [dispatch, showDropdown])

  // Calculate unread count from admin notifications
  useEffect(() => {
    // For admin, we'll consider high priority notifications as "unread"
    const highPriorityCount = notifications.filter((n) => n.priority === "high").length
    setUnreadCount(highPriorityCount)
  }, [notifications])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const handleNotificationClick = (notification) => {
    // Navigate to link if available
    if (notification.link) {
      window.location.href = notification.link
    } else {
      // Otherwise go to admin notification management
      window.location.href = "/admin/notifications"
    }

    // Close dropdown
    setShowDropdown(false)
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-red-500"
      case "medium":
        return "border-l-4 border-yellow-500"
      default:
        return "border-l-4 border-green-500"
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        aria-label={`Admin Notifications - ${unreadCount} alerts`}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Admin Alerts</h3>
            <a href="/admin/notifications" className="text-sm text-blue-500 hover:text-blue-700">
              Manage
            </a>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        notification.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : notification.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {notification.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No alerts</div>
            )}
          </div>

          <div className="p-2 border-t text-center">
            <a href="/admin/notifications" className="text-sm text-blue-500 hover:text-blue-700">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminNotificationBell
