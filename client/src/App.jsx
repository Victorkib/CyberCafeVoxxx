"use client"

import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Pages
import LandingPage from "./pages/LandingPage"
import ServicesPage from "./pages/ServicesPage"
import CyberCafeLandingPage from "./pages/CyberCafeLandingPage"
import ProductDetailsPage from "./pages/ProductDetailsPage"
import ShoppingCartPage from "./pages/ShoppingCartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrderConfirmationPage from "./pages/OrderConfirmationPage"
import AdminLayout from "./pages/admin/admin-layout"
import NotFound from "./pages/NotFound"
import VerifyEmail from "./pages/VerifyEmail"
import ResendVerification from "./pages/ResendVerification"
import NotificationsPage from "./pages/NotificationsPage"

// Components
import ProtectedRoute from "./components/auth/ProtectedRoute"
import AuthModals from "./components/auth/AuthModals"
import AdminInvitationAccept from "./components/auth/AdminInvitationAccept"
import MainLayout from "./components/layout/MainLayout"
import ResetPassword from "./components/auth/ResetPassword"
import ForgotPassword from "./components/auth/ForgotPassword"

// Contexts
import { NotificationProvider } from "./contexts/NotificationContext"

// Redux actions
import { checkAuthState } from "./redux/slices/authSlice"
import { useSessionTimeout } from "./hooks/useSessionTimeout"
import ErrorBoundary from "./pages/common/ErrorBoundary"

// Error boundary wrapper for routes
const RouteErrorBoundary = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigateHome = () => {
    navigate("/")
  }

  const handleNavigateBack = () => {
    navigate(-1)
  }

  const handleContactSupport = () => {
    window.open("/support", "_blank")
  }

  return (
    <ErrorBoundary
      onHome={handleNavigateHome}
      onBack={handleNavigateBack}
      onSupport={handleContactSupport}
      onError={(error, errorInfo) => {
        // You could log to a service like Sentry here
        console.error(`Error in route ${location.pathname}:`, error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function App() {
  const dispatch = useDispatch()
  // Use separate selectors to avoid creating a new object on each render
  const isAuthModalOpen = useSelector((state) => state.ui.isAuthModalOpen)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  // Initialize session timeout
  useSessionTimeout()

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    dispatch(checkAuthState())
  }, [dispatch])

  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV !== "production"}
      onError={(error, errorInfo) => {
        // Global error logging
        console.error("Global app error:", error)
      }}
    >
      <NotificationProvider>
        <Router>
          {isAuthModalOpen && <AuthModals />}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <RouteErrorBoundary>
                  <LandingPage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/verify-email"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <VerifyEmail />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <RouteErrorBoundary>
                  <ForgotPassword />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <ResetPassword />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/resend-verification"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <ResendVerification />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin/invitation/:token"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <AdminInvitationAccept />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/shop"
              element={
                <RouteErrorBoundary>
                  <CyberCafeLandingPage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/services"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <ServicesPage />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/websites"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <LandingPage />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/product/:productId"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <ProductDetailsPage />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/cart"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <ShoppingCartPage />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/checkout"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <CheckoutPage />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/order-confirmation"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <OrderConfirmationPage />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/notifications"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <NotificationsPage />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/admin/*"
              element={
                <RouteErrorBoundary>
                  <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                </RouteErrorBoundary>
              }
            />

            {/* Fallback Routes */}
            <Route
              path="/404"
              element={
                <RouteErrorBoundary>
                  <MainLayout>
                    <NotFound />
                  </MainLayout>
                </RouteErrorBoundary>
              }
            />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
