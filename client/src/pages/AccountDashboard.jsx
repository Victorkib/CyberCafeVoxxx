'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Clock,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  Activity,
  Package,
  User,
  MapPin,
  Heart,
  CreditCard,
  Bell,
  Shield,
  Award,
  HelpCircle,
} from 'lucide-react';

// Redux imports
import {
  fetchMyOrders,
  fetchOrderById,
  cancelOrder,
} from '../redux/slices/orderSlice';

// Components
import AccountSidebar from './components/account/AccountSidebar';
import AccountHeader from './components/account/AccountHeader';
import MobileSidebar from './components/account/MobileSidebar';
import OverviewTab from './components/account/tabs/OverviewTab';
import OrdersTab from './components/account/tabs/OrdersTab';
import ProfileTab from './components/account/tabs/ProfileTab';
import PlaceholderTab from './components/account/PlaceholderTab';
import OrderDetailsModal from './components/account/modals/OrderDetailsModal';
import ButtonLoader from './components/loaders/ButtonLoader';

// Utils
import { toast } from 'react-toastify';

const AccountDashboard = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const {
    orders,
    loading: ordersLoading,
    currentOrder,
  } = useSelector((state) => state.order);

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orderFilters, setOrderFilters] = useState({
    status: '',
    dateRange: '',
    search: '',
  });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
      description: 'Account summary and recent activity',
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
      count: orders?.length || 0,
      description: 'Track and manage your orders',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Personal information and preferences',
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: MapPin,
      description: 'Manage shipping and billing addresses',
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      count: 5,
      description: 'Your saved items',
    },
    {
      id: 'payments',
      label: 'Payment Methods',
      icon: CreditCard,
      description: 'Manage payment options',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      count: 3,
      description: 'Notification preferences',
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Password and security settings',
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: Award,
      description: 'Loyalty points and rewards',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Get help and contact support',
    },
  ];

  // Order status configuration
  const orderStatusConfig = {
    pending: {
      color: 'orange',
      icon: Clock,
      label: 'Pending',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-800 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    processing: {
      color: 'blue',
      icon: RefreshCw,
      label: 'Processing',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-800 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    shipped: {
      color: 'purple',
      icon: Truck,
      label: 'Shipped',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      textColor: 'text-purple-800 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    delivered: {
      color: 'green',
      icon: CheckCircle,
      label: 'Delivered',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-800 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    cancelled: {
      color: 'red',
      icon: XCircle,
      label: 'Cancelled',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      textColor: 'text-red-800 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  };

  // Initialize profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'Kenya',
      });
    }
  }, [user]);

  // Fetch orders on component mount
  useEffect(() => {
    if (
      isAuthenticated &&
      (activeTab === 'orders' || activeTab === 'overview')
    ) {
      dispatch(fetchMyOrders({ page: 1, limit: 10, ...orderFilters }));
    }
  }, [dispatch, isAuthenticated, activeTab, orderFilters]);

  // Handle order details view
  const handleViewOrder = async (orderId) => {
    try {
      await dispatch(fetchOrderById(orderId)).unwrap();
      setShowOrderDetails(true);
    } catch (error) {
      toast.error('Failed to fetch order details');
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(orderId)).unwrap();
        toast.success('Order cancelled successfully');
        dispatch(fetchMyOrders({ page: 1, limit: 10, ...orderFilters }));
      } catch (error) {
        toast.error('Failed to cancel order');
      }
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      // TODO: Implement profile update API call
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Get current tab info
  const getCurrentTab = () => {
    return tabs.find((tab) => tab.id === activeTab) || tabs[0];
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            orders={orders}
            ordersLoading={ordersLoading}
            setActiveTab={setActiveTab}
            handleViewOrder={handleViewOrder}
            orderStatusConfig={orderStatusConfig}
          />
        );
      case 'orders':
        return (
          <OrdersTab
            orders={orders}
            ordersLoading={ordersLoading}
            orderFilters={orderFilters}
            setOrderFilters={setOrderFilters}
            handleViewOrder={handleViewOrder}
            handleCancelOrder={handleCancelOrder}
            orderStatusConfig={orderStatusConfig}
          />
        );
      case 'profile':
        return (
          <ProfileTab
            profileData={profileData}
            setProfileData={setProfileData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleProfileUpdate={handleProfileUpdate}
          />
        );
      default:
        return (
          <PlaceholderTab
            tabId={activeTab}
            tabs={tabs}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2
            className={`text-2xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Please log in to access your account
          </h2>
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:fixed lg:inset-y-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-80'
        } transition-all duration-300`}
      >
        <AccountSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          orders={orders}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-80'
        } transition-all duration-300`}
      >
        {/* Header */}
        <AccountHeader
          currentTab={getCurrentTab()}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isCollapsed={isCollapsed}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1
                      className={`text-2xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {getCurrentTab().label}
                    </h1>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {getCurrentTab().description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ButtonLoader
                      onClick={() => {
                        /* TODO: Implement export functionality */
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Download size={16} />
                      Export
                    </ButtonLoader>
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div className="pb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        showOrderDetails={showOrderDetails}
        setShowOrderDetails={setShowOrderDetails}
        currentOrder={currentOrder}
        orderStatusConfig={orderStatusConfig}
      />
    </div>
  );
};

export default AccountDashboard;
