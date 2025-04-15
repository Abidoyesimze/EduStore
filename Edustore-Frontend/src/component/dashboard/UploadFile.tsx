import React, { useState } from 'react';
import Sidebar from './Sidebar';

const UploadFile: React.FC = () => {
  const [fileName, setFileName] = useState('');
  const [tags, setTags] = useState('');
  const [accessType, setAccessType] = useState('public');
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      setFileName(files[0].name);
      // Here you would normally process the file
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      setFileName(files[0].name);
      // Here you would normally process the file
    }
  };
  
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
          <Sidebar activePage="upload" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-8">
                <h1 className="text-xl font-medium">Welcome Olasile 👋</h1>
              </div>
              
              {/* Upload Form */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* File Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File Title</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Lecture 1 - Introduction Basics"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                    />
                  </div>
                  
                  {/* Tags/Subject Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags / Subject</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Add up to 5 keywords to help students search"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                  
                  {/* Who Can View Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Who Can View?</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="access" 
                          className="text-green-500 focus:ring-green-500 mr-2"
                          checked={accessType === 'public'}
                          onChange={() => setAccessType('public')}
                        />
                        <span className="flex items-center">
                          <span className="w-4 h-4 mr-1 rounded-full bg-yellow-400 flex items-center justify-center text-xs">⚪</span>
                          Public
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="access" 
                          className="text-green-500 focus:ring-green-500 mr-2"
                          checked={accessType === 'students'}
                          onChange={() => setAccessType('students')}
                        />
                        <span className="flex items-center">
                          <span className="w-4 h-4 mr-1 rounded-full bg-yellow-400 flex items-center justify-center text-xs">👤</span>
                          Only My Students
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* File Drop Area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center ${
                    isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="w-16 h-16 mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                  <p className="text-gray-700 mb-2">Drag & drop files here or <span className="text-amber-500 font-medium cursor-pointer">Browse Files</span></p>
                  <p className="text-gray-500 text-sm">Accepts: pdf, docx, ppt, mp4, zip, etc.</p>
                  
                  <input 
                    type="file" 
                    className="hidden" 
                    id="file-upload" 
                    onChange={handleFileSelect}
                  />
                </div>
                
                {/* Upload Button */}
                <div className="mt-6 flex justify-end">
                  <button className="bg-gray-400 text-white py-2 px-6 rounded-md hover:bg-gray-500 transition-colors">
                    Upload File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;