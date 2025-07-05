'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  Check,
  ChevronLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Phone,
  Shield,
  Smartphone,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

// Redux imports
import {
  clearCart,
  addToCart,
  removeFromCart,
  decreaseQuantity,
} from '../../redux/slices/cartSlice';
import { createOrder } from '../../redux/slices/orderSlice';
import {
  getPaymentMethods,
  initializePayment,
  checkPaymentStatus,
  retryPayment,
  processInlineCallback, // NEW: Import inline callback action
} from '../../redux/slices/paymentSlice';
import { openAuthModal } from '../../redux/slices/uiSlice';
// NEW: Import product actions to refresh product data
import {
  fetchProducts,
  fetchProductById,
} from '../../redux/slices/productsSlice';

// Components
import ButtonLoader from '../../pages/components/loaders/ButtonLoader';
import SectionLoader from '../../pages/components/loaders/SectionLoader';
import ToastLoader from '../../pages/components/loaders/ToastLoader';
import LoaderSpinner from '../../pages/components/loaders/LoaderSpinner';

// Utils
import { toast } from 'react-toastify';
import { PAYMENT_METHODS } from '../../constants/payment';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const CheckoutModal = ({ isOpen, onClose, onUpdateQuantity, onRemoveItem }) => {
  const dispatch = useDispatch();
  const {
    items,
    totalAmount,
    loading: cartLoading,
    error: cartError,
  } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const { loading: orderLoading, currentOrder } = useSelector(
    (state) => state.order
  );
  const {
    methods: paymentMethods,
    loading: paymentLoading,
    currentPayment,
  } = useSelector((state) => state.payment);

  // State management
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.PAYSTACK);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToastLoader, setShowToastLoader] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paystackHandler, setPaystackHandler] = useState(null);

  // Form data
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Kenya',
    phone: '',
    email: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    phoneNumber: '',
    email: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });

  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });

  // Toast loader helpers
  const showToastLoaderWithMessage = useCallback((message) => {
    setToastMessage(message);
    setShowToastLoader(true);
  }, []);

  const hideToastLoader = useCallback(() => {
    setShowToastLoader(false);
    setToastMessage('');
  }, []);

  // NEW: Function to refresh product data after successful payment
  const refreshProductData = useCallback(async () => {
    try {
      // Refresh products list to update stock numbers
      await dispatch(fetchProducts()).unwrap();

      // If we have specific product IDs from cart items, refresh them individually
      const productIds = items
        .map((item) => item.product?._id || item.productId)
        .filter(Boolean);

      for (const productId of productIds) {
        try {
          await dispatch(fetchProductById(productId)).unwrap();
        } catch (error) {
          console.warn(`Failed to refresh product ${productId}:`, error);
        }
      }

      console.log('✅ Product data refreshed after successful payment');
    } catch (error) {
      console.error('❌ Failed to refresh product data:', error);
    }
  }, [dispatch, items]);

  // Initialize Paystack
  useEffect(() => {
    if (typeof window !== 'undefined' && window.PaystackPop) {
      console.log('Paystack is available');
    } else {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('Paystack script loaded');
      };
      script.onerror = () => {
        console.error('Failed to load Paystack script');
        toast.error('Failed to load payment system. Please refresh the page.');
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  // Calculate order summary
  useEffect(() => {
    const shipping = totalAmount > 100 ? 0 : 10;
    const tax = totalAmount * 0.16;
    const total = totalAmount + shipping + tax;

    setOrderSummary({
      subtotal: totalAmount,
      shipping,
      tax,
      total,
    });
  }, [totalAmount, items]);

  // Pre-fill user information
  useEffect(() => {
    if (isAuthenticated && user) {
      setShippingInfo((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));

      setPaymentInfo((prev) => ({
        ...prev,
        phoneNumber: user.phone || prev.phoneNumber,
        email: user.email || prev.email,
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch payment methods
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      dispatch(getPaymentMethods());
    }
  }, [isOpen, isAuthenticated, dispatch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        if (!isOpen) {
          setStep(1);
          setIsComplete(false);
          setErrors({});
          setPaymentStatus('idle');
          setIsProcessing(false);
          if (paystackHandler) {
            setPaystackHandler(null);
          }
        }
      }, 300);
    }
  }, [isOpen, paystackHandler]);

  // FIXED: Enhanced payment status polling with proper backend integration
  useEffect(() => {
    let statusCheckInterval;
    let retryCount = 0;
    const MAX_RETRIES = 40;

    if (currentPayment && currentOrder && step === 3 && isProcessing) {
      console.log('🔄 Starting payment status polling', {
        orderId: currentOrder._id,
        paymentMethod,
        currentPayment: currentPayment.paymentId || currentPayment._id,
      });

      statusCheckInterval = setInterval(async () => {
        if (retryCount >= MAX_RETRIES) {
          clearInterval(statusCheckInterval);
          setIsProcessing(false);
          setPaymentStatus('expired');
          toast.error(
            'Payment verification timed out. Please check your order status.'
          );
          return;
        }

        try {
          console.log(
            `📡 Checking payment status (attempt ${
              retryCount + 1
            }/${MAX_RETRIES})`
          );

          // CRITICAL FIX: Use the correct endpoint to check payment status
          const response = await dispatch(
            checkPaymentStatus(currentOrder._id)
          ).unwrap();

          console.log('📊 Payment status response:', response);

          const status =
            response.data?.paymentStatus ||
            response.data?.paymentDetails?.status;

          setPaymentStatus(status);

          if (status === 'paid' || status === 'success') {
            clearInterval(statusCheckInterval);
            setIsProcessing(false);
            setIsComplete(true);

            console.log(
              '✅ Payment confirmed as successful - clearing cart and refreshing products'
            );

            // Clear cart and refresh product data
            dispatch(clearCart());
            await refreshProductData();

            toast.success(
              'Payment successful! Your order has been confirmed and stock has been updated.'
            );
          } else if (status === 'failed') {
            clearInterval(statusCheckInterval);
            setIsProcessing(false);
            setPaymentStatus('failed');

            if (paymentMethod === PAYMENT_METHODS.MPESA) {
              toast.error(
                'M-Pesa payment failed. Please check your phone and try again.'
              );
            } else {
              toast.error('Payment failed. Please try again.');
            }
          } else if (status === 'expired') {
            clearInterval(statusCheckInterval);
            setIsProcessing(false);
            setPaymentStatus('expired');
            toast.error('Payment session expired. Please try again.');
          }

          retryCount++;
        } catch (error) {
          console.error('❌ Error checking payment status:', error);
          retryCount++;
        }
      }, 15000); // Check every 15 seconds
    }

    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [
    currentPayment,
    currentOrder,
    step,
    isProcessing,
    dispatch,
    paymentMethod,
    refreshProductData,
  ]);

  // Form handlers
  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.startsWith('0')) {
        formattedValue = '254' + formattedValue.slice(1);
      } else if (!formattedValue.startsWith('254')) {
        formattedValue = '254' + formattedValue;
      }
      formattedValue = formattedValue.slice(0, 12);

      setPaymentInfo((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setPaymentInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validation functions
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

    if (!shippingInfo.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (
      shippingInfo.phone &&
      !/^254[0-9]{9}$/.test(shippingInfo.phone.replace(/\s/g, ''))
    ) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentInfo = useCallback(() => {
    const newErrors = {};

    if (paymentMethod === PAYMENT_METHODS.MPESA) {
      if (!paymentInfo.phoneNumber?.trim()) {
        newErrors.phoneNumber = 'Phone number is required for M-Pesa payments';
      } else if (!/^254[0-9]{9}$/.test(paymentInfo.phoneNumber)) {
        newErrors.phoneNumber = 'Invalid phone number format (254XXXXXXXXX)';
      }
    } else if (paymentMethod === PAYMENT_METHODS.PAYSTACK) {
      if (!paymentInfo.email?.trim()) {
        newErrors.email = 'Email is required for Paystack payments';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [paymentInfo.phoneNumber, paymentInfo.email, paymentMethod]);

  // FIXED: Enhanced Paystack payment handler with non-async callback
  const handlePaystackPayment = useCallback(
    (orderData, backendReference) => {
      return new Promise((resolve, reject) => {
        if (!window.PaystackPop) {
          reject(new Error('Paystack is not loaded'));
          return;
        }

        // FIXED: Use the reference from backend
        const reference = backendReference;

        console.log('🚀 Initializing Paystack payment', {
          orderId: orderData._id,
          reference,
          amount: Math.round(orderSummary.total * 100),
        });

        const handler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: paymentInfo.email || shippingInfo.email,
          amount: Math.round(orderSummary.total * 100),
          currency: 'KES',
          ref: reference, // Use the backend reference
          metadata: {
            orderId: orderData._id,
            orderNumber: orderData.orderNumber,
            custom_fields: [
              {
                display_name: 'Order Number',
                variable_name: 'order_number',
                value: orderData.orderNumber,
              },
              {
                display_name: 'Customer Name',
                variable_name: 'customer_name',
                value: shippingInfo.fullName,
              },
            ],
          },
          // Rest of the callback implementation remains the same
          callback: (response) => {
            console.log('✅ Paystack payment callback received:', response);

            const callbackData = {
              orderId: orderData._id,
              reference: response.reference, // This should match the backend reference
              status: 'success',
              transactionId: response.trans,
              metadata: {
                paymentMethod: PAYMENT_METHODS.PAYSTACK,
                reference: response.reference,
                orderNumber: orderData.orderNumber,
                paystackResponse: response,
              },
            };

            console.log('📤 Sending inline callback to backend:', callbackData);

            dispatch(processInlineCallback(callbackData))
              .unwrap()
              .then((callbackResult) => {
                console.log(
                  '✅ Inline callback processed successfully:',
                  callbackResult
                );
                return refreshProductData();
              })
              .then(() => {
                resolve({
                  success: true,
                  reference: response.reference,
                  status: 'success',
                  transactionId: response.trans,
                  message: 'Payment completed successfully',
                });
              })
              .catch((error) => {
                console.error('❌ Error processing inline callback:', error);
                resolve({
                  success: true,
                  reference: response.reference,
                  status: 'success',
                  transactionId: response.trans,
                  message: 'Payment completed successfully',
                  callbackError: error.message,
                });
              });
          },
          onClose: () => {
            console.log('❌ Paystack payment window closed');
            reject(new Error('Payment window was closed'));
          },
        });

        handler.openIframe();
        setPaystackHandler(handler);
      });
    },
    [
      paymentInfo.email,
      shippingInfo.email,
      shippingInfo.fullName,
      orderSummary.total,
      dispatch,
      refreshProductData,
    ]
  );

  // Action handlers
  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal('login'));
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setStep(2);
  }, [isAuthenticated, items.length, dispatch]);

  const handleShippingSubmit = useCallback(() => {
    if (validateShippingInfo()) {
      setStep(3);
    } else {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [errors]);

  // FIXED: Enhanced payment handler with proper backend integration
  const handlePayment = useCallback(async () => {
    if (!validatePaymentInfo()) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    showToastLoaderWithMessage('Creating order...');

    try {
      console.log('🛒 Creating order with items:', items);

      // Create order first
      const orderData = {
        items: items.map((item) => ({
          product: item.product?._id || item.productId,
          quantity: item.quantity,
          name: item.name || item.product?.name || 'Product',
          price: item.price || item.product?.price || 0,
          totalPrice: (item.price || item.product?.price || 0) * item.quantity,
        })),
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state || 'N/A',
          country: shippingInfo.country,
          zipCode: shippingInfo.zipCode || '00000',
        },
        paymentMethod: paymentMethod,
        itemsPrice: orderSummary.subtotal,
        taxPrice: orderSummary.tax,
        shippingPrice: orderSummary.shipping,
        totalPrice: orderSummary.total,
      };

      console.log('📦 Creating order:', orderData);

      const orderResult = await dispatch(createOrder(orderData)).unwrap();
      const orderId = orderResult._id || orderResult.data._id;

      console.log('✅ Order created successfully:', {
        orderId,
        orderNumber: orderResult.orderNumber,
      });

      hideToastLoader();

      if (paymentMethod === PAYMENT_METHODS.PAYSTACK) {
        showToastLoaderWithMessage('Opening Paystack checkout...');

        try {
          // CRITICAL FIX: Don't generate a new reference, use the one from backend
          const initPaymentData = {
            orderId: orderId,
            method: PAYMENT_METHODS.PAYSTACK,
            email: paymentInfo.email || shippingInfo.email,
            amount: orderSummary.total,
            // Remove the reference generation here - let backend handle it
          };

          // Initialize payment record on backend
          const paymentInitResult = await dispatch(
            initializePayment(initPaymentData)
          ).unwrap();

          console.log('✅ Payment initialized:', paymentInitResult);

          hideToastLoader();

          // FIXED: Use the reference returned from backend
          const backendReference =
            paymentInitResult.reference || paymentInitResult.transactionId;

          // Handle Paystack inline checkout with backend reference
          const paymentResult = await handlePaystackPayment(
            orderResult,
            backendReference
          );

          if (paymentResult.success) {
            console.log('🎉 Payment completed successfully');

            setIsProcessing(false);
            setIsComplete(true);
            setPaymentStatus('success');

            // Clear cart and refresh products
            dispatch(clearCart());
            await refreshProductData();

            toast.success(
              'Payment successful! Your order has been confirmed and stock has been updated.'
            );
          }
        } catch (paymentError) {
          hideToastLoader();
          setIsProcessing(false);
          setPaymentStatus('failed');

          console.error('❌ Payment error:', paymentError);

          if (paymentError.message === 'Payment window was closed') {
            toast.error('Payment was cancelled. You can retry the payment.');
          } else {
            toast.error('Payment failed: ' + paymentError.message);
          }
        }
      } else if (paymentMethod === PAYMENT_METHODS.MPESA) {
        // Handle M-Pesa payment
        showToastLoaderWithMessage('Sending M-Pesa request to your phone...');

        const paymentData = {
          orderId: orderId,
          method: paymentMethod,
          amount: orderSummary.total,
          currency: 'KES',
          phoneNumber: paymentInfo.phoneNumber,
          callback_url: `${window.location.origin}/payment/callback`,
        };

        console.log('📱 Initializing M-Pesa payment:', paymentData);

        const paymentResult = await dispatch(
          initializePayment(paymentData)
        ).unwrap();

        hideToastLoader();

        if (paymentResult.checkoutRequestId) {
          toast.success(
            'M-Pesa request sent! Please check your phone and enter your PIN.'
          );
          setPaymentStatus('processing');

          console.log('✅ M-Pesa payment initialized, starting status polling');
        } else {
          throw new Error('Failed to send M-Pesa request');
        }
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      setIsProcessing(false);
      setPaymentStatus('failed');
      hideToastLoader();
      toast.error(
        error?.message || 'Payment initialization failed. Please try again.'
      );
    }
  }, [
    errors,
    items,
    shippingInfo,
    paymentMethod,
    paymentInfo,
    orderSummary,
    dispatch,
    showToastLoaderWithMessage,
    hideToastLoader,
    validatePaymentInfo,
    handlePaystackPayment,
    refreshProductData,
  ]);

  const handleRetryPayment = useCallback(async () => {
    if (!currentOrder) return;

    setIsProcessing(true);
    setPaymentStatus('processing');
    showToastLoaderWithMessage('Retrying payment...');

    try {
      if (paymentMethod === PAYMENT_METHODS.PAYSTACK) {
        const paymentResult = await handlePaystackPayment(currentOrder);

        if (paymentResult.success) {
          setIsProcessing(false);
          setIsComplete(true);
          setPaymentStatus('success');
          dispatch(clearCart());
          await refreshProductData();
          toast.success(
            'Payment successful! Your order has been confirmed and stock has been updated.'
          );
        }
      } else {
        const retryData = {
          orderId: currentOrder._id,
          method: paymentMethod,
          phoneNumber: paymentInfo.phoneNumber,
        };

        await dispatch(retryPayment(retryData)).unwrap();
        toast.success('Payment request resent! Please check your phone.');
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      setIsProcessing(false);
      setPaymentStatus('failed');
      toast.error('Failed to retry payment. Please try again.');
    } finally {
      hideToastLoader();
    }
  }, [
    currentOrder,
    paymentMethod,
    paymentInfo.phoneNumber,
    dispatch,
    showToastLoaderWithMessage,
    hideToastLoader,
    handlePaystackPayment,
    refreshProductData,
  ]);

  // Cart item handlers
  const handleIncreaseQuantity = useCallback(
    (item) => {
      try {
        const productId = item.product?._id || item.productId;
        if (!productId) {
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
    },
    [dispatch]
  );

  const handleDecreaseQuantity = useCallback(
    (item) => {
      try {
        const productId = item.product?._id || item.productId;
        if (!productId) {
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
    },
    [dispatch]
  );

  const handleRemoveItem = useCallback(
    (item) => {
      try {
        const productId = item.product?._id || item.productId;
        if (!productId) {
          toast.error("Couldn't remove item: missing product ID");
          return;
        }

        dispatch(removeFromCart(String(productId)));
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error("Couldn't remove item");
      }
    },
    [dispatch]
  );

  // Render functions (keeping existing render functions unchanged)
  const renderCartItems = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p
            className={`text-lg mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Your cart is empty
          </p>
          <ButtonLoader
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Continue Shopping
          </ButtonLoader>
        </div>
      );
    }

    return (
      <div className="max-h-80 overflow-y-auto mb-6">
        {items.map((item) => (
          <motion.div
            key={item.id || item.product?._id || item.productId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex items-center py-4 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={
                  item.image ||
                  item.product?.images?.[0] ||
                  '/placeholder.svg?height=80&width=80' ||
                  '/placeholder.svg' ||
                  '/placeholder.svg' ||
                  '/placeholder.svg'
                }
                alt={item.name || item.product?.name || 'Product'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4 flex-1">
              <h3
                className={`text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {item.name || item.product?.name || 'Product'}
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                KES{' '}
                {((item.price || item.product?.price || 0) * 100).toFixed(0)}
              </p>
              {/* NEW: Show current stock if available */}
              {item.product?.stock !== undefined && (
                <p
                  className={`text-xs ${
                    item.product.stock > 0
                      ? darkMode
                        ? 'text-green-400'
                        : 'text-green-600'
                      : darkMode
                      ? 'text-red-400'
                      : 'text-red-600'
                  }`}
                >
                  Stock: {item.product.stock} available
                </p>
              )}
            </div>
            <div className="flex items-center">
              <ButtonLoader
                onClick={() => handleDecreaseQuantity(item)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent border-none"
                aria-label="Decrease quantity"
                size="sm"
              >
                <Minus size={16} />
              </ButtonLoader>
              <span className="mx-2 w-8 text-center">{item.quantity}</span>
              <ButtonLoader
                onClick={() => handleIncreaseQuantity(item)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent border-none"
                aria-label="Increase quantity"
                size="sm"
                // NEW: Disable if out of stock
                disabled={
                  item.product?.stock !== undefined &&
                  item.quantity >= item.product.stock
                }
              >
                <Plus size={16} />
              </ButtonLoader>
            </div>
            <div className="ml-4 text-right">
              <p
                className={`text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                KES{' '}
                {(
                  (item.price || item.product?.price || 0) *
                  item.quantity *
                  100
                ).toFixed(0)}
              </p>
              <ButtonLoader
                onClick={() => handleRemoveItem(item)}
                className="text-red-500 hover:text-red-700 text-xs flex items-center mt-1 bg-transparent border-none p-0"
                aria-label="Remove item"
                size="sm"
              >
                <Trash2 size={12} className="mr-1" />
                Remove
              </ButtonLoader>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderOrderSummary = () => (
    <div
      className={`border-t pt-4 mb-6 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="flex justify-between mb-2">
        <p
          className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          Subtotal
        </p>
        <p
          className={`text-sm font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          KES {(orderSummary.subtotal * 100).toFixed(0)}
        </p>
      </div>
      <div className="flex justify-between mb-2">
        <p
          className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          Shipping
        </p>
        <p
          className={`text-sm font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {orderSummary.shipping === 0
            ? 'Free'
            : `KES ${(orderSummary.shipping * 100).toFixed(0)}`}
        </p>
      </div>
      <div className="flex justify-between mb-2">
        <p
          className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          VAT (16%)
        </p>
        <p
          className={`text-sm font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          KES {(orderSummary.tax * 100).toFixed(0)}
        </p>
      </div>
      <div
        className={`flex justify-between mt-4 pt-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <p
          className={`text-base font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Total
        </p>
        <p
          className={`text-base font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          KES {(orderSummary.total * 100).toFixed(0)}
        </p>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-3">
      {/* Paystack */}
      <motion.label
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
          paymentMethod === PAYMENT_METHODS.PAYSTACK
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : `border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`
        }`}
      >
        <input
          type="radio"
          name="payment"
          value={PAYMENT_METHODS.PAYSTACK}
          checked={paymentMethod === PAYMENT_METHODS.PAYSTACK}
          onChange={() => setPaymentMethod(PAYMENT_METHODS.PAYSTACK)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <div className="ml-4 flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-3">
            <CreditCard className="text-white" size={20} />
          </div>
          <div>
            <span
              className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Paystack
            </span>
            <p
              className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Cards, Bank Transfer, Mobile Money
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-1">
          <Shield size={16} className="text-green-500" />
          <span className="text-xs text-green-500">Secure</span>
        </div>
      </motion.label>

      {/* M-Pesa */}
      <motion.label
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
          paymentMethod === PAYMENT_METHODS.MPESA
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : `border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`
        }`}
      >
        <input
          type="radio"
          name="payment"
          value={PAYMENT_METHODS.MPESA}
          checked={paymentMethod === PAYMENT_METHODS.MPESA}
          onChange={() => setPaymentMethod(PAYMENT_METHODS.MPESA)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
        />
        <div className="ml-4 flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mr-3">
            <Smartphone className="text-white" size={20} />
          </div>
          <div>
            <span
              className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              M-Pesa
            </span>
            <p
              className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Pay with your mobile phone
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-1">
          <Phone size={16} className="text-green-500" />
          <span className="text-xs text-green-500">Instant</span>
        </div>
      </motion.label>
    </div>
  );

  const renderPaymentStatus = () => {
    if (!isProcessing && paymentStatus === 'idle') return null;

    const statusConfig = {
      processing: {
        icon: <LoaderSpinner size="sm" />,
        title: 'Processing Payment',
        message:
          paymentMethod === PAYMENT_METHODS.MPESA
            ? 'Please check your phone and enter your M-Pesa PIN'
            : 'Processing your payment...',
        color: 'blue',
      },
      success: {
        icon: <CheckCircle className="text-green-500" size={24} />,
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully',
        color: 'green',
      },
      failed: {
        icon: <AlertCircle className="text-red-500" size={24} />,
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again.',
        color: 'red',
      },
      expired: {
        icon: <Clock className="text-orange-500" size={24} />,
        title: 'Payment Expired',
        message: 'The payment session has expired. Please try again.',
        color: 'orange',
      },
    };

    const config = statusConfig[paymentStatus] || statusConfig.processing;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-6 p-6 rounded-xl border-2 ${
          config.color === 'blue'
            ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
            : config.color === 'green'
            ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
            : config.color === 'red'
            ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
            : 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800'
        }`}
      >
        <div className="flex items-center mb-4">
          {config.icon}
          <h3
            className={`ml-3 text-lg font-semibold ${
              config.color === 'blue'
                ? 'text-blue-800 dark:text-blue-300'
                : config.color === 'green'
                ? 'text-green-800 dark:text-green-300'
                : config.color === 'red'
                ? 'text-red-800 dark:text-red-300'
                : 'text-orange-800 dark:text-orange-300'
            }`}
          >
            {config.title}
          </h3>
        </div>
        <p
          className={`text-sm mb-4 ${
            config.color === 'blue'
              ? 'text-blue-700 dark:text-blue-400'
              : config.color === 'green'
              ? 'text-green-700 dark:text-green-400'
              : config.color === 'red'
              ? 'text-red-700 dark:text-red-400'
              : 'text-orange-700 dark:text-orange-400'
          }`}
        >
          {config.message}
        </p>

        {/* Action buttons based on status */}
        {(paymentStatus === 'failed' || paymentStatus === 'expired') && (
          <div className="flex space-x-3">
            <ButtonLoader
              onClick={handleRetryPayment}
              isLoading={isProcessing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              loadingText="Retrying..."
            >
              <RefreshCw size={16} className="mr-2" />
              Retry Payment
            </ButtonLoader>
            <ButtonLoader
              onClick={() => {
                setPaymentStatus('idle');
                setIsProcessing(false);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Different Method
            </ButtonLoader>
          </div>
        )}

        {paymentStatus === 'processing' &&
          paymentMethod === PAYMENT_METHODS.MPESA && (
            <div className="mt-4">
              <ButtonLoader
                onClick={handleRetryPayment}
                className="text-sm text-blue-600 hover:text-blue-800 bg-transparent border-none p-0"
              >
                Didn't receive the prompt? Resend request
              </ButtonLoader>
            </div>
          )}
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Loader */}
      <ToastLoader
        isVisible={showToastLoader}
        message={toastMessage}
        position="top-center"
      />

      {/* Modal Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className={`relative w-full max-w-4xl mx-4 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden`}
        >
          {/* Loading Overlay */}
          <AnimatePresence>
            {(cartLoading || orderLoading || paymentLoading) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 ${
                  darkMode ? 'bg-gray-800/75' : 'bg-white/75'
                } backdrop-blur-sm flex items-center justify-center z-10`}
              >
                <SectionLoader />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div
            className={`px-6 py-4 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {isComplete
                  ? 'Order Complete!'
                  : step === 1
                  ? 'Shopping Cart'
                  : step === 2
                  ? 'Shipping Information'
                  : 'Payment'}
              </h2>
              <ButtonLoader
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-transparent border-none"
                aria-label="Close"
              >
                <X size={24} />
              </ButtonLoader>
            </div>

            {/* Progress Steps */}
            {!isComplete && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          step >= stepNumber
                            ? 'bg-blue-600 text-white'
                            : `${
                                darkMode
                                  ? 'bg-gray-700 text-gray-400'
                                  : 'bg-gray-200 text-gray-500'
                              }`
                        }`}
                      >
                        {stepNumber === 1 ? (
                          <ShoppingBag size={16} />
                        ) : stepNumber === 2 ? (
                          <Globe size={16} />
                        ) : (
                          <CreditCard size={16} />
                        )}
                      </div>
                      {stepNumber < 3 && (
                        <div
                          className={`flex-1 h-1 mx-4 ${
                            step > stepNumber
                              ? 'bg-blue-600'
                              : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span
                    className={
                      step >= 1
                        ? 'text-blue-600'
                        : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }
                  >
                    Cart
                  </span>
                  <span
                    className={
                      step >= 2
                        ? 'text-blue-600'
                        : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }
                  >
                    Shipping
                  </span>
                  <span
                    className={
                      step >= 3
                        ? 'text-blue-600'
                        : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }
                  >
                    Payment
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              {/* Step 1: Cart Review */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderCartItems()}
                  {items.length > 0 && (
                    <>
                      {renderOrderSummary()}
                      <div className="flex justify-between items-center">
                        <ButtonLoader
                          onClick={onClose}
                          className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 bg-transparent border-none p-0"
                        >
                          <ChevronLeft size={16} className="mr-1" />
                          Continue Shopping
                        </ButtonLoader>
                        <ButtonLoader
                          onClick={handleCheckout}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          disabled={cartLoading || items.length === 0}
                        >
                          Proceed to Checkout
                        </ButtonLoader>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 2: Shipping Information */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleShippingSubmit();
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={shippingInfo.fullName}
                          onChange={handleShippingInfoChange}
                          className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                            errors.fullName
                              ? 'border-red-500 focus:border-red-500'
                              : `${
                                  darkMode
                                    ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400'
                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                }`
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          placeholder="John Doe"
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={shippingInfo.email}
                          onChange={handleShippingInfoChange}
                          className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                            errors.email
                              ? 'border-red-500 focus:border-red-500'
                              : `${
                                  darkMode
                                    ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400'
                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                }`
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          placeholder="john@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingInfoChange}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          errors.address
                            ? 'border-red-500 focus:border-red-500'
                            : `${
                                darkMode
                                  ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400'
                                  : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                              }`
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        placeholder="123 Main Street"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleShippingInfoChange}
                          className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                            errors.city
                              ? 'border-red-500 focus:border-red-500'
                              : `${
                                  darkMode
                                    ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400'
                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                }`
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          placeholder="Nairobi"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          State/County
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleShippingInfoChange}
                          className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                            darkMode
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400'
                              : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          placeholder="Nairobi County"
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Country
                        </label>
                        <select
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleShippingInfoChange}
                          className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                            darkMode
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400'
                              : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        >
                          <option value="Kenya">Kenya</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Tanzania">Tanzania</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingInfoChange}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          errors.phone
                            ? 'border-red-500 focus:border-red-500'
                            : `${
                                darkMode
                                  ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400'
                                  : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                              }`
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        placeholder="254712345678"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </form>

                  <div className="flex justify-between mt-8">
                    <ButtonLoader
                      onClick={() => setStep(1)}
                      className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft size={16} className="mr-2" />
                      Back to Cart
                    </ButtonLoader>
                    <ButtonLoader
                      onClick={handleShippingSubmit}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Continue to Payment
                    </ButtonLoader>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Payment Methods */}
                    <div>
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Payment Method
                      </h3>
                      {renderPaymentMethods()}

                      {/* Payment Details Form */}
                      <div className="mt-6">
                        {paymentMethod === PAYMENT_METHODS.MPESA && (
                          <div>
                            <label
                              className={`block text-sm font-medium mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              M-Pesa Phone Number *
                            </label>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={paymentInfo.phoneNumber}
                              onChange={handlePaymentInfoChange}
                              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                                errors.phoneNumber
                                  ? 'border-red-500 focus:border-red-500'
                                  : `${
                                      darkMode
                                        ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400'
                                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                    }`
                              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                              placeholder="254712345678"
                            />
                            {errors.phoneNumber && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.phoneNumber}
                              </p>
                            )}
                            <p
                              className={`mt-2 text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              You will receive a payment prompt on your phone
                            </p>
                          </div>
                        )}

                        {paymentMethod === PAYMENT_METHODS.PAYSTACK && (
                          <div>
                            <label
                              className={`block text-sm font-medium mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={paymentInfo.email}
                              onChange={handlePaymentInfoChange}
                              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                                errors.email
                                  ? 'border-red-500 focus:border-red-500'
                                  : `${
                                      darkMode
                                        ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400'
                                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                    }`
                              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                              placeholder="john@example.com"
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.email}
                              </p>
                            )}
                            <p
                              className={`mt-2 text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              Secure payment with cards, bank transfer, or
                              mobile money
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Order Summary
                      </h3>
                      <div
                        className={`p-4 rounded-lg border ${
                          darkMode
                            ? 'border-gray-700 bg-gray-750'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        {renderOrderSummary()}
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  {renderPaymentStatus()}

                  {/* Action Buttons */}
                  {!isComplete && (
                    <div className="flex justify-between mt-8">
                      <ButtonLoader
                        onClick={() => setStep(2)}
                        className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        disabled={isProcessing}
                      >
                        <ChevronLeft size={16} className="mr-2" />
                        Back to Shipping
                      </ButtonLoader>
                      <ButtonLoader
                        onClick={handlePayment}
                        isLoading={isProcessing}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        disabled={isProcessing || paymentStatus === 'success'}
                        loadingText={
                          paymentMethod === PAYMENT_METHODS.MPESA
                            ? 'Sending M-Pesa Request...'
                            : 'Processing Payment...'
                        }
                      >
                        {paymentStatus === 'success'
                          ? 'Payment Complete'
                          : `Pay KES ${(orderSummary.total * 100).toFixed(0)}`}
                      </ButtonLoader>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Success State */}
              {isComplete && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check
                      className="text-green-600 dark:text-green-400"
                      size={40}
                    />
                  </motion.div>
                  <h3
                    className={`text-2xl font-bold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Order Placed Successfully!
                  </h3>
                  <p
                    className={`text-lg mb-6 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Thank you for your purchase. Your order has been confirmed
                    and stock has been updated.
                  </p>
                  {currentOrder && (
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      } mb-6`}
                    >
                      <span
                        className={`text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Order Number:
                      </span>
                      <span
                        className={`ml-2 font-mono font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {currentOrder.orderNumber}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-center space-x-4">
                    <ButtonLoader
                      onClick={onClose}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Continue Shopping
                    </ButtonLoader>
                    {currentOrder && (
                      <ButtonLoader
                        onClick={() => {
                          window.location.href = `/orders/${currentOrder._id}`;
                        }}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        View Order
                      </ButtonLoader>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CheckoutModal;
