'use client';
import { useSelector, useDispatch } from 'react-redux';
import { X, LogOut } from 'lucide-react';
import { logout } from '../../../redux/slices/authSlice';
import ButtonLoader from '../loaders/ButtonLoader';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const MobileSidebar = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  tabs,
  activeTab,
  setActiveTab,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      toast.success('Logged out successfully');
      setIsMobileMenuOpen(false);
    }
  };

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-80 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-xl`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between h-16 px-6 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h2
            className={`text-xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer`}
          >
            <Link to="/">VoxCyber</Link>
          </h2>
          <ButtonLoader
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </ButtonLoader>
        </div>

        {/* User Profile */}
        <div
          className={`p-6 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p
                className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {user?.name || 'User'}
              </p>
              <p
                className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : `${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <div>
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
                  </div>
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
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <ButtonLoader
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </ButtonLoader>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
