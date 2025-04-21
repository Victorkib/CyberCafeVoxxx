"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchNotifications, markAsRead, deleteNotification } from "../../redux/slices/notificationSlice"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, Trash, AlertCircle, RefreshCw, User, Heart } from 'lucide-react'

const NotificationsList = ({ limit = 10, showPagination = true, onlyUnread = false }) => {
  const dispatch = useDispatch()
  const { notifications, loading, error, pagination } = useSelector((state) => state.notifications)

  useEffect(() => {
    dispatch(
      fetchNotifications({
        page: pagination.page,
        limit,
        read: onlyUnread ? false : undefined,
      })
    )
  }, [dispatch, pagination.page, limit, onlyUnread])

  const handleRefresh = () => {
    dispatch(
      fetchNotifications({
        page: pagination.page,
        limit,
        read: onlyUnread ? false : undefined,
      })
    )
  }

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id))
  }

  const handleDeleteNotification = (id) => {
    dispatch(deleteNotification(id))
  }

  const handlePageChange = (newPage) => {
    dispatch(
      fetchNotifications({
        page: newPage,
        limit,
        read: onlyUnread ? false : undefined,
      })
    )
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <Check className="h-6 w-6 text-green-500" />
      case "payment":
        return <Check className="h-6 w-6 text-blue-500" />
      case "system":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
      case "promotion":
        return <Bell className="h-6 w-6 text-purple-500" />
      case "security":
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case "product":
        return <Check className="h-6 w-6 text-indigo-500" />
      case "review":
        return <User className="h-6 w-6 text-pink-500" />
      case "wishlist":
        return <Heart className="h-6 w-6 text-red-500" />
      default:
        return <Bell className="h-6 w-6 text-gray-500" />
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
        <p className="mt-2 text-gray-500">Loading notifications...</p>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700">{error}</div>
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="h-12 w-12 text-gray-300 mx-auto" />
        <p className="mt-2 text-gray-500">You don't have any notifications</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <ul className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <li key={notification._id} className={`p-4 hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-base font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                <div className="mt-3 flex items-center space-x-4">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                  {notification.link && (
                    <a href={notification.link} className="text-sm text-blue-600 hover:text-blue-800">
                      View details
                    </a>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showPagination && pagination.pages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled={pagination.page === pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsList
