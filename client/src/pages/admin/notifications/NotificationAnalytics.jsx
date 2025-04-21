"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchNotificationStats } from "../../../redux/slices/adminNotificationSlice"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const NotificationAnalytics = () => {
  const dispatch = useDispatch()
  const { stats, loading } = useSelector((state) => state.adminNotifications)

  useEffect(() => {
    dispatch(fetchNotificationStats())
  }, [dispatch])

  if (loading || !stats || Object.keys(stats).length === 0) {
    return <div className="p-8 text-center">Loading analytics data...</div>
  }

  // Prepare data for charts
  const typeData = stats.typeStats?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || []

  const priorityData = stats.priorityStats?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || []

  const readData = stats.readStats?.map((item) => ({
    name: item._id ? "Read" : "Unread",
    value: item.count,
  })) || []

  // Colors for pie charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Notifications</h3>
          <p className="text-3xl font-bold">{stats.totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Read vs Unread</h3>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Read</p>
              <p className="text-xl font-bold">{stats.readStats?.find((s) => s._id === true)?.count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unread</p>
              <p className="text-xl font-bold">{stats.readStats?.find((s) => s._id === false)?.count || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">By Priority</h3>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">High</p>
              <p className="text-xl font-bold text-red-600">
                {stats.priorityStats?.find((s) => s._id === "high")?.count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Medium</p>
              <p className="text-xl font-bold text-yellow-600">
                {stats.priorityStats?.find((s) => s._id === "medium")?.count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Low</p>
              <p className="text-xl font-bold text-green-600">
                {stats.priorityStats?.find((s) => s._id === "low")?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Types Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Notifications by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Read/Unread Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Read vs Unread</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {readData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#82ca9d" : "#8884d8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Users */}
      {stats.topUsers && stats.topUsers.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Users by Notification Count</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notifications
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topUsers.map((user) => (
                  <tr key={user.userId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{user.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationAnalytics
