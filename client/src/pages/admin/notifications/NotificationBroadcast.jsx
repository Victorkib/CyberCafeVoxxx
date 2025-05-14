'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import apiRequest from '../../../utils/api';
import { createAdminNotification } from '../../../redux/slices/adminNotificationSlice';

const NotificationBroadcast = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.adminNotifications);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [broadcastToAll, setBroadcastToAll] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'medium',
    link: '',
    expiresAt: '',
  });
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users for selection
  useEffect(() => {
    if (!broadcastToAll) {
      fetchUsers();
    }
  }, [broadcastToAll]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await apiRequest.get(
        `${import.meta.env.VITE_API_URL}/api/users?limit=100`
      );
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    try {
      const payload = {
        ...formData,
      };

      if (!broadcastToAll) {
        if (selectedUsers.length === 0) {
          toast.error('Please select at least one user');
          return;
        }
        payload.userIds = selectedUsers;
      }

      await dispatch(createAdminNotification(payload)).unwrap();
      toast.success('Notification broadcast successfully');

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'system',
        priority: 'medium',
        link: '',
        expiresAt: '',
      });
      setSelectedUsers([]);
      setBroadcastToAll(true);
    } catch (error) {
      toast.error('Failed to broadcast notification');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Broadcast Notification
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="system">System</option>
              <option value="promotion">Promotion</option>
              <option value="admin_alert">Admin Alert</option>
              <option value="system_status">System Status</option>
              <option value="security">Security</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Link (optional)
          </label>
          <input
            type="text"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Expires At (optional)
          </label>
          <input
            type="datetime-local"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={broadcastToAll}
              onChange={() => setBroadcastToAll(!broadcastToAll)}
              className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Send to all users
            </span>
          </label>
        </div>

        {!broadcastToAll && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Select Users ({selectedUsers.length} selected)
            </label>
            {loadingUsers ? (
              <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                <div
                  className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
                  aria-hidden="true"
                ></div>
                Loading users...
              </div>
            ) : (
              <div className="border border-gray-300 dark:border-gray-600 rounded max-h-60 overflow-y-auto p-2 bg-white dark:bg-gray-700">
                {users.length > 0 ? (
                  users.map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center p-1 hover:bg-gray-50 dark:hover:bg-gray-600 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelection(user._id)}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {user.name} ({user.email})
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="p-2 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {broadcastToAll
              ? 'This will send to all users'
              : `Selected ${selectedUsers.length} recipients`}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? (
              <>
                <div
                  className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                  aria-hidden="true"
                ></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationBroadcast;
