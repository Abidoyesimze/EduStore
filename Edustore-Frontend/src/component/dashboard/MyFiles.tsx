import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

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
}

const MyFiles = () => {
  const [contentIds, setContentIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const CONTRACT_ADDRESS = '0x73f46Db18E5b171318a55508873BdD0691209864';

  // Function to fetch content using ethers.js directly
  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let provider;
      let signer;

      // Try to get provider from browser wallet
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          signer = await provider.getSigner();
        } catch (walletErr) {
          console.warn('Could not get signer from wallet:', walletErr);
        }
      }

      // Fallback to public RPC
      if (!provider) {
        provider = new ethers.JsonRpcProvider('https://api.calibration.node.glif.io/rpc/v1');
      }

      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, signer || provider);

      // Verify network
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
      if (Number(network.chainId) !== 314159) {
        throw new Error('Please switch to Filecoin Calibration Network (chain ID 314159)');
      }

      // Call getMyContent
      console.log('Calling getMyContent...');
      const result = await contract.getMyContent();
      console.log('Raw result:', result);

      // Process CIDs
      if (Array.isArray(result)) {
        console.log('Found', result.length, 'files');
        setContentIds(result);
      } else {
        console.log('Result is not an array:', result);
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
          const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const metadata: File = await response.json();
          return {
            ...metadata,
            id: contentId,
            icon: getFileIcon(metadata.type),
          };
        } catch (err: any) {
          console.error(`Error fetching metadata for ${contentId}:`, err);
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
      console.error('Error fetching metadata:', err);
      setError(`Failed to load file metadata: ${err.message}`);
    } finally {
      setIsLoading(false);
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

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'mp4':
        return '🎬';
      default:
        return '📁';
    }
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
                              </div>
                            </div>
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
                            <a
                              href={getIpfsGatewayUrl(file.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View Metadata
                            </a>
                            {file.fileCID && (
                              <a
                                href={getFileDownloadUrl(file.fileCID)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Download
                              </a>
                            )}
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => {
                                navigator.clipboard.writeText(file.id);
                                alert('Content ID copied to clipboard!');
                              }}
                            >
                              Copy CID
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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