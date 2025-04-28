'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  X,
  CreditCard,
  Check,
  ChevronLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';
import {
  clearCart,
  addToCart,
  removeFromCart,
  decreaseQuantity,
} from '../../redux/slices/cartSlice';
import { openAuthModal } from '../../redux/slices/uiSlice';
import { toast } from 'react-toastify';

const CheckoutModal = ({ isOpen, onClose, onUpdateQuantity, onRemoveItem }) => {
  const dispatch = useDispatch();
  const { items, totalAmount, loading, error } = useSelector(
    (state) => state.cart
  );
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState({});
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });

  // Calculate order summary whenever items or totalAmount changes
  useEffect(() => {
    const shipping = 0; // Free shipping for now
    const tax = totalAmount * 0.1; // 10% tax
    const total = totalAmount + shipping + tax;

    setOrderSummary({
      subtotal: totalAmount,
      shipping,
      tax,
      total,
    });
  }, [totalAmount, items]);

  // Pre-fill shipping info if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setShippingInfo((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, user]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      // Don't reset everything immediately to avoid UI flicker
      setTimeout(() => {
        if (!isOpen) {
          setStep(1);
          setIsComplete(false);
          setErrors({});
        }
      }, 300);
    }
  }, [isOpen]);

  // Handle errors from cart operations
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (!isOpen) return null;

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;

    // Special handling for card number formatting
    if (name === 'cardNumber') {
      const formattedValue = formatCardNumber(value);
      setCardInfo((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
    // Special handling for expiry date formatting
    else if (name === 'expiry') {
      const formattedValue = formatExpiryDate(value);
      setCardInfo((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
    // Special handling for CVC (numbers only)
    else if (name === 'cvc') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      setCardInfo((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setCardInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const formatExpiryDate = (value) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');

    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    } else {
      return cleaned;
    }
  };

  const validateShippingInfo = () => {
    const newErrors = {};

    if (!shippingInfo.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!shippingInfo.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!shippingInfo.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!shippingInfo.zipCode?.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingInfo.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format';
    }

    if (!shippingInfo.country?.trim()) {
      newErrors.country = 'Country is required';
    }

    if (
      shippingInfo.phone &&
      !/^(\+\d{1,3})?\s?\d{3}[\s.-]?\d{3}[\s.-]?\d{4}$/.test(shippingInfo.phone)
    ) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCardInfo = () => {
    const newErrors = {};

    if (!cardInfo.cardNumber?.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardInfo.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number format';
    }

    if (!cardInfo.cardName?.trim()) {
      newErrors.cardName = 'Name on card is required';
    }

    if (!cardInfo.expiry?.trim()) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardInfo.expiry)) {
      newErrors.expiry = 'Invalid format (MM/YY)';
    } else {
      // Check if expiry date is valid
      const [month, year] = cardInfo.expiry.split('/');
      const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of year
      const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)

      if (Number.parseInt(month) < 1 || Number.parseInt(month) > 12) {
        newErrors.expiry = 'Invalid month';
      } else if (
        Number.parseInt(year) < currentYear ||
        (Number.parseInt(year) === currentYear &&
          Number.parseInt(month) < currentMonth)
      ) {
        newErrors.expiry = 'Card has expired';
      }
    }

    if (!cardInfo.cvc?.trim()) {
      newErrors.cvc = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(cardInfo.cvc)) {
      newErrors.cvc = 'Invalid CVC';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal('login'));
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setStep(2);
  };

  const handleShippingSubmit = () => {
    if (validateShippingInfo()) {
      setStep(3);
    } else {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handlePayment = () => {
    if (validateCardInfo()) {
      setIsProcessing(true);

      // Simulate payment processing
      setTimeout(() => {
        // Create order object with all necessary information
        const order = {
          items: items.map((item) => ({
            productId: item.product?._id || item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingInfo,
          paymentInfo: {
            method: paymentMethod,
            // Don't include full card details in a real app
            cardLast4: cardInfo.cardNumber.slice(-4),
          },
          orderSummary: {
            subtotal: orderSummary.subtotal,
            shipping: orderSummary.shipping,
            tax: orderSummary.tax,
            total: orderSummary.total,
          },
          status: 'processing',
          orderedAt: new Date().toISOString(),
        };

        console.log('Order created:', order);

        // In a real app, you would send this to your backend
        // const response = await apiRequest.createOrder(order);

        setIsProcessing(false);
        setIsComplete(true);
        dispatch(clearCart());

        // Reset after showing success message
        setTimeout(() => {
          onClose();
          setStep(1);
          setIsComplete(false);
          setShippingInfo({
            fullName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            phone: '',
          });
          setCardInfo({
            cardNumber: '',
            cardName: '',
            expiry: '',
            cvc: '',
          });
        }, 3000);
      }, 2000);
    } else {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleIncreaseQuantity = (item) => {
    try {
      const productId = item.product?._id || item.productId;
      if (!productId) {
        console.error('Invalid product ID:', item);
        toast.error("Couldn't update item: missing product ID");
        return;
      }

      dispatch(
        addToCart({
          productId: String(productId),
          quantity: 1,
        })
      );
    } catch (error) {
      console.error('Error increasing quantity:', error);
      toast.error("Couldn't increase quantity");
    }
  };

  const handleDecreaseQuantity = (item) => {
    try {
      const productId = item.product?._id || item.productId;
      if (!productId) {
        console.error('Invalid product ID:', item);
        toast.error("Couldn't update item: missing product ID");
        return;
      }

      if (item.quantity <= 1) {
        handleRemoveItem(item);
      } else {
        dispatch(
          decreaseQuantity({
            productId: String(productId),
            currentQuantity: item.quantity,
          })
        );
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      toast.error("Couldn't decrease quantity");
    }
  };

  const handleRemoveItem = (item) => {
    try {
      const productId = item.product?._id || item.productId;
      if (!productId) {
        console.error('Invalid product ID:', item);
        toast.error("Couldn't remove item: missing product ID");
        return;
      }

      dispatch(removeFromCart(String(productId)));
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error("Couldn't remove item");
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

    // Limit to 16 digits
    const cardNumber = v.slice(0, 16);

    // Add spaces after every 4 digits
    const parts = [];
    for (let i = 0; i < cardNumber.length; i += 4) {
      parts.push(cardNumber.substring(i, i + 4));
    }

    return parts.join(' ');
  };

  const renderCartItems = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
            Your cart is empty
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      );
    }

    return (
      <div className="max-h-80 overflow-y-auto mb-6">
        {items.map((item) => (
          <div
            key={item.id || item.product?._id || item.productId}
            className="flex items-center py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={
                  item.image ||
                  item.product?.images[0] ||
                  '/placeholder.svg?height=80&width=80'
                }
                alt={item.name || item.product?.name || 'Product'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {item.name || item.product?.name || 'Product'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ${(item.price || item.product?.price || 0).toFixed(2)}
              </p>
              {item.size && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Size: {item.size}
                </p>
              )}
              {item.color && (
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                    Color:
                  </span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <button
                onClick={() => handleDecreaseQuantity(item)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="mx-2 w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => handleIncreaseQuantity(item)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="ml-4 text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                $
                {(
                  (item.price || item.product?.price || 0) * item.quantity
                ).toFixed(2)}
              </p>
              <button
                onClick={() => handleRemoveItem(item)}
                className="text-red-500 hover:text-red-700 text-xs flex items-center mt-1"
                aria-label="Remove item"
              >
                <Trash2 size={12} className="mr-1" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOrderSummary = () => (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
      <div className="flex justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          ${orderSummary.subtotal.toFixed(2)}
        </p>
      </div>
      <div className="flex justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">Shipping</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {orderSummary.shipping === 0
            ? 'Free'
            : `$${orderSummary.shipping.toFixed(2)}`}
        </p>
      </div>
      <div className="flex justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">Tax</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          ${orderSummary.tax.toFixed(2)}
        </p>
      </div>
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-base font-medium text-gray-900 dark:text-white">
          Total
        </p>
        <p className="text-base font-bold text-gray-900 dark:text-white">
          ${orderSummary.total.toFixed(2)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl p-6 mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Progress Steps */}
        {!isComplete && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div
                className={`flex flex-col items-center ${
                  step >= 1 ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    step >= 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  <ShoppingBag size={16} />
                </div>
                <span className="text-xs mt-1">Cart</span>
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              ></div>
              <div
                className={`flex flex-col items-center ${
                  step >= 2 ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    step >= 2
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  2
                </div>
                <span className="text-xs mt-1">Shipping</span>
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              ></div>
              <div
                className={`flex flex-col items-center ${
                  step >= 3 ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    step >= 3
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  3
                </div>
                <span className="text-xs mt-1">Payment</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Step 1: Review Cart */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Cart
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Review your items before checkout
              </p>
            </div>

            {renderCartItems()}

            {items.length > 0 && (
              <>
                {renderOrderSummary()}

                <div className="flex justify-between">
                  <button
                    onClick={onClose}
                    className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading || items.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 2: Shipping Information */}
        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Shipping Information
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Enter your shipping details
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleShippingSubmit();
              }}
            >
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingInfo.fullName || ''}
                  onChange={handleShippingInfoChange}
                  className={`w-full px-3 py-2 border ${
                    errors.fullName
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={shippingInfo.email || user?.email || ''}
                  onChange={handleShippingInfoChange}
                  className={`w-full px-3 py-2 border ${
                    errors.email
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address || ''}
                  onChange={handleShippingInfoChange}
                  className={`w-full px-3 py-2 border ${
                    errors.address
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="123 Main St"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city || ''}
                    onChange={handleShippingInfoChange}
                    className={`w-full px-3 py-2 border ${
                      errors.city
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo.state || ''}
                    onChange={handleShippingInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}"
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={shippingInfo.zipCode || ''}
                    onChange={handleShippingInfoChange}
                    className={`w-full px-3 py-2 border ${
                      errors.zipCode
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.zipCode}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingInfo.country || ''}
                    onChange={handleShippingInfoChange}
                    className={`w-full px-3 py-2 border ${
                      errors.country
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="United States"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingInfo.phone || ''}
                  onChange={handleShippingInfoChange}
                  className={`w-full px-3 py-2 border ${
                    errors.phone
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="(123) 456-7890"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  * Required fields
                </p>
              </div>
            </form>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <ChevronLeft size={16} className="mr-2" />
                Back to Cart
              </button>
              <button
                onClick={handleShippingSubmit}
                className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue to Payment
              </button>
            </div>
          </>
        )}

        {/* Step 3: Payment */}
        {step === 3 && !isComplete && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Payment
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Select your payment method
              </p>
            </div>

            <div className="mb-6">
              <div className="flex flex-col space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={paymentMethod === 'credit-card'}
                    onChange={() => setPaymentMethod('credit-card')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <CreditCard className="ml-3 h-5 w-5 text-gray-400" />
                  <span className="ml-3 font-medium text-gray-900 dark:text-white">
                    Credit Card
                  </span>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <svg
                    className="ml-3 h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .632-.54h6.964c2.075 0 3.747.517 4.713 1.52.453.473.787 1.066.98 1.773.202.728.234 1.575.094 2.549l-.007.053v.458c-.025.147-.05.3-.078.458-.446 2.526-1.96 3.836-4.818 4.15l-.204.022c-1.692.145-3.118-.39-4.07-1.525l.135 1.706.92 5.564a.64.64 0 0 1-.633.74l-1.81-.003zm10.746-12.44c-.593 2.767-2.247 3.064-4.872 3.064H11.97l.604-3.807a.32.32 0 0 1 .316-.27h.873c1.454 0 2.818 0 3.535-.831.431-.5.604-1.261.524-2.157z" />
                  </svg>
                  <span className="ml-3 font-medium text-gray-900 dark:text-white">
                    PayPal
                  </span>
                </label>
              </div>
            </div>

            {paymentMethod === 'credit-card' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Card Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardInfo.cardNumber}
                      onChange={handleCardInfoChange}
                      maxLength="19"
                      className={`w-full pl-10 pr-4 py-2 border ${
                        errors.cardNumber
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="1234 5678 9012 3456"
                    />
                    <CreditCard
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="cardName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Name on Card *
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={cardInfo.cardName}
                    onChange={handleCardInfoChange}
                    className={`w-full px-3 py-2 border ${
                      errors.cardName
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="John Doe"
                  />
                  {errors.cardName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.cardName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="expiry"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      name="expiry"
                      value={cardInfo.expiry}
                      onChange={handleCardInfoChange}
                      className={`w-full px-3 py-2 border ${
                        errors.expiry
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                    {errors.expiry && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.expiry}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="cvc"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      CVC *
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      name="cvc"
                      value={cardInfo.cvc}
                      onChange={handleCardInfoChange}
                      className={`w-full px-3 py-2 border ${
                        errors.cvc
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="123"
                      maxLength="4"
                    />
                    {errors.cvc && (
                      <p className="mt-1 text-sm text-red-500">{errors.cvc}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {renderOrderSummary()}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </>
        )}

        {/* Step 4: Success */}
        {isComplete && (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Thank you for your purchase. Your order has been placed
              successfully and will be processed shortly.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8 max-w-md mx-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Order confirmation has been sent to:
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.email || shippingInfo.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
