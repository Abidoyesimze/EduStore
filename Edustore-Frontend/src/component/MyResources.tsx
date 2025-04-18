import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { EduCoreContract } from './index';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Resource {
  contentId: string;
  owner: string;
  timestamp: bigint;
  title: string;
  isPublic: boolean;
  expiry: bigint;
}

const Resources: React.FC = () => {
  const { address } = useAccount();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient();

  // Get user's content IDs
  const { data: contentIds } = useReadContract({
    address: EduCoreContract.address as `0x${string}`,
    abi: EduCoreContract.abi,
    functionName: 'getMyContent',
  });
    console.log("Content IDs:", contentIds);
  // Fetch content details for each ID
  useEffect(() => {
    const fetchResourceDetails = async () => {
      if (!contentIds) return;

      try {
        const resourcePromises = contentIds.map(async (contentId: string) => {
          const result = await useReadContract({
            address: EduCoreContract.address as `0x${string}`,
            abi: EduCoreContract.abi,
            functionName: 'contents',
            args: [contentId],
          });

          return result.data as Resource;
        });

        const fetchedResources = await Promise.all(resourcePromises);
        setResources(fetchedResources);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching resource details:', error);
        toast.error('Failed to fetch resource details');
        setLoading(false);
      }
    };

    fetchResourceDetails();
  }, [contentIds]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      
      <h1 className="text-3xl font-bold mb-8">My Resources</h1>
      
      {resources.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No resources found. Start by uploading some content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.contentId}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{resource.title}</h2>
              <p className="text-gray-600 mb-4">
                Content ID: {resource.contentId.slice(0, 8)}...{resource.contentId.slice(-6)}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  {resource.isPublic ? (
                    <span className="text-green-500">Public</span>
                  ) : (
                    <span className="text-red-500">Private</span>
                  )}
                </span>
                <span>
                  Expires: {new Date(Number(resource.expiry) * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;