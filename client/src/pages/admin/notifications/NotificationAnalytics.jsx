'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotificationStats } from '../../../redux/slices/adminNotificationSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const NotificationAnalytics = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.adminNotifications);

  useEffect(() => {
    dispatch(fetchNotificationStats());
  }, [dispatch]);

  if (loading || !stats || Object.keys(stats).length === 0) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400">
        <div
          className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"
          aria-hidden="true"
        ></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  // Prepare data for charts
  const typeData =
    stats.typeStats?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  const priorityData =
    stats.priorityStats?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  const readData =
    stats.readStats?.map((item) => ({
      name: item._id ? 'Read' : 'Unread',
      value: item.count,
    })) || [];

  // Colors for pie charts
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FF6B6B',
    '#6B66FF',
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Total Notifications
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Read vs Unread
          </h3>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Read</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.readStats?.find((s) => s._id === true)?.count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.readStats?.find((s) => s._id === false)?.count || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            By Priority
          </h3>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {stats.priorityStats?.find((s) => s._id === 'high')?.count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Medium</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.priorityStats?.find((s) => s._id === 'medium')?.count ||
                  0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {stats.priorityStats?.find((s) => s._id === 'low')?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Types Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Notifications by Type
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  stroke="#6B7280"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#F3F4F6',
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Read/Unread Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Read vs Unread
          </h3>
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
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {readData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#82ca9d' : '#8884d8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#F3F4F6',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Users */}
      {stats.topUsers && stats.topUsers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Top Users by Notification Count
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Notifications
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stats.topUsers.map((user) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                      {user.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationAnalytics;
