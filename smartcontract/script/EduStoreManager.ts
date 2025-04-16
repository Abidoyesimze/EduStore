import hre from "hardhat";

async function main() {
  // Replace with the actual deployed address of the EduStore contract
  const eduStoreAddress = "0x73f46Db18E5b171318a55508873BdD0691209864";

  // Define the fee as 10% (assuming it's expressed as a whole number percentage)
  const feePercentage = 10;

  // Get the contract factory (double-check the contract name is correct)
  const EduStorageManager = await hre.ethers.getContractFactory("EduStorageManager");

  // Deploy the contract with constructor arguments
  const eduaccesscontrol = await EduStorageManager.deploy(eduStoreAddress, feePercentage);

  // Wait for deployment to finish
  await eduaccesscontrol.waitForDeployment();
  const eduaccesscontroladdress = await eduaccesscontrol.getAddress();

  console.log("EduStorageManager deployed to:", eduaccesscontroladdress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });