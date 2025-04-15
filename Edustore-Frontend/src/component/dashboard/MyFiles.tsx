// src/components/dashboard/MyFiles.tsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const MyFiles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Sample file data
  const files = [
    {
      id: 1,
      title: 'Introduction to Web3.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: 'Mar 27, 2024',
      access: 'public',
      icon: '📄'
    },
    {
      id: 2,
      title: 'Decentralized Storage Overview.pptx',
      type: 'PPTX',
      size: '5.1 MB',
      uploadDate: 'Mar 23, 2024',
      access: 'students',
      icon: '📊'
    },
    {
      id: 3,
      title: 'Assignment 1 - Blockchain Basics.docx',
      type: 'DOCX',
      size: '1.2 MB',
      uploadDate: 'Mar 19, 2024',
      access: 'students',
      icon: '📝'
    },
    {
      id: 4,
      title: 'Course Syllabus.pdf',
      type: 'PDF',
      size: '0.8 MB',
      uploadDate: 'Mar 15, 2024',
      access: 'public',
      icon: '📄'
    },
    {
      id: 5,
      title: 'Lecture Recording - IPFS Overview.mp4',
      type: 'MP4',
      size: '48.2 MB',
      uploadDate: 'Mar 10, 2024',
      access: 'students',
      icon: '🎬'
    }
  ];
  
  const filteredFiles = files.filter(file => 
    file.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
          <Sidebar activePage="files" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-medium">My Files</h1>
                
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Files Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                              {file.icon}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{file.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{file.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{file.size}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{file.uploadDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            file.access === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {file.access === 'public' ? 'Public' : 'Students Only'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-green-600 hover:text-green-900 mr-3">Share</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredFiles.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-gray-500">No files found. Try a different search or upload new files.</p>
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <div className="mt-6 flex justify-end">
                <button className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors" onClick={() => navigate('/upload')}>
                  Upload New File
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFiles;