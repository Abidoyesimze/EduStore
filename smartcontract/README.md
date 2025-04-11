Content Management Functions
storeContent
solidityfunction storeContent(
    string memory _contentId,
    string memory _title,
    string memory _description,
    string memory _contentType,
    bool _isPublic
) external

Purpose: Registers educational content on the blockchain after it's been uploaded to IPFS
Parameters:

_contentId: The IPFS Content ID (CID) generated when the file is uploaded
_title: User-provided title for the content
_description: User-provided description
_contentType: Type of content (e.g., "video", "document", "presentation")
_isPublic: Whether anyone can access this content without explicit permission


How it works: Your frontend application would handle the actual file upload to IPFS, get the CID, then call this function to register ownership and metadata on the blockchain

updateContent
solidityfunction updateContent(
    string memory _contentId,
    string memory _title,
    string memory _description,
    bool _isPublic
) external

Purpose: Updates the metadata of previously stored content
Parameters: Similar to storeContent but for changing existing information
Restrictions: Only the content owner can update content (enforced by the onlyContentOwner modifier)

Storage Deal Functions
storeContentWithDeal
solidityfunction storeContentWithDeal(
    string memory _contentId,
    address[] memory _providers,
    uint256 _duration
) external payable

Purpose: Creates a storage deal with a Filecoin provider to ensure content persistence
Parameters:

_contentId: The IPFS CID of the content to store
_providers: List of Filecoin storage provider addresses (your frontend would supply these)
_duration: How many days to store the content


Payment: Requires FIL tokens (sent as value with the transaction) to pay providers
How it works: Selects a provider from the list, creates a deal, sends payment, and updates storage expiry

extendStorage
solidityfunction extendStorage(
    string memory _contentId,
    uint256 _additionalDays
) external payable

Purpose: Extends the duration of an existing storage deal
Parameters:

_contentId: The IPFS CID of the content
_additionalDays: How many more days to store the content


Payment: Requires additional FIL tokens for the extended period
How it works: Finds the active deal for this content, extends the end date, and distributes payment

Access Control Functions
shareContent
solidityfunction shareContent(
    string memory _contentId,
    address _user,
    uint256 _daysValid
) external

Purpose: Grants another user access to your content
Parameters:

_contentId: The IPFS CID of the content to share
_user: Blockchain address of the user to share with
_daysValid: How many days the access permission remains valid


How it works: Creates an access permission record with an expiry date and adds the content to the recipient's accessible content list

stopSharing
solidityfunction stopSharing(
    string memory _contentId,
    address _user
) external

Purpose: Revokes another user's access to your content
Parameters:

_contentId: The IPFS CID of the content
_user: Address of the user whose access is being revoked


How it works: Removes permission records and updates the user's accessible content list

accessContent
solidityfunction accessContent(
    string memory _contentId
) external

Purpose: Records when a user accesses content (for audit and analytics)
Parameters:

_contentId: The IPFS CID of the content being accessed


Restrictions: Only works if the user has valid access (enforced by the hasAccess modifier)
How it works: Emits an event that could be monitored by your application for analytics

User Content Management Functions
getMyContent
solidityfunction getMyContent() external view returns (string[] memory)

Purpose: Returns all content IDs owned by the calling user
Returns: Array of IPFS CIDs representing all content the user has uploaded
How it works: Simply returns the array from the userContent mapping for the caller's address

getAccessibleContent
solidityfunction getAccessibleContent() external view returns (string[] memory)

Purpose: Returns all content IDs the calling user has access to (shared by others)
Returns: Array of IPFS CIDs representing all shared content the user can access
How it works: Returns the array from the userAccessible mapping for the caller's address

getContentDetails
solidityfunction getContentDetails(
    string memory _contentId
) external view returns (...)

Purpose: Retrieves complete details about a specific piece of content
Parameters:

_contentId: The IPFS CID of the content


Returns: All metadata associated with the content (title, description, type, owner, etc.)
Restrictions: Only works if the user has access to the content
How it works: Retrieves the content record from storage and returns its fields

Admin Functions
updatePlatformFee
solidityfunction updatePlatformFee(uint256 _newFee) external

Purpose: Updates the platform fee percentage
Parameters:

_newFee: New fee percentage in basis points (e.g., 100 = 1%)


Restrictions: Only callable by the admin address
How it works: Updates the fee percentage used when calculating payment splits

transferAdmin
solidityfunction transferAdmin(address _newAdmin) external

Purpose: Transfers admin rights to a new address
Parameters:

_newAdmin: Address of the new admin


Restrictions: Only callable by the current admin
How it works: Updates the admin address in storage

Internal Helper Functions
_userHasAccess

Checks if a user has valid permission for a content item
Used by the hasAccess modifier to enforce access control

_removeExistingAccess

Removes an existing access permission from a content's permission list
Used by both shareContent (to replace existing permissions) and stopSharing

_findActiveDealForContent

Searches for an active storage deal for a specific content item
Used by extendStorage to identify which deal to extend

_selectProvider

Selects a valid provider from a list of provider addresses
Used by storeContentWithDeal to choose which provider to create a deal with