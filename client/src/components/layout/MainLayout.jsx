import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import SecurityAlerts from '../security/SecurityAlerts';

const MainLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Security Alerts */}
      {user && (
        <div className="container mx-auto px-4 mt-4">
          <SecurityAlerts />
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout; 