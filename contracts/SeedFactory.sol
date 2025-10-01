// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "./Utils/ReentrancyGuard.sol";
import "./SeedNFT.sol";
import "./SnapshotNFT.sol";
import "./AavePool.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title SeedFactory
 * @dev Factory contract for managing the art system with Aave integration
 * Creates seed tokens and manages the overall system with yield generation
 */
contract SeedFactory is ReentrancyGuard, Ownable {
    
    // Configurable seed creation price 
    uint256 public seedPrice;
    // Configurable seed creation fee percentage (in basis points, e.g., 500 = 5%)
    uint256 public seedFee;

    // Burn recipient for early withdrawal penalties
    address public burnRecipient;
    // Fee recipient for seed creation fees
    address public feeRecipient;
    // Configurable lock period for seed withdrawals
    uint256 public lockPeriodSeconds;
    
    // Core contract addresses
    SeedNFT public seedContract;
    SnapshotNFT public snapshotContract;
    AavePool public pool;
    address public snapFactory;
    
 
    // Mapping from seeder address to their remaining mint allowance
    mapping(address => uint256) public seederAllowance;
    // When true, only addresses with seeder allowance > 0 can call createSeed
    bool public locked;
    
    //  Withdrawal tracking
    mapping(uint256 => bool) public seedWithdrawn;
    mapping(uint256 => uint256) public seedDepositAmount;
    // Total seed value tracking (original deposit + accumulated profits)
    mapping(uint256 => uint256) private _seedTotalValue;
    
    // Seed cap to prevent unbounded loops
    uint256 public maxSeeds;
    
    // Track the highest seed deposit amount
    uint256 public currentMaxSeedDeposit;

    // Individual snapshot prices per seed NFT
    mapping(uint256 => uint256) public seedSnapshotPrices;
    
    // Events
    event SeedCreated(uint256 indexed seedId, address indexed creator);
    event SystemInitialized(address seedContract, address snapshotContract, address pool, address distributor);
    event InterestClaimed(uint256 amount);
    event InterestDistributed(uint256 amount, address indexed distributor);
    event DistributorChanged(address indexed oldDistributor, address indexed newDistributor);
    event DepositSplit(uint256 indexed seedId, uint256 totalAmount, uint256 seedAmount, uint256 adminAmount);
    event DepositFeesDistributed(uint256 totalAmount, address[] recipients, uint256[] amounts);

    event SystemPaused(bool paused);
    event SeedPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event SeedFeeUpdated(uint256 oldFee, uint256 newFee);
    event LockPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event SeederAmountUpdated(address indexed seeder, uint256 amount);
    event LockedUpdated(bool locked);
    event MaxSeedsUpdated(uint256 oldMaxSeeds, uint256 newMaxSeeds);
    event SeedWithdrawn(uint256 indexed seedId, uint256 userAmount, uint256 taxAmount);
    event PartialSeedWithdrawal(uint256 indexed seedId, uint256 requestedAmount, uint256 actualAmount);
    event MaxSeedDepositUpdated(uint256 indexed seedId, uint256 newMaxDeposit);
    event BurnRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event FeeCollected(address indexed recipient, uint256 amount);
    event PaymentSent(address indexed recipient, uint256 amount);
    event SeedProfitsClaimed(uint256 indexed seedId, uint256 profits);
    event SeedContractUpdated(address indexed oldContract, address indexed newContract);
    event SnapshotContractUpdated(address indexed oldContract, address indexed newContract);
    event PoolUpdated(address indexed oldPool, address indexed newPool);
    event SnapFactoryUpdated(address indexed oldFactory, address indexed newFactory);
    /**
     * @dev Constructor to initialize the factory
     * @param _owner Address of the contract owner
     * @param _seedContract Address of the seed NFT contract
     * @param _snapshotContract Address of the snapshot NFT contract
     * @param _pool Address of the AavePool contract
     * @param _seedPrice Initial seed creation price in wei
     * @param _seedFee Initial seed fee percentage in basis points
     * @param _maxSeeds Maximum number of seeds allowed
     * @param _lockPeriodSeconds Lock period for seed withdrawals in seconds
     * @param _burnRecipient Address to receive early withdrawal penalties
     * @param _feeRecipient Address to receive seed creation fees
     */
    constructor(
        address _owner,
        address _seedContract,
        address _snapshotContract,
        address _pool,
        uint256 _seedPrice,
        uint256 _seedFee,
        uint256 _maxSeeds,
        uint256 _lockPeriodSeconds,
        address _burnRecipient,
        address _feeRecipient
    ) Ownable(_owner) {
        require(_owner != address(0), "SeedFactory: Invalid owner address");
        require(_seedContract != address(0), "SeedFactory: Invalid seed contract address");
        require(_snapshotContract != address(0), "SeedFactory: Invalid snapshot contract address");
        require(_pool != address(0), "SeedFactory: Invalid pool address");
        require(_seedPrice > 0, "SeedFactory: Seed price must be greater than 0");
        require(_seedFee <= 10000, "SeedFactory: Seed fee cannot exceed 100%");
        require(_maxSeeds > 0, "SeedFactory: Max seeds must be greater than 0");
        require(_lockPeriodSeconds > 0, "SeedFactory: Lock period must be greater than 0");

        require(_burnRecipient != address(0), "SeedFactory: Invalid burn recipient");
        require(_feeRecipient != address(0), "SeedFactory: Invalid fee recipient");

        seedContract = SeedNFT(_seedContract);
        snapshotContract = SnapshotNFT(_snapshotContract);
        pool = AavePool(payable(_pool));

        // Set configurable parameters
        seedPrice = _seedPrice;
        seedFee = _seedFee;
        maxSeeds = _maxSeeds;
        lockPeriodSeconds = _lockPeriodSeconds;

        burnRecipient = _burnRecipient;
        feeRecipient = _feeRecipient;

        emit SystemInitialized(_seedContract, _snapshotContract, _pool, address(0));
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update the seed creation price (only owner)
     * @param _newPrice The new seed creation price in wei
     */
    function setSeedPrice(uint256 _newPrice) external onlyOwner {
        uint256 oldPrice = seedPrice;
        seedPrice = _newPrice;
        emit SeedPriceUpdated(oldPrice, _newPrice);
    }

    /**
     * @dev Update the seed creation fee percentage (only owner)
     * @param _newFee The new seed fee in basis points (e.g., 500 = 5%)
     */
    function setSeedFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 10000, "SeedFactory: Seed fee cannot exceed 100% (10000 basis points)");
        uint256 oldFee = seedFee;
        seedFee = _newFee;
        emit SeedFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Update the maximum number of seeds allowed (only owner)
     * @param _newMaxSeeds The new maximum number of seeds
     * Note: Cannot be set lower than the current number of seeds
     */
    function setMaxSeeds(uint256 _newMaxSeeds) external onlyOwner {
        require(_newMaxSeeds > 0, "SeedFactory: Max seeds must be greater than 0");
        require(_newMaxSeeds >= seedContract.getTotalSeeds(), "SeedFactory: Cannot set max seeds lower than current seed count");
        
        uint256 oldMaxSeeds = maxSeeds;
        maxSeeds = _newMaxSeeds;
        emit MaxSeedsUpdated(oldMaxSeeds, _newMaxSeeds);
    }

    /**
     * @dev Update the lock period for seed withdrawals (only owner)
     * @param _newLockPeriodSeconds The new lock period in seconds
     */
    function setLockPeriodSeconds(uint256 _newLockPeriodSeconds) external onlyOwner {
        uint256 oldPeriod = lockPeriodSeconds;
        lockPeriodSeconds = _newLockPeriodSeconds;
        emit LockPeriodUpdated(oldPeriod, _newLockPeriodSeconds);
    }

    /**
     * @dev Update the SeedNFT contract address (only owner)
     * @param _newSeedContract The new SeedNFT contract address
     */
    function setSeedContract(address _newSeedContract) external onlyOwner {
        require(_newSeedContract != address(0), "SeedFactory: Invalid seed contract address");
        address oldContract = address(seedContract);
        seedContract = SeedNFT(_newSeedContract);
        emit SeedContractUpdated(oldContract, _newSeedContract);
    }

    /**
     * @dev Update the SnapshotNFT contract address (only owner)
     * @param _newSnapshotContract The new SnapshotNFT contract address
     */
    function setSnapshotContract(address _newSnapshotContract) external onlyOwner {
        require(_newSnapshotContract != address(0), "SeedFactory: Invalid snapshot contract address");
        address oldContract = address(snapshotContract);
        snapshotContract = SnapshotNFT(_newSnapshotContract);
        emit SnapshotContractUpdated(oldContract, _newSnapshotContract);
    }

    /**
     * @dev Update the AavePool contract address (only owner)
     * @param _newPool The new AavePool contract address
     */
    function setPool(address _newPool) external onlyOwner {
        require(_newPool != address(0), "SeedFactory: Invalid pool address");
        address oldPool = address(pool);
        pool = AavePool(payable(_newPool));
        emit PoolUpdated(oldPool, _newPool);
    }

    /**
     * @dev Update the SnapFactory contract address (only owner)
     * @param _newSnapFactory The new SnapFactory contract address
     */
    function setSnapFactory(address _newSnapFactory) external onlyOwner {
        require(_newSnapFactory != address(0), "SeedFactory: Invalid SnapFactory address");
        address oldFactory = snapFactory;
        snapFactory = _newSnapFactory;
        emit SnapFactoryUpdated(oldFactory, _newSnapFactory);
    }

    /**
     * @dev Enable or disable locked mode. When locked, only seeders can call createSeed
     */
    function setLocked(bool _locked) external onlyOwner {
        locked = _locked;
        emit LockedUpdated(_locked);
    }
    
    /**
     * @dev Set the seeder allowance for an address (only owner)
     * @param seeder Address to set allowance for
     * @param amount Number of seeds they can mint (0 to remove seeder)
     */
    function setSeederAmount(address seeder, uint256 amount) external onlyOwner {
        require(seeder != address(0), "SeedFactory: Invalid seeder address");
        seederAllowance[seeder] = amount;

        emit SeederAmountUpdated(seeder, amount);
    }

    /**
     * @dev Set the burn recipient for early withdrawal penalties (only owner)
     * @param newBurnRecipient Address to receive early withdrawal penalties
     */
    function setBurnRecipient(address newBurnRecipient) external onlyOwner {
        require(newBurnRecipient != address(0), "SeedFactory: Invalid burn recipient");
        address oldRecipient = burnRecipient;
        burnRecipient = newBurnRecipient;

        emit BurnRecipientUpdated(oldRecipient, newBurnRecipient);
    }

    /**
     * @dev Set the fee recipient for seed creation fees (only owner)
     * @param newFeeRecipient Address to receive seed creation fees
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "SeedFactory: Invalid fee recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;

        emit FeeRecipientUpdated(oldRecipient, newFeeRecipient);
    }

    /**
     * @dev Set the snapshot price for a specific seed NFT (only owner)
     * @param seedId The ID of the seed NFT
     * @param _newPrice The new snapshot price for this specific seed
     */
    function setSeedSnapshotPrice(uint256 seedId, uint256 _newPrice) external onlyOwner {
        require(seedContract.ownerOf(seedId) != address(0), "SeedFactory: Seed does not exist");
        seedSnapshotPrices[seedId] = _newPrice;
    }

    /**
     * @dev Send payment to any ETH address (only owner)
     * @param recipient Address to receive the payment
     * @param amount Amount of ETH to send in wei
     */
    function makePayment(address payable recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "SeedFactory: Invalid recipient address");
        require(amount > 0, "SeedFactory: Payment amount must be greater than 0");
        require(amount <= address(this).balance, "SeedFactory: Insufficient contract balance");

        // Send payment using low-level call for safety
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "SeedFactory: Payment transfer failed");

        emit PaymentSent(recipient, amount);
    }

    /**
     * @dev Recalculate the current max seed deposit value (only owner)
     * This ensures currentMaxSeedDeposit stays accurate after profit claims
     */
    function recalculateMaxSeedDeposit() external onlyOwner {
        uint256 totalSeeds = seedContract.getTotalSeeds();
        uint256 maxValue = 0;
        uint256 maxSeedId = 0;

        for (uint256 i = 1; i <= totalSeeds; i++) {
            uint256 seedValue = seedDepositAmount[i];
            if (seedValue > maxValue) {
                maxValue = seedValue;
                maxSeedId = i;
            }
        }

        if (maxValue != currentMaxSeedDeposit) {
            currentMaxSeedDeposit = maxValue;
            if (maxSeedId > 0) {
                emit MaxSeedDepositUpdated(maxSeedId, maxValue);
            }
        }
    }
    
    

    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Create a new seed NFT
     * Costs at least SEED_PRICE + SEED_FEE ETH, excess goes to seed deposit
     * The seed is minted to the caller with all value after fees deposited to AavePool
     * Optimized version with immediate caching for gas efficiency.
     * @return seedId The ID of the newly created seed
     */
    function createSeed(uint256 snapshotPrice, string calldata location) external payable nonReentrant returns (uint256 seedId) {
        require(bytes(location).length > 0, "SeedFactory: Location cannot be empty");
        require(seedContract.getTotalSeeds() < maxSeeds, "SeedFactory: Seed cap reached");
        if (locked) {
            require(seederAllowance[msg.sender] > 0, "SeedFactory: Factory locked - only seeders with allowance allowed");
            seederAllowance[msg.sender]--;
        }
        
        uint256 originalValue = msg.value;
        uint256 feeAmount = (seedPrice * seedFee) / 10000;
        uint256 totalCost = seedPrice + feeAmount;
        require(originalValue >= totalCost, "SeedFactory: Insufficient payment for minimum seed price + fee");

        // Calculate deposit amount after fee (excess goes to seed deposit)
        uint256 depositAmount = originalValue - feeAmount;

        // Mint seed NFT to the caller with snapshot price and seed location
        seedId = seedContract.mintSeed(msg.sender, snapshotPrice, location);

        // Set the snapshot price for this seed in the factory
        seedSnapshotPrices[seedId] = snapshotPrice;

        // Use the full deposit amount (including any excess over the minimum)
        seedDepositAmount[seedId] = depositAmount;
        _seedTotalValue[seedId] = depositAmount;

        // Check and update currentMaxSeedDeposit
        if (depositAmount > currentMaxSeedDeposit) {
            currentMaxSeedDeposit = depositAmount;
            emit MaxSeedDepositUpdated(seedId, depositAmount);
        }

        pool.deposit{value: depositAmount}(address(this));

        // Send fee to fee recipient
        if (feeAmount > 0) {
            (bool success, ) = payable(feeRecipient).call{value: feeAmount}("");
            require(success, "SeedFactory: Fee transfer failed");
            emit FeeCollected(feeRecipient, feeAmount);
        }

        emit SeedCreated(seedId, msg.sender);
        return seedId;
    }
    
    /**
     * @dev Deposit ETH to the AavePool for a specific seedId (used by SnapshotNFT)
     * @param seedId The seed ID to credit the deposit to
     */
    function depositForSeed(uint256 seedId) external payable nonReentrant {
        uint256 value = msg.value; 

        require(value > 0, "SeedFactory: Must send ETH");
        require(seedContract.ownerOf(seedId) != address(0), "SeedFactory: Seed does not exist");
        
        // Update total value for the seed 
        _seedTotalValue[seedId] += value;
        // Deposit seed amount to the Aave pool
        pool.deposit{value: value}(address(this));

        emit DepositSplit(seedId, value, value, 0);
    }

    /**
     * @notice Increase the seed deposit amount for a specific seed
     * @param seedId The ID of the seed to increase deposit for
     */
    function increaseSeedDeposit(uint256 seedId) external payable nonReentrant {
        uint256 value = msg.value;

        require(value > 0, "SeedFactory: Must send ETH");
        require(seedContract.ownerOf(seedId) != address(0), "SeedFactory: Seed does not exist");
        require(!seedWithdrawn[seedId], "SeedFactory: Cannot increase deposit for withdrawn seed");
        
        // Update seed deposit amount
        seedDepositAmount[seedId] += value;
        
        // Update total value for the seed
        _seedTotalValue[seedId] += value;
        
        // Deposit all ETH to the Aave pool
        pool.deposit{value: value}(address(this));
        
        // Check and update currentMaxSeedDeposit with new seed deposit amount
        uint256 newSeedDeposit = seedDepositAmount[seedId];
        if (newSeedDeposit > currentMaxSeedDeposit) {
            currentMaxSeedDeposit = newSeedDeposit;
            emit MaxSeedDepositUpdated(seedId, newSeedDeposit);
        }
        emit DepositSplit(seedId, value, value, 0);
    }
    
    /**
     * @dev Withdraw the original deposit for a seedId. Only the current seed holder can claim, and only once.
     * Tax system: 100% tax at creation, 0% tax after 4 years (linear decrease).
     * Permission list allows early withdrawal with reduced penalty.
     * @param seedId The seed NFT ID to withdraw for
     */
    function withdrawSeedDeposit(uint256 seedId) external nonReentrant {
        require(!seedWithdrawn[seedId], "SeedFactory: Already withdrawn");
        require(seedContract.ownerOf(seedId) == msg.sender, "SeedFactory: Not seed holder");
        
        // Get deposit amount and creation time
        uint256 originalDeposit = seedDepositAmount[seedId];
        require(originalDeposit > 0, "SeedFactory: No deposit for seed");
        
        // Calculate total amount to withdraw (original deposit + any unclaimed profits)
        uint256 currentTotal = _seedTotalValue[seedId];
        uint256 totalToWithdraw = currentTotal > originalDeposit ? currentTotal : originalDeposit;
        
        (uint256 createdAt, ) = seedContract.getSeedMetadata(seedId);
        
        uint256 withdrawn = pool.withdraw(totalToWithdraw);
        require(withdrawn == totalToWithdraw, "SeedFactory: Withdrawal amount mismatch");

        // Mark as withdrawn only after successful full withdrawal
        seedWithdrawn[seedId] = true;

        uint256 elapsed;
        unchecked {
            elapsed = block.timestamp > createdAt ? block.timestamp - createdAt : 0;
        }

        // Use fixed lock period - tax only applies to original deposit, not profits
        uint256 userAmount;
        uint256 taxAmount;
        if (elapsed >= lockPeriodSeconds) {
            // After lock period: full refund, no tax
            userAmount = totalToWithdraw;
            taxAmount = 0;
        } else {
            // Calculate tax amount (100% tax at start, 0% tax at final unlock time)
            // Tax only applies to original deposit, profits are tax-free
            uint256 basisPoints = (elapsed * 10000) / lockPeriodSeconds;
            require(10000 > basisPoints, "SeedFactory: Invalid basis points calculation");
            uint256 remainingBasisPoints = 10000 - basisPoints;
            taxAmount = (originalDeposit * remainingBasisPoints) / 10000;
            require(taxAmount <= originalDeposit, "SeedFactory: Tax amount exceeds original deposit");
            
            // User gets: (original deposit - tax) + all profits
            userAmount = (originalDeposit - taxAmount) + (totalToWithdraw - originalDeposit);
        }
        
        if (userAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: userAmount}("");
            require(success, "SeedFactory: ETH transfer to user failed");
        }
        if (taxAmount > 0) {
            (bool success, ) = payable(burnRecipient).call{value: taxAmount}("");
            require(success, "SeedFactory: ETH transfer to burn recipient failed");
        }

        // Reset total value to 0 since everything is withdrawn
        _seedTotalValue[seedId] = 0;
        seedDepositAmount[seedId] = 0;
        emit SeedWithdrawn(seedId, userAmount, taxAmount);
    }

    /**
     * @dev Claim accumulated profits from snapshots without vesting restrictions
     * Only the current seed holder can claim profits, but no vesting period applies
     * @param seedId The seed NFT ID to claim profits for
     */
    function claimSeedProfits(uint256 seedId) external nonReentrant {
        require(seedContract.ownerOf(seedId) == msg.sender, "SeedFactory: Not seed holder");

        uint256 currentTotal = _seedTotalValue[seedId];
        uint256 originalDeposit = seedDepositAmount[seedId];
        uint256 profits = currentTotal - originalDeposit;
        require(profits > 0, "SeedFactory: No profits to claim");

        // Reset total value back to original deposit (remove profits)
        _seedTotalValue[seedId] = originalDeposit;

        // Withdraw profits from Aave pool
        uint256 withdrawn = pool.withdraw(profits);
        require(withdrawn == profits, "SeedFactory: Profit withdrawal amount mismatch");

        // Transfer profits to user (no vesting, no taxes)
        (bool success, ) = payable(msg.sender).call{value: profits}("");
        require(success, "SeedFactory: ETH transfer to user failed");

        emit SeedProfitsClaimed(seedId, profits);
    }
    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get the minimum seed creation cost (price + fee)
     * @return The minimum cost including price and fee in wei (excess goes to seed deposit)
     */
    function getTotalSeedCost() external view returns (uint256) {
        uint256 feeAmount = (seedPrice * seedFee) / 10000;
        return seedPrice + feeAmount;
    }
    
    /**
     * @dev Get total deposits across all seeds
     * @return Total original deposits in wei
     */
    function getTotalDeposits() public view returns (uint256) {
        uint256 total = 0;
        uint256 seedCount = seedContract.getTotalSeeds();

        for (uint256 i = 1; i <= seedCount; i++) {
            total += seedDepositAmount[i];
        }

        return total;
    }

    /**
     * @dev Get total value across all seeds (original deposits + accumulated profits)
     * @return Total value in wei
     */
    function getTotalSeedValue() public view returns (uint256) {
        uint256 total = 0;
        uint256 seedCount = seedContract.getTotalSeeds();

        for (uint256 i = 1; i <= seedCount; i++) {
            total += _seedTotalValue[i];
        }

        return total;
    }
    
    /**
     * @dev Get detailed seed information for admin
     * @param seedId The seed ID
     * @return owner Address that owns the seed
     * @return depositAmount Amount deposited for this seed
     * @return withdrawn Whether the seed has been withdrawn
     * @return creationTime When the seed was created
     * @return snapshotCount Number of snapshots for this seed
     */
    function getSeedInfo(uint256 seedId) external view returns (
        address owner,
        uint256 depositAmount,
        bool withdrawn,
        uint256 creationTime,
        uint256 snapshotCount
    ) {
        require(seedId > 0 && seedId <= seedContract.getTotalSeeds(), "SeedFactory: Invalid seed ID");
        
        owner = seedContract.ownerOf(seedId);
        depositAmount = seedDepositAmount[seedId];
        withdrawn = seedWithdrawn[seedId];
        
        (creationTime, ) = seedContract.getSeedMetadata(seedId);
        snapshotCount = snapshotContract.getSeedSnapshotCount(seedId);
    }

    /**
     * @dev Get the NFT holder address for a specific seed
     * @param seedId The seed ID
     * @return The address of the current NFT holder
     */
    function getDepositOwner(uint256 seedId) external view returns (address) {
        require(seedId > 0 && seedId <= seedContract.getTotalSeeds(), "SeedFactory: Invalid seed ID");
        return seedContract.ownerOf(seedId);
    }

    /**
     * @dev Get the original capital amount deposited for a specific seed
     * @param seedId The seed ID
     * @return The original deposit amount in wei
     */
    function getDepositAmount(uint256 seedId) external view returns (uint256) {
        require(seedId > 0 && seedId <= seedContract.getTotalSeeds(), "SeedFactory: Invalid seed ID");
        return seedDepositAmount[seedId];
    }

    /**
     * @dev Get the accumulated profits for a specific seed
     * @param seedId The seed ID
     * @return The accumulated profits amount in wei
     */
    function getAccumulatedProfits(uint256 seedId) external view returns (uint256) {
        require(seedId > 0 && seedId <= seedContract.getTotalSeeds(), "SeedFactory: Invalid seed ID");
        uint256 currentTotal = _seedTotalValue[seedId];
        uint256 originalDeposit = seedDepositAmount[seedId];
        return currentTotal > originalDeposit ? currentTotal - originalDeposit : 0;
    }

    /**
     * @dev Get the total value (original deposit + accumulated profits) for a specific seed
     * @param seedId The seed ID
     * @return The total value in wei
     */
    function getTotalSeedValue(uint256 seedId) external view returns (uint256) {
        require(seedId > 0 && seedId <= seedContract.getTotalSeeds(), "SeedFactory: Invalid seed ID");
        return _seedTotalValue[seedId];
    }

    /**
     * @dev Get the seed deposit amount (used by SnapFactory)
     * @param seedId The seed ID
     * @return The deposit amount in wei
     */
    function getSeedDepositAmount(uint256 seedId) external view returns (uint256) {
        require(seedId > 0 && seedId <= seedContract.getTotalSeeds(), "SeedFactory: Invalid seed ID");
        return seedDepositAmount[seedId];
    }

    /**
     * @dev Get the unlock time when capital becomes withdrawable for a specific seed
     * @param seedId The seed ID
     * @return The timestamp when the capital becomes fully withdrawable (4 years after creation)
     */
    function getUnlockTime(uint256 seedId) external view returns (uint256) {
        require(seedId > 0 && seedId <= seedContract.getTotalSeeds(), "SeedFactory: Invalid seed ID");
        (uint256 creationTime, ) = seedContract.getSeedMetadata(seedId);
        return creationTime + lockPeriodSeconds; // Configurable unlock period
    }
    

    
    /**
     * @dev Public view to check seeder allowance
     */
    function getSeederAllowance(address account) external view returns (uint256) {
        return seederAllowance[account];
    }

    /**
     * @dev Get the AavePool address
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
        require(seedId > 0 && seedId <= seedContract.getTotalSeeds(), "SeedFactory: Invalid seed ID");
        uint256 currentSeedDeposit = seedDepositAmount[seedId];
        return _calculateDynamicSeedPercentage(currentSeedDeposit);
    }

    /**
     * @dev Validate that a seed exists (for SnapshotNFT validation)
     * @param seedId The seed ID to validate
     * @return exists Whether the seed exists as a valid token
     */
    function validateSeedForSnapshot(uint256 seedId) external view returns (bool exists) {
        // Check if seed ID is within the valid range of minted tokens
        if (seedId == 0 || seedId > seedContract.getTotalSeeds()) {
            return false;
        }
        return true;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Calculate dynamic seed percentage based on current seed deposit vs max
     * @param currentSeedDeposit Current deposit amount for the seed
     * @return percentage The dynamic percentage in basis points (2000-4000)
     */
    function _calculateDynamicSeedPercentage(uint256 currentSeedDeposit) internal view returns (uint256 percentage) {
        if (currentMaxSeedDeposit == 0) {
            return 2000;
        }
        if (currentSeedDeposit >= currentMaxSeedDeposit) {
            return 4000;
        }

        // Calculate linear interpolation: 2000 + (currentSeedDeposit * 2000) / currentMaxSeedDeposit
        // This gives 20% at 0, 30% at 50% of max, 40% at 100% of max
        // Security: Prevent overflow in multiplication
        require(currentSeedDeposit <= type(uint256).max / 2000, "SeedFactory: Deposit too large for calculation");
        uint256 interpolation = (currentSeedDeposit * 2000) / currentMaxSeedDeposit;
        uint256 result = 2000 + interpolation;

        // Ensure result stays within expected bounds (2000-4000 basis points)
        if (result > 4000) {
            return 4000;
        }

        return result;
    }
    

    
    // ============ FALLBACK FUNCTIONS ============
    
    /**
     * @dev Receive function to accept ETH (for interest claims)
     */
    receive() external payable {
        // Allow receiving ETH for interest claims
    }
} 