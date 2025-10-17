# CreateSeed Visual Flowchart

## Complete Flow from User Click to Blockchain Confirmation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                         🌐 FRONTEND (Next.js/React)                          │
│                         File: app/page.tsx                                   │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                │  [1] User clicks "Mint Seed" button
                                │      handleMintSeed()
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              📋 MODAL FORM                                    │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Snapshot Price: [0.011 ETH]                                        │   │
│   │                                                                      │   │
│   │  Recipient Address: [0x742d35Cc6634C0532925a3b8...] [Use My Address]│  │
│   │                                                                      │   │
│   │  Beneficiary 1: [▼ Artist Fund]                                    │   │
│   │  Beneficiary 2: [▼ Community Treasury]                             │   │
│   │  Beneficiary 3: [▼ Development Team]                               │   │
│   │  Beneficiary 4: [▼ Marketing Budget]                               │   │
│   │                                                                      │   │
│   │            [Cancel]  [Confirm & Mint]                               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                │  [2] User clicks "Confirm & Mint"
                                │      handleConfirmMint()
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ✅ FRONTEND VALIDATION                                │
│                                                                               │
│   [✓] Wallet connected?            → address !== null                       │
│   [✓] Valid recipient address?     → 0x... (42 chars)                       │
│   [✓] On correct network?          → Base Mainnet (8453)                    │
│   [✓] Valid snapshot price?        → > 0                                    │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                │  [3] Build transaction arguments
                                │      parseEther(), convert beneficiaries
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      🔧 TRANSACTION PREPARATION                              │
│                      Hook: useWriteContract (Wagmi)                          │
│                                                                               │
│   Contract: SEED_FACTORY_ADDRESS                                             │
│   Function: createSeed(address, uint256, string, uint256[4])                │
│   Args:     [recipientAddress, snapshotPriceWei, 'berlin', [1,2,3,4]]      │
│   Value:    totalSeedCostBigInt (e.g., 50000000000000000 wei)              │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                │  [4] Send to user's wallet
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        👛 WALLET SIGNATURE REQUEST                           │
│                        (MetaMask/WalletConnect/Coinbase)                     │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Confirm Transaction                                                 │   │
│   │                                                                      │   │
│   │  To: SeedFactory (0xABC...DEF)                                      │   │
│   │  Function: createSeed                                               │   │
│   │  Value: 0.05 ETH                                                    │   │
│   │  Gas: ~288,000                                                      │   │
│   │                                                                      │   │
│   │               [Reject]  [Confirm]                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                │  [5] User confirms
                                │      Transaction signed and broadcasted
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                        🌍 BLOCKCHAIN (Base Mainnet)                          │
│                        Transaction enters mempool                            │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                │  [6] Transaction mined in block
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                    ⚙️  CONTRACT EXECUTION: SeedFactory.sol                   │
│                    Function: createSeed() - Line 290                         │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                │  [7] Execute contract logic
                                ▼
        ┌───────────────────────┴──────────────────────┐
        │                                               │
        │   STEP 1: Input Validation                   │  (~5,000 gas)
        │   ├── Check location not empty               │
        │   ├── Check snapshot price >= default        │
        │   └── Check seed cap not reached             │
        │                                               │
        └───────────────────────┬───────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │                                               │
        │   STEP 2: Beneficiary Validation             │  (~10,000 gas)
        │   └── Count valid beneficiaries (4)          │
        │                                               │
        └───────────────────────┬───────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │                                               │
        │   STEP 3: Access Control                     │  (~5,000 gas)
        │   ├── Check if factory locked                │
        │   └── Verify seeder allowance                │
        │                                               │
        └───────────────────────┬───────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │                                               │
        │   STEP 4: Payment Calculation                │  (~10,000 gas)
        │   ├── feeAmount = (price × fee) / 10000      │
        │   ├── totalCost = price + fee                │
        │   ├── depositAmount = remaining / 4 × 4      │
        │   └── dust → feeAmount                       │
        │                                               │
        │   Example:                                    │
        │   • User sends: 0.05 ETH                     │
        │   • Fee (5%): 0.00125 ETH                    │
        │   • Deposit: 0.04875 ETH                     │
        │   • Per beneficiary: 0.0121875 ETH           │
        │                                               │
        └───────────────────────┬───────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │                                               │
        │   STEP 5: Mint Seed NFT ──────────┐          │  (~50,000 gas)
        │                                    │          │
        │   SeedNFT.mintSeed()              │          │
        │   ├── Generate tokenId (e.g., 42) │          │
        │   ├── Store metadata:              │          │
        │   │   • creationTime               │          │
        │   │   • creationBlock              │          │
        │   │   • location: "berlin"         │          │
        │   └── _mint(recipient, tokenId)    │          │
        │                                    │          │
        └────────────────────────┬───────────┘──────────┘
                                │
                                │   seedId = 42
                                ▼
        ┌───────────────────────────────────────────────┐
        │                                               │
        │   STEP 6: Set Snapshot Price ─────────┐      │  (~20,000 gas)
        │                                        │      │
        │   SnapFactory.setSnapshotPriceForSeed()│     │
        │   └── seedSnapshotPrices[42] = 0.011 ETH│    │
        │                                        │      │
        └────────────────────────┬───────────────┘──────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │                                               │
        │   STEP 7: Update Beneficiaries (Loop 4×)     │  (~80,000 gas)
        │                                               │
        │   For each beneficiary [1, 2, 3, 4]:         │
        │   ├── SnapFactory.updateBeneficiaryTotalValue()│
        │   └── Add 0.0121875 ETH to beneficiary tracking│
        │                                               │
        │   Beneficiary Tracking:                       │
        │   • Beneficiary 1: +0.0121875 ETH            │
        │   • Beneficiary 2: +0.0121875 ETH            │
        │   • Beneficiary 3: +0.0121875 ETH            │
        │   • Beneficiary 4: +0.0121875 ETH            │
        │                                               │
        └───────────────────────┬───────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │                                               │
        │   STEP 8: Deposit to Aave ────────────┐      │  (~100,000 gas)
        │                                        │      │
        │   AavePool.deposit{value: 0.04875 ETH}()│    │
        │   ├── Wrap ETH → WETH                  │      │
        │   ├── Deposit WETH to Aave V3          │      │
        │   ├── Receive aWETH (interest-bearing) │      │
        │   └── Start earning yield              │      │
        │                                        │      │
        └────────────────────────┬───────────────┘──────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │                                               │
        │   STEP 9: Transfer Fee                       │  (~21,000 gas)
        │   └── Send 0.00125 ETH to feeRecipient      │
        │                                               │
        └───────────────────────┬───────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │                                               │
        │   STEP 10: Emit Events                       │  (~5,000 gas)
        │   ├── SeedCreated(42, 0xUser...)             │
        │   ├── Transfer(0x0, 0xRecipient, 42)         │
        │   ├── MaxSeedDepositUpdated(42, 0.04875)     │
        │   └── FeeCollected(0xFeeRecipient, 0.00125)  │
        │                                               │
        └───────────────────────┬───────────────────────┘
                                │
                                │  [8] Return seedId
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                        ✅ TRANSACTION CONFIRMED                              │
│                        Block: 12,345,678                                     │
│                        Gas Used: 288,000                                     │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                │  [9] Frontend detects confirmation
                                │      useWaitForTransactionReceipt
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        📱 FRONTEND STATE UPDATE                              │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  ✅ Seed minted successfully!                                        │   │
│   │     Transaction: 0xABC...XYZ                                         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   • mintSeedSuccess = true                                                   │
│   • refetchSeedCount() → seedCount = 42                                      │
│   • refreshData() → fetch new seed data                                      │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                │  [10] UI updates
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🎨 SEED GALLERY UPDATED                               │
│                                                                               │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                              │
│   │ 🌱  │  │ 🌱  │  │ 🌱  │  │ 🌱  │  │ 🌱  │  ← NEW!                        │
│   │  38 │  │  39 │  │  40 │  │  41 │  │  42 │                              │
│   └─────┘  └─────┘  └─────┘  └─────┘  └─────┘                              │
│                                                                               │
│   New seed appears in gallery with:                                          │
│   • Token ID: #42                                                            │
│   • Image: /seed42/seed.png                                                  │
│   • Owner: 0xRecipient...                                                    │
│   • Clickable link to seed detail page                                       │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                            📊 FINAL STATE CHANGES
═══════════════════════════════════════════════════════════════════════════════

🎫 NFT Created:
   • Seed #42 minted to recipient
   • Metadata stored on-chain
   • Transferable ERC721 token

💰 Financial State:
   • 0.00125 ETH → Fee recipient
   • 0.04875 ETH → Aave (earning yield)
   • seedDepositAmount[42] = 0.04875 ETH

👥 Beneficiary Allocation:
   • Beneficiary 1 total += 0.0121875 ETH
   • Beneficiary 2 total += 0.0121875 ETH
   • Beneficiary 3 total += 0.0121875 ETH
   • Beneficiary 4 total += 0.0121875 ETH

⚙️ System State:
   • totalSeeds = 42
   • currentMaxSeedDeposit updated (if applicable)
   • Snapshot price set for seed 42

⏰ Time Locks:
   • Withdrawal locked until: now + lockPeriodSeconds
   • Early withdrawal: incurs decreasing penalty
   • After lock: full withdrawal available

═══════════════════════════════════════════════════════════════════════════════
```

## Event Timeline

```
Time     Event                                    Actor
────────────────────────────────────────────────────────────────────────────
T+0s     User clicks "Mint Seed"                 User
T+2s     Modal opens, user fills form            User
T+10s    User clicks "Confirm & Mint"            User
T+11s    Wallet signature request appears        Wallet
T+15s    User signs transaction                  User
T+16s    Transaction broadcasted                 RPC Node
T+18s    Transaction enters mempool              Base Network
T+20s    Transaction mined in block              Base Validator
T+20s    createSeed() executes                   SeedFactory Contract
T+20s    ├─ mintSeed() called                    SeedNFT Contract
T+20s    ├─ setSnapshotPriceForSeed() called    SnapFactory Contract
T+20s    ├─ updateBeneficiaryTotalValue() × 4   SnapshotNFT Contract
T+20s    ├─ deposit() called                     AavePool Contract
T+20s    └─ Events emitted                       All Contracts
T+22s    Transaction confirmed                   Base Network
T+23s    Frontend detects confirmation           useWaitForTransactionReceipt
T+24s    Success message displayed               UI
T+25s    Seed gallery refreshed                  useHomeData hook
T+26s    New seed #42 visible                    Gallery Component
```

## Gas Breakdown

```
┌─────────────────────────────┬────────────┬────────────────┐
│ Operation                   │ Gas Used   │ Percentage     │
├─────────────────────────────┼────────────┼────────────────┤
│ Input validation            │   ~5,000   │      2%        │
│ Access control check        │   ~5,000   │      2%        │
│ Payment calculations        │  ~10,000   │      3%        │
│ NFT minting                 │  ~50,000   │     17%        │
│ Set snapshot price          │  ~20,000   │      7%        │
│ Update beneficiaries (4×)   │  ~80,000   │     28%        │
│ Aave deposit                │ ~100,000   │     35%        │
│ Fee transfer                │  ~21,000   │      7%        │
│ Event emissions             │   ~5,000   │      2%        │
├─────────────────────────────┼────────────┼────────────────┤
│ TOTAL                       │ ~288,000   │    100%        │
└─────────────────────────────┴────────────┴────────────────┘

At 0.1 gwei gas price:
Cost = 288,000 × 0.1 gwei = 0.0000288 ETH (~$0.072 at $2,500 ETH)
```

## State Diagram

```
                      ┌─────────────────┐
                      │   Seed NFT      │
                      │   Not Exists    │
                      └────────┬────────┘
                               │
                               │ createSeed()
                               │ payable
                               ▼
                      ┌─────────────────┐
                      │   Seed NFT      │
                      │   Minted        │
                      │   • Owner set   │
                      │   • In Aave     │
                      │   • Locked      │
                      └────────┬────────┘
                               │
                               │ Time passes...
                               │ Interest accrues...
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            │ < lockPeriod     │ ≥ lockPeriod     │
            ▼                  ▼                  │
   ┌────────────────┐ ┌────────────────┐         │
   │ Early          │ │ Full           │         │
   │ Withdrawal     │ │ Withdrawal     │         │
   │ • With penalty │ │ • No penalty   │         │
   └────────┬───────┘ └────────┬───────┘         │
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │   Seed NFT      │
                      │   Withdrawn     │
                      │   • Aave funds  │
                      │     returned    │
                      │   • NFT remains │
                      └─────────────────┘
```

---

**Generated**: 2025-10-17
**Purpose**: Visual reference for createSeed transaction flow

