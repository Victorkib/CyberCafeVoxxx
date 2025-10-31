'use client';
import { useSelector } from 'react-redux';
import {
  User,
  Package,
  Heart,
  Award,
  TrendingUp,
  ShoppingBag,
  Eye,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import ButtonLoader from '../../loaders/ButtonLoader';
import SectionLoader from '../../loaders/SectionLoader';
import { formatDate, formatCurrency } from '../../../../utils/formatters';

const OverviewTab = ({
  orders,
  ordersLoading,
  setActiveTab,
  handleViewOrder,
  orderStatusConfig,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div
        className={`rounded-xl p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-blue-100">
              Here's what's happening with your account
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Total Orders
              </p>
              <p
                className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {orders?.length || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Total Spent
              </p>
              <p
                className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {formatCurrency(
                  orders?.reduce(
                    (total, order) => total + (order.totalAmount || 0),
                    0
                  ) || 0
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Wishlist Items
              </p>
              <p
                className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                5
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border ${
            darkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Reward Points
              </p>
              <p
                className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                1,250
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div
        className={`rounded-xl border p-6 ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Recent Orders
          </h3>
          <ButtonLoader
            onClick={() => setActiveTab('orders')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All
          </ButtonLoader>
        </div>

        {ordersLoading ? (
          <div className="flex justify-center py-8">
            <SectionLoader />
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              No orders yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.slice(0, 3).map((order) => {
              const statusConfig =
                orderStatusConfig[order.status] || orderStatusConfig.pending;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order._id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    darkMode
                      ? 'border-gray-700 bg-gray-750'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      #{order.orderNumber?.slice(-3)}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Order #{order.orderNumber}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(order.createdAt)} •{' '}
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                    >
                      <StatusIcon size={12} />
                      {statusConfig.label}
                    </span>
                    <ButtonLoader
                      onClick={() => handleViewOrder(order._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye size={16} />
                    </ButtonLoader>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div
        className={`rounded-xl border p-6 ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ButtonLoader
            onClick={() => setActiveTab('profile')}
            className={`p-4 rounded-lg border text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`}
          >
            <User className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <span
              className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Edit Profile
            </span>
          </ButtonLoader>

          <ButtonLoader
            onClick={() => setActiveTab('addresses')}
            className={`p-4 rounded-lg border text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`}
          >
            <MapPin className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <span
              className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Addresses
            </span>
          </ButtonLoader>

          <ButtonLoader
            onClick={() => setActiveTab('wishlist')}
            className={`p-4 rounded-lg border text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`}
          >
            <Heart className="w-6 h-6 mx-auto mb-2 text-red-600 dark:text-red-400" />
            <span
              className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Wishlist
            </span>
          </ButtonLoader>

          <ButtonLoader
            onClick={() => setActiveTab('help')}
            className={`p-4 rounded-lg border text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`}
          >
            <HelpCircle className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <span
              className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Get Help
            </span>
          </ButtonLoader>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
