import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { BrowserProvider, JsonRpcProvider, Contract } from 'ethers';
import { EduCoreContract } from '../index';
import lighthouse from '@lighthouse-web3/sdk';

// Simple ABI for just the getMyContent function
const MINIMAL_ABI = [
  {
    inputs: [],
    name: 'getMyContent',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
];

interface File {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadDate: string;
  access: 'public' | 'students' | 'unknown';
  fileCID: string;
  tags: string[];
  icon: string;
  originalName?: string;
  contentUrl?: string;
}

interface LighthouseFileInfo {
  data: {
    fileSizeInBytes: string;
    cid: string;
    encryption: boolean;
    fileName: string;
    mimeType: string;
  };
}

const MyFiles = () => {
  const [contentIds, setContentIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const lighthouseApiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;

  // Use the imported contract address
  const CONTRACT_ADDRESS = EduCoreContract.address;

  // Function to fetch content using ethers.js directly
  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let provider;
      let signer;

      // Try to get provider from browser wallet
      if (window.ethereum) {
        console.log('Found window.ethereum, attempting to connect...');
        provider = new BrowserProvider(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          signer = await provider.getSigner();
          const address = await signer.getAddress();
          console.log('Connected wallet address:', address);
        } catch (walletErr) {
          console.warn('Could not get signer from wallet:', walletErr);
        }
      }

      // Fallback to public RPC
      if (!provider) {
        console.log('No wallet provider found, using public RPC...');
        provider = new JsonRpcProvider('https://api.calibration.node.glif.io/rpc/v1');
      }

      // Create contract instance
      console.log('Creating contract instance with address:', CONTRACT_ADDRESS);
      const contractInstance = new Contract(CONTRACT_ADDRESS, MINIMAL_ABI, signer || provider);

      // Verify network
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
      if (Number(network.chainId) !== 314159) {
        throw new Error('Please switch to Filecoin Calibration Network (chain ID 314159)');
      }

      // Call getMyContent
      console.log('Calling getMyContent...');
      const result = await contractInstance.getMyContent();
      console.log('Raw result from getMyContent:', result);

      // Process CIDs
      if (Array.isArray(result)) {
        const validCids = result.filter(cid => cid && cid.length > 0);
        console.log('Found', validCids.length, 'valid files:', validCids);
        setContentIds(validCids);
      } else {
        console.error('Result is not an array:', result);
        setContentIds([]);
      }
    } catch (err: any) {
      console.error('Error fetching content:', err);
      if (err.message.includes('user rejected')) {
        setError('Please connect your wallet to view your files');
      } else {
        setError(err.message || 'Unknown error occurred');
      }
      setContentIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch metadata from IPFS for each CID
  const fetchMetadata = async () => {
    if (contentIds.length === 0) {
      setFiles([]);
      return;
    }

    setIsLoading(true);
    try {
      const filePromises = contentIds.map(async (contentId) => {
        try {
          const cid = contentId.startsWith('ipfs://') ? contentId.substring(7) : contentId;
          
          // Get file info from Lighthouse
          const fileInfo = await lighthouse.getFileInfo(cid) as LighthouseFileInfo;
          
          if (!fileInfo || !fileInfo.data) {
            throw new Error('Failed to get file info from Lighthouse');
          }

          // Get file type from content type
          let fileType = 'unknown';
          if (fileInfo.data.mimeType) {
            if (fileInfo.data.mimeType.includes('image')) fileType = 'image';
            else if (fileInfo.data.mimeType.includes('pdf')) fileType = 'pdf';
            else if (fileInfo.data.mimeType.includes('text')) fileType = 'text';
            else if (fileInfo.data.mimeType.includes('video')) fileType = 'video';
            else if (fileInfo.data.mimeType.includes('audio')) fileType = 'audio';
          }

          // Get file size
          const size = parseInt(fileInfo.data.fileSizeInBytes) || 0;

          // Get original filename
          const originalName = fileInfo.data.fileName || 'Untitled';

          // Generate access URL with API key
          const contentUrl = `https://gateway.lighthouse.storage/ipfs/${cid}?api-key=${lighthouseApiKey}`;

          return {
            id: contentId,
            title: originalName,
            type: fileType,
            size: formatFileSize(size),
            uploadDate: new Date().toLocaleDateString(), // Lighthouse doesn't provide creation date
            access: 'public',
            fileCID: cid,
            tags: [],
            icon: getFileIcon(fileType),
            originalName: originalName,
            contentUrl: contentUrl
          } as File;
        } catch (err) {
          console.error(`Error processing file ${contentId}:`, err);
          return {
            id: contentId,
            title: 'File Unavailable',
            type: 'unknown',
            size: '-',
            uploadDate: '-',
            access: 'unknown',
            fileCID: '',
            tags: [],
            icon: '❌',
          } as File;
        }
      });
      
      const filesData = await Promise.all(filePromises);
      setFiles(filesData);
    } catch (err: any) {
      setError(`Failed to load files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Update getFileIcon to handle more file types
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '🖼️';
      case 'txt':
        return '📝';
      case 'mp4':
        return '🎬';
      case 'mp3':
        return '🎵';
      default:
        return '📁';
    }
  };

  // Fetch content on mount
  useEffect(() => {
    fetchContent();
  }, []);

  // Fetch metadata when contentIds change
  useEffect(() => {
    fetchMetadata();
  }, [contentIds]);

  // Format CID for display
  const formatCid = (cid: string) => {
    if (!cid) return '';
    if (cid.length > 60) {
      return `${cid.substring(0, 30)}...${cid.substring(cid.length - 25)}`;
    }
    return cid;
  };

  // Get IPFS gateway URL
  const getIpfsGatewayUrl = (contentId: string) => {
    if (!contentId) return '#';
    const cid = contentId.startsWith('ipfs://') ? contentId.substring(7) : contentId;
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  };

  // Get file download URL
  const getFileDownloadUrl = (fileCID: string) => {
    if (!fileCID) return '#';
    return `https://gateway.lighthouse.storage/ipfs/${fileCID}`;
  };

  // Filter files based on search term
  const filteredFiles = files.filter(
    (file) =>
      file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (file: File) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedFile(null);
    setIsModalOpen(false);
  };

  // Helper function to download file
  const downloadFile = async (file: File) => {
    try {
      const response = await fetch(file.contentUrl!);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName || file.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar activePage="files" />
          <div className="flex-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-medium">My Files</h1>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <button
                  onClick={fetchContent}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh Files'}
                </button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Files Table */}
              {!isLoading && !error && filteredFiles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preview
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Access
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
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
                                {file.originalName && (
                                  <div className="text-xs text-gray-500">Original: {file.originalName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {file.type === 'image' && file.contentUrl && (
                              <div 
                                className="h-12 w-12 cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => openModal(file)}
                              >
                                <img 
                                  src={file.contentUrl} 
                                  alt={file.title}
                                  className="h-full w-full object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            {file.type === 'pdf' && file.contentUrl && (
                              <a 
                                href={file.contentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View PDF
                              </a>
                            )}
                            {file.type === 'text' && file.contentUrl && (
                              <a 
                                href={file.contentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Text
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{file.type.toUpperCase()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{file.size}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{file.uploadDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                file.access === 'public'
                                  ? 'bg-green-100 text-green-800'
                                  : file.access === 'unknown'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {file.access === 'public'
                                ? 'Public'
                                : file.access === 'unknown'
                                ? 'Unavailable'
                                : 'Students Only'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => openModal(file)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Image Preview Modal */}
              {isModalOpen && selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg max-w-4xl w-full mx-4">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedFile.title}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => downloadFile(selectedFile)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={closeModal}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      {selectedFile.type === 'image' && selectedFile.contentUrl && (
                        <img
                          src={selectedFile.contentUrl}
                          alt={selectedFile.title}
                          className="max-h-[70vh] w-auto mx-auto"
                        />
                      )}
                      {selectedFile.type === 'pdf' && selectedFile.contentUrl && (
                        <iframe
                          src={selectedFile.contentUrl}
                          className="w-full h-[70vh]"
                          title={selectedFile.title}
                        />
                      )}
                      {selectedFile.type === 'text' && selectedFile.contentUrl && (
                        <div className="max-h-[70vh] overflow-auto bg-gray-50 p-4 rounded">
                          <pre className="whitespace-pre-wrap">{selectedFile.contentUrl}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* No Files State */}
              {!isLoading && !error && filteredFiles.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-10 text-center">
                  <div className="text-5xl mb-4">📂</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? 'No files match your search.'
                      : 'You haven\'t uploaded any files yet. Get started by uploading your first file.'}
                  </p>
                  <button
                    className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors"
                    onClick={() => navigate('/dashboard/upload')}
                  >
                    Upload New File
                  </button>
                </div>
              )}

              {/* Upload Button */}
              {!isLoading && filteredFiles.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <button
                    className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors"
                    onClick={() => navigate('/dashboard/upload')}
                  >
                    Upload New File
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

export default MyFiles;