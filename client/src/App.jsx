'use client';

import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LandingPage from './pages/LandingPage';
import ServicesPage from './pages/ServicesPage';
import CyberCafeLandingPage from './pages/CyberCafeLandingPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ShoppingCartPage from './pages/ShoppingCartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminLayout from './pages/admin/Admin-Layout';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthModals from './components/auth/AuthModals';

// Redux actions
import { checkAuthState } from './redux/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthModalOpen } = useSelector((state) => state.ui);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  return (
    <Router>
      {isAuthModalOpen && <AuthModals />}
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/shop" element={<CyberCafeLandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/websites" element={<LandingPage />} />
        <Route path="/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<ShoppingCartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

        {/* Protected Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
