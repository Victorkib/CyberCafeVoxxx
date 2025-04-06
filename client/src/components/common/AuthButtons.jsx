'use client';
import { useDispatch, useSelector } from 'react-redux';
import { openAuthModal } from '../../redux/slices/uiSlice';
import UserMenu from './UserMenu';

const AuthButtons = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogin = () => {
    dispatch(openAuthModal('login'));
  };

  const handleSignUp = () => {
    dispatch(openAuthModal('register'));
  };

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleLogin}
        className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        Log In
      </button>
      <button
        onClick={handleSignUp}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign Up
      </button>
    </div>
  );
};

export default AuthButtons;
