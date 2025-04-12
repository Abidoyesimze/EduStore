// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./EduStore.sol";

/**
 * @title EduAccessControl
 * @dev Contract for managing access control to educational content
 */
contract EduAccessControl {
    // ============ Structs ============

    struct AccessPermission {
        string contentId;        // IPFS CID of the content
        address user;            // Address of the user granted access
        uint256 expiryDate;      // When the access permission expires
    }

    // ============ Events ============

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

    // Reference to the core contract
    EduStoreCore public coreContract;
    
    // Mapping from content ID to array of permitted users
    mapping(string => AccessPermission[]) public contentAccess;
    
    // Mapping from user address to array of content IDs they have access to
    mapping(address => string[]) public userAccessible;

    // ============ Constructor ============

    constructor(address _coreContract) {
        coreContract = EduStoreCore(_coreContract);
    }

    // ============ Modifiers ============

    modifier onlyContentOwner(string memory _contentId) {
        require(coreContract.isContentOwner(_contentId, msg.sender), "Only content owner can call this");
        _;
    }

    modifier hasAccess(string memory _contentId) {
        require(
            coreContract.isContentPublic(_contentId) || 
            coreContract.isContentOwner(_contentId, msg.sender) || 
            _userHasAccess(_contentId, msg.sender),
            "Access denied"
        );
        _;
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
    ) external onlyContentOwner(_contentId) {
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
    function stopSharing(string memory _contentId, address _user) external onlyContentOwner(_contentId) {
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
    function accessContent(string memory _contentId) external hasAccess(_contentId) {
        emit ContentAccessed(_contentId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get all content the caller has access to
     * @return Array of content IDs accessible to the caller
     */
    function getAccessibleContent() external view returns (string[] memory) {
        return userAccessible[msg.sender];
    }

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
     * @dev Check if a user has access to content
     * @param _contentId IPFS CID of the content
     * @param _user Address of the user
     * @return True if user has access
     */
    function checkAccess(string memory _contentId, address _user) external view returns (bool) {
        return (
            coreContract.isContentPublic(_contentId) || 
            coreContract.isContentOwner(_contentId, _user) || 
            _userHasAccess(_contentId, _user)
        );
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
}