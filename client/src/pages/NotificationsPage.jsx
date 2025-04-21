"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import NotificationsList from "../components/notifications/NotificationsList"
import { markAllAsRead } from "../redux/slices/notificationSlice"
import PageHeader from "../components/common/PageHeader"

const NotificationsPage = () => {
  const dispatch = useDispatch()

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Notifications"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Notifications", path: "/notifications" },
        ]}
        actions={[
          {
            label: "Mark all as read",
            onClick: handleMarkAllAsRead,
            className: "px-3 py-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 rounded-md hover:bg-blue-100",
          },
        ]}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Notifications</h2>
        </div>

        <NotificationsList limit={20} showPagination={true} />
      </div>
    </div>
  )
}

export default NotificationsPage
