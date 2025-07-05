'use client';
import { useSelector } from 'react-redux';
import { Menu, Bell, Search } from 'lucide-react';
import ButtonLoader from '../loaders/ButtonLoader';

const AccountHeader = ({ currentTab, setIsMobileMenuOpen, isCollapsed }) => {
  const { darkMode } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  return (
    <header
      className={`sticky top-0 z-40 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b shadow-sm`}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <ButtonLoader
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu size={20} />
          </ButtonLoader>

          {/* Current tab info */}
          <div className="hidden sm:block">
            <h1
              className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {currentTab?.label || 'Dashboard'}
            </h1>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {currentTab?.description || 'Manage your account'}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              className={`pl-10 pr-4 py-2 border rounded-lg text-sm w-64 ${
                darkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Notifications */}
          <ButtonLoader className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </ButtonLoader>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p
                className={`text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {user?.name || 'User'}
              </p>
              <p
                className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AccountHeader;
