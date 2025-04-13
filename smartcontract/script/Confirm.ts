// script/check-factory.ts
import { ethers } from "hardhat";

async function main() {
  // Address of the already deployed factory
  const factoryAddress = "0x1731ca8b16aaFB4e35612CC413E83Fe5A74F660B";
  
  console.log("Connecting to EduStoreFactory at:", factoryAddress);
  
  // Get the factory contract interface
  const EduStoreFactory = await ethers.getContractFactory("EduStoreFactory");
  const factory = EduStoreFactory.attach(factoryAddress);
  
  // Check if system has been deployed by checking individual address properties
  console.log("Checking deployment status...");
  
  try {
    const coreAddress = await factory.coreContract();
    console.log(`Core Contract: ${coreAddress}`);
    
    const storageAddress = await factory.storageContract();
    console.log(`Storage Contract: ${storageAddress}`);
    
    const accessAddress = await factory.accessContract();
    console.log(`Access Contract: ${accessAddress}`);
    
    // If we get here, contracts are deployed
    if (coreAddress !== ethers.constants.AddressZero) {
      console.log("System is already deployed!");
    } else {
      console.log("System deployment hasn't completed. Let's deploy it now.");
      
      // Try to deploy the system
      const platformFee = 500; // 5%
      
      console.log("Deploying complete EduStore system...");
      const deployTx = await factory.deployEduStoreSystem(platformFee, {
        gasLimit: 30000000, // Maximum gas limit allowed
      });
      
      console.log("Transaction sent, waiting for confirmation...");
      const receipt = await deployTx.wait();
      console.log("System deployment transaction confirmed:", receipt.transactionHash);
    }
  } catch (error) {
    console.error("Error checking deployment status:", error);
    
    // If there was an error, let's try deploying the contracts individually
    console.log("\nFalling back to individual contract deployment...");
    await deployIndividualContracts();
  }
}

async function deployIndividualContracts() {
  // Deploy EduStoreCore first
  console.log("Deploying EduStoreCore...");
  const EduStoreCore = await ethers.getContractFactory("EduStoreCore");
  const core = await EduStoreCore.deploy({
    gasLimit: 30000000,
  });
  const coreAddress = await core.getAddress();
  console.log(`EduStoreCore deployed to: ${coreAddress}`);

  // Deploy EduStorageManager
  console.log("Deploying EduStorageManager...");
  const platformFee = 500; // 5%
  const EduStorageManager = await ethers.getContractFactory("EduStorageManager");
  const storage = await EduStorageManager.deploy(coreAddress, platformFee, {
    gasLimit: 30000000,
  });
  const storageAddress = await storage.getAddress();
  console.log(`EduStorageManager deployed to: ${storageAddress}`);

  // Deploy EduAccessControl
  console.log("Deploying EduAccessControl...");
  const EduAccessControl = await ethers.getContractFactory("EduAccessControl");
  const access = await EduAccessControl.deploy(coreAddress, {
    gasLimit: 30000000,
  });
  const accessAddress = await access.getAddress();
  console.log(`EduAccessControl deployed to: ${accessAddress}`);

  console.log("\nDeployment Summary:");
  console.log(`Core Contract: ${coreAddress}`);
  console.log(`Storage Contract: ${storageAddress}`);
  console.log(`Access Contract: ${accessAddress}`);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });