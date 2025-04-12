import { ethers } from "hardhat";


async function main() {
  // Default platform fee is 500 basis points (5%)
  const platformFee = 500;

  console.log("Deploying EduStore contract with the following parameters:");
  console.log(`Platform Fee: ${platformFee} basis points (${platformFee / 100}%)`);

  // Deploy the contract
  const EduStore = await ethers.getContractFactory("EduStore");
  const eduStore = await EduStore.deploy(platformFee, {
    gasLimit: 10000000, // Try with a lower limit
  });

  await eduStore.deployed();

  console.log(`EduStore deployed to: ${eduStore.address}`);

  

  console.log("Deployment completed!");
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });