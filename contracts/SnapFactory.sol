// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "./Utils/ReentrancyGuard.sol";
import "./SnapshotNFT.sol";
import "./AavePool.sol";
import "./Distributor.sol";
import "./SeedFactory.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title SnapFactory
 * @dev Factory contract for managing snapshot creation and AavePool integration
 * Handles all snapshot-related functionality, deposits, and yield distribution
 */
contract SnapFactory is ReentrancyGuard, Ownable {

    
    // Core contract addresses
    SnapshotNFT public snapshotContract;
    AavePool public pool;
    Distributor public distributor;
    address payable public seedFactory;

    // Configuration
    uint256 public lockPeriodSeconds;
    address public burnRecipient;
    mapping(uint256 => uint256) public seedSnapshotPrices;
    
    // Lock mechanism for snapshot creation
    bool public locked;
    mapping(address => uint256) public snapshotAllowance;
    


    // Admin fee distribution
    struct AdminFeeRecipient {
        address recipient;
        uint256 percentage; // in basis points (100 = 1%)
    }
    AdminFeeRecipient[] public adminFeeRecipients;

    event InterestClaimed(uint256 amount);
    event InterestDistributed(uint256 amount, address indexed distributor);
    event DistributorChanged(address indexed oldDistributor, address indexed newDistributor);
    event PaymentSent(address indexed recipient, uint256 amount);
    event SeedWithdrawn(uint256 indexed seedId, uint256 userAmount, uint256 taxAmount);
    event SeedProfitsClaimed(uint256 indexed seedId, uint256 profits);
    event LockPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event BurnRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event SnapshotContractUpdated(address indexed oldContract, address indexed newContract);
    event PoolUpdated(address indexed oldPool, address indexed newPool);
    event DepositFeesDistributed(uint256 totalAmount, address[] recipients, uint256[] amounts);
    event AdminFeeRecipientsUpdated(address[] recipients, uint256[] percentages);

   
    /**
     * @dev Constructor to initialize the snap factory
     * @param _owner Address of the contract owner
     * @param _seedFactory Address of the SeedFactory contract
     * @param _snapshotContract Address of the snapshot NFT contract
     * @param _pool Address of the AavePool contract
     * @param _distributor Address of the Distributor contract
     * @param _lockPeriodSeconds Lock period for seed withdrawals in seconds
     * @param _burnRecipient Address to receive early withdrawal penalties
     */
    constructor(
        address _owner,
        address _seedFactory,
        address _snapshotContract,
        address _pool,
        address _distributor,
        uint256 _lockPeriodSeconds,
        address _burnRecipient
    ) Ownable(_owner) {
        require(_owner != address(0), "SnapFactory: Invalid owner address");
        require(_seedFactory != address(0), "SnapFactory: Invalid seed factory address");
        require(_snapshotContract != address(0), "SnapFactory: Invalid snapshot contract address");
        require(_pool != address(0), "SnapFactory: Invalid pool address");
        require(_distributor != address(0), "SnapFactory: Invalid distributor address");
        require(_lockPeriodSeconds > 0, "SnapFactory: Lock period must be greater than 0");
        require(_burnRecipient != address(0), "SnapFactory: Invalid burn recipient");

        seedFactory = payable(_seedFactory);
        snapshotContract = SnapshotNFT(_snapshotContract);
        pool = AavePool(payable(_pool));
        distributor = Distributor(payable(_distributor));
        lockPeriodSeconds = _lockPeriodSeconds;
        burnRecipient = _burnRecipient;
        locked = false; // Start unlocked
    }


    modifier onlyOwnerOrSeedFactory() {
        require(msg.sender == owner() || msg.sender == seedFactory, "SnapFactory: Only owner or SeedFactory");
        _;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update the SeedFactory address (only owner or SeedFactory)
     * @param _newSeedFactory The new SeedFactory contract address
     */
    function setSeedFactory(address _newSeedFactory) external onlyOwner  {
        require(_newSeedFactory != address(0), "SnapFactory: Invalid art factory address");
        seedFactory = payable(_newSeedFactory);
    }

    /**
     * @dev Update the lock period for seed withdrawals (only owner or SeedFactory)
     * @param _newLockPeriodSeconds The new lock period in seconds
     */
    function setLockPeriodSeconds(uint256 _newLockPeriodSeconds) external onlyOwner {
        uint256 oldPeriod = lockPeriodSeconds;
        lockPeriodSeconds = _newLockPeriodSeconds;
        emit LockPeriodUpdated(oldPeriod, _newLockPeriodSeconds);
    }

    /**
     * @dev Set the distributor contract address (only owner or SeedFactory)
     * @param newDistributor The new distributor contract address
     */
    function setDistributor(address newDistributor) external onlyOwner  {
        require(newDistributor != address(0), "SnapFactory: Invalid distributor address");
        address oldDistributor = address(distributor);
        distributor = Distributor(payable(newDistributor));
        emit DistributorChanged(oldDistributor, newDistributor);
    }

    /**
     * @dev Set the burn recipient for early withdrawal penalties (only owner or SeedFactory)
     * @param newBurnRecipient Address to receive early withdrawal penalties
     */
    function setBurnRecipient(address newBurnRecipient) external onlyOwner  {
        require(newBurnRecipient != address(0), "SnapFactory: Invalid burn recipient");
        address oldRecipient = burnRecipient;
        burnRecipient = newBurnRecipient;
        emit BurnRecipientUpdated(oldRecipient, newBurnRecipient);
    }

    /**
     * @dev Set the locked state of the factory (only owner)
     * @param _locked True to lock the factory, false to unlock
     */
    function setLocked(bool _locked) external onlyOwner {
        locked = _locked;
    }

    /**
     * @dev Set snapshot allowance for specific address (only owner)
     * @param user Address to set allowance for
     * @param allowance Number of snapshots they can create when locked
     */
    function setSnapshotAllowance(address user, uint256 allowance) external onlyOwner {
        require(user != address(0), "SnapFactory: Invalid user address");
        snapshotAllowance[user] = allowance;
    }

    /**
     * @dev Set the SnapshotNFT contract address (only owner)
     * @param _snapshotContract Address of the new SnapshotNFT contract
     */
    function setSnapshotContract(address _snapshotContract) external onlyOwner {
        require(_snapshotContract != address(0), "SnapFactory: Invalid snapshot contract");
        SnapshotNFT oldContract = snapshotContract;
        snapshotContract = SnapshotNFT(_snapshotContract);
        emit SnapshotContractUpdated(address(oldContract), _snapshotContract);
    }

    /**
     * @dev Set the AavePool contract address (only owner)
     * @param _pool Address of the new AavePool contract
     */
    function setPool(address payable _pool) external onlyOwner {
        require(_pool != address(0), "SnapFactory: Invalid pool address");
        AavePool oldPool = pool;
        pool = AavePool(_pool);
        emit PoolUpdated(address(oldPool), _pool);
    }
 
    /**
     * @dev Set admin fee recipients and their percentages
     * @param _recipients Array of addresses to receive admin fees
     * @param _percentages Array of percentages in basis points (must sum to 10000)
     */
    function setAdminFeeRecipients(address[] calldata _recipients, uint256[] calldata _percentages) external onlyOwner {
        require(_recipients.length == _percentages.length, "SnapFactory: Recipients and percentages arrays must have same length");
        require(_recipients.length > 0, "SnapFactory: Must have at least one recipient");

        // Calculate total percentage to ensure it equals 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _percentages.length; i++) {
            require(_percentages[i] > 0, "SnapFactory: Percentage must be greater than 0");
            totalPercentage += _percentages[i];
        }
        require(totalPercentage == 10000, "SnapFactory: Total percentage must equal 100% (10000 basis points)");

        // Withdraw existing admin fees to current recipients before changing them
        uint256 balance = address(this).balance;
        if (balance > 0 && adminFeeRecipients.length > 0) {
            _withdrawAdminFeesInternal(balance);
        }
        delete adminFeeRecipients;

        // Add new recipients
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "SnapFactory: Invalid recipient address");

            adminFeeRecipients.push(AdminFeeRecipient({
                recipient: _recipients[i],
                percentage: _percentages[i]
            }));
        }

        emit AdminFeeRecipientsUpdated(_recipients, _percentages);
    }

    /**
     * @dev Set the snapshot price for a specific seed NFT (called by SeedFactory or owner)
     */
    function setSeedSnapshotPrice(uint256 seedId, uint256 _newPrice) external onlyOwnerOrSeedFactory {
        seedSnapshotPrices[seedId] = _newPrice;
    }

    /**
     * @dev Allow owner to withdraw accumulated deposit fees
     * @param amount Amount to withdraw (0 for full balance)
     */
    function withdrawAdminFees(uint256 amount) external onlyOwnerOrSeedFactory {
        uint256 balance = address(this).balance;
        if (balance == 0) {
            return;
        }

        // If amount is 0, withdraw the full balance
        if (amount == 0) {
            _withdrawAdminFeesInternal(balance);
            return;
        }

        require(amount <= balance, "SnapFactory: Insufficient balance");
        _withdrawAdminFeesInternal(amount);
    }

    // ============ SNAPSHOT CREATION ============
    /**
     * @dev Mint a snapshot NFT (public interface with money handling)
     * @param seedId The ID of the seed NFT
     * @param beneficiaryIndex The index of the beneficiary
     * @param processId The process ID
     * @param to The address to mint the snapshot to
     * @param feeRecipient The address to receive 10% fee (if address(0), fee goes to SnapFactory)
     * @return snapshotId The ID of the newly minted snapshot
     */
    function mintSnapshot(
        uint256 seedId,
        uint256 beneficiaryIndex,
        string calldata processId,
        address to,
        address feeRecipient
    ) external payable nonReentrant returns (uint256) {
        uint256 value = msg.value;
        
        // Check if factory is locked
        if (locked) {
            require(snapshotAllowance[msg.sender] > 0, "SnapFactory: Factory locked - only addresses with allowance allowed");
            snapshotAllowance[msg.sender]--;
        }
        
        // Validate inputs
        require(to != address(0), "SnapFactory: Invalid recipient");
        require(address(snapshotContract) != address(0), "SnapFactory: SnapshotNFT not set");
        require(address(distributor) != address(0), "SnapFactory: Distributor not set");
        
        // Validate seed exists and get required price
        uint256 requiredPrice = SeedFactory(seedFactory).seedSnapshotPrices(seedId);
        require(value == requiredPrice, "SnapFactory: Incorrect price");
        require(SeedFactory(seedFactory).validateSeedForSnapshot(seedId), "SnapFactory: Invalid seed");

        // Validate beneficiary
        uint256 beneficiaryCount = distributor.getBeneficiaryCount();
        require(beneficiaryIndex < beneficiaryCount, "SnapFactory: Invalid beneficiary");

        // Get beneficiary info for money distribution
        (address beneficiaryAddr, , string memory projectCode, , , , ) = distributor.getBeneficiary(beneficiaryIndex);

        // Mint the snapshot NFT (data only, no money handling)
        uint256 snapshotId = snapshotContract.mintSnapshot(seedId, beneficiaryIndex, processId, to, value, projectCode);

        if (value == 0) {
            return snapshotId;
        }

        // Calculate fee distribution: 50% beneficiary, 10% fee recipient/SnapFactory, 40% seed
        uint256 beneficiaryAmount = (value * 50) / 100; // 50% to beneficiary
        uint256 feeAmount = (value * 10) / 100; // 10% fee
        uint256 seedAmount = value - beneficiaryAmount - feeAmount; // Remaining 40% to seed

        // Ensure total adds up exactly by giving any remainder to beneficiary
        beneficiaryAmount = value - feeAmount - seedAmount;

        // Transfer 10% fee to fee recipient or SnapFactory
        address feeDestination = feeRecipient == address(0) ? address(this) : feeRecipient;
        (bool successFee, ) = feeDestination.call{value: feeAmount}("");
        require(successFee, "SnapFactory: Fee transfer failed");

        // Transfer beneficiary portion
        (bool successBeneficiary, ) = beneficiaryAddr.call{value: beneficiaryAmount}("");
        require(successBeneficiary, "SnapFactory: Beneficiary transfer failed");

        // Calculate dynamic seed percentage before sending funds to SeedFactory
        uint256 dynamicSeedPercentage = SeedFactory(seedFactory).getDynamicSeedPercentage(seedId);
        
        // Calculate the actual seed deposit amount (seedAmount * dynamicPercentage / 10000)
        uint256 actualSeedDeposit = (seedAmount * dynamicSeedPercentage) / 10000;
        
        // The difference (seedAmount - actualSeedDeposit) stays in SnapFactory as admin fees
        // No need to send fees back from SeedFactory since we never sent them there
        
        SeedFactory(seedFactory).depositForSeed{value: actualSeedDeposit}(seedId);
 
        return snapshotId;
    }

    /**
     * @dev Claim accumulated interest from Aave and optionally distribute immediately (operators and owner)
     * This allows operators to claim and optionally distribute yield generated from deposits
     * The interest is claimed from the pool and can be distributed to beneficiaries or held for later distribution
     * @param distributeImmediately If true, immediately distribute the claimed interest to beneficiaries
     */
    function claimPoolInterest(bool distributeImmediately) external {
        // Check if caller is owner or an operator in the distributor
        require(
            msg.sender == owner() || Distributor(payable(distributor)).isOperator(msg.sender),
            "SnapFactory: Only owner or distributor operator can claim interest"
        );

        uint256 claimedAmount = pool.checkAndClaimInterest(address(distributor));
        require(claimedAmount > 0, "SnapFactory: No interest to claim");
        emit InterestClaimed(claimedAmount);

        // Optionally distribute the claimed interest to beneficiaries
        if (distributeImmediately) {
            Distributor(payable(distributor)).distributeInterest();
        }
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get the AavePool address (used by Distributor contract)
     * @return The address of the AavePool contract
     */
    function getPool() external view returns (address) {
        return address(pool);
    }

    /**
     * @dev Get the dynamic seed percentage for a specific seed
     * @param seedId The seed ID to check
     * @return percentage The dynamic percentage in basis points (2000-4000)
     */
    function getDynamicSeedPercentage(uint256 seedId) external view returns (uint256 percentage) {
        return SeedFactory(seedFactory).getDynamicSeedPercentage(seedId);
    }

    /**
     * @dev Validate that a seed exists (for SnapshotNFT validation)
     * @param seedId The seed ID to validate
     * @return exists Whether the seed exists as a valid token
     */
    function validateSeedForSnapshot(uint256 seedId) external view returns (bool exists) {
        // Check if seed ID is within the valid range of minted tokens
        if (seedId == 0 || seedId > SeedFactory(seedFactory).seedContract().getTotalSeeds()) {
            return false;
        }
        return true;
    }

    /**
     * @dev Get the total number of admin fee recipients
     * @return Total count of recipients
     */
    function getAdminFeeRecipientCount() external view returns (uint256) {
        return adminFeeRecipients.length;
    }

    /**
     * @dev Get admin fee recipient information by index
     * @param _index Index of the recipient
     * @return recipient Address of the recipient
     * @return percentage Percentage in basis points
     */
    function getAdminFeeRecipient(uint256 _index) external view returns (address recipient, uint256 percentage) {
        require(_index < adminFeeRecipients.length, "SnapFactory: Invalid recipient index");

        AdminFeeRecipient memory recipientInfo = adminFeeRecipients[_index];
        return (recipientInfo.recipient, recipientInfo.percentage);
    }

    /**
     * @dev Get the unlock time when capital becomes withdrawable for a specific seed
     * @param seedId The seed ID
     * @return The timestamp when the capital becomes fully withdrawable (4 years after creation)
     */
    function getUnlockTime(uint256 seedId) external view returns (uint256) {
        require(seedId > 0 && seedId <= SeedFactory(seedFactory).seedContract().getTotalSeeds(), "SnapFactory: Invalid seed ID");
        (uint256 creationTime, ) = SeedFactory(seedFactory).seedContract().getSeedMetadata(seedId);
        return creationTime + lockPeriodSeconds; // Configurable unlock period
    }

    // ============ INTERNAL FUNCTIONS ============

    // REMOVED: _claimSeedProfitsInternal() - security risk
    // Seed holders should use SeedFactory.claimSeedProfits() directly

    /**
     * @dev Internal function to withdraw deposit fees to current recipients
     * @param amount Amount to withdraw
     */
    function _withdrawAdminFeesInternal(uint256 amount) internal {
        require(adminFeeRecipients.length > 0, "SnapFactory: No admin fee recipients configured");

        // Calculate total percentage to ensure it equals 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < adminFeeRecipients.length; i++) {
            totalPercentage += adminFeeRecipients[i].percentage;
        }
        require(totalPercentage == 10000, "SnapFactory: Total percentage must equal 100% (10000 basis points)");

        // Prepare arrays for event emission
        address[] memory recipients = new address[](adminFeeRecipients.length);
        uint256[] memory amounts = new uint256[](adminFeeRecipients.length);

        // Distribute fees based on individual percentages
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < adminFeeRecipients.length; i++) {
            amounts[i] = (amount * adminFeeRecipients[i].percentage) / 10000;
            recipients[i] = adminFeeRecipients[i].recipient;
            totalDistributed += amounts[i];
        }

        // Ensure the total distributed amount matches the requested withdraw amount
        require(totalDistributed == amount, "SnapFactory: Total distributed amount mismatch");

        // Transfer funds to recipients
        for (uint256 i = 0; i < adminFeeRecipients.length; i++) {
            (bool success, ) = payable(adminFeeRecipients[i].recipient).call{value: amounts[i]}("");
            require(success, "SnapFactory: ETH transfer to recipient failed");
        }

        emit DepositFeesDistributed(amount, recipients, amounts);
    }
    // ============ FALLBACK FUNCTIONS ============

    /**
     * @dev Get the snapshot price for a seed (called by SnapshotNFT)
     * @param seedId The seed ID
     * @return The snapshot price in wei
     */
    function getSeedSnapshotPrice(uint256 seedId) external view returns (uint256) {
        // Get the price from SeedFactory since that's where it's stored
        return SeedFactory(seedFactory).seedSnapshotPrices(seedId);
    }

    /**
     * @dev Forward deposit for seed to SeedFactory (called by SnapshotNFT)
     * @param seedId The seed ID to deposit for
     */
    function depositForSeed(uint256 seedId) external payable {
        require(msg.sender == address(snapshotContract), "SnapFactory: Only SnapshotNFT can call");
        SeedFactory(seedFactory).depositForSeed{value: msg.value}(seedId);
    }

    receive() external payable {
        // Allow receiving ETH for interest claims
    }
}
