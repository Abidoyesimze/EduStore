import { useState, useEffect } from 'react';
import StudentSidebar from './dashboard/StudentSidebar';
import { BrowserProvider, JsonRpcProvider, Contract, Signer } from 'ethers';
import { EduCoreContract, EduAccessControlContract } from './index';
import lighthouse from '@lighthouse-web3/sdk';
import { useEduStoreContracts } from './Service';
// import { getAddress } from 'ethers';

interface LighthouseFileInfo {
  contentType?: string;
  fileSize?: number;
  fileName?: string;
}

// Simple ABI for just the required functions
const MINIMAL_ABI = [
  {
    inputs: [],
    name: 'getAllContentIds',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'string', name: '_contentId', type: 'string' }],
    name: 'getContentDetails',
    outputs: [
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'bool', name: 'isPublic', type: 'bool' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'string[]', name: 'tags', type: 'string[]' },
      { internalType: 'uint256', name: 'viewCount', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

interface Content {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadDate: string;
  owner: string;
  description: string;
  tags: string[];
  icon: string;
  originalName?: string;
  contentUrl?: string;
  isPublic: boolean;
}

const LearnerDashboard = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lighthouseApiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
  const { viewContent } = useEduStoreContracts();

  // Use the imported contract addresses
  const CORE_CONTRACT_ADDRESS = EduCoreContract.address;
  const ACCESS_CONTROL_ADDRESS = EduAccessControlContract.address;

  // Function to fetch all public content
  const fetchPublicContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = new JsonRpcProvider('https://api.calibration.node.glif.io/rpc/v1');
      console.log('Provider connected:', provider);
      
      const coreContract = new Contract(CORE_CONTRACT_ADDRESS, MINIMAL_ABI, provider);
      console.log('Contract instance created:', CORE_CONTRACT_ADDRESS);

      // Get all content IDs
      const allContentIds = await coreContract.getAllContentIds();
      console.log('All content IDs:', allContentIds);

      if (!allContentIds || allContentIds.length === 0) {
        console.log('No content IDs found');
        setContents([]);
        return;
      }

      // Process each content ID
      const contentPromises = allContentIds.map(async (contentId: string) => {
        try {
          console.log('Processing content ID:', contentId);
          
          // Get content details from contract
          const contentDetails = await coreContract.getContentDetails(contentId);
          console.log('Content details:', contentDetails);

          // Skip if not public
          if (!contentDetails.isPublic) {
            console.log('Content is not public, skipping:', contentId);
            return null;
          }

          // Get file info from Lighthouse
          const fileInfo = await lighthouse.getFileInfo(contentId) as LighthouseFileInfo;
          console.log('Lighthouse file info:', fileInfo);
          
          // Get file type from content type
          let fileType = 'unknown';
          if (fileInfo.contentType) {
            if (fileInfo.contentType.includes('image')) fileType = 'image';
            else if (fileInfo.contentType.includes('pdf')) fileType = 'pdf';
            else if (fileInfo.contentType.includes('text')) fileType = 'text';
            else if (fileInfo.contentType.includes('video')) fileType = 'video';
            else if (fileInfo.contentType.includes('audio')) fileType = 'audio';
          }

          // Generate access URL with API key
          const contentUrl = `https://gateway.lighthouse.storage/ipfs/${contentId}?api-key=${lighthouseApiKey}`;

          return {
            id: contentId,
            title: contentDetails.title || 'Untitled',
            type: fileType,
            size: formatFileSize(fileInfo.fileSize || 0),
            uploadDate: new Date(Number(contentDetails.timestamp) * 1000).toLocaleDateString(),
            owner: contentDetails.owner,
            description: contentDetails.description || 'No description available',
            tags: contentDetails.tags || [],
            icon: getFileIcon(fileType),
            originalName: fileInfo.fileName || contentId,
            contentUrl: contentUrl,
            isPublic: true
          } as Content;
        } catch (err) {
          console.error(`Error processing content ${contentId}:`, err);
          return null;
        }
      });

      const contentsData = await Promise.all(contentPromises);
      const validContents = contentsData.filter(content => content !== null) as Content[];
      console.log('Processed contents:', validContents);
      setContents(validContents);
    } catch (err: any) {
      console.error('Error fetching public content:', err);
      setError(`Failed to load content: ${err.message}`);
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

  // Helper function to get file icon
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'image':
        return '🖼️';
      case 'text':
        return '📝';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      default:
        return '📁';
    }
  };

  // Fetch content on mount
  useEffect(() => {
    fetchPublicContent();
  }, []);

  // Filter content based on search term
  const filteredContents = contents.filter(
    (content) =>
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openModal = async (content: Content) => {
    try {
      // Check access and record view
      const canView = await viewContent(content.id);
      if (canView) {
        setSelectedContent(content);
        setIsModalOpen(true);
      } else {
        alert('You do not have access to this content');
      }
    } catch (error) {
      console.error('Error checking content access:', error);
      alert('Error checking content access');
    }
  };

  const closeModal = () => {
    setSelectedContent(null);
    setIsModalOpen(false);
  };

  // Helper function to download content
  const downloadContent = async (content: Content) => {
    try {
      const response = await fetch(content.contentUrl!);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = content.originalName || content.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading content:', err);
      alert('Failed to download content. Please try again.');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <StudentSidebar activePage="resources" />
          <div className="flex-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-medium">Public Content</h1>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search content..."
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
                  onClick={fetchPublicContent}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh Content'}
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

              {/* Content Grid */}
              {!isLoading && !error && filteredContents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContents.map((content) => (
                    <div
                      key={content.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-center mb-4">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                            {content.icon}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
                            <p className="text-sm text-gray-500">By {content.owner}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{content.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {content.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{content.size}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal(content)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => downloadContent(content)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Content Preview Modal */}
              {isModalOpen && selectedContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg max-w-4xl w-full mx-4">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedContent.title}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => downloadContent(selectedContent)}
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
                      {selectedContent.type === 'image' && selectedContent.contentUrl && (
                        <img
                          src={selectedContent.contentUrl}
                          alt={selectedContent.title}
                          className="max-h-[70vh] w-auto mx-auto"
                        />
                      )}
                      {selectedContent.type === 'pdf' && selectedContent.contentUrl && (
                        <iframe
                          src={selectedContent.contentUrl}
                          className="w-full h-[70vh]"
                          title={selectedContent.title}
                        />
                      )}
                      {selectedContent.type === 'text' && selectedContent.contentUrl && (
                        <div className="max-h-[70vh] overflow-auto bg-gray-50 p-4 rounded">
                          <pre className="whitespace-pre-wrap">{selectedContent.contentUrl}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* No Content State */}
              {!isLoading && !error && filteredContents.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-10 text-center">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? 'No content matches your search.'
                      : 'There is no public content available at the moment.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard; 