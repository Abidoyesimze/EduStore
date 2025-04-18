// src/services/contracts.ts (Corrected version)
import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  usePublicClient
} from 'wagmi';
import { EduCoreContract, EduStoreContract, EduAccessControlContract } from './index';
import { getAddress } from 'ethers';

/**
 * Service for interacting with the EduStore contracts
 */
export const useEduStoreContracts = () => {
  // Get public client for read operations
  const publicClient = usePublicClient();
  
  // Contract writing hooks
  const { 
    writeContract: writeToCore, 
    isPending: isPendingCore, 
    error: errorCore, 
    data: hashCore 
  } = useWriteContract();
  
  const { 
    writeContract: writeToStorage, 
    isPending: isPendingStorage, 
    error: errorStorage, 
    data: hashStorage 
  } = useWriteContract();
  
  const { 
    writeContract: writeToAccess, 
    isPending: isPendingAccess, 
    error: errorAccess, 
    data: hashAccess 
  } = useWriteContract();
  
  // Additional write contract hook for delete operations
  const {
    writeContract: writeToDelete,
    isPending: isPendingDelete,
    error: errorDelete,
    data: hashDelete
  } = useWriteContract();
  
  // Transaction status hooks
  const { 
    isLoading: isConfirmingCore, 
    isSuccess: isConfirmedCore 
  } = useWaitForTransactionReceipt({ hash: hashCore });
  
  const { 
    isLoading: isConfirmingStorage, 
    isSuccess: isConfirmedStorage 
  } = useWaitForTransactionReceipt({ hash: hashStorage });
  
  const { 
    isLoading: isConfirmingAccess, 
    isSuccess: isConfirmedAccess 
  } = useWaitForTransactionReceipt({ hash: hashAccess });
  
  const {
    isLoading: isConfirmingDelete,
    isSuccess: isConfirmedDelete
  } = useWaitForTransactionReceipt({ hash: hashDelete });
  
  // Ensure addresses are correctly checksummed
  const ensureValidAddress = (address: string): `0x${string}` => {
    try {
      // Normalize address to proper checksum format
      return getAddress(address) as `0x${string}`;
    } catch (error) {
      console.error(`Invalid address format: ${address}`, error);
      throw new Error(`Invalid address format: ${address}`);
    }
  };
  
  /**
   * Store content in the EduStoreCore contract
   */
  const storeContent = async (contentId: string, title: string, isPublic: boolean) => {
    try {
      const validAddress = ensureValidAddress(EduCoreContract.address);
      
      return writeToCore({
        address: validAddress,
        functionName: 'storeContent',
        abi: EduCoreContract.abi,
        args: [contentId, title, isPublic]
      });
    } catch (error) {
      console.error("Error in storeContent:", error);
      throw error;
    }
  };
  
  /**
   * Create a storage deal in the EduStorageManager contract
   */
  const createStorageDeal = async (
    contentId: string, 
    provider: string, 
    days: number, 
    paymentAmount: bigint
  ) => {
    try {
      // Ensure both contract and provider addresses are valid
      const validContractAddress = ensureValidAddress(EduStoreContract.address);
      const validProviderAddress = ensureValidAddress(provider);
      
      console.log("Creating storage deal with validated addresses:", {
        contract: validContractAddress,
        provider: validProviderAddress,
        days,
        value: paymentAmount.toString()
      });
      
      // Create a timeout promise that rejects after 30 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Transaction preparation timed out. Please try again."));
        }, 30000); // 30 seconds
      });
      
      // Race the contract write with the timeout
      const result = await Promise.race([
        writeToStorage({
          address: validContractAddress,
          functionName: 'createDeal',
          abi: EduStoreContract.abi,
          args: [contentId, validProviderAddress, days],
          value: paymentAmount
        }),
        timeoutPromise
      ]);
      
      // If we get here, the transaction was submitted successfully
      return result;
      
    } catch (error: any) {
      // Enhanced error logging and custom error messages
      console.error("Error in createStorageDeal:", error);
      
      // Create more specific error messages based on common error types
      if (error.message && error.message.includes("user rejected")) {
        throw new Error("Transaction was rejected in your wallet");
      } else if (error.message && error.message.includes("insufficient funds")) {
        throw new Error("Insufficient funds to complete the transaction");
      } else if (error.message && error.message.includes("timeout")) {
        throw new Error("Transaction timed out. Network may be congested. Please try again.");
      } else if (error.message && error.message.includes("nonce")) {
        throw new Error("Nonce error. You may have another pending transaction. Please check your wallet.");
      } else if (error.message && error.message.includes("gas")) {
        throw new Error("Gas estimation failed. The transaction may be invalid or the contract may have issues.");
      } else if (error.code === 4001) { // MetaMask reject error code
        throw new Error("Transaction rejected in your wallet");
      } else {
        throw new Error(`Failed to create storage deal: ${error.message || "Unknown error"}`);
      }
    }
  };
  
  /**
   * Extend an existing storage deal
   */
  const extendStorageDeal = async (
    contentId: string,
    additionalDays: number,
    paymentAmount: bigint
  ) => {
    try {
      const validAddress = ensureValidAddress(EduStoreContract.address);
      
      return writeToStorage({
        address: validAddress,
        functionName: 'extendDeal',
        abi: EduStoreContract.abi,
        args: [contentId, additionalDays],
        value: paymentAmount
      });
    } catch (error) {
      console.error("Error in extendStorageDeal:", error);
      throw error;
    }
  };
  
  
  const getMyContent = async (userAddress: string) => {
    try {
      if (!publicClient) {
        console.error("Public client not available");
        return [];
      }
      
      const validContractAddress = ensureValidAddress(EduCoreContract.address);
      const validUserAddress = ensureValidAddress(userAddress);
      
      console.log("Getting content for address:", validUserAddress);
      
      try {
        // Make the contract call
        const data = await publicClient.readContract({
          address: validContractAddress,
          abi: EduCoreContract.abi,
          functionName: 'getMyContent',
          args: [validUserAddress],
        });
        
        console.log("Raw contract data:", data);
        
        // Ensure we have an array of content IDs
        const contentIds = Array.isArray(data) ? data : [];
        
        // Debugging log
        console.log(`Found ${contentIds.length} files for ${validUserAddress}`);
        
        return contentIds;
      } catch (contractError) {
        console.error("Error reading from contract:", contractError);
        return [];
      }
    } catch (error) {
      console.error("Error in getMyContent:", error);
      return [];
    }
  };
  
 
  const getContentDetails = async (contentId: string) => {
    try {
      if (!publicClient) {
        console.error("Public client not available");
        return null;
      }
      
      const validAddress = ensureValidAddress(EduCoreContract.address);
      
      try {
        // Make direct contract call with CORRECT function name
        const data = await publicClient.readContract({
          address: validAddress,
          abi: EduCoreContract.abi,
          functionName: 'getContent', 
          args: [contentId],
        });
        
        console.log(`Content details for ${contentId}:`, data);
        
        return data || null;
      } catch (contractError) {
        console.error(`Error reading content details for ${contentId}:`, contractError);
        return null;
      }
    } catch (error) {
      console.error(`Error getting content details for ${contentId}:`, error);
      return null;
    }
  };
  
  /**
   * Get details about a storage deal for a content ID
   */
  const getDealInfo = async (contentId: string) => {
    try {
      if (!publicClient) {
        console.error("Public client not available");
        return null;
      }
      
      const validAddress = ensureValidAddress(EduStoreContract.address);
      
      try {
        // Make direct contract call
        const data = await publicClient.readContract({
          address: validAddress,
          abi: EduStoreContract.abi,
          functionName: 'getDeal',
          args: [contentId],
        });
        
        return data || null;
      } catch (contractError) {
        console.error(`Error reading deal info for ${contentId}:`, contractError);
        return null;
      }
    } catch (error) {
      console.error(`Error getting deal info for ${contentId}:`, error);
      return null;
    }
  };
  
  /**
   * Delete content
   */
  const deleteContent = async (contentId: string) => {
    try {
      const validAddress = ensureValidAddress(EduCoreContract.address);
      
      return writeToDelete({
        address: validAddress,
        functionName: 'deleteContent',
        abi: EduCoreContract.abi,
        args: [contentId]
      });
    } catch (error) {
      console.error(`Error deleting content ${contentId}:`, error);
      throw error;
    }
  };
  
  /**
   * Grant access to content for a specific user
   */
  const grantAccess = async (contentId: string, user: string, days: number) => {
    try {
      const validContractAddress = ensureValidAddress(EduAccessControlContract.address);
      const validUserAddress = ensureValidAddress(user);
      
      return writeToAccess({
        address: validContractAddress,
        functionName: 'grantAccess',
        abi: EduAccessControlContract.abi,
        args: [contentId, validUserAddress, days]
      });
    } catch (error) {
      console.error("Error in grantAccess:", error);
      throw error;
    }
  };
  
  /**
   * Revoke access to content for a specific user
   */
  const revokeAccess = async (contentId: string, user: string) => {
    try {
      const validContractAddress = ensureValidAddress(EduAccessControlContract.address);
      const validUserAddress = ensureValidAddress(user);
      
      return writeToAccess({
        address: validContractAddress,
        functionName: 'revokeAccess',
        abi: EduAccessControlContract.abi,
        args: [contentId, validUserAddress]
      });
    } catch (error) {
      console.error("Error in revokeAccess:", error);
      throw error;
    }
  };
  
  /**
   * Check if a user has access to specific content
   */
  const checkAccess = async (contentId: string, user: string) => {
    try {
      if (!publicClient) {
        console.error("Public client not available");
        return false;
      }
      
      const validContractAddress = ensureValidAddress(EduAccessControlContract.address);
      const validUserAddress = ensureValidAddress(user);
      
      try {
        // Make direct contract call
        const data = await publicClient.readContract({
          address: validContractAddress,
          abi: EduAccessControlContract.abi,
          functionName: 'hasAccess',
          args: [contentId, validUserAddress],
        });
        
        return data || false;
      } catch (contractError) {
        console.error("Error checking access from contract:", contractError);
        return false;
      }
    } catch (error) {
      console.error("Error in checkAccess:", error);
      return false;
    }
  };
  
  return {
    // Core contract
    storeContent,
    getMyContent,
    getContentDetails,
    deleteContent,
    isPendingCore,
    isConfirmingCore,
    isConfirmedCore,
    errorCore,
    isPendingDelete,
    isConfirmingDelete,
    isConfirmedDelete,
    errorDelete,
    
    // Storage manager contract
    createStorageDeal,
    extendStorageDeal,
    getDealInfo,
    isPendingStorage,
    isConfirmingStorage,
    isConfirmedStorage,
    errorStorage,
    
    // Access control contract
    grantAccess,
    revokeAccess,
    checkAccess,
    isPendingAccess,
    isConfirmingAccess,
    isConfirmedAccess,
    errorAccess
  };
};