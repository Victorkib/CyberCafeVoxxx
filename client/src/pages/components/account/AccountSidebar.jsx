'use client';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Package,
  Bell,
  Heart,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  MapPin,
  Award,
  Activity,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { logout } from '../../../redux/slices/authSlice';
import { toggleDarkMode } from '../../../redux/slices/uiSlice';
import ButtonLoader from '../loaders/ButtonLoader';
import { toast } from 'react-toastify';

const AccountSidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  orders,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      toast.success('Logged out successfully');
    }
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
          >
            VoxCyber
          </Link>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleDarkMode}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {user?.name || 'User'}
              </p>
              <p
                className={`text-sm truncate ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Profile */}
      {isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-center">
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer"
            title={user?.name || 'User'}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <div key={tab.id} className="relative group">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : `${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {!isCollapsed && (
                      <div className="text-left">
                        <div className="font-medium">{tab.label}</div>
                        <div
                          className={`text-xs ${
                            isActive
                              ? 'text-blue-100'
                              : darkMode
                              ? 'text-gray-500'
                              : 'text-gray-500'
                          }`}
                        >
                          {tab.description}
                        </div>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-2">
                      {tab.count !== undefined && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${
                          isActive ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  )}
                </button>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-300">
                      {tab.description}
                    </div>
                    {tab.count !== undefined && (
                      <div className="text-xs text-blue-300 mt-1">
                        {tab.count} items
                      </div>
                    )}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <ButtonLoader
          onClick={handleLogout}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'gap-3'
          } px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </ButtonLoader>
      </div>
    </div>
  );
};

export default AccountSidebar;
