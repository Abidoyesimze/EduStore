import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface StudentSidebarProps {
  activePage?: string;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ activePage = 'home' }) => {
  const location = useLocation();

  const menuItems = [
    { id: 'home', icon: '🏠', text: 'Home', path: '/student-dashboard' },
    { id: 'resources', icon: '📚', text: 'My Resources', path: '/resources' },
    { id: 'notifications', icon: '🔔', text: 'Notifications', path: '/notifications' },
    { id: 'explore', icon: '🔍', text: 'Explore', path: '/explore' },
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
                  location.pathname === item.path || 
                  (location.pathname === '/student-dashboard' && item.id === 'home')
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

export default StudentSidebar; 