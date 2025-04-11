import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchNotifications } from '../redux/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { 
  BellIcon, 
  CheckIcon, 
  TrashIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import { useNotification } from '../contexts/NotificationContext';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { 
    notifications, 
    loading, 
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchNotifications());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <CheckIcon className="h-6 w-6 text-green-500" />;
      case 'payment':
        return <CheckIcon className="h-6 w-6 text-blue-500" />;
      case 'system':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      case 'promotion':
        return <BellIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Notifications" 
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Notifications', path: '/notifications' }]} 
      />
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Notifications</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              disabled={loading}
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {notifications.some(notification => !notification.read) && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-2 text-gray-500">You don't have any notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li 
                key={notification._id} 
                className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-base font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <div className="mt-3 flex items-center space-x-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View details
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 