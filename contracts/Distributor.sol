// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "./Utils/ReentrancyGuard.sol";
import "./SnapshotNFT.sol";
import "./SeedFactory.sol";

/**
 * @title Distributor
 * @dev Time-aware interest distribution system that allocates interest immediately
 * upon receipt based on snapshot distribution at that moment, ensuring historical fairness.
 * 
 */
contract Distributor is Ownable, ReentrancyGuard {
    
    SnapshotNFT public snapshotNFT;
    address public factory;

    // Precision handling
    uint256 public constant PRECISION = 1e18;
    
    struct Beneficiary {
        address addr;
        string name;              // Fixed name for the beneficiary
        string code;              // Code identifier for the beneficiary
        uint256 allocatedAmount;  // Total allocated across all interest payments
        uint256 totalClaimed;     // Total claimed by this beneficiary
        bool active;              // Whether this beneficiary slot is active
    }
    
    Beneficiary[] public beneficiaries;
    uint256 public totalReceived;
     
    mapping(address => bool) public operators;
    mapping(string => uint256) public codeToBeneficiaryIndex; // Maps beneficiary code to their index


    event InterestReceived(uint256 indexed totalReceived, uint256 amount, uint256 totalValueRaised);
    event BeneficiaryUpdated(uint256 indexed index, address oldAddr, address newAddr, string name);
    event InterestClaimed(uint256 indexed beneficiaryIndex, address beneficiary, uint256 amount);
    event InterestDustAllocated(uint256 indexed beneficiaryIndex, uint256 dustAmount);
    event FactoryUpdated(address indexed oldFactory, address indexed newFactory);
    event SnapshotNFTUpdated(address indexed oldSnapshotNFT, address indexed newSnapshotNFT);
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
        
    error OnlyFactory();
    error OnlyBeneficiary();
    error OnlyOperator();
    error InvalidBeneficiaryIndex();
    error InvalidAddress();
    error NoInterestToDistribute();
    error NothingToClaim();
    error InvalidFactoryAddress();
    error NoSnapshotsExist();
    error BeneficiaryNameAlreadyExists();
    error BeneficiaryCodeAlreadyExists();
    error BeneficiaryAddressAlreadyExists();
    error InvalidName();
    error OperatorAlreadyExists();
    error OperatorDoesNotExist();
    


   
    constructor(
        address _owner,
        address _snapshotNFT,
        address _factory
    ) Ownable(_owner) {
        if (_snapshotNFT == address(0)) revert InvalidAddress();
        if (_factory == address(0)) revert InvalidFactoryAddress();
        
        snapshotNFT = SnapshotNFT(_snapshotNFT);
        factory = _factory;
    }

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }
    
    modifier onlyBeneficiary(uint256 beneficiaryIndex) {
        if (beneficiaryIndex >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        if (!beneficiaries[beneficiaryIndex].active) revert InvalidBeneficiaryIndex();
        if (msg.sender != beneficiaries[beneficiaryIndex].addr) revert OnlyBeneficiary();
        _;
    }
    
    modifier onlyOperator() {
        if (!operators[msg.sender] && msg.sender != owner()) revert OnlyOperator();
        _;
    }
    

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Add an operator (owner only)
     */
    function addOperator(address operator) external onlyOwner {
        if (operator == address(0)) revert InvalidAddress();
        if (operators[operator]) revert OperatorAlreadyExists();
        
        operators[operator] = true;
        emit OperatorAdded(operator);
    }
    
    /**
     * @dev Remove an operator (owner only)
     */
    function removeOperator(address operator) external onlyOwner {
        if (!operators[operator]) revert OperatorDoesNotExist();
        
        operators[operator] = false;
        emit OperatorRemoved(operator);
    }
    
    /**
     * @dev Update factory address (owner only)
     */
    function updateFactory(address newFactory) external onlyOwner {
        if (newFactory == address(0)) revert InvalidFactoryAddress();
        
        address oldFactory = factory;
        factory = newFactory;
        
        emit FactoryUpdated(oldFactory, newFactory);
    }
    
    /**
     * @dev Update SnapshotNFT contract address (owner only)
     */
    function setSnapshotNFT(address newSnapshotNFT) external onlyOwner {
        if (newSnapshotNFT == address(0)) revert InvalidAddress();
        
        address oldSnapshotNFT = address(snapshotNFT);
        snapshotNFT = SnapshotNFT(newSnapshotNFT);
        
        emit SnapshotNFTUpdated(oldSnapshotNFT, newSnapshotNFT);
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Receives and immediately distributes interest based on beneficiary percentage of total value raised
     * This prevents retroactive calculation bugs by locking in allocations at receipt time
     * @notice Can be called by operators to distribute existing contract balance + any msg.value
     * @notice Requires at least one snapshot to exist for distribution (totalValueRaised > 0)
     * @notice Allocation formula: (beneficiaryTotalValue / totalValueRaised) * totalAmount
     * @notice Each beneficiary gets a percentage equal to their share of total value raised
     * @notice Dust from rounding is given to the first active beneficiary
     */
    function distributeInterest() external payable onlyOperator nonReentrant {
        // Include existing contract balance
        uint256 totalAmount = address(this).balance;

        if (totalAmount == 0) revert NoInterestToDistribute();

        uint256 totalValueRaised = snapshotNFT.getTotalValueRaised();
        if (totalValueRaised == 0) revert NoSnapshotsExist();

        // Distribute to active beneficiaries based on their percentage of total value raised
        uint256 activeIndex = 0;
        uint256 totalAllocated = 0;

        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) {
                uint256 beneficiaryValue = snapshotNFT.getBeneficiaryTotalValue(i);
                if (beneficiaryValue > 0) {
                    // Calculate allocation as: (beneficiaryValue / totalValueRaised) * totalAmount
                    // Use high precision arithmetic to minimize rounding errors
                    // beneficiaryPercentage = beneficiaryValue / totalValueRaised (as a fraction)
                    require(totalAmount <= type(uint256).max / (beneficiaryValue * PRECISION), "Distributor: Calculation overflow");
                    uint256 preciseAllocation = (totalAmount * beneficiaryValue * PRECISION) / totalValueRaised;
                    uint256 allocation = preciseAllocation / PRECISION;
                    beneficiaries[i].allocatedAmount += allocation;
                    totalAllocated += allocation;
                }
                activeIndex++;
            }
        }

        // Handle dust: give any remaining wei to first active beneficiary
        if (totalAllocated < totalAmount && activeIndex > 0) {
            uint256 dust = totalAmount - totalAllocated;
            // Find first active beneficiary to receive dust
            for (uint256 i = 0; i < beneficiaries.length; i++) {
                if (beneficiaries[i].active) {
                    beneficiaries[i].allocatedAmount += dust;
                    emit InterestDustAllocated(i, dust);
                    break;
                }
            }
        }

        totalReceived += totalAmount;
        emit InterestReceived(totalReceived, totalAmount, totalValueRaised);
    }
    
    /**
     * @dev Allows anyone to claim allocated interest on behalf of a beneficiary
     * @param beneficiaryIndex The index of the beneficiary to claim for
     */
    function claimShare(uint256 beneficiaryIndex) 
        external 
        nonReentrant 
    {
        if (beneficiaryIndex >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        if (!beneficiaries[beneficiaryIndex].active) revert InvalidBeneficiaryIndex();
        
        uint256 claimableAmount = getClaimableAmount(beneficiaryIndex);
        if (claimableAmount == 0) revert NothingToClaim();
        
        beneficiaries[beneficiaryIndex].totalClaimed += claimableAmount;
        
        // Transfer ETH to beneficiary
        address beneficiaryAddr = beneficiaries[beneficiaryIndex].addr;
        (bool success, ) = payable(beneficiaryAddr).call{value: claimableAmount}("");
        require(success, "Distributor: ETH transfer failed");
        
        emit InterestClaimed(beneficiaryIndex, beneficiaryAddr, claimableAmount);
    }
    
    /**
     * @dev Add a new beneficiary to the system (operator or owner only)
     * @param beneficiaryAddr Address of the new beneficiary
     * @param name Name of the beneficiary (must be unique)
     * @param code Code identifier for the new beneficiary
     * @return beneficiaryIndex The index of the newly added beneficiary
     */
    function addBeneficiary(address beneficiaryAddr, string memory name, string memory code) external onlyOperator returns (uint256 beneficiaryIndex) {
        if (beneficiaryAddr == address(0)) revert InvalidAddress();
        if (bytes(name).length == 0) revert InvalidName();
        if (bytes(code).length == 0) revert InvalidName(); // Code validation
        if (isCodeExists(code)) revert BeneficiaryCodeAlreadyExists();
        if (isAddressBeneficiary(beneficiaryAddr)) revert BeneficiaryAddressAlreadyExists();
        
        // Add new beneficiary
        beneficiaries.push(Beneficiary({
            addr: beneficiaryAddr,
            name: name,
            code: code,
            allocatedAmount: 0,
            totalClaimed: 0,
            active: true
        }));
        beneficiaryIndex = beneficiaries.length;
        codeToBeneficiaryIndex[code] = beneficiaryIndex; 
        
        emit BeneficiaryUpdated(beneficiaryIndex, address(0), beneficiaryAddr, name);
        
        return beneficiaryIndex;
    }
    
    /**
     * @dev Update beneficiary address (operator or owner only)
     */
    function updateBeneficiary(uint256 index, address newBeneficiary) external onlyOperator {
        if (index >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        if (!beneficiaries[index].active) revert InvalidBeneficiaryIndex();
        if (newBeneficiary == address(0)) revert InvalidAddress();
        
        // Check if new address is already a beneficiary
        if (isAddressBeneficiary(newBeneficiary)) revert BeneficiaryAddressAlreadyExists();
        
        address oldBeneficiary = beneficiaries[index].addr;
        beneficiaries[index].addr = newBeneficiary;
                
        emit BeneficiaryUpdated(index, oldBeneficiary, newBeneficiary, beneficiaries[index].name);
    }

    /**
     * @dev Update beneficiary code (operator or owner only)
     */
    function updateBeneficiaryCode(uint256 index, string memory newCode) external onlyOperator {
        if (index >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        if (!beneficiaries[index].active) revert InvalidBeneficiaryIndex();
        if (bytes(newCode).length == 0) revert InvalidName();
        
        beneficiaries[index].code = newCode;
        
        emit BeneficiaryUpdated(index, beneficiaries[index].addr, beneficiaries[index].addr, beneficiaries[index].name);
    }
    
    /**
     * @dev Deactivate a beneficiary (operator or owner only)
     */
    function deactivateBeneficiary(uint256 index) external onlyOperator {
        if (index >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        if (!beneficiaries[index].active) revert InvalidBeneficiaryIndex();
        
        beneficiaries[index].active = false;
        
        emit BeneficiaryUpdated(index, beneficiaries[index].addr, address(0), beneficiaries[index].name);
    }
    
    /**
     * @dev Reactivate a beneficiary (operator or owner only)
     */
    function reactivateBeneficiary(uint256 index) external onlyOperator {
        if (index >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        if (beneficiaries[index].active) revert("Distributor: Beneficiary already active");
        
        // Reactivate beneficiary
        beneficiaries[index].active = true;
        
        emit BeneficiaryUpdated(index, address(0), beneficiaries[index].addr, beneficiaries[index].name);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Calculate claimable amount for a beneficiary by index
     */
    function getClaimableAmount(uint256 beneficiaryIndex) public view returns (uint256) {
        if (beneficiaryIndex >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        if (!beneficiaries[beneficiaryIndex].active) return 0;
        
        uint256 allocated = beneficiaries[beneficiaryIndex].allocatedAmount;
        uint256 claimed = beneficiaries[beneficiaryIndex].totalClaimed;
        
        return allocated > claimed ? allocated - claimed : 0;
    }
    
    /**
     * @dev Calculate claimable amount for a beneficiary by address
     */
    function getClaimableAmount(address beneficiaryAddr) external view returns (uint256) {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active && beneficiaries[i].addr == beneficiaryAddr) {
                return getClaimableAmount(i);
            }
        }
        return 0; // Not a beneficiary
    }
    
    /**
     * @dev Get beneficiary information
     */
    function getBeneficiary(uint256 index) external view returns (
        address addr,
        string memory name,
        string memory code,
        uint256 allocatedAmount,
        uint256 totalClaimed,
        uint256 claimableAmount,
        bool active
    ) {
        if (index >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        
        Beneficiary memory beneficiary = beneficiaries[index];
        return (
            beneficiary.addr,
            beneficiary.name,
            beneficiary.code,
            beneficiary.allocatedAmount,
            beneficiary.totalClaimed,
            getClaimableAmount(index),
            beneficiary.active
        );
    }
    
    /**
     * @dev Get all active beneficiaries information
     */
    function getAllBeneficiaries() external view returns (
        address[] memory addresses,
        string[] memory names,
        string[] memory codes,
        uint256[] memory allocatedAmounts,
        uint256[] memory totalClaimed,
        uint256[] memory claimableAmounts
    ) {
        // Count active beneficiaries
        uint256 activeCount = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) {
                activeCount++;
            }
        }
        
        // Create arrays for active beneficiaries only
        addresses = new address[](activeCount);
        names = new string[](activeCount);
        codes = new string[](activeCount);
        allocatedAmounts = new uint256[](activeCount);
        totalClaimed = new uint256[](activeCount);
        claimableAmounts = new uint256[](activeCount);
        
        uint256 activeIndex = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) {
                addresses[activeIndex] = beneficiaries[i].addr;
                names[activeIndex] = beneficiaries[i].name;
                codes[activeIndex] = beneficiaries[i].code;
                allocatedAmounts[activeIndex] = beneficiaries[i].allocatedAmount;
                totalClaimed[activeIndex] = beneficiaries[i].totalClaimed;
                claimableAmounts[activeIndex] = getClaimableAmount(i);
                activeIndex++;
            }
        }
    }
    
    /**
     * @dev Get number of active beneficiaries
     */
    function getBeneficiaryCount() external view returns (uint256) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) {
                activeCount++;
            }
        }
        return activeCount;
    }
    
    /**
     * @dev Get total number of beneficiaries (including inactive)
     */
    function getTotalBeneficiarySlots() external view returns (uint256) {
        return beneficiaries.length;
    }

    /**
     * @dev Get beneficiary name by index
     * @param beneficiaryIndex Index of the beneficiary
     * @return name The name of the beneficiary
     */
    function getBeneficiaryName(uint256 beneficiaryIndex) external view returns (string memory name) {
        if (beneficiaryIndex >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        return beneficiaries[beneficiaryIndex].name;
    }
    /**
     * @dev Get beneficiary code by index
     * @param beneficiaryIndex Index of the beneficiary
     * @return code The code of the beneficiary
     */
    function getBeneficiaryCode(uint256 beneficiaryIndex) external view returns (string memory code) {
        if (beneficiaryIndex >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        return beneficiaries[beneficiaryIndex].code;
    }
    /**
     * @dev Get current share percentage for a beneficiary based on snapshot activity
     * @param beneficiaryIndex Index of the beneficiary
     * @return sharePercentage Current share percentage (out of 10000 basis points)
     */
    function getCurrentSharePercentage(uint256 beneficiaryIndex) external view returns (uint256 sharePercentage) {
        if (beneficiaryIndex >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        if (!beneficiaries[beneficiaryIndex].active) return 0;
        
        uint256 totalSnapshots = snapshotNFT.getTotalSnapshots();
        uint256 activeBeneficiaryCount = this.getBeneficiaryCount();
        
        if (totalSnapshots == 0) {
            return activeBeneficiaryCount > 0 ? 10000 / activeBeneficiaryCount : 0;
        }
        
        uint256 beneficiarySnapshots = snapshotNFT.getBeneficiarySnapshotCount(beneficiaryIndex);
        return (beneficiarySnapshots * 10000) / totalSnapshots;
    }
    
    /**
     * @dev Get precision information
     */
    function getPrecisionInfo() external pure returns (uint256 precision) {
        return PRECISION;
    }
    
    /**
     * @dev Check if a code already exists
     */
    function isCodeExists(string memory code) public view returns (bool) {
        return codeToBeneficiaryIndex[code] > 0;
    }
    
    /**
     * @dev Check if an address is already a beneficiary
     */
    function isAddressBeneficiary(address beneficiaryAddr) public view returns (bool) {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active && beneficiaries[i].addr == beneficiaryAddr) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get contract balance and total allocations for verification
     */
    function getContractState() external view returns (
        uint256 contractBalance,
        uint256 totalAllocated,
        uint256 totalClaimedAll,
        uint256 remainingToDistribute
    ) {
        contractBalance = address(this).balance;
        
        uint256 allocated = 0;
        uint256 claimed = 0;
        
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) {
                allocated += beneficiaries[i].allocatedAmount;
                claimed += beneficiaries[i].totalClaimed;
            }
        }
        
        totalAllocated = allocated;
        totalClaimedAll = claimed;
        remainingToDistribute = allocated > claimed ? allocated - claimed : 0;
    }
    
    /**
     * @dev Check if an address is an operator
     */
    function isOperator(address operator) external view returns (bool) {
        return operators[operator] || operator == owner();
    }
    
    /**
     * @dev Get beneficiary information by code
     */
    function getBeneficiaryByCode(string memory code) external view returns (
        uint256 index,
        address addr,
        string memory name,
        uint256 allocatedAmount,
        uint256 totalClaimed,
        uint256 claimableAmount,
        bool active
    ) {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (keccak256(bytes(beneficiaries[i].code)) == keccak256(bytes(code))) {
                return (
                    i,
                    beneficiaries[i].addr,
                    beneficiaries[i].name,
                    beneficiaries[i].allocatedAmount,
                    beneficiaries[i].totalClaimed,
                    getClaimableAmount(i),
                    beneficiaries[i].active
                );
            }
        }
        revert InvalidBeneficiaryIndex();
    }

    /**
     * @dev Calculate the percentage share for a beneficiary
     * @param beneficiaryIndex The index of the beneficiary
     * @return percentage The percentage in basis points (10000 = 100%)
     */
    function getBeneficiaryPercentage(uint256 beneficiaryIndex) external view returns (uint256 percentage) {
        require(beneficiaryIndex < beneficiaries.length, "Distributor: Invalid beneficiary index");
        
        uint256 totalValueRaised = snapshotNFT.getTotalValueRaised();
        if (totalValueRaised == 0) return 0;
        
        uint256 beneficiaryValue = snapshotNFT.getBeneficiaryTotalValue(beneficiaryIndex);
        percentage = (beneficiaryValue * 10000) / totalValueRaised; // Convert to basis points
    }

    /**
     * @dev Get distribution calculation details for debugging
     */
    function getDistributionDetails() external view returns (
        uint256 contractBalance,
        uint256 totalValueRaised,
        uint256 activeBeneficiaryCount
    ) {
        contractBalance = address(this).balance;
        totalValueRaised = snapshotNFT.getTotalValueRaised();
        
        uint256 activeCount = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].active) {
                activeCount++;
            }
        }
        activeBeneficiaryCount = activeCount;
    }
    
    /**
     * @dev Get beneficiary allocation details for debugging
     */
    function getBeneficiaryAllocationDetails(uint256 beneficiaryIndex) external view returns (
        uint256 beneficiaryValue,
        uint256 allocatedAmount,
        uint256 totalClaimed,
        bool isActive
    ) {
        if (beneficiaryIndex >= beneficiaries.length) revert InvalidBeneficiaryIndex();
        
        beneficiaryValue = snapshotNFT.getBeneficiaryTotalValue(beneficiaryIndex);
        allocatedAmount = beneficiaries[beneficiaryIndex].allocatedAmount;
        totalClaimed = beneficiaries[beneficiaryIndex].totalClaimed;
        isActive = beneficiaries[beneficiaryIndex].active;
    }


    // ============ FALLBACK FUNCTIONS ============
    
    /**
     * @dev Accept ETH transfers from trusted sources (AavePool and factory)
     * For other sources, require using distributeInterest()
     */
    receive() external payable {
        // Allow ETH from factory
        if (msg.sender == factory) {
            // Accept the ETH 
            return;
        }
        
        // Allow ETH from the AavePool that the factory manages
        if (msg.sender == SeedFactory(payable(factory)).getPool()) {
            // Accept the ETH 
            return;
        }
        revert("Distributor: Use distributeInterest()");
    }
} 