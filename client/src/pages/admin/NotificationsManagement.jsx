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
  Mail,
  BarChart2,
  Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
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
import {
  fetchAdminNotifications,
  createAdminNotification,
  deleteAdminNotification,
  deleteAllAdminNotifications,
  fetchNotificationStats
} from '../../redux/slices/adminNotificationSlice';

const NotificationsManagement = () => {
  const dispatch = useDispatch();
  const { notifications, stats, pagination, loading, error } = useSelector(
    (state) => state.adminNotifications || {
      notifications: [],
      stats: {
        totalCount: 0,
        typeStats: []
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      loading: false,
      error: null
    }
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    startDate: '',
    endDate: ''
  });
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'medium',
    link: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = () => {
    dispatch(fetchAdminNotifications({
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    }));
    dispatch(fetchNotificationStats());
  };

  const handleCreateNotification = async () => {
    try {
      await dispatch(createAdminNotification(newNotification)).unwrap();
      setIsCreateDialogOpen(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'system',
        priority: 'medium',
        link: '',
        expiresAt: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await dispatch(deleteAdminNotification(id)).unwrap();
      fetchData();
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await dispatch(deleteAllAdminNotifications()).unwrap();
        fetchData();
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const handleApplyFilters = () => {
    setIsFilterDialogOpen(false);
    fetchData();
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      priority: '',
      startDate: '',
      endDate: ''
    });
    setIsFilterDialogOpen(false);
    fetchData();
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <BarChart2 className="h-8 w-8 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Total Notifications</p>
              <p className="text-2xl font-semibold">{stats?.totalCount || 0}</p>
            </div>
          </div>
        </div>
        {Array.isArray(stats?.typeStats) && stats.typeStats.map((stat) => (
          <div key={stat._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              {getNotificationIcon(stat._id)}
              <div className="ml-2">
                <p className="text-sm text-gray-500">{stat._id}</p>
                <p className="text-2xl font-semibold">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <Input
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({
                          ...newNotification,
                          title: e.target.value
                        })}
                        placeholder="Notification title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <Textarea
                        value={newNotification.message}
                        onChange={(e) => setNewNotification({
                          ...newNotification,
                          message: e.target.value
                        })}
                        placeholder="Notification message"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <Select
                        value={newNotification.type}
                        onValueChange={(value) => setNewNotification({
                          ...newNotification,
                          type: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order">Order</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="wishlist">Wishlist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <Select
                        value={newNotification.priority}
                        onValueChange={(value) => setNewNotification({
                          ...newNotification,
                          priority: value
                        })}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link (optional)
                      </label>
                      <Input
                        value={newNotification.link}
                        onChange={(e) => setNewNotification({
                          ...newNotification,
                          link: e.target.value
                        })}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expires At (optional)
                      </label>
                      <Input
                        type="datetime-local"
                        value={newNotification.expiresAt}
                        onChange={(e) => setNewNotification({
                          ...newNotification,
                          expiresAt: e.target.value
                        })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
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
        </div>

        {/* Filter Dialog */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Notifications</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({
                    ...filters,
                    type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="order">Order</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="wishlist">Wishlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) => setFilters({
                    ...filters,
                    priority: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({
                    ...filters,
                    startDate: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({
                    ...filters,
                    endDate: e.target.value
                  })}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
                <Button onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsManagement; 