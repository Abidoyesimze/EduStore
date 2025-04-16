// src/components/dashboard/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activePage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage = 'home' }) => {
  const menuItems = [
    { id: 'home', icon: '🏠', text: 'Home', path: '/Educator-dashboard' },
    { id: 'upload', icon: '⬆️', text: 'Upload File', path: '/upload' },
    { id: 'files', icon: '📄', text: 'My Files', path: '/files' },
    { id: 'access', icon: '🔒', text: 'Access Control', path: '/access' },
    { id: 'settings', icon: '⚙️', text: 'Settings', path: '/settings' }
  ];

  return (
    <div className="w-full md:w-64 bg-white rounded-lg p-2">
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link 
                to={item.path} 
                className={`flex items-center p-3 my-1 rounded-md transition-colors ${
                  activePage === item.id 
                    ? 'bg-gray-100 text-green-600' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;