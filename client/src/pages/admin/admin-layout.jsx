'use client';

import { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Package,
  ShoppingCart,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  User,
  HelpCircle,
  Home,
  Calendar,
  FileText,
  Activity,
  CreditCard,
  LayoutDashboard,
  UserCog,
  Mail,
} from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import { toggleDarkMode } from '../../redux/slices/uiSlice';

// Import your custom components
import Dashboard from './custom/dashboard';
import Products from './custom/products';
import  Order from './custom/order';
import Customers from './custom/customers';
import UsersManagement from './custom/users';
import NewsletterManagement from './NewsletterManagement';
import PaymentAnalyticsPage from './PaymentAnalyticsPage';
import PaymentManagementPage from './PaymentManagementPage';
import NotificationBell from './notifications/NotificationBell';
import NotificationsManagement from './notifications/NotificationsManagement';
import CategoryManagement from './categories/CategoryManagement';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

  // Persist dark mode preference
  useEffect(() => {
    // Check if user has a saved preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode !== darkMode) {
      dispatch(toggleDarkMode());
    }
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      // Apply dark mode to MUI and Ant Design components
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      // Remove dark mode from MUI and Ant Design components
      document.body.removeAttribute('data-theme');
    }

    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Add this function to handle dark mode toggle
  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const allNavigationItems = [
    {
      name: 'Dashboard',
      id: 'dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      roles: ['admin', 'super_admin'], // Both roles can access
    },
    {
      name: 'Products',
      id: 'products',
      icon: Package,
      path: '/admin/products',
      roles: ['admin', 'super_admin'], // Both roles can access
    },
    {
      name: 'Orders',
      id: 'orders',
      icon: ShoppingCart,
      path: '/admin/orders',
      roles: ['super_admin'], // Only super_admin can access
    },
    {
      name: 'Customers',
      id: 'customers',
      icon: Users,
      path: '/admin/customers',
      roles: ['super_admin'], // Only super_admin can access
    },
    {
      name: 'Categories',
      id: 'categories',
      icon: Users,
      path: '/admin/categories',
      roles: ['admin', 'super_admin'], // Both roles can access
    },
    {
      name: 'Payments',
      id: 'payments',
      icon: CreditCard,
      path: '/admin/payments',
      group: 'main',
      roles: ['super_admin'], // Only super_admin can access
    },
    {
      name: 'Users',
      id: 'users',
      icon: UserCog,
      path: '/admin/users',
      roles: ['super_admin'], // Only super_admin can access
    },
    {
      name: 'Newsletter',
      id: 'newsletter',
      icon: Mail,
      path: '/admin/newsletter',
      roles: ['super_admin'], // Only super_admin can access
    },
    {
      name: 'Notifications',
      id: 'notifications',
      icon: Bell,
      path: '/admin/notifications',
      roles: ['super_admin'], // Only super_admin can access
    },
    {
      name: 'Settings',
      id: 'settings',
      icon: Settings,
      path: '/admin/settings',
      roles: ['super_admin'], // Only super_admin can access
    },
  ];

  // Filter navigation items based on user role
  const navigation = allNavigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  // Group navigation items
  const mainNavItems = navigation.slice(0, 4);
  const secondaryNavItems = navigation.slice(4);

  // Get the current tab name for breadcrumb
  const getCurrentTabName = () => {
    const path = location.pathname.split('/').pop();
    const currentTab = navigation.find((item) => item.id === path);
    return currentTab ? currentTab.name : 'Dashboard';
  };

  // Notifications
  const notifications = [
    {
      id: 1,
      title: 'New Order',
      message: 'You have a new order #1234',
      time: '5 min ago',
      isRead: false,
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      message: 'Product "Wireless Mouse" is low on stock',
      time: '1 hour ago',
      isRead: false,
    },
    {
      id: 3,
      title: 'Payment Received',
      message: 'Payment for order #1233 has been received',
      time: '3 hours ago',
      isRead: true,
    },
    {
      id: 4,
      title: 'New Customer',
      message: 'John Doe has registered as a new customer',
      time: 'Yesterday',
      isRead: true,
    },
  ];

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${
        isCollapsed ? 'sidebar-collapsed' : ''
      }`}
    >
      {/* Sidebar for desktop */}
      <div
        className={`hidden md:flex md:flex-col ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
          <div
            className={`flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {!isCollapsed && (
              <Link
                to="/"
                className="text-xl font-bold text-blue-600 dark:text-blue-400"
              >
                VoxCyber
              </Link>
            )}
            {isCollapsed && (
              <Link
                to="/"
                className="text-xl font-bold text-blue-600 dark:text-blue-400"
              >
                V
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <ChevronRight
                className={`h-5 w-5 transform transition-transform duration-200 ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <div className="px-3 py-4">
              {/* Main Navigation */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Main
                  </h3>
                )}
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (location.pathname === '/admin' && item.id === 'dashboard');

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`group flex items-center ${
                        isCollapsed ? 'justify-center' : 'justify-start'
                      } w-full px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon
                        className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                        }`}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                      {isCollapsed && isActive && (
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Secondary Navigation */}
              <div className="mt-8 space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Secondary
                  </h3>
                )}
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`group flex items-center ${
                        isCollapsed ? 'justify-center' : 'justify-start'
                      } w-full px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon
                        className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                        }`}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                      {isCollapsed && isActive && (
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div
            className={`p-4 border-t border-gray-200 dark:border-gray-700 ${
              isCollapsed ? 'flex justify-center' : ''
            }`}
          >
            {!isCollapsed && (
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name || 'Admin User'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      user?.role === 'super_admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {user?.role === 'super_admin' ? 'SUPER' : 'ADMIN'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                {user?.name?.charAt(0) || 'A'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-in-out"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out transform">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-5">
                <Link
                  to="/"
                  className="text-xl font-bold text-blue-600 dark:text-blue-400"
                >
                  VoxCyber
                </Link>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <div className="space-y-1 mb-8">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Main
                  </h3>
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      (location.pathname === '/admin' &&
                        item.id === 'dashboard');

                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon
                          className={`mr-4 h-5 w-5 ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                <div className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Secondary
                  </h3>
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon
                          className={`mr-4 h-5 w-5 ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex-shrink-0 group block">
                <div className="flex items-center">
                  <div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {user?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10 transition-colors duration-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Menu className="h-6 w-6" />
                </button>

                {/* Breadcrumb */}
                <nav className="hidden md:flex ml-4" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    <li>
                      <div className="flex items-center">
                        <Link
                          to="/admin/dashboard"
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Home className="h-4 w-4" />
                          <span className="sr-only">Home</span>
                        </Link>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getCurrentTabName()}
                        </span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <NotificationBell />
                <button
                  onClick={handleToggleDarkMode}
                  className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Page header */}
              <div className="md:flex md:items-center md:justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getCurrentTabName()}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {location.pathname.includes('dashboard') &&
                      'Overview of your business performance and key metrics.'}
                    {location.pathname.includes('products') &&
                      'Manage your product inventory and catalog.'}
                    {location.pathname.includes('orders') &&
                      'Track and manage customer orders.'}
                    {location.pathname.includes('customers') &&
                      'View and manage your customer database.'}
                    {location.pathname.includes('categories') &&
                      'View and manage your categories database.'}
                    {location.pathname.includes('analytics') &&
                      'Analyze your business data and trends.'}
                    {location.pathname.includes('calendar') &&
                      'Manage your schedule and upcoming events.'}
                    {location.pathname.includes('documents') &&
                      'Access and organize your important files.'}
                    {location.pathname.includes('settings') &&
                      'Configure your application settings.'}
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    {location.pathname.includes('products') && 'Add Product'}
                    {location.pathname.includes('orders') && 'Create Order'}
                    {location.pathname.includes('customers') && 'Add Customer'}
                    {location.pathname.includes('categories') && 'Add Categories'}
                    {location.pathname.includes('dashboard') && 'Refresh Data'}
                    {location.pathname.includes('analytics') &&
                      'Generate Report'}
                    {location.pathname.includes('calendar') && 'Add Event'}
                    {location.pathname.includes('documents') && 'Upload File'}
                    {location.pathname.includes('settings') && 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Content area */}
              <div className="py-4">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<CategoryManagement />} />
                  
                  {/* Super Admin Only Routes */}
                  {user?.role === 'super_admin' && (
                    <>
                      <Route path="/orders" element={<Order />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/payments" element={<PaymentManagementPage />} />
                      <Route path="/payments/analytics" element={<PaymentAnalyticsPage />} />
                      <Route path="/users" element={<UsersManagement />} />
                      <Route path="/newsletter" element={<NewsletterManagement />} />
                      <Route path="/notifications" element={<NotificationsManagement />} />
                      <Route path="/settings" element={<Settings />} />
                    </>
                  )}
                  
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  
                  {/* Fallback for unauthorized access */}
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="text-6xl mb-4">🚫</div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Access Denied
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You don't have permission to access this page.
                      </p>
                      <Link 
                        to="/admin/dashboard" 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  } />
                </Routes>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
