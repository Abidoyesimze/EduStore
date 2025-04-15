// src/components/dashboard/NotificationList.tsx
import React from 'react';

const NotificationList: React.FC = () => {
  const notifications = [
    {
      id: 1,
      icon: '📄',
      message: 'Upload complete: Introduction to Web3.pdf',
      time: '5 Mins ago',
      actionLabel: 'Manage',
      actionType: 'manage'
    },
    {
      id: 2,
      icon: '👨‍🎓',
      message: 'Access granted to 12 new students for Assignment 1',
      time: 'Mar 19',
      actionLabel: 'View Log',
      actionType: 'log'
    },
    {
      id: 3,
      icon: '📄',
      message: 'Upload complete: Introduction to Decentralized Storage',
      time: 'Mar 23',
      actionLabel: 'Manage',
      actionType: 'manage'
    },
    {
      id: 4,
      icon: '👨‍🎓',
      message: 'Access granted to 12 new students for Assignment 1',
      time: 'Mar 23',
      actionLabel: 'View Log',
      actionType: 'log'
    },
    {
      id: 5,
      icon: '📄',
      message: 'Backup successful — 3 new files stored to IPFS',
      time: 'Mar 27',
      actionLabel: 'Manage',
      actionType: 'manage'
    }
  ];

  return (
    <div className="bg-white rounded-lg">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          className={`flex items-center justify-between py-4 px-3 ${
            index !== notifications.length - 1 ? 'border-b border-gray-100' : ''
          }`}
        >
          <div className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl mr-4">
              {notification.icon}
            </div>
            <div>
              <p className="text-sm">{notification.message}</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-3">{notification.time}</span>
            <button 
              className={`text-xs px-3 py-1 rounded text-white ${
                notification.actionType === 'manage' ? 'bg-black' : 'bg-blue-500'
              }`}
            >
              {notification.actionLabel}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;