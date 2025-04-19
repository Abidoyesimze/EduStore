// src/components/dashboard/EducatorDashboard.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import StatCards from './StatCards';
import NotificationList from './NotificationList';
import { BrowserProvider } from 'ethers';

const EducatorDashboard: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string>('');
  const [ensName, setEnsName] = useState<string>('');
  
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);

          // Try to resolve ENS name
          try {
            const ensName = await provider.lookupAddress(address);
            if (ensName) {
              setEnsName(ensName);
            }
          } catch (ensError) {
            console.log('Could not resolve ENS name:', ensError);
          }
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    };

    getUserInfo();
  }, []);
  
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        {/* <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="EduStore Logo" className="h-8" />
            <span className="text-xl font-semibold">EduStore</span>
          </div>
          <div className="text-sm text-gray-500">DrVa_...d45r</div>
        </div> */}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <Sidebar activePage="home" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-8">
                <h1 className="text-xl font-medium">
                  Welcome {ensName ? ensName : userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Guest'} 👋
                </h1>
              </div>
              
              {/* Stats Cards */}
              <StatCards />
              
              {/* Notifications */}
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-9a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Notifications
                </h2>
                <NotificationList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducatorDashboard;