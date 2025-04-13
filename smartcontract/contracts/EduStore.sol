// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title EduStoreCore
 *  Core contract for the educational content registry
 */
contract EduStoreCore {
    // ============ Structs ============

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

    // ============ Events ============

    event ContentStored(
        string contentId,
        address owner,
        string title,
        uint256 timestamp
    );

    // ============ State Variables ============

    // Mapping from content ID to content details
    mapping(string => EducationalContent) public contentRegistry;
    
    // Mapping from user address to array of content IDs they own
    mapping(address => string[]) public userContent;
    
    // Address of the platform admin
    address public admin;

    // ============ Constructor ============

    constructor() {
        admin = msg.sender;
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

    // ============ Content Management Functions ============

    /**
     *  Store educational content after it has been uploaded to IPFS
     * @param _contentId IPFS CID of the already uploaded content
     * @param _title Title of the content
     * @param _description Description of the content
     * @param _contentType Type of educational content
     * @param _isPublic Whether the content is publicly accessible
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
     *  Update content metadata
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

    /**
     *  Get all content owned by the caller
     * @return Array of content IDs owned by the caller
     */
    function getMyContent() external view returns (string[] memory) {
        return userContent[msg.sender];
    }

    
    //  *  Get details about specific content
    //  * @param _contentId IPFS CID of the content
    //  * @return Content details
     
    function getContentDetails(string memory _contentId) external view contentExists(_contentId) returns (
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

    /**
     *  Check if the caller is the owner of a content
     * @param _contentId IPFS CID of the content
     * @return True if caller is owner
     */
    function isContentOwner(string memory _contentId, address _user) public view returns (bool) {
        return contentRegistry[_contentId].owner == _user;
    }

    /**
     *  Check if content is public
     * @param _contentId IPFS CID of the content
     * @return True if content is public
     */
    function isContentPublic(string memory _contentId) public view returns (bool) {
        return contentRegistry[_contentId].isPublic;
    }

    /**
     *  Update the storage expiry time for content (called by storage contract)
     * @param _contentId IPFS CID of the content
     * @param _expiryTime New expiry timestamp
     */
    function updateStorageExpiry(string memory _contentId, uint256 _expiryTime) external {
        // Logic to ensure only the storage contract can call this will be added
        contentRegistry[_contentId].storageExpiry = _expiryTime;
    }

    /**
     *  Transfer admin rights to a new address
     * @param _newAdmin Address of the new admin
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
}