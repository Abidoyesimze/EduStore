// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEduStore {
    function isContentPublic(string memory _contentId) external view returns (bool);
    function isContentOwner(string memory _contentId, address _user) external view returns (bool);
}

contract EduAccessControl {
    // Simple permission struct
    struct Permission {
        address user;
        uint256 expiry;
    }

    // Events
    event AccessGranted(string contentId, address user, uint256 expiry);
    event AccessRevoked(string contentId, address user);

    // State variables
    IEduStore public eduStore;
    mapping(string => mapping(address => uint256)) public permissions; // contentId => user => expiry
    mapping(address => string[]) public userAccess;

    constructor(address _eduStoreAddress) {
        eduStore = IEduStore(_eduStoreAddress);
    }

    modifier onlyOwner(string memory _contentId) {
        require(
            eduStore.isContentOwner(_contentId, msg.sender), 
            "Not owner"
        );
        _;
    }

    function grantAccess(
        string memory _contentId,
        address _user,
        uint256 _days
    ) external onlyOwner(_contentId) {
        require(_user != address(0), "Invalid user");
        require(_days > 0, "Invalid duration");

        uint256 expiry = block.timestamp + (_days * 1 days);
        
        // If this is a new access grant, add to user's list
        if (permissions[_contentId][_user] == 0) {
            userAccess[_user].push(_contentId);
        }
        
        // Set permission
        permissions[_contentId][_user] = expiry;
        
        emit AccessGranted(_contentId, _user, expiry);
    }

    function revokeAccess(
        string memory _contentId, 
        address _user
    ) external onlyOwner(_contentId) {
        if (permissions[_contentId][_user] > 0) {
            // Remove permission
            permissions[_contentId][_user] = 0;
            
            // Remove from user's access list
            string[] storage userItems = userAccess[_user];
            for (uint i = 0; i < userItems.length; i++) {
                if (keccak256(bytes(userItems[i])) == keccak256(bytes(_contentId))) {
                    // Move last item to this position and pop
                    userItems[i] = userItems[userItems.length - 1];
                    userItems.pop();
                    break;
                }
            }
            
            emit AccessRevoked(_contentId, _user);
        }
    }

    function hasAccess(string memory _contentId, address _user) public view returns (bool) {
        return (
            eduStore.isContentPublic(_contentId) || 
            eduStore.isContentOwner(_contentId, _user) ||
            (permissions[_contentId][_user] > 0 && permissions[_contentId][_user] > block.timestamp)
        );
    }

    function getUserAccess(address _user) external view returns (string[] memory) {
        return userAccess[_user];
    }
}