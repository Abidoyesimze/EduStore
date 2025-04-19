const hre = require('hardhat');

async function main() {
  // Define contract address and ABI
  const contractAddress = '0x73f46Db18E5b171318a55508873BdD0691209864'; // Replace with EduCoreContract.address
  const abi = [
    // Minimal ABI for storeContent and getMyContent
    {
      "inputs": [
        {"internalType": "string", "name": "contentId", "type": "string"},
        {"internalType": "string", "name": "title", "type": "string"},
        {"internalType": "bool", "name": "isPublic", "type": "bool"}
      ],
      "name": "storeContent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyContent",
      "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Get signer (wallet)
  const [signer] = await hre.ethers.getSigners();
  console.log('Using wallet address:', signer.address);

  // Connect to contract
  const contract = new hre.ethers.Contract(contractAddress, abi, signer);

  // Step 1: Check existing content
  console.log('Fetching content from getMyContent...');
  try {
    const hashes = await contract.getMyContent();
    console.log('Stored CIDs:', hashes);

    // Check if the expected CID is present
    const expectedCID = 'QmRV2DWsaw3trQnkp48WKTEeCckjQQAMznYxvrvkFKA4Yk';
    if (hashes.includes(expectedCID)) {
      console.log(`Success: Found expected CID ${expectedCID}`);
    } else {
      console.log(`Warning: Expected CID ${expectedCID} not found in contract`);
    }

    if (hashes.length === 0) {
      console.log('No content found for this address');
    }
  } catch (error) {
    console.error('Error calling getMyContent:', error.message);
  }

  // Step 2: Optionally simulate storeContent (uncomment to test)
  /*
  console.log('Simulating storeContent...');
  try {
    const tx = await contract.storeContent(
      'QmRV2DWsaw3trQnkp48WKTEeCckjQQAMznYxvrvkFKA4Yk',
      'Test File',
      true
    );
    console.log('Transaction submitted:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    // Re-check content after storing
    const newHashes = await contract.getMyContent();
    console.log('Updated CIDs:', newHashes);
  } catch (error) {
    console.error('Error calling storeContent:', error.message);
  }
  */
}

// Run script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });