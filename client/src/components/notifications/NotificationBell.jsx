"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Bell, XIcon as XMarkIcon } from 'lucide-react'
import { fetchNotifications, markAsRead, markAllAsRead, getUnreadCount } from "../../redux/slices/notificationSlice"
import { formatDistanceToNow } from "date-fns"

const NotificationBell = () => {
  const dispatch = useDispatch()
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch unread count on mount
  useEffect(() => {
    dispatch(getUnreadCount())
  }, [dispatch])

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
    if (!showDropdown) {
      // Fetch recent notifications when opening dropdown
      dispatch(
        fetchNotifications({
          page: 1,
          limit: 5,
          read: false,
        })
      )
    }
  }

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation()
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      dispatch(markAsRead(notification._id))
    }

    // Navigate to link if available
    if (notification.link) {
      window.location.href = notification.link
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
        aria-label={`Notifications - ${unreadCount} unread`}
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
            <h3 className="text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button className="text-sm text-blue-500 hover:text-blue-700" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  } ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-semibold">{notification.title}</h4>
                    {!notification.read && (
                      <button
                        className="text-xs text-gray-500 hover:text-gray-700"
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            )}
          </div>

          <div className="p-2 border-t text-center">
            <a href="/notifications" className="text-sm text-blue-500 hover:text-blue-700">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
