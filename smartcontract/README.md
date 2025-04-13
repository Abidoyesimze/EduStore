EduStore: Decentralized Educational Storage Platform
EduStore is a decentralized application built on Filecoin that provides secure, accessible storage for educational content. The platform leverages IPFS for content-addressed storage and Filecoin for persistent, incentivized storage.
Contract Architecture
The system consists of three main contracts that work together to provide a complete educational content management solution:
1. EduStoreCore (0xf51F26Be5eDF0Fdc168FE9618F85670B84E0eEbD)
The central contract that handles content registration and metadata management.
Key Features:

Content registration with metadata (title, description, type)
Content ownership management
Content retrieval and viewing
Public/private content visibility settings

Main Functions:

storeContent(): Register new educational content
updateContent(): Modify content metadata
getMyContent(): Retrieve all content owned by a user
getContentDetails(): Get information about specific content

2. EduStorageManager (0xD625F0A89263D8C9cE35EBC733AB1908486F882f)
Manages storage deals with Filecoin storage providers.
Key Features:

Automated storage deal creation with Filecoin miners
Payment distribution between providers and platform
Storage deal extension functionality
Platform fee management

Main Functions:

storeContentWithDeal(): Create a storage deal for content
extendStorage(): Extend the duration of a storage deal
getStorageDealForContent(): Check active storage deals for content
updatePlatformFee(): Adjust the platform fee percentage (admin only)

3. EduAccessControl (0xee45F988e46aa569c1BB2F0a1f7b1A786075ec00)
Handles content access permissions and sharing.
Key Features:

Time-limited content sharing
Access control for private content
Access tracking for analytics
User-friendly permission management

Main Functions:

shareContent(): Grant content access to another user
stopSharing(): Revoke access permissions
accessContent(): Record content access (for analytics)
getAccessibleContent(): List all content a user can access
checkAccess(): Verify if a user has access to content

How It Works

Content Upload:

User uploads content to IPFS through the application
IPFS returns a unique Content ID (CID)
The CID is registered in EduStoreCore with metadata


Storage Deal Creation:

User selects storage duration and pays in FIL
EduStorageManager creates a storage deal with a Filecoin provider
Platform fee is sent to admin, remainder to the provider


Content Sharing:

Owner can share content with specific users
EduAccessControl manages permissions and access
Access can be time-limited and revoked at any time


Content Retrieval:

Users can access content they own or have permission for
Content is retrieved from IPFS using the CID
Access events are recorded for analytics



Contract Deployment
The contracts are deployed on the Filecoin Calibration Network at the following addresses:

EduStoreCore: 0xf51F26Be5eDF0Fdc168FE9618F85670B84E0eEbD
EduStorageManager: 0xD625F0A89263D8C9cE35EBC733AB1908486F882f
EduAccessControl: 0xee45F988e46aa569c1BB2F0a1f7b1A786075ec00

Usage Examples
Storing Content
typescript// Connect to the EduStoreCore contract
const coreContract = await ethers.getContractAt("EduStoreCore", "0xf51F26Be5eDF0Fdc168FE9618F85670B84E0eEbD");

// Store content (after uploading to IPFS)
await coreContract.storeContent(
  "QmZ9...", // IPFS Content ID
  "Introduction to Blockchain",
  "A comprehensive guide to blockchain technology",
  "document",
  true // isPublic
);
Creating a Storage Deal
typescript// Connect to the EduStorageManager contract
const storageContract = await ethers.getContractAt("EduStorageManager", "0xD625F0A89263D8C9cE35EBC733AB1908486F882f");

// Create a storage deal
await storageContract.storeContentWithDeal(
  "QmZ9...", // IPFS Content ID
  ["0x123..."], // Provider addresses
  30, // Storage duration in days
  { value: ethers.utils.parseEther("1.0") } // Payment in FIL
);
Sharing Content
typescript// Connect to the EduAccessControl contract
const accessContract = await ethers.getContractAt("EduAccessControl", "0xee45F988e46aa569c1BB2F0a1f7b1A786075ec00");

// Share content with another user
await accessContract.shareContent(
  "QmZ9...", // IPFS Content ID
  "0xabc...", // User address
  7 // Access duration in days
);
Development and Testing
Prerequisites



