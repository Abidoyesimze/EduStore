// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./EduStore.sol";
import "./EduStoreManager.sol";
import "./EduAccessControl.sol";

/**
 * @title EduStoreFactory
 *  Factory contract to deploy and connect the modular EduStore system
 */
contract EduStoreFactory {
    // Deployed contract addresses
    address public coreContract;
    address public storageContract;
    address public accessContract;
    
    // Platform admin
    address public admin;
    
    // Events
    event SystemDeployed(
        address core,
        address storage_,
        address access,
        address admin
    );
    
    /**
     *  Constructor initializes the factory
     */
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Deploy the complete EduStore system
     * @param _platformFee Platform fee for storage deals (in basis points)
     */
    function deployEduStoreSystem(uint256 _platformFee) external {
        require(msg.sender == admin, "Only admin can deploy");
        require(coreContract == address(0), "System already deployed");
        
        // Deploy the core contract
        EduStoreCore core = new EduStoreCore();
        coreContract = address(core);
        
        // Deploy the storage manager contract
        EduStorageManager storage_ = new EduStorageManager(coreContract, _platformFee);
        storageContract = address(storage_);
        
        // Deploy the access control contract
        EduAccessControl access = new EduAccessControl(coreContract);
        accessContract = address(access);
        
        emit SystemDeployed(coreContract, storageContract, accessContract, admin);
    }
    
    
    //  * @dev Get all contract addresses
    //  * @return Addresses of core, storage, and access contracts
     
    function getContractAddresses() external view returns (
        address core,
        address storage_,
        address access
    ) {
        return (coreContract, storageContract, accessContract);
    }
}