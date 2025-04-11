import React from 'react';
import { useSelector } from 'react-redux';
import { BellIcon } from '@heroicons/react/24/outline';

const NotificationBadge = ({ className = '' }) => {
  const { unreadCount } = useSelector((state) => state.notifications);

  if (unreadCount === 0) return null;

  return (
    <div className={`relative inline-flex ${className}`}>
      <BellIcon className="h-6 w-6 text-gray-600" />
      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    </div>
  );
};

export default NotificationBadge; 