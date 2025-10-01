// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "./Utils/ReentrancyGuard.sol";
import "./interfaces/IAave.sol";
import "./Interfaces/IWETH.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title AavePool
 * @dev A vault contract that handles ETH deposits and withdrawals with Aave yield generation
 * Users get their original deposit back, while the contract can claim accumulated interest
 * 
 * @notice This contract has been updated with reentrancy protection
 * @dev Implements checks-effects-interactions pattern to prevent reentrancy attacks
 */
contract AavePool is ReentrancyGuard, Ownable {
    
    // Core contract addresses
    IAavePool public aavePool;
    IAToken public aWETH;
    IWETH public immutable WETH;
    address public factory;
    address public snapFactory;

    // Deposit tracking
    mapping(address => uint256) public userDeposits;
    uint256 public totalDeposits;

    // System state
    bool public paused;
    

    event Deposit(address indexed depositor, uint256 amount);
    event Withdraw(address indexed depositor, uint256 amount);
    event PartialWithdrawal(address indexed depositor, uint256 requested, uint256 received);
    event PartialInterestClaim(uint256 requested, uint256 received);
    event InterestClaimed(address indexed owner, uint256 amount);
    event SystemPaused(bool paused);
    event EmergencyWithdrawal(address indexed user, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _owner The owner of the contract (typically the factory)
     * @param _aavePool Address of the Aave Pool contract
     * @param _aWETH Address of the Aave aWETH token
     * @param _WETH Address of the WETH contract
     * @param _factory Address of the initial factory contract
     * @param _snapFactory Address of the SnapFactory contract
     */
    constructor(
        address _owner,
        address _aavePool,
        address _aWETH,
        address _WETH,
        address _factory,
        address _snapFactory
    ) Ownable(_owner) {
        require(_owner != address(0), "AavePool: Invalid owner");
        require(_aavePool != address(0), "AavePool: Invalid Aave pool");
        require(_aWETH != address(0), "AavePool: Invalid aWETH");
        require(_WETH != address(0), "AavePool: Invalid WETH");
        require(_factory != address(0), "AavePool: Invalid factory");
        require(_snapFactory != address(0), "AavePool: Invalid SnapFactory");
        
        aavePool = IAavePool(_aavePool);
        aWETH = IAToken(_aWETH);
        WETH = IWETH(_WETH);
        factory = _factory;
        snapFactory = _snapFactory;
        paused = false;
        
        // Approve Aave pool to spend WETH
        IWETH(_WETH).approve(_aavePool, type(uint256).max);
    }
    
    // ============ DEPOSIT/WITHDRAW FUNCTIONS ============
    
    /**
     * @dev Deposit ETH on behalf of a specific depositor and invest in Aave
     * @param depositor The address to credit the deposit to
     */
    function deposit(address depositor) external payable nonReentrant {
        require(msg.sender == factory, "AavePool: Only factory can deposit");
        require(!paused, "AavePool: System is paused");

        uint256 value = msg.value; // Cache msg.value to prevent reentrancy issues

        require(value > 0, "AavePool: Cannot deposit 0 ETH");
        require(depositor != address(0), "AavePool: Invalid depositor address");
        
        // Update tracking
        userDeposits[depositor] += value;
        totalDeposits += value;
        
        // Convert ETH to WETH
        WETH.deposit{value: value}();

        aavePool.supply(address(WETH), value, address(this), 0);
        
        emit Deposit(depositor, value);
    }
    
    /**
     * @dev Withdraw original deposit amount (without interest)
     * @notice Fixed reentrancy vulnerability using checks-effects-interactions pattern
     * @param amount Amount of original deposit to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant returns (uint256) {
        require(msg.sender == factory, "AavePool: Only factory can withdraw");
        require(!paused, "AavePool: System is paused");
        require(amount > 0, "AavePool: Cannot withdraw 0 ETH");

        uint256 userBalance = userDeposits[msg.sender];
        require(userBalance >= amount, "AavePool: Insufficient balance");

        userDeposits[msg.sender] = userBalance - amount;
        totalDeposits = totalDeposits - amount;

        uint256 withdrawn = aavePool.withdraw(address(WETH), amount, address(this));

        if (withdrawn == 0) {
            revert("AavePool: Aave withdrawal failed - received 0 ETH");
        }

        // Handle partial withdrawals (Aave might return less than requested)
        if (withdrawn < amount) {
            userDeposits[msg.sender] = userDeposits[msg.sender] + (amount - withdrawn);
            totalDeposits = totalDeposits + (amount - withdrawn);
            emit PartialWithdrawal(msg.sender, amount, withdrawn);
        }

        WETH.withdraw(withdrawn);

        // Send withdrawn ETH to user
        (bool success, ) = payable(msg.sender).call{value: withdrawn}("");
        require(success, "AavePool: ETH transfer failed");

        emit Withdraw(msg.sender, withdrawn);
        return withdrawn;
    }

    // ============ INTEREST MANAGEMENT ============
    
    /**
     * @dev Optimized function that checks and claims interest in one external call
     * @param distributor Address to receive the interest
     * @return claimedAmount Amount of interest claimed (0 if no interest to claim)
     */
    function checkAndClaimInterest(address distributor) external nonReentrant returns (uint256 claimedAmount) {
        require(msg.sender == snapFactory, "AavePool: Only SnapFactory can claim interest");
        require(!paused, "AavePool: System is paused");
        require(distributor != address(0), "AavePool: Invalid distributor address");

        uint256 currentATokenBalance = aWETH.balanceOf(address(this));

        // If no interest to claim, return 0
        if (currentATokenBalance <= totalDeposits) {
            return 0;
        }

        uint256 interest = currentATokenBalance - totalDeposits;
        uint256 withdrawn = aavePool.withdraw(address(WETH), interest, address(this));

        if (withdrawn == 0) {
            revert("AavePool: Interest withdrawal failed - received 0 ETH");
        }
        if (withdrawn < interest) {
            emit PartialInterestClaim(interest, withdrawn);
        }

        WETH.withdraw(withdrawn);

        // Send interest directly to distributor
        (bool success, ) = payable(distributor).call{value: withdrawn}("");
        require(success, "AavePool: Interest transfer failed");

        emit InterestClaimed(distributor, withdrawn);

        return withdrawn;
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get the original deposit balance of a specific depositor
     * @param depositor Address to check balance for
     * @return The original deposit balance of the depositor
     */
    function getBalance(address depositor) external view returns (uint256) {
        return userDeposits[depositor];
    }
    
    /**
     * @dev Get the current aToken balance (original deposits + interest)
     * @return The current aToken balance
     */
    function getATokenBalance() external view returns (uint256) {
        return aWETH.balanceOf(address(this));
    }
    
    /**
     * @dev Get the current claimable interest amount
     * @return The interest amount that can be claimed by the owner
     */
    function getClaimableInterest() external view returns (uint256) {
        uint256 currentATokenBalance = aWETH.balanceOf(address(this));
        if (currentATokenBalance > totalDeposits) {
            return currentATokenBalance - totalDeposits;
        }
        return 0;
    }
    
    /**
     * @dev Get the total contract ETH balance
     * @return The total ETH balance in the contract
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get comprehensive pool information
     * @return totalOriginal Total original deposits without interest
     * @return currentAToken Current aToken balance (with interest)
     * @return claimableInterest Interest that can be claimed
     * @return contractETH ETH balance in contract
     */
    function getPoolInfo() external view returns (
        uint256 totalOriginal,
        uint256 currentAToken,
        uint256 claimableInterest,
        uint256 contractETH
    ) {
        totalOriginal = totalDeposits;
        currentAToken = aWETH.balanceOf(address(this));
        claimableInterest = currentAToken > totalOriginal ? currentAToken - totalOriginal : 0;
        contractETH = address(this).balance;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Emergency function to recover ETH sent directly to contract (only owner)
     * Also unwraps any WETH balance to ETH before withdrawal
     */
    function emergencyWithdrawETH() external onlyOwner {
        uint256 wethBalance = WETH.balanceOf(address(this));
        if (wethBalance > 0) {
            WETH.withdraw(wethBalance);
        }

        uint256 totalBalance = address(this).balance;
        require(totalBalance > 0, "AavePool: No ETH to withdraw");

        // Withdraw ETH not staked in Aave
        (bool success, ) = payable(owner()).call{value: totalBalance}("");
        require(success, "AavePool: ETH transfer failed");

        emit EmergencyWithdrawal(owner(), totalBalance);
    }

    /**
     * @dev Update the factory address (only owner)
     * @param newFactory The new factory contract address
     */
    function setFactory(address newFactory) external onlyOwner {
        require(newFactory != address(0), "AavePool: Invalid factory address");
        factory = newFactory;
    }

    /**
     * @dev Set the SnapFactory address (only owner)
     * @param _snapFactory The SnapFactory contract address
     */
    function setSnapFactory(address _snapFactory) external onlyOwner {
        require(_snapFactory != address(0), "AavePool: Invalid SnapFactory address");
        snapFactory = _snapFactory;
    }

    /**
     * @dev Pause/unpause the system in case of emergencies (only owner)
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit SystemPaused(_paused);
    }

    // ============ FALLBACK FUNCTIONS ============
    
    /**
     * @dev Receive function to accept ETH from WETH withdrawals
     */
    receive() external payable {
        // Only accept ETH from WETH contract
        require(msg.sender == address(WETH), "AavePool: Only WETH can send ETH");
    }
} 