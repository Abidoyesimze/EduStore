// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EduStoreCore {
    struct Content {
        string contentId;
        address owner;
        uint256 timestamp;
        string title;
        bool isPublic;
        uint256 expiry;
        string description;
        string[] tags;
        uint256 viewCount;
    }

    event ContentStored(string contentId, address owner, string title);
    event ContentViewed(string contentId, address viewer);
    event ContentTagged(string contentId, string tag);
    event ContentDescriptionUpdated(string contentId, string description);

    // Main storage
    mapping(string => Content) public contents;
    mapping(address => string[]) public userContents;
    mapping(address => string[]) public userViewedContents;
    mapping(string => address[]) public contentViewers;
    string[] public allContentIds;
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier contentExists(string memory _contentId) {
        require(contents[_contentId].owner != address(0), "Content does not exist");
        _;
    }

    function storeContent(
        string memory _contentId,
        string memory _title,
        bool _isPublic,
        string memory _description,
        string[] memory _tags
    ) external {
        require(bytes(_contentId).length > 0, "Invalid ID");
        require(bytes(_title).length > 0, "Invalid title");
        require(contents[_contentId].owner == address(0), "Already exists");

        Content memory newContent = Content({
            contentId: _contentId,
            owner: msg.sender,
            timestamp: block.timestamp,
            title: _title,
            isPublic: _isPublic,
            expiry: 0,
            description: _description,
            tags: _tags,
            viewCount: 0
        });

        contents[_contentId] = newContent;
        userContents[msg.sender].push(_contentId);
        allContentIds.push(_contentId);

        emit ContentStored(_contentId, msg.sender, _title);
    }

    function getMyContent() external view returns (string[] memory) {
        return userContents[msg.sender];
    }

    function getPublicContent() external view returns (string[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < userContents[msg.sender].length; i++) {
            if (contents[userContents[msg.sender][i]].isPublic) {
                count++;
            }
        }

        string[] memory publicContent = new string[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < userContents[msg.sender].length; i++) {
            if (contents[userContents[msg.sender][i]].isPublic) {
                publicContent[index] = userContents[msg.sender][i];
                index++;
            }
        }
        return publicContent;
    }

    function getContentDetails(string memory _contentId) 
        external 
        view 
        contentExists(_contentId) 
        returns (
            string memory title,
            address owner,
            bool isPublic,
            string memory description,
            string[] memory tags,
            uint256 viewCount,
            uint256 timestamp
        ) 
    {
        Content memory content = contents[_contentId];
        return (
            content.title,
            content.owner,
            content.isPublic,
            content.description,
            content.tags,
            content.viewCount,
            content.timestamp
        );
    }

    function viewContent(string memory _contentId) 
        external 
        contentExists(_contentId) 
    {
        Content storage content = contents[_contentId];
        require(content.isPublic || msg.sender == content.owner, "Content not accessible");
        
        // Update view count
        content.viewCount++;
        
        // Track viewer
        if (!hasViewed(msg.sender, _contentId)) {
            userViewedContents[msg.sender].push(_contentId);
            contentViewers[_contentId].push(msg.sender);
        }
        
        emit ContentViewed(_contentId, msg.sender);
    }

    function hasViewed(address _user, string memory _contentId) 
        public 
        view 
        returns (bool) 
    {
        for (uint256 i = 0; i < contentViewers[_contentId].length; i++) {
            if (contentViewers[_contentId][i] == _user) {
                return true;
            }
        }
        return false;
    }

    function updateContentDescription(
        string memory _contentId, 
        string memory _description
    ) 
        external 
        contentExists(_contentId) 
    {
        require(msg.sender == contents[_contentId].owner, "Not content owner");
        contents[_contentId].description = _description;
        emit ContentDescriptionUpdated(_contentId, _description);
    }

    function addTag(string memory _contentId, string memory _tag) 
        external 
        contentExists(_contentId) 
    {
        require(msg.sender == contents[_contentId].owner, "Not content owner");
        contents[_contentId].tags.push(_tag);
        emit ContentTagged(_contentId, _tag);
    }

    function updateExpiry(string memory _contentId, uint256 _expiry) 
        external 
        contentExists(_contentId) 
    {
        require(msg.sender == contents[_contentId].owner, "Not content owner");
        contents[_contentId].expiry = _expiry;
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }

    function getAllContentIds() external view returns (string[] memory) {
        return allContentIds;
    }
}