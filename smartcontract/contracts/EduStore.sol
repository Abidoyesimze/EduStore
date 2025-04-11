// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


contract UserFriendlyEducationalStorage {
    // Structs

    struct EducationalContent {
        string contentId;        // IPFS CID (Content Identifier)
        address owner;           // Address of the content owner
        uint256 uploadTimestamp; // When the content was uploaded
        string title;            // Title of the content
        string description;      // Description of the content
        string contentType;      // Type of educational content (video, pdf, etc.)
        bool isPublic;           // Whether the content is publicly accessible
        uint256 storageExpiry;   // When the storage deal expires
    }

    struct StorageDeal {
        uint256 dealId;          // Unique identifier for the storage deal
        string contentId;        // IPFS CID of the content being stored
        address provider;        // Address of the storage provider (Filecoin miner)
        uint256 endDate;         // When the deal ends
        uint256 price;           // Price for the storage deal in FIL tokens
        bool active;             // Whether the deal is currently active
    }

    struct AccessPermission {
        string contentId;        // IPFS CID of the content
        address user;            // Address of the user granted access
        uint256 expiryDate;      // When the access permission expires
    }

    // ============ Events ============

    event ContentStored(
        string contentId,
        address owner,
        string title,
        uint256 timestamp
    );

    event StorageDealCreated(
        uint256 dealId,
        string contentId,
        address provider,
        uint256 endDate
    );

    event AccessGranted(
        string contentId,
        address owner,
        address user,
        uint256 expiryDate
    );

    event ContentAccessed(
        string contentId,
        address user,
        uint256 timestamp
    );

    // ============ State Variables ============

    // Mapping from content ID to content details
    mapping(string => EducationalContent) public contentRegistry;
    
    // Mapping from deal ID to storage deal details
    mapping(uint256 => StorageDeal) public storageDeals;
    
    // Mapping from content ID to array of permitted users
    mapping(string => AccessPermission[]) public contentAccess;
    
    // Mapping from user address to array of content IDs they own
    mapping(address => string[]) public userContent;
    
    // Mapping from user address to array of content IDs they have access to
    mapping(address => string[]) public userAccessible;
    
    // Counter for generating unique deal IDs
    uint256 private dealIdCounter;
    
    // Platform fee percentage (in basis points, e.g., 100 = 1%)
    uint256 public platformFee;
    
    // Address of the platform admin
    address public admin;

    // ============ Constructor ============

    constructor(uint256 _platformFee) {
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
        require(contentRegistry[_contentId].owner == msg.sender, "Only content owner can call this");
        _;
    }

    modifier contentExists(string memory _contentId) {
        require(bytes(contentRegistry[_contentId].contentId).length > 0, "Content does not exist");
        _;
    }

    modifier hasAccess(string memory _contentId) {
        require(
            contentRegistry[_contentId].isPublic || 
            contentRegistry[_contentId].owner == msg.sender || 
            _userHasAccess(_contentId, msg.sender),
            "Access denied"
        );
        _;
    }

    // ============ Content Management Functions ============

    /**
     * @dev Store educational content after it has been uploaded to IPFS
     * @param _contentId IPFS CID of the already uploaded content
     * @param _title Title of the content
     * @param _description Description of the content
     * @param _contentType Type of educational content
     * @param _isPublic Whether the content is publicly accessible
     * @notice This function doesn't handle the actual file upload,
     * but registers content that was uploaded through the application
     */
    function storeContent(
        string memory _contentId,
        string memory _title,
        string memory _description,
        string memory _contentType,
        bool _isPublic
    ) external {
        require(bytes(_contentId).length > 0, "Content ID required");
        require(bytes(_title).length > 0, "Title required");
        require(contentRegistry[_contentId].owner == address(0), "Content already registered");

        EducationalContent memory newContent = EducationalContent({
            contentId: _contentId,
            owner: msg.sender,
            uploadTimestamp: block.timestamp,
            title: _title,
            description: _description,
            contentType: _contentType,
            isPublic: _isPublic,
            storageExpiry: 0 // Initially no storage deal
        });

        contentRegistry[_contentId] = newContent;
        userContent[msg.sender].push(_contentId);

        emit ContentStored(_contentId, msg.sender, _title, block.timestamp);
    }

    /**
     * @dev Update content metadata
     * @param _contentId IPFS CID of the content
     * @param _title New title for the content
     * @param _description New description for the content
     * @param _isPublic New public access setting
     */
    function updateContent(
        string memory _contentId,
        string memory _title,
        string memory _description,
        bool _isPublic
    ) external onlyContentOwner(_contentId) contentExists(_contentId) {
        EducationalContent storage content = contentRegistry[_contentId];
        
        if (bytes(_title).length > 0) {
            content.title = _title;
        }
        
        if (bytes(_description).length > 0) {
            content.description = _description;
        }
        
        content.isPublic = _isPublic;
    }

    // ============ Storage Management Functions ============

    /**
     * @dev Store content with automatic storage deal creation
     * @param _contentId IPFS CID of the content
     * @param _providers Addresses of recommended storage providers
     * @param _duration Duration of the storage in days
     * @notice This function automatically selects a provider and creates a storage deal
     */
    function storeContentWithDeal(
        string memory _contentId,
        address[] memory _providers,
        uint256 _duration
    ) external payable onlyContentOwner(_contentId) contentExists(_contentId) {
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
        contentRegistry[_contentId].storageExpiry = endDate;

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
    function extendStorage(string memory _contentId, uint256 _additionalDays) external payable onlyContentOwner(_contentId) contentExists(_contentId) {
        require(_additionalDays > 0, "Additional days must be greater than zero");
        require(msg.value > 0, "Payment required for extension");

        // Find active deal for this content
        uint256 dealId = _findActiveDealForContent(_contentId);
        require(dealId > 0, "No active storage deal found");
        
        StorageDeal storage deal = storageDeals[dealId];
        uint256 newEndDate = deal.endDate + (_additionalDays * 1 days);
        deal.endDate = newEndDate;
        contentRegistry[_contentId].storageExpiry = newEndDate;

        // Calculate and transfer payment
        uint256 platformAmount = (msg.value * platformFee) / 10000;
        uint256 providerAmount = msg.value - platformAmount;

        // Transfer payment to provider
        payable(deal.provider).transfer(providerAmount);
        
        // Transfer platform fee to admin
        payable(admin).transfer(platformAmount);
    }

    // ============ Access Control Functions ============

    /**
     * @dev Share content with another user
     * @param _contentId IPFS CID of the content
     * @param _user Address of the user to grant access
     * @param _daysValid Number of days the access will be valid
     */
    function shareContent(
        string memory _contentId,
        address _user,
        uint256 _daysValid
    ) external onlyContentOwner(_contentId) contentExists(_contentId) {
        require(_user != address(0), "Invalid user address");
        require(_daysValid > 0, "Duration must be greater than zero");

        uint256 expiryDate = block.timestamp + (_daysValid * 1 days);

        AccessPermission memory newAccess = AccessPermission({
            contentId: _contentId,
            user: _user,
            expiryDate: expiryDate
        });

        // Remove existing permission if any
        _removeExistingAccess(_contentId, _user);
        
        // Add new permission
        contentAccess[_contentId].push(newAccess);
        userAccessible[_user].push(_contentId);

        emit AccessGranted(_contentId, msg.sender, _user, expiryDate);
    }

    /**
     * @dev Stop sharing content with a user
     * @param _contentId IPFS CID of the content
     * @param _user Address of the user to revoke access from
     */
    function stopSharing(string memory _contentId, address _user) external onlyContentOwner(_contentId) contentExists(_contentId) {
        _removeExistingAccess(_contentId, _user);
        
        // Remove from user's accessible content list
        string[] storage userContents = userAccessible[_user];
        for (uint256 i = 0; i < userContents.length; i++) {
            if (keccak256(bytes(userContents[i])) == keccak256(bytes(_contentId))) {
                // Replace with the last element and remove the last
                userContents[i] = userContents[userContents.length - 1];
                userContents.pop();
                break;
            }
        }
    }

    /**
     * @dev Record content access (for audit purposes)
     * @param _contentId IPFS CID of the content being accessed
     */
    function accessContent(string memory _contentId) external hasAccess(_contentId) contentExists(_contentId) {
        emit ContentAccessed(_contentId, msg.sender, block.timestamp);
    }

    // ============ User Content Management ============

    /**
     * @dev Get all content owned by the caller
     * @return Array of content IDs owned by the caller
     */
    function getMyContent() external view returns (string[] memory) {
        return userContent[msg.sender];
    }

    /**
     * @dev Get all content the caller has access to
     * @return Array of content IDs accessible to the caller
     */
    function getAccessibleContent() external view returns (string[] memory) {
        return userAccessible[msg.sender];
    }

    
    //   Get details about specific content
    //  param _contentId IPFS CID of the content
    //  return Content details
     
    function getContentDetails(string memory _contentId) external view contentExists(_contentId) hasAccess(_contentId) returns (
        string memory title,
        string memory description,
        string memory contentType,
        address owner,
        uint256 uploadTimestamp,
        bool isPublic,
        uint256 storageExpiry
    ) {
        EducationalContent memory content = contentRegistry[_contentId];
        return (
            content.title,
            content.description,
            content.contentType,
            content.owner,
            content.uploadTimestamp,
            content.isPublic,
            content.storageExpiry
        );
    }

    //Admin Functions

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

    // Helper Functions

    /**
     * @dev Check if a user has valid permission for a content
     * @param _contentId IPFS CID of the content
     * @param _user Address of the user
     * @return bool indicating whether the user has valid permission
     */
    function _userHasAccess(string memory _contentId, address _user) internal view returns (bool) {
        AccessPermission[] memory permissions = contentAccess[_contentId];
        for (uint256 i = 0; i < permissions.length; i++) {
            if (permissions[i].user == _user && permissions[i].expiryDate > block.timestamp) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Remove existing access permission
     * @param _contentId IPFS CID of the content
     * @param _user Address of the user
     */
    function _removeExistingAccess(string memory _contentId, address _user) internal {
        AccessPermission[] storage permissions = contentAccess[_contentId];
        for (uint256 i = 0; i < permissions.length; i++) {
            if (permissions[i].user == _user) {
                permissions[i] = permissions[permissions.length - 1];
                permissions.pop();
                break;
            }
        }
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
}