# CreateSeed Quick Reference Guide

## 🚀 Quick Start

### Frontend: Mint a Seed
```typescript
// 1. User opens modal and fills form
handleMintSeed(); // Opens modal

// 2. User confirms mint
const tx = await writeSeed({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  functionName: 'createSeed',
  args: [
    recipientAddress,      // Who gets the NFT
    snapshotPriceWei,     // Min snapshot price
    'berlin',              // Location
    [ben1, ben2, ben3, ben4] // 4 beneficiary indices
  ],
  value: totalSeedCostBigInt
});
```

### Contract: Create Seed
```solidity
function createSeed(
    address seedReceiver,
    uint256 snapshotPrice,
    string calldata location,
    uint256[4] calldata beneficiaryIndexList
) external payable returns (uint256 seedId)
```

---

## 📁 Key Files Reference

### Smart Contracts
| File | Purpose | Key Functions |
|------|---------|---------------|
| `contracts/SeedFactory.sol` | Main factory | `createSeed()`, `withdrawSeedDeposit()` |
| `contracts/SeedNFT.sol` | ERC721 token | `mintSeed()`, `getSeedMetadata()` |
| `contracts/SnapFactory.sol` | Snapshot management | `setSnapshotPriceForSeed()` |
| `contracts/Distributor.sol` | Yield distribution | `distributeInterest()` |

### Frontend
| File | Purpose | Key Functions |
|------|---------|---------------|
| `app/page.tsx` | Main UI | `handleMintSeed()`, `handleConfirmMint()` |
| `lib/hooks/useHomeData.ts` | Data fetching | `fetchAllSeeds()`, `refreshData()` |
| `app/constants/contracts.ts` | Addresses | Contract address exports |
| `app/api/seed-metadata/[tokenId]/route.ts` | Metadata API | `GET()` - returns JSON metadata |

---

## 🔢 Function Parameters

### createSeed() Parameters

```solidity
address seedReceiver        // Recipient of the seed NFT
uint256 snapshotPrice       // Minimum price for snapshots (wei)
string calldata location    // Location metadata ("berlin", etc.)
uint256[4] calldata beneficiaryIndexList  // Array of 4 beneficiary indices
```

**Example Call:**
```solidity
createSeed(
    0x742d35Cc6634C0532925a3b844BC454e4438f44e,  // recipient
    11000000000000000,                           // 0.011 ETH snapshot price
    "berlin",                                     // location
    [1, 2, 3, 4]                                 // beneficiaries
)
{ value: 50000000000000000 }  // 0.05 ETH payment
```

---

## 💰 Payment Structure

### Cost Breakdown

```
User Payment = Seed Price + Seed Fee + Extra Deposit

Example (seedPrice=0.048 ETH, seedFee=5%):
├─ Seed Price:   0.048 ETH  (base cost)
├─ Seed Fee:     0.0024 ETH (5% of price)
├─ Extra Deposit: 0.01 ETH  (optional, user's choice)
└─ TOTAL:        0.0604 ETH

Distribution:
├─ Fee (0.0024) → feeRecipient
└─ Deposit (0.058) → Aave Pool → 4 Beneficiaries (0.0145 each)
```

### Calculation Formula
```solidity
feeAmount = (seedPrice × seedFee) / 10000
totalCost = seedPrice + feeAmount
depositAmount = msg.value - feeAmount
perBeneficiary = depositAmount / 4
```

---

## 🔐 Access Control

### Factory Lock States

| State | Who Can Mint | Check |
|-------|-------------|-------|
| `locked = false` | Anyone | Open to all |
| `locked = true` | Owner only | Owner bypass |
| `locked = true` | Whitelisted seeders | `seederAllowance[user] > 0` |

### Setting Seeder Allowance (Owner Only)
```solidity
// Grant 5 mints to address
seedFactory.setSeederAmount(0xUser..., 5);

// Remove seeder access
seedFactory.setSeederAmount(0xUser..., 0);

// Toggle lock
seedFactory.setLocked(true);  // Lock factory
seedFactory.setLocked(false); // Unlock factory
```

---

## 📊 State Variables

### SeedFactory.sol
```solidity
// Pricing
uint256 public seedPrice;              // Base price (e.g., 0.048 ETH)
uint256 public seedFee;                // Fee % in basis points (e.g., 500 = 5%)
uint256 public defaultSnapshotPrice;   // Default min snapshot price

// Limits
uint256 public maxSeeds;               // Max total seeds
uint256 public lockPeriodSeconds;      // Withdrawal lock period (e.g., 4 years)

// Access
bool public locked;                    // Factory lock status
mapping(address => uint256) public seederAllowance;

// Tracking
mapping(uint256 => uint256) public seedDepositAmount;
mapping(uint256 => bool) public seedWithdrawn;
mapping(uint256 => bool) public seedEarlyWithdrawn;
```

---

## 🎯 Common Operations

### Check Seed Info
```solidity
// Get complete seed info
(
    address owner,
    uint256 depositAmount,
    bool withdrawn,
    uint256 creationTime,
    uint256 snapshotCount
) = seedFactory.getSeedInfo(seedId);

// Get deposit amount only
uint256 deposit = seedFactory.getDepositAmount(seedId);

// Get unlock time
uint256 unlockTime = seedFactory.getUnlockTime(seedId);
```

### Frontend: Read Contract Data
```typescript
// Get seed price
const { data: seedPrice } = useReadContract({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  functionName: 'seedPrice',
});

// Get total seed cost
const { data: totalCost } = useReadContract({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  functionName: 'getTotalSeedCost',
});

// Get beneficiaries
const { data: beneficiaries } = useReadContract({
  address: DISTRIBUTOR_ADDRESS,
  abi: DistributorAbi,
  functionName: 'getAllBeneficiaries',
});
```

---

## ⚙️ Contract Interactions

### createSeed() Calls These Functions:

```
SeedFactory.createSeed()
  │
  ├──► SeedNFT.mintSeed()
  │     └─ _mint() or _safeMint()
  │
  ├──► SnapFactory.setSnapshotPriceForSeed()
  │
  ├──► SnapFactory.updateBeneficiaryTotalValue() × 4
  │     └─ SnapshotNFT.updateBeneficiaryTotalValue()
  │
  └──► AavePool.deposit()
        └─ Wrap ETH, deposit to Aave V3
```

---

## 🔄 Withdrawal Logic

### Withdrawal Penalty Formula
```solidity
elapsed = block.timestamp - creationTime
basisPoints = (elapsed × 10000) / lockPeriodSeconds
remainingBasisPoints = 10000 - basisPoints
taxAmount = (originalDeposit × remainingBasisPoints) / 10000
userAmount = originalDeposit - taxAmount
```

### Example Timeline (4-year lock)
```
Time          Elapsed    Tax Rate    User Gets    Burn Gets
───────────────────────────────────────────────────────────
Immediately   0 days     100%        0.00 ETH     0.05 ETH
6 months      183 days   87.5%       0.00625 ETH  0.04375 ETH
1 year        365 days   75%         0.0125 ETH   0.0375 ETH
2 years       730 days   50%         0.025 ETH    0.025 ETH
3 years       1095 days  25%         0.0375 ETH   0.0125 ETH
4 years+      1460 days  0%          0.05 ETH     0.00 ETH
```

---

## 🎨 Events

### Emitted by createSeed()
```solidity
event SeedCreated(uint256 indexed seedId, address indexed creator);
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId); // ERC721
event MaxSeedDepositUpdated(uint256 indexed seedId, uint256 newMaxDeposit);
event FeeCollected(address indexed recipient, uint256 amount);
```

### Listening to Events (Frontend)
```typescript
// Watch for SeedCreated events
const { data: logs } = useWatchContractEvent({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  eventName: 'SeedCreated',
  onLogs: (logs) => {
    console.log('New seed created:', logs);
    refreshData(); // Refresh UI
  },
});
```

---

## 🛠️ Admin Functions (Owner Only)

### Configuration
```solidity
// Pricing
setSeedPrice(uint256 newPrice)
setSeedFee(uint256 newFee)              // Basis points (500 = 5%)
setDefaultSnapshotPrice(uint256 price)

// Limits
setMaxSeeds(uint256 newMax)

// Timing
setLockPeriodSeconds(uint256 seconds)

// Access
setLocked(bool locked)
setSeederAmount(address seeder, uint256 amount)

// Addresses
setSeedContract(address newContract)
setPool(address newPool)
setSnapFactory(address newFactory)
setDistributor(address newDistributor)
setBurnRecipient(address recipient)
setFeeRecipient(address recipient)
```

---

## 🧪 Testing

### Foundry Tests
```bash
# Run all tests
forge test

# Run specific test
forge test --match-test testCreateSeed -vvvv

# Test with specific seed price
forge test --match-test testCreateSeed --fork-url <RPC_URL>
```

### Frontend Testing
```typescript
// Check connection
const { address, isConnected } = useAccount();
console.log('Connected:', isConnected, 'Address:', address);

// Check network
const { chain } = useAccount();
console.log('Chain ID:', chain?.id, 'Expected: 8453');

// Monitor transaction
const { isLoading, isSuccess, isError } = 
  useWaitForTransactionReceipt({ hash: txHash });
```

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `LocationCannotBeEmpty` | Empty location string | Provide location (e.g., "berlin") |
| `SnapshotPriceMustBeGreaterThanOrEqualToDefault` | Price too low | Use `defaultSnapshotPrice` or higher |
| `SeedCapReached` | Max seeds minted | Increase `maxSeeds` or wait |
| `FactoryLockedOnlyOwnerOrSeedersAllowed` | Factory locked | Unlock factory or grant seeder allowance |
| `InsufficientPaymentForMinimumSeedPriceAndFee` | Payment too low | Send at least `getTotalSeedCost()` |
| `InvalidBeneficiaryIndex` | Invalid beneficiary | Use active beneficiary index |

---

## 📈 Gas Costs

| Operation | Gas | Cost (0.1 gwei) | Cost ($2500 ETH) |
|-----------|-----|-----------------|-------------------|
| createSeed() | ~288,000 | 0.0000288 ETH | $0.072 |
| withdrawSeedDeposit() | ~150,000 | 0.000015 ETH | $0.0375 |
| Transfer seed NFT | ~50,000 | 0.000005 ETH | $0.0125 |

---

## 🌐 Network Info

| Network | Chain ID | RPC URL | Block Explorer |
|---------|----------|---------|----------------|
| Base Mainnet | 8453 | https://mainnet.base.org | https://basescan.org |
| Base Sepolia | 84532 | https://sepolia.base.org | https://sepolia.basescan.org |

### Contract Addresses (Base Mainnet)
```typescript
SEED_FACTORY_ADDRESS:  "0x..."  // Main factory
SEED_NFT_ADDRESS:      "0x..."  // ERC721 token
SNAPSHOT_NFT_ADDRESS:  "0x..."  // Snapshot tokens
DISTRIBUTOR_ADDRESS:   "0x..."  // Interest distributor
AAVE_POOL_ADDRESS:     "0x..."  // Aave V3 pool
```

---

## 🔗 Related Functions

### After Creating a Seed

**Withdraw Deposit:**
```solidity
// After lock period
seedFactory.withdrawSeedDeposit(seedId);

// Or specify destination
seedFactory.withdrawSeedDepositTo(seedId, destinationAddress);
```

**Create Snapshot:**
```solidity
snapFactory.createSnapshot(
    seedId,
    beneficiaryIndex,
    processId
) { value: snapshotPrice }
```

**Transfer Seed:**
```solidity
seedNFT.transferFrom(from, to, seedId);
// or
seedNFT.safeTransferFrom(from, to, seedId);
```

**Claim Interest (Owner/Operator):**
```solidity
seedFactory.claimPoolInterest(true); // Claim and distribute
```

---

## 📚 Resources

### Documentation
- **Full Analysis**: `SEED_CREATION_ANALYSIS.md`
- **Flowchart**: `SEED_CREATION_FLOWCHART.md`
- **This Guide**: `SEED_CREATION_QUICK_REFERENCE.md`

### Code Locations
- **Smart Contracts**: `/contracts/`
- **Frontend**: `/app/`, `/components/`, `/lib/`
- **ABIs**: `/abi/`
- **Constants**: `/app/constants/`

### External Links
- **Base Network**: https://base.org
- **Aave V3 Docs**: https://docs.aave.com/developers/
- **Wagmi Docs**: https://wagmi.sh
- **Next.js Docs**: https://nextjs.org/docs

---

## 💡 Tips & Best Practices

### For Users
1. **Check network** before minting (Base Mainnet required)
2. **Send extra ETH** to increase seed deposit (goes to Aave)
3. **Choose beneficiaries** carefully (can't change after mint)
4. **Wait for lock period** to avoid withdrawal penalties
5. **Keep seed NFT** to maintain withdrawal rights

### For Developers
1. **Always validate** beneficiary indices exist and are active
2. **Handle transaction errors** gracefully in UI
3. **Show loading states** during transaction confirmation
4. **Refresh data** after successful transactions
5. **Use `getTotalSeedCost()`** for minimum payment amount

### For Admins
1. **Set reasonable** `maxSeeds` to prevent unbounded loops
2. **Monitor fee recipient** balance for collected fees
3. **Claim interest regularly** to distribute to beneficiaries
4. **Lock factory** if you want controlled minting
5. **Test changes** on testnet first

---

**Generated**: 2025-10-17
**Version**: 1.0
**Network**: Base Mainnet (Chain ID: 8453)

