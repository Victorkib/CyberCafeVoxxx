import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Plus,
  Trash2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  User,
  Mail
} from 'lucide-react';
import { toast } from 'react-toastify';
import { notificationAPI } from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const NotificationsManagement = () => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'medium',
    link: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAdminNotifications();
      setNotifications(response.data);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    try {
      setLoading(true);
      await notificationAPI.create(newNotification);
      toast.success('Notification created successfully');
      setIsCreateDialogOpen(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'system',
        priority: 'medium',
        link: '',
        expiresAt: ''
      });
      fetchNotifications();
    } catch (error) {
      toast.error(error.message || 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationAPI.deleteAdmin(id);
      toast.success('Notification deleted successfully');
      fetchNotifications();
    } catch (error) {
      toast.error(error.message || 'Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await notificationAPI.deleteAllAdmin();
        toast.success('All notifications deleted successfully');
        fetchNotifications();
      } catch (error) {
        toast.error(error.message || 'Failed to delete all notifications');
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-green-500" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'promotion':
        return <Mail className="h-5 w-5 text-purple-500" />;
      case 'security':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'product':
        return <ShoppingBag className="h-5 w-5 text-indigo-500" />;
      case 'review':
        return <User className="h-5 w-5 text-pink-500" />;
      case 'wishlist':
        return <Bell className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Notifications Management"
        breadcrumbs={[
          { name: 'Dashboard', path: '/admin' },
          { name: 'Notifications', path: '/admin/notifications' }
        ]}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Notification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newNotification.title}
                      onChange={(e) =>
                        setNewNotification({ ...newNotification, title: e.target.value })
                      }
                      placeholder="Notification title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={newNotification.message}
                      onChange={(e) =>
                        setNewNotification({ ...newNotification, message: e.target.value })
                      }
                      placeholder="Notification message"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value) =>
                        setNewNotification({ ...newNotification, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="order">Order</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="wishlist">Wishlist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newNotification.priority}
                      onValueChange={(value) =>
                        setNewNotification({ ...newNotification, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Link (optional)</label>
                    <Input
                      value={newNotification.link}
                      onChange={(e) =>
                        setNewNotification({ ...newNotification, link: e.target.value })
                      }
                      placeholder="Notification link"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expires At (optional)</label>
                    <Input
                      type="datetime-local"
                      value={newNotification.expiresAt}
                      onChange={(e) =>
                        setNewNotification({ ...newNotification, expiresAt: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNotification} disabled={loading}>
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-2 text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="p-4 hover:bg-gray-50"
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
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          notification.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : notification.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {notification.priority}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Type: {notification.type}</span>
                      <span>Created: {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                      {notification.expiresAt && (
                        <span>Expires: {formatDistanceToNow(new Date(notification.expiresAt), { addSuffix: true })}</span>
                      )}
                      <span>Read by: {notification.readCount || 0} users</span>
                    </div>
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 block"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsManagement; 