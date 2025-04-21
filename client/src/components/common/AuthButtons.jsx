'use client';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Box } from '@mui/material';
import { openAuthModal } from '../../redux/slices/uiSlice';
import { User } from 'lucide-react';

const AuthButtons = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogin = () => {
    dispatch(openAuthModal('login'));
  };

  const handleRegister = () => {
    dispatch(openAuthModal('register'));
  };

  if (user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {user.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-medium text-sm">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user.email || ''}</p>
          </div>
        </div>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="outlined"
        color="inherit"
        onClick={handleLogin}
      >
        Login
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleRegister}
      >
        Register
      </Button>
    </Box>
  );
};

export default AuthButtons;
