'use client';

import { useState } from 'react';
import { Users, Settings, BarChart2 } from 'lucide-react';
import NotificationBroadcast from './NotificationBroadcast';
import NotificationAnalytics from './NotificationAnalytics';
import PageHeader from '../../../components/common/PageHeader';

const NotificationsManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <NotificationAnalytics />;
      case 'broadcast':
        return <NotificationBroadcast />;
      case 'settings':
        return (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Notification Settings
            </h3>
            <div className="space-y-4">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                  Notification Expiry
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Set how long notifications are kept in the system before
                  automatic deletion.
                </p>
                <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
                  Default Notification Settings
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Show toast notifications
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Play sound for high priority notifications
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Auto-retry failed notification deliveries
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <NotificationAnalytics />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Notification Management"
        breadcrumbs={[
          { name: 'Dashboard', path: '/admin' },
          { name: 'Notifications', path: '/admin/notifications' },
        ]}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-3 flex items-center transition-colors duration-200 ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart2 className="h-5 w-5 mr-2" />
            Dashboard
          </button>
          <button
            className={`px-4 py-3 flex items-center transition-colors duration-200 ${
              activeTab === 'broadcast'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('broadcast')}
          >
            <Users className="h-5 w-5 mr-2" />
            Broadcast
          </button>
          <button
            className={`px-4 py-3 flex items-center transition-colors duration-200 ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </button>
        </div>

        <div className="p-4">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default NotificationsManagement;
