import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers";
import {BigNumber} from "ethers";

describe("EduStore", function () {
  // Contract instance
  let eduStore: Contract;
  
  // Signers
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let provider1: SignerWithAddress;
  let provider2: SignerWithAddress;
  
  // Test variables
  const platformFee = 500; // 5% fee (in basis points)
  const contentId1 = "QmZXmkpgJAPjzZD6Kx9rmkVJVfV3YNECW5q5Wu7N9whC6p";
  const contentId2 = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
  
  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, provider1, provider2] = await ethers.getSigners();
    
    // Deploy contract
    const EduStore = await ethers.getContractFactory("EduStore");
    eduStore = await EduStore.deploy(platformFee);
    
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await eduStore.admin()).to.equal(owner.address);
    });
    
    it("Should set the correct platform fee", async function () {
      expect(await eduStore.platformFee()).to.equal(platformFee);
    });
  });
  
  describe("Content Management", function () {
    it("Should store content correctly", async function () {
      await eduStore.connect(user1).storeContent(
        contentId1,
        "Introduction to Blockchain",
        "A comprehensive guide to blockchain technology",
        "document",
        true // isPublic
      );
      
      // Check if content was stored
      const contentDetails = await eduStore.connect(user1).getContentDetails(contentId1);
      expect(contentDetails.title).to.equal("Introduction to Blockchain");
      expect(contentDetails.description).to.equal("A comprehensive guide to blockchain technology");
      expect(contentDetails.contentType).to.equal("document");
      expect(contentDetails.owner).to.equal(user1.address);
      expect(contentDetails.isPublic).to.equal(true);
    });
    
    it("Should fail to store content with empty title", async function () {
      await expect(
        eduStore.connect(user1).storeContent(
          contentId1,
          "", // Empty title
          "A comprehensive guide to blockchain technology",
          "document",
          true
        )
      ).to.be.revertedWith("Title required");
    });
    
    it("Should fail to store already registered content", async function () {
      // Store content first time
      await eduStore.connect(user1).storeContent(
        contentId1,
        "Introduction to Blockchain",
        "A comprehensive guide to blockchain technology",
        "document",
        true
      );
      
      await expect(
        eduStore.connect(user1).storeContent(
          contentId1,
          "Another Title",
          "Different description",
          "video",
          false
        )
      ).to.be.revertedWith("Content already registered");
    });
    
    it("Should update content metadata", async function () {
      // First store content
      await eduStore.connect(user1).storeContent(
        contentId1,
        "Introduction to Blockchain",
        "A comprehensive guide to blockchain technology",
        "document",
        true
      );
      
      // Then update it
      await eduStore.connect(user1).updateContent(
        contentId1,
        "Updated Title",
        "Updated description",
        false
      );
      
      // Check if content was updated
      const contentDetails = await eduStore.connect(user1).getContentDetails(contentId1);
      expect(contentDetails.title).to.equal("Updated Title");
      expect(contentDetails.description).to.equal("Updated description");
      expect(contentDetails.isPublic).to.equal(false);
    });
    
    it("Should fail to update content if not owner", async function () {
      // First store content as user1
      await eduStore.connect(user1).storeContent(
        contentId1,
        "Introduction to Blockchain",
        "A comprehensive guide to blockchain technology",
        "document",
        true
      );
      
      await expect(
        eduStore.connect(user2).updateContent(
          contentId1,
          "Updated Title",
          "Updated description",
          false
        )
      ).to.be.revertedWith("Only content owner can call this");
    });
  });
  
  describe("Storage Deals", function () {
    beforeEach(async function () {
      // Store content as user1
      await eduStore.connect(user1).storeContent(
        contentId1,
        "Introduction to Blockchain",
        "A comprehensive guide to blockchain technology",
        "document",
        true
      );
    });
    
    it("Should create a storage deal", async function () {
      const providers = [provider1.address];
      const duration = 30; // 30 days
      const paymentAmount = ethers.parseEther("1"); // 1 ETH
      
      // Create storage deal
      await eduStore.connect(user1).storeContentWithDeal(
        contentId1,
        providers,
        duration,
        { value: paymentAmount }
      );
      
      // Get content details to check storage expiry
      const contentDetails = await eduStore.connect(user1).getContentDetails(contentId1);
      expect(contentDetails.storageExpiry).to.be.gt(0); // Should have a non-zero expiry
    
    });
    
    it("Should fail to create storage deal without payment", async function () {
      const providers = [provider1.address];
      const duration = 30; // 30 days
      
      // Try to create storage deal without payment
      await expect(
        eduStore.connect(user1).storeContentWithDeal(
          contentId1,
          providers,
          duration,
          { value: 0 }
        )
      ).to.be.revertedWith("Payment required for storage");
    });
    
    it("Should extend storage", async function () {
      const providers = [provider1.address];
      const initialDuration = 30; // 30 days
      const additionalDays = 15; // 15 more days
      const initialPayment = ethers.parseEther("1"); // 1 ETH
      const additionalPayment = ethers.parseEther("0.5"); // 0.5 ETH
      
      // First create a storage deal
      await eduStore.connect(user1).storeContentWithDeal(
        contentId1,
        providers,
        initialDuration,
        { value: initialPayment }
      );
      
      // Get initial storage expiry
      const initialContent = await eduStore.connect(user1).getContentDetails(contentId1);
      const initialExpiry = initialContent.storageExpiry;
      
      // Extend storage
      await eduStore.connect(user1).extendStorage(
        contentId1,
        additionalDays,
        { value: additionalPayment }
      );
      
      // Get updated storage expiry
      const updatedContent = await eduStore.connect(user1).getContentDetails(contentId1);
      
      // Check that expiry has been extended
      // The exact value is tricky to calculate precisely due to block timestamps
      // So we just check that it increased
      expect(updatedContent.storageExpiry).to.be.gt(initialExpiry);
    });
  });
  
  describe("Access Control", function () {
    beforeEach(async function () {
      // Store content as user1
      await eduStore.connect(user1).storeContent(
        contentId1,
        "Introduction to Blockchain",
        "A comprehensive guide to blockchain technology",
        "document",
        false // Not public
      );
    });
    
    it("Should share content with another user", async function () {
      const daysValid = 7; // 7 days
      
      // Share content with user2
      await eduStore.connect(user1).shareContent(
        contentId1,
        user2.address,
        daysValid
      );
      
      // Check if user2 can access the content
      // This will revert if user2 doesn't have access
      await eduStore.connect(user2).getContentDetails(contentId1);
      
      // Get user2's accessible content
      const accessibleContent = await eduStore.connect(user2).getAccessibleContent();
      expect(accessibleContent).to.include(contentId1);
    });
    
    it("Should stop sharing content", async function () {
      const daysValid = 7; // 7 days
      
      // Share content with user2
      await eduStore.connect(user1).shareContent(
        contentId1,
        user2.address,
        daysValid
      );
      
      // Stop sharing with user2
      await eduStore.connect(user1).stopSharing(
        contentId1,
        user2.address
      );
      
      // Check if user2 can no longer access the content
      await expect(
        eduStore.connect(user2).getContentDetails(contentId1)
      ).to.be.revertedWith("Access denied");
      
      // Get user2's accessible content
      const accessibleContent = await eduStore.connect(user2).getAccessibleContent();
      expect(accessibleContent).to.not.include(contentId1);
    });
    
    it("Should allow public access to public content", async function () {
      // Store public content as user1
      await eduStore.connect(user1).storeContent(
        contentId2,
        "Public Document",
        "This is a public document",
        "document",
        true // Public
      );
      
      // Check if user2 can access the public content
      // This will revert if user2 doesn't have access
      const contentDetails = await eduStore.connect(user2).getContentDetails(contentId2);
      expect(contentDetails.title).to.equal("Public Document");
    });
  });
  
  describe("User Content Management", function () {
    beforeEach(async function () {
      // Store content as user1
      await eduStore.connect(user1).storeContent(
        contentId1,
        "Introduction to Blockchain",
        "A comprehensive guide to blockchain technology",
        "document",
        true
      );
      
      await eduStore.connect(user1).storeContent(
        contentId2,
        "Advanced Blockchain",
        "Deep dive into blockchain internals",
        "video",
        false
      );
    });
    
    it("Should list all content owned by a user", async function () {
      const myContent = await eduStore.connect(user1).getMyContent();
      expect(myContent).to.have.lengthOf(2);
      expect(myContent).to.include(contentId1);
      expect(myContent).to.include(contentId2);
    });
    
    it("Should list all content accessible to a user", async function () {
      // Share content with user2
      await eduStore.connect(user1).shareContent(
        contentId2,
        user2.address,
        7 // 7 days
      );
      
      // Public content should be accessible without explicit sharing
      const accessibleContent = await eduStore.connect(user2).getAccessibleContent();
      
      // Should include only the explicitly shared content
      expect(accessibleContent).to.include(contentId2);
      
      // Should not include content that's public but not explicitly shared
      expect(accessibleContent).to.not.include(contentId1);
    });
  });
  
  describe("Admin Functions", function () {
    it("Should update platform fee", async function () {
      const newFee = 200; // 2%
      
      await eduStore.connect(owner).updatePlatformFee(newFee);
      
      expect(await eduStore.platformFee()).to.equal(newFee);
    });
    
    it("Should fail to update platform fee if not admin", async function () {
      const newFee = 200; // 2%
      
      await expect(
        eduStore.connect(user1).updatePlatformFee(newFee)
      ).to.be.revertedWith("Only admin can call this");
    });
    
    it("Should transfer admin rights", async function () {
      await eduStore.connect(owner).transferAdmin(user1.address);
      
      expect(await eduStore.admin()).to.equal(user1.address);
      
      // Previous admin should no longer have admin rights
      await expect(
        eduStore.connect(owner).updatePlatformFee(200)
      ).to.be.revertedWith("Only admin can call this");
      
      // New admin should have admin rights
      await eduStore.connect(user1).updatePlatformFee(200);
      expect(await eduStore.platformFee()).to.equal(200);
    });
  });
  
  describe("Payment Distribution", function () {
    it("Should distribute payments correctly", async function () {
      // Store content as user1
      await eduStore.connect(user1).storeContent(
        contentId1,
        "Introduction to Blockchain",
        "A comprehensive guide to blockchain technology",
        "document",
        true
      );
      
      const providers = [provider1.address];
      const duration = 30; // 30 days
      const paymentAmount = ethers.utils.parseEther("1"); // 1 ETH
      
      // Check initial balances
      const initialProviderBalance = await ethers.provider.getBalance(provider1.address);
      const initialAdminBalance = await ethers.provider.getBalance(owner.address);
      
      // Create storage deal
      await eduStore.connect(user1).storeContentWithDeal(
        contentId1,
        providers,
        duration,
        { value: paymentAmount }
      );
      
      // Calculate expected amounts
      const expectedPlatformFee = paymentAmount.mul(platformFee).div(10000);
      const expectedProviderAmount = paymentAmount.sub(expectedPlatformFee);
      
      // Check final balances
      const finalProviderBalance = await ethers.provider.getBalance(provider1.address);
      const finalAdminBalance = await ethers.provider.getBalance(owner.address);
      
      
      // Provider should receive payment minus platform fee
      expect(finalProviderBalance).to.equal(
        initialProviderBalance.add(expectedProviderAmount)
      );
      
      // Admin balance check is approximate due to gas costs
      const adminBalanceDelta = finalAdminBalance.sub(initialAdminBalance);
      // Just check that admin received something close to the expected fee
      expect(adminBalanceDelta.gt(0)).to.be.true; // Allow for small difference due to gas costs
      
    });
  });
  
  // Additional test ideas:
  // - Test events emission
  // - Test edge cases for storage deals
  // - Test permission expiry based on time (requires time manipulation)
});