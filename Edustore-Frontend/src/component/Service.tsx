// src/services/contracts.ts
import { 
    useWriteContract, 
    useWaitForTransactionReceipt, 
    useReadContract 
  } from 'wagmi';
  import { EduCoreContract, EduStoreContract, EduAccessControlContract } from './index';
  
  /**
   * Service for interacting with the EduStore contracts
   */
  export const useEduStoreContracts = () => {
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
    
    /**
     * Store content in the EduStoreCore contract
     */
    const storeContent = async (contentId: string, title: string, isPublic: boolean) => {
      return writeToCore({
        address: EduCoreContract.address as `0x${string}`,
        functionName: 'storeContent',
        abi: EduCoreContract.abi,
        args: [contentId, title, isPublic]
      });
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
      return writeToStorage({
        address: EduStoreContract.address as `0x${string}`,
        functionName: 'createDeal',
        abi: EduStoreContract.abi,
        args: [contentId, provider, days],
        value: paymentAmount
      });
    };
    
    /**
     * Extend an existing storage deal
     */
    const extendStorageDeal = async (
      contentId: string,
      additionalDays: number,
      paymentAmount: bigint
    ) => {
      return writeToStorage({
        address: EduStoreContract.address as `0x${string}`,
        functionName: 'extendDeal',
        abi: EduStoreContract.abi,
        args: [contentId, additionalDays],
        value: paymentAmount
      });
    };
    
    /**
     * Get details about a storage deal for a content ID
     */
    const getDealInfo = (contentId: string) => {
      return useReadContract({
        address: EduStoreContract.address as `0x${string}`,
        functionName: 'getDeal',
        abi: EduStoreContract.abi,
        args: [contentId]
      });
    };
    
    /**
     * Grant access to content for a specific user
     */
    const grantAccess = async (contentId: string, user: string, days: number) => {
      return writeToAccess({
        address: EduAccessControlContract.address as `0x${string}`,
        functionName: 'grantAccess',
        abi: EduAccessControlContract.abi,
        args: [contentId, user, days]
      });
    };
    
    /**
     * Revoke access to content for a specific user
     */
    const revokeAccess = async (contentId: string, user: string) => {
      return writeToAccess({
        address: EduAccessControlContract.address as `0x${string}`,
        functionName: 'revokeAccess',
        abi: EduAccessControlContract.abi,
        args: [contentId, user]
      });
    };
    
    /**
     * Check if a user has access to specific content
     */
    const checkAccess = (contentId: string, user: string) => {
      return useReadContract({
        address: EduAccessControlContract.address as `0x${string}`,
        functionName: 'hasAccess',
        abi: EduAccessControlContract.abi,
        args: [contentId, user]
      });
    };
    
    /**
     * Get all content IDs owned by the current user
     */
    const getMyContent = (user: string) => {
      return useReadContract({
        address: EduCoreContract.address as `0x${string}`,
        functionName: 'getMyContent',
        abi: EduCoreContract.abi
      });
    };
    
    return {
      // Core contract
      storeContent,
      getMyContent,
      isPendingCore,
      isConfirmingCore,
      isConfirmedCore,
      errorCore,
      
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