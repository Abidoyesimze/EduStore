// src/useFileStorage.ts
import { useState, useCallback } from 'react';
import { getAddress } from 'ethers';
import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
import { toast } from 'react-toastify';

interface IUploadProgressCallback {
  progress: number;
}

export interface StoragePlan {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  maxSize: string;
  features: string[];
}

export const storagePlans: StoragePlan[] = [
  {
    id: '1',
    name: 'Basic',
    description: 'Basic storage plan for small files',
    price: '0.1',
    duration: '1 month',
    maxSize: '1GB',
    features: ['1GB Storage', 'Basic Support', 'Standard Upload Speed']
  },
  {
    id: '2',
    name: 'Pro',
    description: 'Professional storage plan for medium-sized files',
    price: '0.5',
    duration: '3 months',
    maxSize: '5GB',
    features: ['5GB Storage', 'Priority Support', 'Fast Upload Speed']
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'Enterprise storage plan for large files',
    price: '1.0',
    duration: '12 months',
    maxSize: '20GB',
    features: ['20GB Storage', '24/7 Support', 'Ultra-Fast Upload Speed']
  }
];

// Custom hook for Filecoin storage functionality
export const useFilecoinStorage = (apiKey: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadToFilecoin = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const response = await lighthouse.upload(
        file,
        apiKey,
        undefined,
        (progressData: { progress: number }) => {
          setUploadProgress(progressData.progress);
          onProgress?.(progressData.progress);
        }
      );

      if (response.data?.Hash) {
        return response.data.Hash;
      }
      throw new Error('Upload failed: No CID returned');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [apiKey]);

  return {
    uploadToFilecoin,
    storagePlans,
    isUploading,
    uploadProgress,
    uploadError
  };
};