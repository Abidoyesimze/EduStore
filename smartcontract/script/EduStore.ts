import hre from "hardhat";

async function main() {
  // Get the contract factory
  const EduStore = await hre.ethers.getContractFactory("EduStoreCore");

  // Deploy the contract
  const edustore = await EduStore.deploy();

  // Wait for deployment to finish
  await edustore.waitForDeployment();
  const edustoreaddress = await edustore.getAddress();

  console.log("edustoreaddress deployed to:", edustoreaddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });