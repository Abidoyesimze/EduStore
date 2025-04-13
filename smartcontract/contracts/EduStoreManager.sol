// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./EduStore.sol";

/**
 * @title EduStorageManager
 * @dev Contract for managing storage deals for educational content
 */
contract EduStorageManager {
    // ============ Structs ============

    struct StorageDeal {
        uint256 dealId;          // Unique identifier for the storage deal
        string contentId;        // IPFS CID of the content being stored
        address provider;        // Address of the storage provider (Filecoin miner)
        uint256 endDate;         // When the deal ends
        uint256 price;           // Price for the storage deal in FIL tokens
        bool active;             // Whether the deal is currently active
    }

    // ============ Events ============

    event StorageDealCreated(
        uint256 dealId,
        string contentId,
        address provider,
        uint256 endDate
    );

    // ============ State Variables ============

    // Reference to the core contract
    EduStoreCore public coreContract;
    
    // Mapping from deal ID to storage deal details
    mapping(uint256 => StorageDeal) public storageDeals;
    
    // Counter for generating unique deal IDs
    uint256 private dealIdCounter;
    
    // Platform fee percentage (in basis points, e.g., 100 = 1%)
    uint256 public platformFee;
    
    // Address of the platform admin
    address public admin;

    // ============ Constructor ============

    constructor(address _coreContract, uint256 _platformFee) {
        coreContract = EduStoreCore(_coreContract);
        admin = msg.sender;
        platformFee = _platformFee;
        dealIdCounter = 1;
    }

    // ============ Modifiers ============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyContentOwner(string memory _contentId) {
        require(coreContract.isContentOwner(_contentId, msg.sender), "Only content owner can call this");
        _;
    }

    // ============ Storage Deal Functions ============

    /**
     * @dev Store content with automatic storage deal creation
     * @param _contentId IPFS CID of the content
     * @param _providers Addresses of recommended storage providers
     * @param _duration Duration of the storage in days
     */
    function storeContentWithDeal(
        string memory _contentId,
        address[] memory _providers,
        uint256 _duration
    ) external payable onlyContentOwner(_contentId) {
        require(_providers.length > 0, "Need at least one provider");
        require(_duration > 0, "Duration must be greater than zero");
        require(msg.value > 0, "Payment required for storage");

        // Simple provider selection - choose the first valid one
        address selectedProvider = _selectProvider(_providers);
        require(selectedProvider != address(0), "No valid provider found");

        uint256 dealId = dealIdCounter++;
        uint256 endDate = block.timestamp + (_duration * 1 days);

        StorageDeal memory newDeal = StorageDeal({
            dealId: dealId,
            contentId: _contentId,
            provider: selectedProvider,
            endDate: endDate,
            price: msg.value,
            active: true
        });

        storageDeals[dealId] = newDeal;
        
        // Update storage expiry in core contract
        coreContract.updateStorageExpiry(_contentId, endDate);

        // Calculate and transfer payment
        uint256 platformAmount = (msg.value * platformFee) / 10000;
        uint256 providerAmount = msg.value - platformAmount;

        // Transfer payment to provider
        payable(selectedProvider).transfer(providerAmount);
        
        // Transfer platform fee to admin
        payable(admin).transfer(platformAmount);

        emit StorageDealCreated(dealId, _contentId, selectedProvider, endDate);
    }

    /**
     * @dev Extend storage duration for content
     * @param _contentId IPFS CID of the content
     * @param _additionalDays Additional storage duration in days
     */
    function extendStorage(string memory _contentId, uint256 _additionalDays) external payable onlyContentOwner(_contentId) {
        require(_additionalDays > 0, "Additional days must be greater than zero");
        require(msg.value > 0, "Payment required for extension");

        // Find active deal for this content
        uint256 dealId = _findActiveDealForContent(_contentId);
        require(dealId > 0, "No active storage deal found");
        
        StorageDeal storage deal = storageDeals[dealId];
        uint256 newEndDate = deal.endDate + (_additionalDays * 1 days);
        deal.endDate = newEndDate;
        
        // Update storage expiry in core contract
        coreContract.updateStorageExpiry(_contentId, newEndDate);

        // Calculate and transfer payment
        uint256 platformAmount = (msg.value * platformFee) / 10000;
        uint256 providerAmount = msg.value - platformAmount;

        // Transfer payment to provider
        payable(deal.provider).transfer(providerAmount);
        
        // Transfer platform fee to admin
        payable(admin).transfer(platformAmount);
    }

    /**
     * @dev Update platform fee percentage
     * @param _newFee New fee percentage in basis points
     */
    function updatePlatformFee(uint256 _newFee) external onlyAdmin {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _newFee;
    }

    /**
     * @dev Transfer admin rights to a new address
     * @param _newAdmin Address of the new admin
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }

    /**
     * @dev Find active storage deal for content
     * @param _contentId IPFS CID of the content
     * @return dealId of the active deal (0 if none found)
     */
    function _findActiveDealForContent(string memory _contentId) internal view returns (uint256) {
        for (uint256 i = 1; i < dealIdCounter; i++) {
            StorageDeal memory deal = storageDeals[i];
            if (keccak256(bytes(deal.contentId)) == keccak256(bytes(_contentId)) && 
                deal.active && 
                deal.endDate > block.timestamp) {
                return i;
            }
        }
        return 0;
    }

    /**
     * @dev Select a provider from the given list
     * @param _providers List of provider addresses
     * @return The selected provider address
     */
    function _selectProvider(address[] memory _providers) internal pure returns (address) {
        for (uint256 i = 0; i < _providers.length; i++) {
            if (_providers[i] != address(0)) {
                return _providers[i];
            }
        }
        return address(0);
    }

    /**
     * @dev Check if storage deal is active
     * @param _dealId ID of the storage deal
     * @return bool indicating whether the deal is active
     */
    function isStorageDealActive(uint256 _dealId) external view returns (bool) {
        StorageDeal memory deal = storageDeals[_dealId];
        return deal.active && block.timestamp <= deal.endDate;
    }

    
    //  * @dev Get active storage deal for content
    //  * @param _contentId Content ID to check
    //  * @return Deal ID, provider address, end date, active status
     
    function getStorageDealForContent(string memory _contentId) external view returns (
        uint256 dealId,
        address provider,
        uint256 endDate,
        bool active
    ) {
        uint256 id = _findActiveDealForContent(_contentId);
        if (id == 0) {
            return (0, address(0), 0, false);
        }
        
        StorageDeal memory deal = storageDeals[id];
        return (deal.dealId, deal.provider, deal.endDate, deal.active);
    }
}