// src/useFileStorage.ts
import { useState } from 'react';
import lighthouse from '@lighthouse-web3/sdk';
// import { getAddress } from 'ethers';
// import { ethers } from 'ethers';
// import { toast } from 'react-toastify';
import { IUploadProgressCallback } from '@lighthouse-web3/sdk/dist/types';

export interface StoragePlan {
  id: string;
  name: string;
  price: string;
  days: number;
  features: string[];
}

export interface StorageProvider {
  address: string;
  name: string;
}

interface ProgressData {
  progress: number;
  total: number;
}

export const useFilecoinStorage = (apiKey: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const storagePlans: StoragePlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: '0.01 FIL',
      days: 180,
      features: ['Standard replication', 'Basic support']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '0.05 FIL',
      days: 365,
      features: ['High replication', 'Priority support', 'Fast retrieval']
    }
  ];

  const uploadToFilecoin = async (
    file: File,
    onProgress?: (data: IUploadProgressCallback) => void
  ): Promise<string> => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      if (!apiKey) {
        throw new Error('Lighthouse API key not found');
      }

      const dealParameters = {
        num_copies: 3,
        deal_duration: 180 * 24 * 60 * 60, // 180 days in seconds
        miner: ['*'], // Use any miner
        repair_threshold: 0.5, // Repair if 50% of copies are lost
        renew_threshold: 0.8, // Renew if 80% of deal duration has passed
        network: 'mainnet'
      };

      const response = await lighthouse.upload(
        file,
        apiKey,
        dealParameters,
        onProgress
      );

      setIsUploading(false);
      return response.data.Hash;
    } catch (error: any) {
      setIsUploading(false);
      setUploadError(error.message);
      throw error;
    }
  };

  const getStorageProviders = async (): Promise<StorageProvider[]> => {
    try {
      console.log('Fetching storage providers...');
      
      // Return a list of known Filecoin storage providers for the Calibration Network
      return [
        {
          address: 'f01234',
          name: 'Calibration Provider 1'
        },
        {
          address: 'f05678',
          name: 'Calibration Provider 2'
        },
        {
          address: 'f09012',
          name: 'Calibration Provider 3'
        }
      ];
    } catch (error: any) {
      console.error('Error fetching storage providers:', error);
      setUploadError(`Failed to fetch storage providers: ${error.message}`);
      throw error;
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadToFilecoin,
    getStorageProviders,
    storagePlans
  };
};