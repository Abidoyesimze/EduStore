import EduAccessControl from "./ABI/EduAccessControl.json";
import EduCore from "./ABI/EduCore.json";
import EduStore from "./ABI/EduStore.json";
import { getAddress } from "ethers";

export const EduAccessControlContract = {
    address: "0xb9BBced3781fB125544153593908CB62ee6E0f51",
    abi: EduAccessControl,
  };

  export const EduCoreContract = {
    address: "0x73f46Db18E5b171318a55508873BdD0691209864",
    abi: EduCore,
  };

    export const EduStoreContract = {
        address: getAddress("0x762032BFeaC41757F28A36C9841bFF7b9a22152d"),
        abi: EduStore,
    };