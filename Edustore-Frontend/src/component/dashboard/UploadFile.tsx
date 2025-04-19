import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EduCoreContract, EduStoreContract } from '..';
import { getAddress } from 'ethers';
import { useFilecoinStorage } from '../useFileStorage';

interface StoragePlan {
  id: string;
  name: string;
  price: string;
  days: number;
  features: string[];
}

type UploadStep = 'idle' | 'uploading' | 'core-tx' | 'storage-tx' | 'error' | 'complete';

const UploadFile: React.FC = () => {
  const { address } = useAccount();
  const lighthouseApiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
  const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
  const pinataApiSecret = import.meta.env.VITE_PINATA_SECRET_KEY;

  const {
    uploadToFilecoin,
    storagePlans,
    getStorageProviders,
    isUploading,
    uploadProgress,
    uploadError: filecoinError,
  } = useFilecoinStorage(lighthouseApiKey);

  // Hooks for contract interactions
  const {
    writeContract: storeContentWrite,
    data: storeContentData,
    isPending: isPendingCore,
    error: errorCore,
  } = useWriteContract();

  const {
    writeContract: createStorageDealWrite,
    data: createStorageDealData,
    isPending: isPendingStorage,
    error: errorStorage,
  } = useWriteContract();

  // Transaction receipt monitoring
  const { isLoading: isConfirmingCore, isSuccess: isConfirmedCore } = useWaitForTransactionReceipt({ hash: storeContentData });
  const { isLoading: isConfirmingStorage, isSuccess: isConfirmedStorage } = useWaitForTransactionReceipt({ hash: createStorageDealData });

  // Form state
  const [fileName, setFileName] = useState('');
  const [tags, setTags] = useState('');
  const [accessType, setAccessType] = useState<'public' | 'students'>('public');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  // Storage plan state
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [storageProvider, setStorageProvider] = useState('');
  const [storageProviders, setStorageProviders] = useState<{ address: string; name: string }[]>([]);
  const [showDealConfirmation, setShowDealConfirmation] = useState(false);

  // Transaction state
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [contentCID, setContentCID] = useState<string | null>(null);
  const [coreTransactionTimeout, setCoreTransactionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [storageTransactionTimeout, setStorageTransactionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);

  // Pinata API functions
  const pinFileToIPFS = async (file: File): Promise<string> => {
    try {
      console.log('Starting Pinata upload...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
  
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataApiSecret,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Pinata upload failed:', response.status, errorData);
        throw new Error(`Pinata file upload failed: ${response.status} - ${errorData.error?.details || response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Pinata upload successful:', data);
      return data.IpfsHash;
    } catch (error: any) {
      console.error('Pinata upload error:', error);
      throw new Error(`Pinata file upload failed: ${error.message}`);
    }
  };

  const pinJSONToIPFS = async (json: object, metadataName: string): Promise<string> => {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataApiSecret,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinataContent: json,
          pinataMetadata: { name: metadataName },
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pinata JSON upload failed: ${response.status} - ${errorData.error?.details || response.statusText}`);
      }
  
      const data = await response.json();
      return data.IpfsHash;
    } catch (error: any) {
      console.error('Pinata JSON upload error:', error);
      throw new Error(`Pinata JSON upload failed: ${error.message}`);
    }
  };

  // Initialize storage providers and defaults
  useEffect(() => {
    const init = async () => {
      try {
        const providers = await getStorageProviders();
        setStorageProviders(providers);
        if (!selectedPlan && storagePlans.length > 0) setSelectedPlan(storagePlans[0].id);
        if (!storageProvider && providers.length > 0) setStorageProvider(providers[0].address);
      } catch (error) {
        console.error('Error initializing providers:', error);
        toast.error('Failed to load storage providers. Please refresh the page.');
      }
    };
    init();
  }, []);

  // Update upload error state
  useEffect(() => {
    if (filecoinError) setUploadError(filecoinError);
  }, [filecoinError]);

  // File drag and drop handlers
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
      const fullName = files[0].name;
      const nameWithoutExt = fullName.split('.').slice(0, -1).join('.') || fullName;
      setFileName(nameWithoutExt);
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      const fullName = files[0].name;
      const nameWithoutExt = fullName.split('.').slice(0, -1).join('.') || fullName;
      setFileName(nameWithoutExt);
      setSelectedFile(files[0]);
    }
  };

  // Store content on EduCoreContract
  const storeContentOnChain = async (contentId: string) => {
    setUploadStep('core-tx');
    setIsTransactionInProgress(true);

    try {
      if (coreTransactionTimeout) {
        clearTimeout(coreTransactionTimeout);
        setCoreTransactionTimeout(null);
      }

      const timeout = setTimeout(() => {
        if (uploadStep === 'core-tx' && !isConfirmedCore) {
          toast.error('Transaction timeout. Please check your wallet.');
          setUploadStep('error');
          setUploadError('Transaction timeout.');
          setIsTransactionInProgress(false);
        }
      }, 60000);
      setCoreTransactionTimeout(timeout);

      console.log('Storing content with CID:', contentId);
      await storeContentWrite({
        address: EduCoreContract.address as `0x${string}`,
        abi: EduCoreContract.abi,
        functionName: 'storeContent',
        args: [
          contentId, 
          fileName, 
          accessType === 'public',
          '', // Empty description
          tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) // Convert tags string to array
        ],
      });
    } catch (error: any) {
      console.error('Error storing content:', error);
      toast.error(`Failed to store content: ${error.message || 'Transaction rejected'}`);
      setUploadStep('error');
      setUploadError(`Failed to store content: ${error.message || 'Transaction rejected'}`);
      setIsTransactionInProgress(false);
      throw error;
    }
  };

  // Create storage deal on EduStoreContract
  const createStorageDealOnChain = async (contentId: string, provider: string, days: number, ethAmount: string) => {
    setUploadStep('storage-tx');
    setIsTransactionInProgress(true);

    try {
      if (storageTransactionTimeout) {
        clearTimeout(storageTransactionTimeout);
        setStorageTransactionTimeout(null);
      }

      const timeout = setTimeout(() => {
        if (uploadStep === 'storage-tx' && !isConfirmedStorage) {
          toast.error('Storage deal timeout. Please check your wallet.');
          setUploadStep('error');
          setUploadError('Storage deal timeout.');
          setIsTransactionInProgress(false);
        }
      }, 60000);
      setStorageTransactionTimeout(timeout);

      const valueInWei = BigInt(parseFloat(ethAmount) * 10 ** 18);
      const formattedProvider = getAddress(provider);
      console.log('Creating storage deal with params:', { contentId, provider: formattedProvider, days, valueInWei: valueInWei.toString() });

      await createStorageDealWrite({
        address: EduStoreContract.address as `0x${string}`,
        abi: EduStoreContract.abi,
        functionName: 'createDeal',
        args: [contentId, formattedProvider, days],
        value: valueInWei,
      });
    } catch (error: any) {
      console.error('Error creating storage deal:', error);
      const errorMessage = error.message?.includes('user rejected')
        ? 'Transaction rejected in wallet'
        : `Failed to create storage deal: ${error.message || 'Unknown error'}`;
      toast.error(errorMessage);
      setUploadStep('error');
      setUploadError(errorMessage);
      setIsTransactionInProgress(false);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isTransactionInProgress) {
      toast.info('A transaction is already in progress');
      return;
    }

    setUploadError('');
    setUploadStep('idle');

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      setUploadError('Please select a file to upload');
      return;
    }

    if (!fileName.trim()) {
      toast.error('Please enter a file title');
      setUploadError('Please enter a file title');
      return;
    }

    if (!selectedPlan) {
      toast.error('Please select a storage plan');
      setUploadError('Please select a storage plan');
      return;
    }

    // Check file size (optional, but good practice)
    const maxFileSize = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > maxFileSize) {
      toast.error('File size exceeds 100MB limit');
      setUploadError('File size exceeds 100MB limit');
      return;
    }

    const processToastId = 'file-process-toast';
    try {
      console.log('Starting upload process...');
      toast.info('Preparing file upload to Filecoin...', {
        autoClose: false,
        toastId: processToastId,
        position: 'top-right',
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        isLoading: true,
      });

      setUploadStep('uploading');
      setIsTransactionInProgress(true);

      // Upload file using Lighthouse with retry logic
      console.log('Uploading file to Lighthouse...');
      let uploadAttempts = 0;
      const maxUploadAttempts = 3;
      let contentId = null;

      while (uploadAttempts < maxUploadAttempts && !contentId) {
        try {
          contentId = await uploadToFilecoin(selectedFile, (progress) => {
            uploadProgress = progress;
          });
          console.log('File uploaded with CID:', contentId);
          break;
        } catch (error: any) {
          uploadAttempts++;
          if (uploadAttempts === maxUploadAttempts) {
            throw new Error(`Upload failed after ${maxUploadAttempts} attempts: ${error.message}`);
          }
          console.log(`Upload attempt ${uploadAttempts} failed, retrying...`);
          toast.update(processToastId, {
            render: `Upload attempt ${uploadAttempts} failed, retrying...`,
            type: 'warning',
            autoClose: false,
            isLoading: true,
          });
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!contentId) {
        throw new Error('Failed to upload file after multiple attempts');
      }

      // Update toast to show successful upload
      toast.update(processToastId, {
        render: 'File uploaded successfully! Registering on blockchain...',
        type: 'info',
        autoClose: false,
        isLoading: true,
      });

      // Save the content ID
      setContentCID(contentId);

      // Store content on blockchain
      console.log('Calling storeContentOnChain...');
      await storeContentOnChain(contentId);

      // Monitor transaction status with increased timeout
      let transactionConfirmed = false;
      const maxAttempts = 60; // 60 seconds timeout
      let attempts = 0;

      while (!transactionConfirmed && attempts < maxAttempts) {
        if (isConfirmedCore) {
          transactionConfirmed = true;
          break;
        }
        if (errorCore) {
          throw new Error(`Transaction failed: ${errorCore.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!transactionConfirmed) {
        throw new Error('Transaction timeout. Please check your wallet.');
      }

      // Update success state
      setUploadStep('complete');
      toast.update(processToastId, {
        render: 'File uploaded and registered successfully!',
        type: 'success',
        autoClose: 5000,
        isLoading: false,
      });

      // Reset form
      setFileName('');
      setTags('');
      setSelectedFile(null);
      setAccessType('public');
      setSelectedPlan('basic');
    } catch (error: any) {
      console.error('Error during upload process:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed to upload file: ${errorMessage}`);
      setUploadError(`Failed to upload file: ${errorMessage}`);
      setUploadStep('error');
    } finally {
      setIsTransactionInProgress(false);
      if (coreTransactionTimeout) {
        clearTimeout(coreTransactionTimeout);
        setCoreTransactionTimeout(null);
      }
    }
  };

  // Monitor core contract transaction status
  useEffect(() => {
    const processToastId = 'file-process-toast';

    if (isPendingCore) {
      toast.update(processToastId, {
        render: 'Submitting content registration to blockchain...',
        type: 'info',
        autoClose: false,
        isLoading: true,
      });
    }

    if (isConfirmingCore) {
      toast.update(processToastId, {
        render: 'Confirming content registration...',
        type: 'info',
        autoClose: false,
        isLoading: true,
      });
    }

    if (isConfirmedCore) {
      toast.update(processToastId, {
        render: 'Content successfully registered! Ready to create storage deal.',
        type: 'success',
        autoClose: 5000,
        isLoading: false,
      });
      setShowDealConfirmation(true);
    }

    if (errorCore) {
      toast.update(processToastId, {
        render: `Content registration failed: ${errorCore.message || 'Unknown error'}`,
        type: 'error',
        autoClose: 5000,
        isLoading: false,
      });
      setUploadStep('error');
    }
  }, [isPendingCore, isConfirmingCore, isConfirmedCore, errorCore]);

  // Handle storage deal creation
  const handleContinueToStorageDeal = async () => {
    if (isTransactionInProgress) {
      toast.info('A transaction is already in progress');
      return;
    }

    if (!contentCID || !selectedPlan || !storageProvider) {
      toast.error('Missing required information for storage deal');
      return;
    }

    try {
      setUploadError('');
      const processToastId = 'storage-deal-toast';
      toast.info('Creating storage deal on Filecoin...', {
        autoClose: false,
        toastId: processToastId,
        position: 'top-right',
        closeOnClick: false,
        isLoading: true,
      });

      await createStorageDealOnChain(contentCID, storageProvider, storagePlans.find((p: StoragePlan) => p.id === selectedPlan)?.days || 180, storagePlans.find((p: StoragePlan) => p.id === selectedPlan)?.price || '0');
    } catch (error: any) {
      console.error('Error creating storage deal:', error);
      toast.error(`Failed to create storage deal: ${error.message || 'Unknown error'}. File is pinned via Pinata.`);
      setUploadStep('complete'); // Allow completion despite deal failure
      setIsTransactionInProgress(false);
      setFileName('');
      setTags('');
      setSelectedFile(null);
      setShowDealConfirmation(false);
      setContentCID(null);
    }
  };

  // Monitor storage deal transaction status
  useEffect(() => {
    const processToastId = 'storage-deal-toast';

    if (isConfirmedStorage || errorStorage) {
      if (storageTransactionTimeout) {
        clearTimeout(storageTransactionTimeout);
        setStorageTransactionTimeout(null);
      }
    }

    if (isPendingStorage) {
      toast.update(processToastId, {
        render: 'Submitting storage deal to blockchain...',
        type: 'info',
        autoClose: false,
        isLoading: true,
      });
    }

    if (isConfirmingStorage) {
      toast.update(processToastId, {
        render: 'Confirming storage deal on the Filecoin network...',
        type: 'info',
        autoClose: false,
        isLoading: true,
      });
    }

    if (isConfirmedStorage) {
      toast.update(processToastId, {
        render: 'Storage deal created successfully! Your file is now securely stored on Filecoin.',
        type: 'success',
        autoClose: 5000,
        isLoading: false,
      });
      setUploadStep('complete');
      setIsTransactionInProgress(false);
      setFileName('');
      setTags('');
      setSelectedFile(null);
      setShowDealConfirmation(false);
      setContentCID(null);
    }

    if (errorStorage) {
      console.error('Storage deal error details:', errorStorage);
      toast.update(processToastId, {
        render: `Storage deal failed: ${errorStorage.message || 'Transaction was rejected'}. File is pinned via Pinata.`,
        type: 'warning',
        autoClose: 5000,
        isLoading: false,
      });
      setUploadStep('complete'); // Allow completion despite deal failure
      setIsTransactionInProgress(false);
      setFileName('');
      setTags('');
      setSelectedFile(null);
      setShowDealConfirmation(false);
      setContentCID(null);
    }
  }, [isPendingStorage, isConfirmingStorage, isConfirmedStorage, errorStorage]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (coreTransactionTimeout) clearTimeout(coreTransactionTimeout);
      if (storageTransactionTimeout) clearTimeout(storageTransactionTimeout);
    };
  }, [coreTransactionTimeout, storageTransactionTimeout]);

  // Status message for UI
  const getStatusMessage = () => {
    switch (uploadStep) {
      case 'uploading':
        return `Uploading file to IPFS... ${uploadProgress.toFixed(1)}%`;
      case 'core-tx':
        if (isPendingCore) return 'Submitting content registration...';
        if (isConfirmingCore) return 'Confirming content registration...';
        return 'Registering content on blockchain...';
      case 'storage-tx':
        if (isPendingStorage) return 'Submitting storage deal...';
        if (isConfirmingStorage) return 'Confirming storage deal...';
        return 'Creating storage deal...';
      case 'complete':
        return 'File uploaded and pinned successfully!';
      case 'error':
        return `Error: ${uploadError || errorCore?.message || errorStorage?.message || 'Upload failed'}`;
      default:
        return '';
    }
  };

  // Handle retry
  const handleRetry = () => {
    setUploadError('');
    setUploadStep('idle');
    setIsTransactionInProgress(false);
    toast.dismiss();
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    document.getElementById('file-upload')?.click();
  };

  return (
    <div className="bg-white min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar activePage="upload" />
          <div className="flex-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-8">
                <h1 className="text-xl font-medium">
                  Welcome {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''} 👋
                </h1>
              </div>

              {/* Error Status Bar */}
              {uploadStep === 'error' && (
                <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Transaction Failed</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{uploadError || errorCore?.message || errorStorage?.message || 'An unknown error occurred'}</p>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={handleRetry}
                          className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Storage Deal Confirmation */}
              {showDealConfirmation && contentCID && (
                <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border-2 border-green-100">
                  <h2 className="text-lg font-semibold mb-4 text-green-800">Content Successfully Registered!</h2>
                  <p className="mb-4">Your file has been uploaded to IPFS and registered on the blockchain.</p>
                  <p className="mb-2 font-medium">Metadata CID: <span className="font-mono text-sm">{contentCID}</span></p>
                  <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                    <h3 className="font-medium mb-2">Create Storage Deal</h3>
                    <p className="text-sm mb-4">To ensure your content stays available on Filecoin, create a storage deal (optional, file is pinned via Pinata):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Storage Provider</label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={storageProvider}
                          onChange={(e) => setStorageProvider(e.target.value)}
                        >
                          {storageProviders.map((provider) => (
                            <option key={provider.address} value={provider.address}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Storage Plan</label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={selectedPlan}
                          onChange={(e) => setSelectedPlan(e.target.value)}
                        >
                          {storagePlans.map((plan: StoragePlan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name} - {plan.days} days ({plan.price})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded text-sm mb-4">
                      {storagePlans.find((p: StoragePlan) => p.id === selectedPlan)?.features.join(', ')}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setUploadStep('complete');
                          setFileName('');
                          setTags('');
                          setSelectedFile(null);
                          setShowDealConfirmation(false);
                          setContentCID(null);
                        }}
                        className="py-2 px-6 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
                      >
                        Skip Deal
                      </button>
                      <button
                        onClick={handleContinueToStorageDeal}
                        disabled={isPendingStorage || isConfirmingStorage || isTransactionInProgress}
                        className={`py-2 px-6 rounded-md transition-colors ${
                          isPendingStorage || isConfirmingStorage || isTransactionInProgress
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {isPendingStorage || isConfirmingStorage || isTransactionInProgress
                          ? 'Processing...'
                          : `Create Storage Deal (${storagePlans.find((p: StoragePlan) => p.id === selectedPlan)?.price || 'Free'})`}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Form */}
              {!showDealConfirmation && uploadStep !== 'error' && (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Title</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Lecture 1 - Introduction Basics"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        required
                      />
                    </div>
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

                  <div className="mb-8">
                    <h3 className="text-md font-medium mb-3">Select Storage Plan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {storagePlans.map((plan: StoragePlan) => (
                        <div
                          key={plan.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedPlan === plan.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                          }`}
                          onClick={() => setSelectedPlan(plan.id)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{plan.name}</h4>
                            <span className="text-sm bg-blue-100 px-2 py-1 rounded-full">{plan.price}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{plan.features.join(', ')}</p>
                          <div className="flex justify-between text-sm">
                            <span>{plan.days} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

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
                    {selectedFile ? (
                      <div className="text-green-600 font-medium mb-2">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    ) : (
                      <p className="text-gray-700 mb-2">
                        Drag & drop files here or{' '}
                        <span className="text-amber-500 font-medium cursor-pointer" onClick={handleBrowseClick}>
                          Browse Files
                        </span>
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">Accepts: pdf, docx, ppt, mp4, zip, etc.</p>
                    <input type="file" className="hidden" id="file-upload" onChange={handleFileSelect} />
                  </div>

                  <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-md flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      Your files will be stored on IPFS via Pinata for immediate access and optionally on the Filecoin network for long-term storage. This process happens in two steps:
                      <ol className="list-decimal ml-5 mt-2">
                        <li>First, we'll upload your file and metadata to IPFS and register it on our smart contract</li>
                        <li>Then, you can create a storage deal for long-term availability on Filecoin</li>
                      </ol>
                    </div>
                  </div>

                  {getStatusMessage() && (
                    <div
                      className={`mt-4 text-sm ${
                        uploadStep === 'complete' ? 'text-green-500' : uploadStep === 'error' ? 'text-red-500' : 'text-blue-500'
                      }`}
                    >
                      {getStatusMessage()}
                    </div>
                  )}

                  {uploadStep === 'uploading' && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUploading || isPendingCore || isConfirmingCore || isTransactionInProgress}
                      className={`py-2 px-6 rounded-md transition-colors ${
                        isUploading || isPendingCore || isConfirmingCore || isTransactionInProgress
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {isUploading
                        ? 'Uploading to IPFS...'
                        : isPendingCore
                        ? 'Registering Content...'
                        : isConfirmingCore
                        ? 'Confirming Registration...'
                        : isTransactionInProgress
                        ? 'Processing...'
                        : 'Upload File'}
                    </button>
                  </div>
                </form>
              )}

              {/* Success Message */}
              {uploadStep === 'complete' && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-green-800">Upload Complete!</h3>
                  </div>
                  <p className="mt-3 text-green-700">
                    Your file has been successfully uploaded to IPFS and registered on the blockchain. You can now view it in My Files.
                  </p>
                  <div className="mt-4 bg-white p-4 rounded-md border border-green-100">
                    <h4 className="font-medium text-gray-700 mb-2">File Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="font-medium text-green-600">Pinned on IPFS</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span className="text-gray-500">Access:</span>
                          <span className="font-medium">{accessType === 'public' ? 'Public' : 'Private (Students Only)'}</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span className="text-gray-500">Storage Plan:</span>
                          <span className="font-medium">{storagePlans.find((p: StoragePlan) => p.id === selectedPlan)?.name || 'Standard'}</span>
                        </p>
                      </div>
                      <div>
                        <p className="flex justify-between">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{storagePlans.find((p: StoragePlan) => p.id === selectedPlan)?.days || 180} days</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span className="text-gray-500">Features:</span>
                          <span className="font-medium">{storagePlans.find((p: StoragePlan) => p.id === selectedPlan)?.features.join(', ')}</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span className="text-gray-500">Expiry Date:</span>
                          <span className="font-medium">
                            {new Date(Date.now() + (storagePlans.find((p: StoragePlan) => p.id === selectedPlan)?.days || 180) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex mt-4 gap-3">
                    <button
                      className="px-4 py-2 bg-white border border-green-500 text-green-600 rounded-md hover:bg-green-50"
                      onClick={() => (window.location.href = '/dashboard/my-content')}
                    >
                      View My Content
                    </button>
                    <button
                      className="px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50"
                      onClick={() => (window.location.href = '/dashboard/manage-access')}
                    >
                      Manage Access
                    </button>
                    <button
                      className="px-4 py-2 ml-auto bg-amber-500 text-white rounded-md hover:bg-amber-600"
                      onClick={() => {
                        setUploadStep('idle');
                        setFileName('');
                        setTags('');
                        setSelectedFile(null);
                        setContentCID(null);
                      }}
                    >
                      Upload Another File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;