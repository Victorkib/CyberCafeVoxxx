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
import AdminLayout from './pages/admin/admin-layout';
import NotFound from './pages/NotFound';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthModals from './components/auth/AuthModals';
import AdminInvitationAccept from './components/auth/AdminInvitationAccept';
import MainLayout from './components/layout/MainLayout';
import ResetPassword from './components/auth/ResetPassword';

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
        <Route path="/verify-email" element={<MainLayout><VerifyEmail /></MainLayout>} />
        <Route path="/resend-verification" element={<MainLayout><ResendVerification /></MainLayout>} />
        <Route path="/admin/invitation/:token" element={<MainLayout><AdminInvitationAccept /></MainLayout>} />
        <Route path="/shop" element={<MainLayout><CyberCafeLandingPage /></MainLayout>} />
        <Route path="/services" element={<MainLayout><ServicesPage /></MainLayout>} />
        <Route path="/websites" element={<MainLayout><LandingPage /></MainLayout>} />
        <Route path="/product/:productId" element={<MainLayout><ProductDetailsPage /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><ShoppingCartPage /></MainLayout>} />
        <Route path="/checkout" element={<MainLayout><CheckoutPage /></MainLayout>} />
        <Route path="/order-confirmation" element={<MainLayout><OrderConfirmationPage /></MainLayout>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
        <Route path="/404" element={<MainLayout><NotFound /></MainLayout>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
