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
    }

    event ContentStored(string contentId, address owner, string title);

    // Main storage
    mapping(string => Content) public contents;
    mapping(address => string[]) public userContents;
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function storeContent(
        string memory _contentId,
        string memory _title,
        bool _isPublic
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
            expiry: 0
        });

        contents[_contentId] = newContent;
        userContents[msg.sender].push(_contentId);

        emit ContentStored(_contentId, msg.sender, _title);
    }

    function getMyContent() external view returns (string[] memory) {
        return userContents[msg.sender];
    }

    function updateExpiry(string memory _contentId, uint256 _expiry) external {
        contents[_contentId].expiry = _expiry;
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
}