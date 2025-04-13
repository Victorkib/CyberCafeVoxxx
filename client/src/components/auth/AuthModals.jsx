'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import {
  loginUser,
  registerUser,
  forgotPassword,
  clearError,
  resetLoginAttempts,
  MAX_LOGIN_ATTEMPTS,
} from '../../redux/slices/authSlice';
import {
  closeAuthModal,
  setAuthModalView,
} from '../../redux/slices/uiSlice';
import { toast } from 'react-hot-toast';

const AuthModals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { authModalView, isLoading } = useSelector((state) => state.ui);
  const { error, loginAttempts } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      dispatch(closeAuthModal());
    }
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (authModalView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [authModalView]);

  const handleClose = () => {
    dispatch(closeAuthModal());
    dispatch(clearError());
    setFormErrors({});
  };

  const switchView = (view) => {
    dispatch(setAuthModalView(view));
    dispatch(clearError());
    setFormErrors({});
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordForm({
      ...forgotPasswordForm,
      [e.target.name]: e.target.value,
    });
  };

  const validateLoginForm = () => {
    const errors = {};

    if (!loginForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      errors.email = 'Email is invalid';
    }

    if (!loginForm.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};

    if (!registerForm.name) {
      errors.name = 'Name is required';
    }

    if (!registerForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      errors.email = 'Email is invalid';
    }

    if (!registerForm.password) {
      errors.password = 'Password is required';
    } else if (registerForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForgotPasswordForm = () => {
    const errors = {};

    if (!forgotPasswordForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(forgotPasswordForm.email)) {
      errors.email = 'Email is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (validateLoginForm()) {
      try {
        setFormErrors({});
        await dispatch(loginUser({
          email: loginForm.email,
          password: loginForm.password,
        })).unwrap();

        // Reset login attempts on successful login
        dispatch(resetLoginAttempts());
      } catch (error) {
        // Handle account locking
        if (error.includes('Account is locked')) {
          const lockExpiry = error.match(/try again in (\d+) minutes/);
          if (lockExpiry) {
            setFormErrors({
              ...formErrors,
              general: `Account is locked. Please try again in ${lockExpiry[1]} minutes.`
            });
          } else {
            setFormErrors({
              ...formErrors,
              general: error
            });
          }
        } else {
          setFormErrors({
            ...formErrors,
            general: error
          });
        }
      }
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (validateRegisterForm()) {
      dispatch(
        registerUser({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        })
      );
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (validateForgotPasswordForm()) {
      try {
        await dispatch(forgotPassword(forgotPasswordForm.email)).unwrap();
        toast.success('Password reset instructions have been sent to your email');
        switchView('login');
      } catch (error) {
        setFormErrors({
          ...formErrors,
          general: error
        });
      }
    }
  };

  const remainingAttempts = MAX_LOGIN_ATTEMPTS - loginAttempts;

  if (!authModalView) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className="fixed inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        <div className="max-h-[90vh] overflow-y-auto">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {authModalView === 'login' ? 'Welcome Back' : 
                 authModalView === 'register' ? 'Create Account' : 
                 'Reset Password'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {authModalView === 'login' 
                  ? 'Sign in to access your account' 
                  : authModalView === 'register'
                  ? 'Join us to get started'
                  : 'Enter your email to reset your password'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            {formErrors.general && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                {formErrors.general}
              </div>
            )}

            {authModalView === 'login' && loginAttempts > 0 && remainingAttempts > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
                <p className="text-sm">
                  Warning: You have {remainingAttempts} login {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining.
                </p>
              </div>
            )}

            <form 
              onSubmit={
                authModalView === 'login' ? handleLogin : 
                authModalView === 'register' ? handleRegister :
                handleForgotPassword
              } 
              className="space-y-6"
            >
              {authModalView === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={registerForm.name}
                      onChange={handleRegisterChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={
                      authModalView === 'login' ? loginForm.email :
                      authModalView === 'register' ? registerForm.email :
                      forgotPasswordForm.email
                    }
                    onChange={
                      authModalView === 'login' ? handleLoginChange :
                      authModalView === 'register' ? handleRegisterChange :
                      handleForgotPasswordChange
                    }
                    className={`w-full pl-10 pr-4 py-3 border ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="Enter your email"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              {(authModalView === 'login' || authModalView === 'register') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={
                        authModalView === 'login' ? loginForm.password :
                        registerForm.password
                      }
                      onChange={
                        authModalView === 'login' ? handleLoginChange :
                        handleRegisterChange
                      }
                      className={`w-full pl-10 pr-10 py-3 border ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-gray-400" />
                      ) : (
                        <Eye size={18} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>
              )}

              {authModalView === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {authModalView === 'login' ? 'Logging in...' : 
                       authModalView === 'register' ? 'Registering...' : 
                       'Sending reset instructions...'}
                    </span>
                  ) : (
                    authModalView === 'login' ? 'Sign in' : 
                    authModalView === 'register' ? 'Create Account' : 
                    'Reset Password'
                  )}
                </button>
              </div>

              {authModalView === 'login' && (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => switchView('forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => switchView('register')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              )}

              {authModalView === 'register' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              )}

              {authModalView === 'forgot-password' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Back to login
                  </button>
                </div>
              )}

              {loginAttempts > 0 && (
                <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                  {remainingAttempts} attempts remaining before account is locked
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModals;
