import hre from "hardhat";

async function main() {
  // Replace this with the actual deployed address of the EduStore contract
  const eduStoreAddress = "0x73f46Db18E5b171318a55508873BdD0691209864";

  // Get the contract factory
  const EduAccessControl = await hre.ethers.getContractFactory("EduAccessControl");

  // Deploy the contract with the constructor argument
  const eduaccesscontrol = await EduAccessControl.deploy(eduStoreAddress);

  // Wait for deployment to finish
  await eduaccesscontrol.waitForDeployment();
  const eduaccesscontroladdress = await eduaccesscontrol.getAddress();

  console.log("EduAccessControl deployed to:", eduaccesscontroladdress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });