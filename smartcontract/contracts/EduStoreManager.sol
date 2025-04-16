// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEduStore {
    function isContentOwner(string memory _contentId, address _user) external view returns (bool);
    function updateStorageExpiry(string memory _contentId, uint256 _expiryTime) external;
}

contract EduStorageManager {
    // Simple storage deal struct
    struct Deal {
        uint256 id;
        string contentId;
        address provider;
        uint256 endDate;
        bool active;
    }

    // Events
    event DealCreated(uint256 dealId, string contentId, address provider, uint256 endDate);
    event DealExtended(uint256 dealId, uint256 newEndDate);

    // State variables
    IEduStore public eduStore;
    mapping(uint256 => Deal) public deals;
    mapping(string => uint256) public contentToDeal;
    uint256 public dealCounter = 1;
    uint256 public fee;
    address public admin;

    constructor(address _eduStoreAddress, uint256 _fee) {
        eduStore = IEduStore(_eduStoreAddress);
        fee = _fee;
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyOwner(string memory _contentId) {
        require(eduStore.isContentOwner(_contentId, msg.sender), "Not owner");
        _;
    }

    function createDeal(
        string memory _contentId,
        address _provider,
        uint256 _days
    ) external payable onlyOwner(_contentId) {
        require(_provider != address(0), "Invalid provider");
        require(_days > 0, "Invalid duration");
        require(msg.value > 0, "Payment required");

        uint256 dealId = dealCounter++;
        uint256 endDate = block.timestamp + (_days * 1 days);

        // Store deal
        deals[dealId] = Deal({
            id: dealId,
            contentId: _contentId,
            provider: _provider,
            endDate: endDate,
            active: true
        });

        // Create reference from content to deal
        contentToDeal[_contentId] = dealId;

        // Update expiry in core contract
        eduStore.updateStorageExpiry(_contentId, endDate);

        // Split payment
        uint256 adminAmount = (msg.value * fee) / 10000;
        uint256 providerAmount = msg.value - adminAmount;

        payable(_provider).transfer(providerAmount);
        payable(admin).transfer(adminAmount);

        emit DealCreated(dealId, _contentId, _provider, endDate);
    }

    function extendDeal(
        string memory _contentId,
        uint256 _additionalDays
    ) external payable onlyOwner(_contentId) {
        require(_additionalDays > 0, "Invalid days");
        require(msg.value > 0, "Payment required");

        uint256 dealId = contentToDeal[_contentId];
        require(dealId > 0, "No active deal");
        
        Deal storage deal = deals[dealId];
        require(deal.active, "Deal not active");
        require(deal.endDate > block.timestamp, "Deal expired");

        uint256 newEndDate = deal.endDate + (_additionalDays * 1 days);
        deal.endDate = newEndDate;
        
        // Update expiry in core contract
        eduStore.updateStorageExpiry(_contentId, newEndDate);

        // Split payment
        uint256 adminAmount = (msg.value * fee) / 10000;
        uint256 providerAmount = msg.value - adminAmount;

        payable(deal.provider).transfer(providerAmount);
        payable(admin).transfer(adminAmount);

        emit DealExtended(dealId, newEndDate);
    }

    function getDeal(string memory _contentId) external view returns (
        uint256 dealId,
        address provider,
        uint256 endDate,
        bool active
    ) {
        uint256 id = contentToDeal[_contentId];
        if (id == 0) {
            return (0, address(0), 0, false);
        }
        
        Deal memory deal = deals[id];
        return (deal.id, deal.provider, deal.endDate, deal.active);
    }

    function updateFee(uint256 _newFee) external onlyAdmin {
        require(_newFee <= 1000, "Max 10%");
        fee = _newFee;
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
}