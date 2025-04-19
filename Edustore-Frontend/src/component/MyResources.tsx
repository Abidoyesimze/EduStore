// /src/hooks/useEduStore.js

import { useContractRead, useContractWrite, useContract } from 'wagmi';
import  contractABI  from './ABI/EduCore.json';

export const useEduStore = () => {
  return {
    contractConfig: {
      address: "0x73f46Db18E5b171318a55508873BdD0691209864",
      abi: contractABI,
    },
  };
};
