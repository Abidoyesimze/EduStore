// src/useFileStorage.ts
import { useState } from 'react';
import lighthouse from '@lighthouse-web3/sdk';
import { toast } from 'react-toastify';
//import { utils } from 'ethers';
//import { parseUnits } from "ethers";
//import * as ethersUtils from "ethers/lib/utils";


export interface IUploadProgressCallback {
  total: number;
  uploaded: number;
}

export interface FilecoinDealParams {
  numOfCopies?: number;
  dealDuration?: number;
  replication?: number;
  checkOneByOneStorageStatus?: boolean;
  minerList?: string[];
  fundedByAddress?: string;
  renewalConfig?: boolean | {
    autoRenew: boolean;
    fundSource: string;
    renewalTimes: number;
  };
}

export interface StoragePlan {
  name: string;
  days: number;
  dealParams: FilecoinDealParams;
  price: string; // In ETH
  description: string;
}

export const defaultStoragePlans: StoragePlan[] = [
  {
    name: "Basic",
    days: 30,
    dealParams: {
      numOfCopies: 1,
      dealDuration: 43200, // 30 days in minutes
      replication: 1,
      checkOneByOneStorageStatus: true
    },
    price: "0.01",
    description: "Basic storage for 30 days with single copy on Filecoin"
  },
  {
    name: "Standard",
    days: 180,
    dealParams: {
      numOfCopies: 2,
      dealDuration: 259200, // 180 days in minutes
      replication: 1,
      checkOneByOneStorageStatus: true
    },
    price: "0.03",
    description: "Standard 6-month storage with 2 copies for redundancy"
  },
  {
    name: "Premium",
    days: 365,
    dealParams: {
      numOfCopies: 3,
      dealDuration: 525600, // 365 days in minutes
      replication: 2,
      checkOneByOneStorageStatus: true
    },
    price: "0.05",
    description: "Premium 1-year storage with 3 copies and geographic distribution"
  }
];

// Custom hook for Filecoin storage functionality
export const useFilecoinStorage = (apiKey: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Basic upload function - fallback in case the dealparam version doesn't work
  const basicUpload = async (file: File, toastId?: string): Promise<string> => {
    try {
      console.log('Attempting basic upload to Lighthouse without deal parameters');
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      // Basic upload without deal parameters
      const response = await lighthouse.upload(
        formData, 
        apiKey,
        (progressData: any) => {
          if (progressData && progressData.total && progressData.uploaded) {
            const percent = (progressData.uploaded / progressData.total) * 100;
            setUploadProgress(percent);
            
            // Update toast if toastId provided
            if (toastId && toast.isActive(toastId)) {
              toast.update(toastId, {
                render: `Uploading to IPFS... ${percent.toFixed(1)}%`,
              });
            }
          }
        }
      );
      
      console.log('Basic upload response:', response);
      
      if (!response.data || !response.data.Hash) {
        throw new Error("Failed to get CID from Lighthouse");
      }
      
      const cid = response.data.Hash;
      console.log('File uploaded with CID:', cid);
      
      return `ipfs://${cid}`;
    } catch (error: any) {
      console.error("Error in basic upload:", error);
      throw error;
    }
  };

  // Function to upload file to Lighthouse with Filecoin storage
  const uploadToFilecoin = async (
    file: File, 
    dealParams: FilecoinDealParams = defaultStoragePlans[0].dealParams,
    toastId?: string
  ): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      if (!apiKey) {
        throw new Error("Lighthouse API key is not configured");
      }
      
      console.log('Uploading to Lighthouse with file:', file.name, file.size, file.type);
      console.log('API Key length:', apiKey.length);
      
      // First try upload with deal parameters
      try {
        console.log('Attempting upload with deal parameters');
        
        // Create a FormData object
        const formData = new FormData();
        formData.append('file', file);
        
        // Add deal parameters to formData
        if (dealParams) {
          // Convert the dealParams object to a JSON string and append it
          formData.append('dealParams', JSON.stringify(dealParams));
        }
        
        // Try upload with complete integration
        const response = await lighthouse.upload(
          formData, 
          apiKey,
          (progressData: any) => {
            if (progressData && progressData.total && progressData.uploaded) {
              const percent = (progressData.uploaded / progressData.total) * 100;
              setUploadProgress(percent);
              
              // Update toast if toastId provided
              if (toastId && toast.isActive(toastId)) {
                toast.update(toastId, {
                  render: `Uploading to Filecoin... ${percent.toFixed(1)}%`,
                });
              }
            }
          }
        );
        
        console.log('Lighthouse upload response:', response);
        
        if (!response.data || !response.data.Hash) {
          throw new Error("Failed to get CID from Lighthouse");
        }
        
        const cid = response.data.Hash;
        console.log('File uploaded to Lighthouse with CID:', cid);
        
        // For public files we can generate a gateway URL
        const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
        console.log('Gateway URL:', gatewayUrl);
        
        return `ipfs://${cid}`;
      } catch (dealParamError) {
        console.warn("Upload with deal parameters failed, falling back to basic upload:", dealParamError);
        
        // If the deal parameter version fails, try basic upload
        return await basicUpload(file, toastId);
      }
    } catch (error: any) {
      console.error("Error uploading to Lighthouse:", error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Lighthouse error details:", error.response.data);
      }
      
      const errorMessage = "Failed to upload file to Lighthouse: " + (error.message || "Unknown error");
      setUploadError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Alternative approach using apiKey directly
  const uploadWithApproach2 = async (file: File, toastId?: string): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('Using direct upload approach - starting...');
      
      // Create a FormData object - this is important
      const formData = new FormData();
      formData.append('file', file);
      
      // Use FormData with the upload
      const output = await lighthouse.upload(
        formData, // Use FormData, not the direct file
        apiKey
      );
      
      console.log('Direct upload response:', output);
      
      if (!output.data || !output.data.Hash) {
        throw new Error("Failed to get CID");
      }
      
      return `ipfs://${output.data.Hash}`;
    } catch (error: any) {
      console.error("Error in alternative upload:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadWithProgress = async (file: File, toastId?: string): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('Starting upload with progress monitoring...');
      
      // Use XMLHttpRequest for better progress monitoring
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(percentComplete);
            console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
            
            if (toastId && toast.isActive(toastId)) {
              toast.update(toastId, {
                render: `Uploading to Filecoin... ${percentComplete.toFixed(1)}%`,
              });
            }
          }
        });
        
        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.Hash) {
                console.log('Upload successful, CID:', response.Hash);
                resolve(`ipfs://${response.Hash}`);
              } else {
                reject(new Error('No Hash in response'));
              }
            } catch (error) {
              reject(new Error(`Failed to parse response: ${xhr.responseText}`));
            }
          } else {
            reject(new Error(`HTTP error: ${xhr.status}`));
          }
        });
        
        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });
        
        // Set timeout
        xhr.timeout = 60000; // 1 minute
        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timed out'));
        });
        
        // Open and send the request
        xhr.open('POST', 'https://node.lighthouse.storage/api/v0/add');
        xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error("Error in progressive upload:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  // Function to get metadata about a file stored on Filecoin
  const getFilecoinMetadata = async (cid: string) => {
    try {
      // Remove ipfs:// prefix if present
      const cleanCID = cid.startsWith('ipfs://') ? cid.slice(7) : cid;
      
      // Get file metadata from Lighthouse
      const fileInfo = await lighthouse.getFileInfo(cleanCID);
      
      return fileInfo;
    } catch (error: any) {
      console.error("Error fetching Filecoin metadata:", error);
      return null;
    }
  };
  
  // Get storage providers in the Filecoin network
  // Get storage providers in the Filecoin network
  const getStorageProviders = async () => {
    return [
      {
        address: utils.getAddress(import.meta.env.VITE_PROVIDER_1_ADDRESS),
        name: "EduStore Provider 1",
      },
      {
        address: utils.getAddress(import.meta.env.VITE_PROVIDER_2_ADDRESS),
        name: "EduStore Provider 2",
      },
    ];
  };

  return {
    uploadToFilecoin,
    uploadWithApproach2,
    uploadWithProgress,
    getFilecoinMetadata,
    getStorageProviders,
    defaultStoragePlans,
    isUploading,
    uploadProgress,
    uploadError
  };
};

