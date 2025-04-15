import React, { useState } from 'react';
import Sidebar from './Sidebar';

const AccessControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students');
  
  // Sample students data
  const students = [
    {
      id: 1,
      name: 'Aisha Johnson',
      email: 'aisha.johnson@example.com',
      joinedDate: 'Feb 12, 2024',
      accessLevel: 'Full Access',
      avatar: '👩🏽‍🎓'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      joinedDate: 'Feb 15, 2024',
      accessLevel: 'Read Only',
      avatar: '👨🏻‍🎓'
    },
    {
      id: 3,
      name: 'Sofia Rodriguez',
      email: 'sofia.rodriguez@example.com',
      joinedDate: 'Mar 1, 2024',
      accessLevel: 'Full Access',
      avatar: '👩🏻‍🎓'
    },
    {
      id: 4,
      name: 'David Okafor',
      email: 'david.okafor@example.com',
      joinedDate: 'Mar 5, 2024',
      accessLevel: 'Read Only',
      avatar: '👨🏿‍🎓'
    },
    {
      id: 5,
      name: 'Emily Wong',
      email: 'emily.wong@example.com',
      joinedDate: 'Mar 10, 2024',
      accessLevel: 'Full Access',
      avatar: '👩🏻‍🎓'
    }
  ];
  
  // Sample permission requests
  const requests = [
    {
      id: 1,
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      requestDate: 'Mar 25, 2024',
      requestType: 'Access to Assignment 2',
      avatar: '👨🏼‍🎓'
    },
    {
      id: 2,
      name: 'Fatima Ali',
      email: 'fatima.ali@example.com',
      requestDate: 'Mar 24, 2024',
      requestType: 'Full Course Access',
      avatar: '👩🏽‍🎓'
    }
  ];
  
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        {/* <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="EduStore Logo" className="h-8" />
            <span className="text-xl font-semibold">EduStore</span>
          </div>
          <div className="text-sm text-gray-500">DxVa_...d45r</div>
        </div> */}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <Sidebar activePage="access" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-medium">Access Control</h1>
                
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex">
                  <button
                    className={`py-4 px-6 ${
                      activeTab === 'students'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    } font-medium`}
                    onClick={() => setActiveTab('students')}
                  >
                    Students
                  </button>
                  <button
                    className={`py-4 px-6 ${
                      activeTab === 'requests'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    } font-medium`}
                    onClick={() => setActiveTab('requests')}
                  >
                    Access Requests <span className="ml-2 bg-red-100 text-red-800 text-xs rounded-full px-2 py-1">{requests.length}</span>
                  </button>
                  <button
                    className={`py-4 px-6 ${
                      activeTab === 'settings'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    } font-medium`}
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </button>
                </nav>
              </div>
              
              {/* Students Tab Content */}
              {activeTab === 'students' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Level</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                                {student.avatar}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.joinedDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              student.accessLevel === 'Full Access' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {student.accessLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Access Requests Tab Content */}
              {activeTab === 'requests' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {requests.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                                  {request.avatar}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{request.name}</div>
                                  <div className="text-sm text-gray-500">{request.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{request.requestDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{request.requestType}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors mr-2">
                                Approve
                              </button>
                              <button className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors">
                                Deny
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-gray-500">No pending access requests.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Settings Tab Content */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium mb-6">Access Control Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="text-green-500 focus:ring-green-500 h-5 w-5 mr-3" />
                        <span>Allow students to request access to protected content</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="text-green-500 focus:ring-green-500 h-5 w-5 mr-3" />
                        <span>Automatically approve access for verified students</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="text-green-500 focus:ring-green-500 h-5 w-5 mr-3" />
                        <span>Enable content expiration (revoke access after set period)</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Access Level for New Students</label>
                      <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                        <option>No Access</option>
                        <option>Read Only</option>
                        <option>Full Access</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
              
              {/* Add Student Button */}
              {activeTab === 'students' && (
                <div className="mt-6 flex justify-end">
                  <button className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors">
                    Add New Student
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControl;