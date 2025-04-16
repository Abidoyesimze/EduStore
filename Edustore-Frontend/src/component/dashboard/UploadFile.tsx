// src/components/dashboard/UploadFile.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAccount } from 'wagmi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEduStoreContracts } from '../Service';
import { ethers } from 'ethers';
import { useFilecoinStorage, StoragePlan } from '../useFileStorage';


const UploadFile: React.FC = () => {
  // Get user's account
  const { address } = useAccount();
  
  // Lighthouse API configuration
  const lighthouseApiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
  
  // Get Filecoin storage hook
  const {
    uploadToFilecoin,
    uploadWithApproach2, // Added this line
    uploadWithProgress,
    defaultStoragePlans,
    getStorageProviders,
    isUploading,
    uploadProgress,
    uploadError: filecoinError
  } = useFilecoinStorage(lighthouseApiKey);
  
  // Get contract interactions
  const {
    storeContent,
    createStorageDeal,
    isPendingCore,
    isConfirmingCore,
    isConfirmedCore,
    errorCore,
    isPendingStorage,
    isConfirmingStorage,
    isConfirmedStorage,
    errorStorage
  } = useEduStoreContracts();
  
  // Form state
  const [fileName, setFileName] = useState('');
  const [tags, setTags] = useState('');
  const [accessType, setAccessType] = useState('public');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  
  // Storage plan selection
  const [storagePlans, setStoragePlans] = useState<StoragePlan[]>(defaultStoragePlans);
  const [selectedPlan, setSelectedPlan] = useState<StoragePlan | null>(null);
  const [storageProvider, setStorageProvider] = useState('');
  const [storageProviders, setStorageProviders] = useState<{address: string, name: string}[]>([]);
  const [showDealConfirmation, setShowDealConfirmation] = useState(false);
  
  // Transaction status tracking
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'core-tx' | 'storage-tx' | 'complete' | 'error'>('idle');
  const [contentCID, setContentCID] = useState<string | null>(null);
  
  // Load storage providers and set default selections
  useEffect(() => {
    const init = async () => {
      // Get storage providers
      const providers = await getStorageProviders();
      setStorageProviders(providers);
      
      // Set default selections
      if (!selectedPlan && storagePlans.length > 0) {
        setSelectedPlan(storagePlans[0]);
      }
      
      if (!storageProvider && providers.length > 0) {
        setStorageProvider(providers[0].address);
      }
    };
    
    init();
  }, []);
  
  // Update upload error state when Filecoin error changes
  useEffect(() => {
    if (filecoinError) {
      setUploadError(filecoinError);
    }
  }, [filecoinError]);

  // Handle file dragging
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      // Extract name without extension
      const fullName = files[0].name;
      const nameWithoutExt = fullName.split('.').slice(0, -1).join('.');
      setFileName(nameWithoutExt || fullName); // Fallback to full name if no extension
      setSelectedFile(files[0]);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      // Extract name without extension
      const fullName = files[0].name;
      const nameWithoutExt = fullName.split('.').slice(0, -1).join('.');
      setFileName(nameWithoutExt || fullName); // Fallback to full name if no extension
      setSelectedFile(files[0]);
    }
  };
  
  // Function to write content to EduStoreCore contract
  const storeContentOnChain = async (contentId: string) => {
    setUploadStep('core-tx');
    
    try {
      await storeContent(contentId, fileName, accessType === 'public');
      
      // Transaction submitted - further status will be tracked in useEffect
      console.log("Content storage transaction submitted");
    } catch (error: any) {
      console.error("Error storing content on chain:", error);
      setUploadStep('error');
      throw new Error("Failed to store content on blockchain: " + error.message);
    }
  };
  
  // Function to create storage deal on EduStorageManager
  const createStorageDealOnChain = async (contentId: string, provider: string, days: number, ethAmount: string) => {
    setUploadStep('storage-tx');
    
    try {
      // Convert eth to wei
      const valueInWei = BigInt(parseFloat(ethAmount) * 10**18);
      
      // Ensure provider address is properly formatted
      // Simple fix to ensure the address has the right format (lowercase with 0x prefix)
      const formattedProvider = provider.toLowerCase();
      
      console.log("Creating storage deal with:", {
        contentId,
        provider: formattedProvider,
        days,
        value: valueInWei.toString()
      });
      
      await createStorageDeal(
        contentId, 
        formattedProvider, 
        days, 
        valueInWei
      );
      
      console.log("Storage deal transaction submitted");
    } catch (error: any) {
      console.error("Error creating storage deal:", error);
      setUploadStep('error');
      throw new Error("Failed to create storage deal: " + error.message);
    }
  };
  
  // Main function to handle the submission flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      setUploadError("Please select a file to upload");
      return;
    }
    
    if (!fileName.trim()) {
      toast.error("Please enter a file title");
      setUploadError("Please enter a file title");
      return;
    }
    
    if (!selectedPlan) {
      toast.error("Please select a storage plan");
      setUploadError("Please select a storage plan");
      return;
    }
    
    try {
      // Create a toast ID for tracking the entire process
      const processToastId = "file-process-toast";
      
      // Step 1: Upload file to IPFS via Lighthouse
      toast.info("Uploading file to Filecoin via Lighthouse...", { 
        autoClose: false, 
        toastId: processToastId,
        position: "top-right",
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        isLoading: true,
      });
      
      setUploadStep('uploading');
      
      // Upload the file with selected plan parameters
      console.log("Trying direct upload method...");
      const contentId = await uploadWithProgress(selectedFile, processToastId);
     console.log("Upload completed with CID:", contentId);
      
      // Update toast to show successful upload
      toast.update(processToastId, { 
        render: "File uploaded successfully! Registering on blockchain...", 
        type: "info",
        autoClose: false,
        isLoading: true,
      });
      
      // Save the content ID
      setContentCID(contentId);
      
      // Step 2: Store content reference on the core contract
      await storeContentOnChain(contentId);

      // Next steps (creating storage deal) will happen after confirming the first transaction
      // This is handled in the useEffect watching the transaction confirmations
      
    } catch (error: any) {
      console.error("Error during upload process:", error);
      toast.error(`Failed to upload file: ${error.message}`);
      setUploadError(`Failed to upload file: ${error.message}`);
      setUploadStep('error');
    }
  };
  
  // Function to handle continuing to storage deal after content is registered
  const handleContinueToStorageDeal = async () => {
    if (!contentCID || !selectedPlan || !storageProvider) {
      toast.error("Missing required information for storage deal");
      return;
    }
    
    try {
      const processToastId = "storage-deal-toast";
      
      toast.info("Creating storage deal on Filecoin...", { 
        autoClose: false, 
        toastId: processToastId,
        position: "top-right",
        closeOnClick: false,
        isLoading: true,
      });
      
      await createStorageDealOnChain(
        contentCID, 
        storageProvider, 
        selectedPlan.days, 
        selectedPlan.price
      );
      
      // Status updates will be handled by the useEffect watching transaction confirmations
      
    } catch (error: any) {
      console.error("Error creating storage deal:", error);
      toast.error(`Failed to create storage deal: ${error.message}`);
    }
  };
  
  // Monitor core contract transaction status
  useEffect(() => {
    const processToastId = "file-process-toast";
    
    if (isPendingCore) {
      if (!toast.isActive(processToastId)) {
        toast.info("Submitting content registration to blockchain...", { 
          toastId: processToastId,
          autoClose: false,
          isLoading: true,
        });
      } else {
        toast.update(processToastId, {
          render: "Registering content on blockchain...", 
          type: "info",
          autoClose: false,
          isLoading: true,
        });
      }
    }
    
    if (isConfirmingCore) {
      if (toast.isActive(processToastId)) {
        toast.update(processToastId, {
          render: "Confirming content registration...", 
          type: "info",
          autoClose: false,
          isLoading: true,
        });
      }
    }
    
    if (isConfirmedCore) {
      if (toast.isActive(processToastId)) {
        toast.update(processToastId, {
          render: "Content successfully registered! Ready to create storage deal.", 
          type: "success",
          autoClose: 5000,
          isLoading: false,
        });
      }
      
      // Show storage deal confirmation UI
      setShowDealConfirmation(true);
    }
    
    if (errorCore) {
      if (toast.isActive(processToastId)) {
        toast.update(processToastId, {
          render: `Content registration failed: ${errorCore.message || "Unknown error"}`, 
          type: "error",
          autoClose: 5000,
          isLoading: false,
        });
      } else {
        toast.error(`Content registration failed: ${errorCore.message || "Unknown error"}`);
      }
      setUploadStep('error');
    }
  }, [isPendingCore, isConfirmingCore, isConfirmedCore, errorCore]);
  
  // Monitor storage deal transaction status
  useEffect(() => {
    const processToastId = "storage-deal-toast";
    
    if (isPendingStorage) {
      if (!toast.isActive(processToastId)) {
        toast.info("Submitting storage deal to blockchain...", { 
          toastId: processToastId,
          autoClose: false,
          isLoading: true,
        });
      } else {
        toast.update(processToastId, {
          render: "Creating storage deal on Filecoin...", 
          type: "info",
          autoClose: false,
          isLoading: true,
        });
      }
    }
    
    if (isConfirmingStorage) {
      if (toast.isActive(processToastId)) {
        toast.update(processToastId, {
          render: "Confirming storage deal on the Filecoin network...", 
          type: "info",
          autoClose: false,
          isLoading: true,
        });
      }
    }
    
    if (isConfirmedStorage) {
      if (toast.isActive(processToastId)) {
        toast.update(processToastId, {
          render: "Storage deal created successfully! Your file is now securely stored on Filecoin.", 
          type: "success",
          autoClose: 5000,
          isLoading: false,
        });
      }
      
      // Complete the process
      setUploadStep('complete');
      
      // Reset form after successful submission
      setFileName("");
      setTags("");
      setSelectedFile(null);
      setShowDealConfirmation(false);
      setContentCID(null);
    }
    
    if (errorStorage) {
      if (toast.isActive(processToastId)) {
        toast.update(processToastId, {
          render: `Storage deal failed: ${errorStorage.message || "Unknown error"}`, 
          type: "error",
          autoClose: 5000,
          isLoading: false,
        });
      } else {
        toast.error(`Storage deal failed: ${errorStorage.message || "Unknown error"}`);
      }
      setUploadStep('error');
    }
  }, [isPendingStorage, isConfirmingStorage, isConfirmedStorage, errorStorage]);
  
  // Get status message for UI display
  const getStatusMessage = () => {
    switch (uploadStep) {
      case 'uploading':
        return `Uploading file to Filecoin... ${uploadProgress.toFixed(1)}%`;
      case 'core-tx':
        if (isPendingCore) return "Submitting content registration...";
        if (isConfirmingCore) return "Confirming content registration...";
        return "Registering content on blockchain...";
      case 'storage-tx':
        if (isPendingStorage) return "Submitting storage deal...";
        if (isConfirmingStorage) return "Confirming storage deal...";
        return "Creating storage deal...";
      case 'complete':
        return "File uploaded and storage deal created successfully!";
      case 'error':
        return `Error: ${errorCore?.message || errorStorage?.message || "Upload failed"}`;
      default:
        return "";
    }
  };
  
  // Browse files button click handler
  const handleBrowseClick = () => {
    document.getElementById('file-upload')?.click();
  };
  
  return (
    <div className="bg-white min-h-screen">
      {/* Toast Container */}
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
          {/* Sidebar */}
          <Sidebar activePage="upload" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-8">
                <h1 className="text-xl font-medium">Welcome {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''} 👋</h1>
              </div>
              
              {/* Storage Deal Confirmation Dialog */}
              {showDealConfirmation && contentCID && (
                <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border-2 border-green-100">
                  <h2 className="text-lg font-semibold mb-4 text-green-800">Content Successfully Registered!</h2>
                  <p className="mb-4">Your file has been uploaded to IPFS and registered on the blockchain.</p>
                  <p className="mb-2 font-medium">CID: <span className="font-mono text-sm">{contentCID}</span></p>
                  
                  <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                    <h3 className="font-medium mb-2">Create Storage Deal</h3>
                    <p className="text-sm mb-4">To ensure your content stays available on Filecoin, create a storage deal:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Storage Provider</label>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={storageProvider}
                          onChange={(e) => setStorageProvider(e.target.value)}
                        >
                          {storageProviders.map(provider => (
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
                          value={selectedPlan ? storagePlans.findIndex(p => p.name === selectedPlan.name) : 0}
                          onChange={(e) => setSelectedPlan(storagePlans[parseInt(e.target.value)])}
                        >
                          {storagePlans.map((plan, index) => (
                            <option key={plan.name} value={index}>
                              {plan.name} - {plan.days} days ({plan.price} ETH)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded text-sm mb-4">
                      {selectedPlan?.description} - {selectedPlan?.dealParams.numOfCopies} copies on the Filecoin network.
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleContinueToStorageDeal}
                        disabled={isPendingStorage || isConfirmingStorage}
                        className={`py-2 px-6 rounded-md transition-colors ${
                          isPendingStorage || isConfirmingStorage
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {isPendingStorage || isConfirmingStorage 
                          ? 'Processing...' 
                          : `Create Storage Deal (${selectedPlan?.price} ETH)`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Upload Form - Only show if not in deal confirmation */}
              {!showDealConfirmation && (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
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
                        required
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
                  
                  {/* Storage Plan Selection */}
                  <div className="mb-8">
                    <h3 className="text-md font-medium mb-3">Select Storage Plan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {storagePlans.map((plan) => (
                        <div 
                          key={plan.name}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedPlan?.name === plan.name 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{plan.name}</h4>
                            <span className="text-sm bg-blue-100 px-2 py-1 rounded-full">
                              {plan.price} ETH
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{plan.description}</p>
                          <div className="flex justify-between text-sm">
                            <span>{plan.days} days</span>
                            <span>{plan.dealParams.numOfCopies} copies</span>
                          </div>
                        </div>
                      ))}
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
                    {selectedFile ? (
                      <div className="text-green-600 font-medium mb-2">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    ) : (
                      <p className="text-gray-700 mb-2">
                        Drag & drop files here or{" "}
                        <span 
                          className="text-amber-500 font-medium cursor-pointer" 
                          onClick={handleBrowseClick}
                        >
                          Browse Files
                        </span>
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">Accepts: pdf, docx, ppt, mp4, zip, etc.</p>
                    
                    <input 
                      type="file" 
                      className="hidden" 
                      id="file-upload" 
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* Filecoin Storage Info */}
                  <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-md flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      Your files will be stored on the Filecoin Calibration network via Lighthouse. This process happens in two steps:
                      <ol className="list-decimal ml-5 mt-2">
                        <li>First, we'll upload your file and register it on our smart contract</li>
                        <li>Then, you'll create a storage deal to ensure long-term availability</li>
                      </ol>
                    </div>
                  </div>
                  
                  {/* Error message */}
                  {uploadError && (
                    <div className="mt-4 text-red-500 text-sm">
                      {uploadError}
                    </div>
                  )}
                  
                  {/* Status message */}
                  {getStatusMessage() && (
                    <div className={`mt-4 text-sm ${
                      uploadStep === 'complete' ? 'text-green-500' : 
                      uploadStep === 'error' ? 'text-red-500' : 
                      'text-blue-500'
                    }`}>
                      {getStatusMessage()}
                    </div>
                  )}
                  
                  {/* Upload progress bar (only show during upload) */}
                  {uploadStep === 'uploading' && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="mt-6 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isUploading || isPendingCore || isConfirmingCore}
                      className={`py-2 px-6 rounded-md transition-colors ${
                        isUploading || isPendingCore || isConfirmingCore
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {isUploading ? 'Uploading to Filecoin...' : 
                       isPendingCore ? 'Registering Content...' : 
                       isConfirmingCore ? 'Confirming Registration...' : 
                       'Upload File'}
                    </button>
                  </div>
                </form>
              )}
              
              {/* If upload is complete, show success message with next steps */}
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
                    Your file has been successfully uploaded to Filecoin and registered on the blockchain.
                    You can now share it with your students or manage access permissions.
                  </p>
                  
                  <div className="mt-4 bg-white p-4 rounded-md border border-green-100">
                    <h4 className="font-medium text-gray-700 mb-2">File Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="font-medium text-green-600">Stored on Filecoin</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span className="text-gray-500">Access:</span>
                          <span className="font-medium">{accessType === 'public' ? 'Public' : 'Private (Students Only)'}</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span className="text-gray-500">Storage Plan:</span>
                          <span className="font-medium">{selectedPlan?.name || 'Standard'}</span>
                        </p>
                      </div>
                      <div>
                        <p className="flex justify-between">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{selectedPlan?.days || 180} days</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span className="text-gray-500">Copies:</span>
                          <span className="font-medium">{selectedPlan?.dealParams.numOfCopies || 2}</span>
                        </p>
                        <p className="flex justify-between mt-1">
                          <span className="text-gray-500">Expiry Date:</span>
                          <span className="font-medium">{new Date(Date.now() + (selectedPlan?.days || 180) * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-4 gap-3">
                    <button 
                      className="px-4 py-2 bg-white border border-green-500 text-green-600 rounded-md hover:bg-green-50"
                      onClick={() => window.location.href = '/dashboard/my-content'}
                    >
                      View My Content
                    </button>
                    <button 
                      className="px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50"
                      onClick={() => window.location.href = '/dashboard/manage-access'}
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