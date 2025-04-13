// deploy-edustore-factory.ts
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying EduStore Factory...");

  // Deploy the factory contract with increased gas limit
  const EduStoreFactory = await ethers.getContractFactory("EduStoreFactory");
  const factory = await EduStoreFactory.deploy({
    gasLimit: 28000000, // Increased based on error message
  });

  // Wait for deployment to complete
  const factoryAddress = await factory.getAddress();
  console.log(`EduStoreFactory deployed to: ${factoryAddress}`);

  // Deploy the complete system
  console.log("Deploying complete EduStore system...");
  
  // Platform fee is 500 basis points (5%)
  const platformFee = 500;
  
  const deployTx = await factory.deployEduStoreSystem(platformFee, {
    gasLimit: 30000000, // Maximum gas limit allowed
  });
  
  // Wait for the deployment transaction to be confirmed
  await deployTx.wait();
  
  // Get the deployed contract addresses
  const addresses = await factory.getContractAddresses();
  
  console.log("EduStore System successfully deployed!");
  console.log(`Core Contract: ${addresses[0]}`);
  console.log(`Storage Contract: ${addresses[1]}`);
  console.log(`Access Contract: ${addresses[2]}`);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });