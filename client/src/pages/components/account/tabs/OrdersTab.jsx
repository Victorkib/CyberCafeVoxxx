'use client';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, ShoppingBag, Eye, XCircle, Star } from 'lucide-react';
import ButtonLoader from '../../loaders/ButtonLoader';
import SectionLoader from '../../loaders/SectionLoader';
import { formatDate, formatCurrency } from '../../../../utils/formatters';

const OrdersTab = ({
  orders,
  ordersLoading,
  orderFilters,
  setOrderFilters,
  handleViewOrder,
  handleCancelOrder,
  orderStatusConfig,
}) => {
  const { darkMode } = useSelector((state) => state.ui);

  return (
    <div className="space-y-6">
      {/* Orders Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            My Orders
          </h2>
          <p
            className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Track and manage your orders
          </p>
        </div>

        {/* Order Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search orders..."
              value={orderFilters.search}
              onChange={(e) =>
                setOrderFilters({ ...orderFilters, search: e.target.value })
              }
              className={`pl-10 pr-4 py-2 border rounded-lg text-sm ${
                darkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <select
            value={orderFilters.status}
            onChange={(e) =>
              setOrderFilters({ ...orderFilters, status: e.target.value })
            }
            className={`px-4 py-2 border rounded-lg text-sm ${
              darkMode
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={orderFilters.dateRange}
            onChange={(e) =>
              setOrderFilters({ ...orderFilters, dateRange: e.target.value })
            }
            className={`px-4 py-2 border rounded-lg text-sm ${
              darkMode
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {ordersLoading ? (
        <div className="flex justify-center py-12">
          <SectionLoader />
        </div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3
            className={`text-lg font-medium mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            No orders found
          </h3>
          <p
            className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            You haven't placed any orders yet. Start shopping to see your orders
            here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShoppingBag size={16} />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig =
              orderStatusConfig[order.status] || orderStatusConfig.pending;
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-xl p-6 ${
                  darkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
                } hover:shadow-lg transition-all duration-200`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3
                        className={`font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Order #{order.orderNumber}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                      >
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p
                          className={`font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Order Date
                        </p>
                        <p
                          className={
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }
                        >
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Total Amount
                        </p>
                        <p
                          className={`font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Items
                        </p>
                        <p
                          className={
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }
                        >
                          {order.items?.length || 0} item(s)
                        </p>
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Payment
                        </p>
                        <p
                          className={
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }
                        >
                          {order.paymentMethod?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package
                            size={16}
                            className={
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }
                          />
                          <span
                            className={`text-sm font-medium ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            Items in this order:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                darkMode
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {item.name} (x{item.quantity})
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                darkMode
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <ButtonLoader
                      onClick={() => handleViewOrder(order._id)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye size={16} />
                      View Details
                    </ButtonLoader>

                    {order.status === 'pending' && (
                      <ButtonLoader
                        onClick={() => handleCancelOrder(order._id)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <XCircle size={16} />
                        Cancel
                      </ButtonLoader>
                    )}

                    {order.status === 'delivered' && (
                      <ButtonLoader
                        onClick={() => {
                          /* TODO: Implement review functionality */
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Star size={16} />
                        Review
                      </ButtonLoader>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
