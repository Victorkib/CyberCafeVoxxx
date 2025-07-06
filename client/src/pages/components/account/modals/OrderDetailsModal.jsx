'use client';
import { useSelector } from 'react-redux';
import {
  X,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  User,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import ButtonLoader from '../../loaders/ButtonLoader';

const OrderDetailsModal = ({
  showOrderDetails,
  setShowOrderDetails,
  currentOrder,
  orderStatusConfig,
}) => {
  const { darkMode } = useSelector((state) => state.ui);

  // Debug logging
  console.log('Modal props:', { showOrderDetails, currentOrder });

  if (!showOrderDetails) return null;

  if (!currentOrder) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div
          className={`max-w-md w-full p-6 rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={darkMode ? 'text-white' : 'text-gray-900'}>
              Loading order details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig =
    orderStatusConfig[currentOrder.status] || orderStatusConfig.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 flex items-center justify-between p-6 border-b ${
            darkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Order #{currentOrder.orderNumber}
            </h2>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Placed on {formatDate(currentOrder.createdAt)}
            </p>
          </div>
          <ButtonLoader
            onClick={() => setShowOrderDetails(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </ButtonLoader>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div
            className={`p-4 rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor}`}
          >
            <div className="flex items-center gap-3">
              <StatusIcon size={20} className={statusConfig.textColor} />
              <div>
                <h3 className={`font-semibold ${statusConfig.textColor}`}>
                  Order {statusConfig.label}
                </h3>
                <p className={`text-sm ${statusConfig.textColor} opacity-80`}>
                  Last updated: {formatDate(currentOrder.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div
            className={`border rounded-lg p-4 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3
              className={`font-semibold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              <Package size={18} />
              Order Items
            </h3>
            <div className="space-y-3">
              {currentOrder.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0] || '/placeholder.svg'}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <Package size={24} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {item.name}
                    </h4>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {formatCurrency(
                        item.totalPrice || item.price * item.quantity
                      )}
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div
            className={`border rounded-lg p-4 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3
              className={`font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Subtotal
                </span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  {formatCurrency(
                    currentOrder.totalAmount -
                      (currentOrder.taxAmount || 0) -
                      (currentOrder.shippingAmount || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Shipping
                </span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  {formatCurrency(currentOrder.shippingAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Tax
                </span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                  {formatCurrency(currentOrder.taxAmount || 0)}
                </span>
              </div>
              <div
                className={`flex justify-between pt-2 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <span
                  className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Total
                </span>
                <span
                  className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {formatCurrency(currentOrder.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div
            className={`border rounded-lg p-4 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3
              className={`font-semibold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              <Truck size={18} />
              Shipping Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4
                  className={`font-medium mb-2 flex items-center gap-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <MapPin size={16} />
                  Delivery Address
                </h4>
                <div
                  className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {currentOrder.shippingAddress ? (
                    <>
                      <p>{currentOrder.shippingAddress.street}</p>
                      <p>
                        {currentOrder.shippingAddress.city},{' '}
                        {currentOrder.shippingAddress.state}
                      </p>
                      <p>
                        {currentOrder.shippingAddress.country}{' '}
                        {currentOrder.shippingAddress.zipCode}
                      </p>
                    </>
                  ) : (
                    <p>No shipping address provided</p>
                  )}
                </div>
              </div>
              <div>
                <h4
                  className={`font-medium mb-2 flex items-center gap-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <User size={16} />
                  Customer Information
                </h4>
                <div
                  className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <p>{currentOrder.user?.name || 'N/A'}</p>
                  <p>{currentOrder.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div
            className={`border rounded-lg p-4 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3
              className={`font-semibold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              <CreditCard size={18} />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Payment Method
                </p>
                <p
                  className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {currentOrder.paymentMethod?.toUpperCase() || 'Not specified'}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Payment Status
                </p>
                <p
                  className={`font-medium ${
                    currentOrder.paymentStatus === 'paid'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}
                >
                  {currentOrder.paymentStatus?.toUpperCase() || 'Pending'}
                </p>
              </div>
              {currentOrder.paymentDetails?.transactionId && (
                <div className="md:col-span-2">
                  <p
                    className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Transaction ID
                  </p>
                  <p
                    className={`font-mono text-sm ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {currentOrder.paymentDetails.transactionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div
            className={`border rounded-lg p-4 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3
              className={`font-semibold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              <Calendar size={18} />
              Order Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Order Placed
                  </p>
                  <p
                    className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {formatDate(currentOrder.createdAt)}
                  </p>
                </div>
              </div>
              {currentOrder.paymentDetails?.timestamp && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Payment Confirmed
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {formatDate(currentOrder.paymentDetails.timestamp)}
                    </p>
                  </div>
                </div>
              )}
              {currentOrder.status !== 'pending' && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Order {statusConfig.label}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {formatDate(currentOrder.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
