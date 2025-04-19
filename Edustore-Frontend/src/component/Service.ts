import { ethers } from 'ethers';
import { EduCoreContract, EduAccessControlContract } from './index';
import { useCallback } from 'react';

export const useEduStoreContracts = () => {
  const getContentDetails = useCallback(async (contentId: string) => {
    if (!window.ethereum) throw new Error('No Ethereum provider found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EduCoreContract.address, EduCoreContract.abi, signer);
    return await contract.getContentDetails(contentId);
  }, []);

  const checkAccess = useCallback(async (contentId: string, userAddress: string) => {
    if (!window.ethereum) throw new Error('No Ethereum provider found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EduAccessControlContract.address, EduAccessControlContract.abi, signer);
    return await contract.hasAccess(contentId, userAddress);
  }, []);

  const storeContent = useCallback(async (
    contentId: string,
    title: string,
    isPublic: boolean,
    description: string,
    tags: string[]
  ) => {
    if (!window.ethereum) throw new Error('No Ethereum provider found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EduCoreContract.address, EduCoreContract.abi, signer);
    
    try {
      const tx = await contract.storeContent(contentId, title, isPublic, description, tags);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error storing content:', error);
      throw error;
    }
  }, []);

  const getAllContentIds = useCallback(async () => {
    if (!window.ethereum) throw new Error('No Ethereum provider found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EduCoreContract.address, EduCoreContract.abi, signer);
    
    try {
      // Get total content count
      const contentCount = await contract.getContentCount();
      const contentIds = [];
      
      // Fetch each content ID
      for (let i = 0; i < contentCount; i++) {
        const contentId = await contract.getContentIdByIndex(i);
        contentIds.push(contentId);
      }
      
      return contentIds;
    } catch (error) {
      console.error('Error fetching content IDs:', error);
      return [];
    }
  }, []);

  const getPublicContent = useCallback(async () => {
    if (!window.ethereum) throw new Error('No Ethereum provider found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EduCoreContract.address, EduCoreContract.abi, signer);
    
    try {
      // Get public content IDs directly from the contract
      const publicContentIds = await contract.getPublicContent();
      const publicContent = [];
      
      // Get details for each public content
      for (const contentId of publicContentIds) {
        const details = await contract.getContentDetails(contentId);
        publicContent.push({
          id: contentId,
          ...details
        });
      }
      
      return publicContent;
    } catch (error) {
      console.error('Error fetching public content:', error);
      return [];
    }
  }, []);

  const viewContent = useCallback(async (contentId: string) => {
    if (!window.ethereum) throw new Error('No Ethereum provider found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EduCoreContract.address, EduCoreContract.abi, signer);
    
    try {
      // First check if content is public or user has access
      const isPublic = await contract.isContentPublic(contentId);
      const userAddress = await signer.getAddress();
      const hasAccess = await checkAccess(contentId, userAddress);
      
      if (isPublic || hasAccess) {
        // Record the view
        await contract.viewContent(contentId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error viewing content:', error);
      return false;
    }
  }, [checkAccess]);

  return { 
    getContentDetails, 
    checkAccess, 
    storeContent,
    getAllContentIds, 
    getPublicContent, 
    viewContent 
  };
}; 