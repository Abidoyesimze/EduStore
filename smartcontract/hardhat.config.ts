import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("Please set your PRIVATE_KEY in a .env file");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris",
      viaIR: false,
    },
  },
  defaultNetwork: "calibrationnet",
  networks: {
    localnet: {
      chainId: 31415926,
      url: "http://127.0.0.1:1234/rpc/v1",
      accounts: [PRIVATE_KEY],
    },
    calibrationnet: {
      chainId: 314159,
      url: "https://api.calibration.node.glif.io/rpc/v1",
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000,
      gas: 20000000,
      timeout: 120000,
    },
    filecoinmainnet: {
      chainId: 314,
      url: "https://api.node.glif.io",
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  sourcify: {
    enabled: true,
  },
  
  etherscan: {
    apiKey: {
      
      calibrationnet: "no-api-key-required",
      filecoinmainnet: "no-api-key-required"
    },
    customChains: [
      {
        network: "calibrationnet",
        chainId: 314159,
        urls: {
          apiURL: "https://calibration.filfox.info/api/v1/contract",
          browserURL: "https://calibration.filfox.info/en"
        }
      },
      {
        network: "filecoinmainnet",
        chainId: 314,
        urls: {
          apiURL: "https://filfox.info/api/v1/contract",
          browserURL: "https://filfox.info/en"
        }
      }
    ]
  },
};

export default config;