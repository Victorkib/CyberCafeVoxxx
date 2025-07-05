'use client';
import { useSelector } from 'react-redux';
import { Construction, ArrowLeft } from 'lucide-react';
import ButtonLoader from '../loaders/ButtonLoader';

const PlaceholderTab = ({ tabId, tabs, setActiveTab }) => {
  const { darkMode } = useSelector((state) => state.ui);

  const currentTab = tabs.find((tab) => tab.id === tabId);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className={`text-center max-w-md mx-auto`}>
        <div className="mb-6">
          <Construction
            size={64}
            className={`mx-auto ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          />
        </div>

        <h2
          className={`text-2xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {currentTab?.label || 'Coming Soon'}
        </h2>

        <p
          className={`text-lg mb-6 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {currentTab?.description ||
            'This feature is under development and will be available soon.'}
        </p>

        <div
          className={`p-4 rounded-lg mb-6 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          } border`}
        >
          <p
            className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            We're working hard to bring you this feature. In the meantime, you
            can:
          </p>
          <ul
            className={`mt-2 text-sm space-y-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <li>• Check out your order history</li>
            <li>• Update your profile information</li>
            <li>• Browse our latest products</li>
          </ul>
        </div>

        <ButtonLoader
          onClick={() => setActiveTab && setActiveTab('overview')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Overview
        </ButtonLoader>
      </div>
    </div>
  );
};

export default PlaceholderTab;
