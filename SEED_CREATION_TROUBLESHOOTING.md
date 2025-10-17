# CreateSeed Troubleshooting Guide

## 🔍 Diagnostic Checklist

Before investigating specific errors, verify these basics:

```typescript
// 1. Check wallet connection
const { address, isConnected } = useAccount();
console.log('Wallet connected:', isConnected);
console.log('Address:', address);

// 2. Check network
const { chain } = useAccount();
console.log('Current chain:', chain?.id);
console.log('Expected chain: 8453 (Base Mainnet)');

// 3. Check contract addresses
console.log('SeedFactory:', SEED_FACTORY_ADDRESS);
console.log('SeedNFT:', SEED_NFT_ADDRESS);

// 4. Check seed price
const { data: seedPrice } = useReadContract({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  functionName: 'seedPrice',
});
console.log('Seed price:', seedPrice);

// 5. Check factory lock status
const { data: locked } = useReadContract({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  functionName: 'locked',
});
console.log('Factory locked:', locked);
```

---

## ❌ Common Errors & Solutions

### 1. "Connect your wallet first"

**Error Message:** Alert box in UI
**Cause:** Wallet not connected
**Solution:**
```typescript
// User needs to click connect button in header
<ConnectWalletButton />
```

**Check:**
- Is Privy/WalletConnect initialized?
- Does user have a wallet installed?
- Is popup blocked in browser?

---

### 2. "Please enter a valid Ethereum address"

**Error Message:** Alert box in UI
**Cause:** Invalid recipient address format
**Solution:**
```typescript
// Address must be:
// - 42 characters long
// - Start with "0x"
// - Contain only hex characters

// Valid: 0x742d35Cc6634C0532925a3b844BC454e4438f44e
// Invalid: 742d35Cc... (missing 0x)
// Invalid: 0x742d35 (too short)
```

**Quick Fix:**
- Use "Use My Address" button to auto-fill
- Copy address from wallet/explorer
- Verify checksum using ethers.js

---

### 3. Factory Locked Error

**Contract Error:** `FactoryLockedOnlyOwnerOrSeedersAllowed()`
**Cause:** Factory is locked and user is not whitelisted
**Solution (Admin):**
```solidity
// Option 1: Unlock factory
seedFactory.setLocked(false);

// Option 2: Grant seeder allowance
seedFactory.setSeederAmount(userAddress, 5); // 5 mints
```

**Check if you're a seeder:**
```typescript
const { data: allowance } = useReadContract({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  functionName: 'getSeederAllowance',
  args: [address],
});
console.log('Your allowance:', allowance);
```

---

### 4. Insufficient Payment Error

**Contract Error:** `InsufficientPaymentForMinimumSeedPriceAndFee()`
**Cause:** User didn't send enough ETH
**Solution:**

```typescript
// Get minimum required amount
const { data: totalCost } = useReadContract({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  functionName: 'getTotalSeedCost',
});

console.log('Minimum required:', formatEther(totalCost), 'ETH');

// User must send at least this amount
value: totalCost  // or higher
```

**Calculation:**
```
Required = seedPrice + (seedPrice × seedFee / 10000)

Example:
seedPrice = 0.048 ETH
seedFee = 500 (5%)
Required = 0.048 + (0.048 × 500 / 10000) = 0.0504 ETH
```

---

### 5. Seed Cap Reached

**Contract Error:** `SeedCapReached()`
**Cause:** Maximum number of seeds has been minted
**Solution (Admin):**
```solidity
// Check current counts
uint256 current = seedFactory.seedContract().getTotalSeeds();
uint256 max = seedFactory.maxSeeds();
console.log(`Seeds: ${current}/${max}`);

// Increase cap
seedFactory.setMaxSeeds(newMax);
```

**Note:** Owner can mint even when cap is reached

---

### 6. Location Cannot Be Empty

**Contract Error:** `LocationCannotBeEmpty()`
**Cause:** Empty string passed for location parameter
**Solution:**
```typescript
// Frontend currently hardcodes 'berlin'
args: [recipientAddress, snapshotPriceWei, 'berlin', beneficiaryIndexList]

// If you want dynamic locations:
const location = userLocation.trim() || 'berlin';
if (location.length === 0) {
  alert('Please provide a location');
  return;
}
```

---

### 7. Invalid Beneficiary Index

**Contract Error:** `InvalidBeneficiaryIndex()`
**Cause:** Selected beneficiary doesn't exist or is inactive
**Solution:**

```typescript
// Get valid beneficiaries
const { data: beneficiaries } = useReadContract({
  address: DISTRIBUTOR_ADDRESS,
  abi: DistributorAbi,
  functionName: 'getAllBeneficiaries',
});

// Filter active beneficiaries
const activeBeneficiaries = beneficiaries.filter((b, index) => {
  // Check if beneficiary is active
  const isActive = b.active;
  const hasAddress = b.address !== '0x0000000000000000000000000000000000000000';
  return isActive && hasAddress && index !== 0; // Skip beneficiary 0
});

// Use these indices in dropdown
```

**Common Causes:**
- Beneficiary was deactivated
- Beneficiary address is 0x0
- Beneficiary index > total beneficiary count
- Using beneficiary index 0 (reserved)

---

### 8. Snapshot Price Too Low

**Contract Error:** `SnapshotPriceMustBeGreaterThanOrEqualToDefault()`
**Cause:** Snapshot price below default minimum
**Solution:**

```typescript
// Get default snapshot price
const { data: defaultPrice } = useReadContract({
  address: SNAP_FACTORY_ADDRESS,
  abi: SnapFactoryAbi,
  functionName: 'defaultSnapshotPrice',
});

// Ensure user input is at least this much
const snapshotPriceWei = parseEther(snapshotPriceInput);
if (snapshotPriceWei < defaultPrice) {
  alert(`Minimum snapshot price is ${formatEther(defaultPrice)} ETH`);
  return;
}
```

---

### 9. Wrong Network Error

**UI Warning:** "Please connect to Base Mainnet"
**Cause:** Wallet connected to wrong network
**Solution:**

```typescript
// Detect network mismatch
const { chain } = useAccount();
const isOnCorrectNetwork = chain?.id === 8453;

if (!isOnCorrectNetwork) {
  // Prompt user to switch
  await switchChain({ chainId: 8453 });
}
```

**Manual Switch:**
1. Open wallet (MetaMask/Coinbase Wallet)
2. Click network dropdown
3. Select "Base Mainnet"
4. Refresh page

**Add Base Network (if not showing):**
```json
{
  "chainId": "0x2105",
  "chainName": "Base Mainnet",
  "rpcUrls": ["https://mainnet.base.org"],
  "nativeCurrency": {
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "blockExplorerUrls": ["https://basescan.org"]
}
```

---

### 10. Transaction Reverted (Unknown)

**Error:** Transaction fails without specific error
**Debugging Steps:**

```typescript
// 1. Check transaction on block explorer
console.log('Transaction hash:', txHash);
// Visit: https://basescan.org/tx/{txHash}

// 2. Try with more gas
const tx = await writeSeed({
  ...args,
  gas: 500000n, // Increase gas limit
});

// 3. Check contract state
const { data: locked } = useReadContract({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  functionName: 'locked',
});

const { data: maxSeeds } = useReadContract({
  address: SEED_FACTORY_ADDRESS,
  abi: SeedFactoryAbi,
  functionName: 'maxSeeds',
});

const { data: totalSeeds } = useReadContract({
  address: SEED_NFT_ADDRESS,
  abi: SeedNFTAbi,
  functionName: 'getTotalSeeds',
});

console.log('Factory locked:', locked);
console.log('Seeds:', totalSeeds, '/', maxSeeds);
```

---

### 11. Metamask Errors

#### "Transaction Underpriced"
**Cause:** Gas price too low
**Solution:**
```typescript
// Let wallet handle gas estimation
// Or manually set higher gas
maxFeePerGas: parseGwei('0.5'),
maxPriorityFeePerGas: parseGwei('0.1'),
```

#### "Nonce Too Low"
**Cause:** Previous transaction still pending
**Solution:**
- Wait for previous transaction to confirm
- Or speed up/cancel previous transaction in MetaMask
- Clear MetaMask activity & nonce data (Settings > Advanced > Reset Account)

#### "User Rejected Transaction"
**Cause:** User clicked "Reject" in wallet
**Solution:** User must click "Confirm" to proceed

---

### 12. Page Not Updating After Mint

**Symptom:** Success message shows but seed doesn't appear
**Cause:** Data not refreshed
**Solution:**

```typescript
// Ensure refetch is called after success
useEffect(() => {
  if (mintSeedSuccess) {
    refetchSeedCount();
    refreshData();
  }
}, [mintSeedSuccess]);

// Or manually trigger
const handleSuccess = async () => {
  await refetchSeedCount();
  await refreshData();
  setMintSeedTxHash(undefined); // Reset for next mint
};
```

---

### 13. Image Not Loading

**Symptom:** Seed shows but image is broken
**Causes:**
1. Image doesn't exist in blob storage
2. Wrong URL format
3. CORS issue

**Solutions:**

```typescript
// Check image URL
const imageUrl = `${VERCEL_BLOB_STORAGE_URL}/seed${tokenId}/seed.png`;
console.log('Image URL:', imageUrl);

// Test URL directly
fetch(imageUrl, { method: 'HEAD' })
  .then(res => console.log('Image exists:', res.ok))
  .catch(err => console.error('Image error:', err));

// Fallback to placeholder
const [brokenImages, setBrokenImages] = useState({});
<img
  src={imageUrl}
  onError={() => setBrokenImages(prev => ({...prev, [tokenId]: true}))}
/>
{brokenImages[tokenId] && <div>🌱</div>}
```

---

## 🔧 Advanced Debugging

### Enable Verbose Logging

```typescript
// Frontend
const handleConfirmMint = async () => {
  console.log('=== MINT START ===');
  console.log('Recipient:', recipientAddress);
  console.log('Snapshot price:', snapshotPriceEthInput);
  console.log('Beneficiaries:', selectedBeneficiaries);
  console.log('Total cost:', totalSeedCostBigInt);
  
  try {
    const tx = await writeSeed({...args});
    console.log('Transaction hash:', tx);
  } catch (error) {
    console.error('Mint error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  }
};
```

### Contract State Inspection

```solidity
// Read all relevant state
forge inspect SeedFactory storage --pretty

// Call view functions
cast call $SEED_FACTORY "seedPrice()(uint256)"
cast call $SEED_FACTORY "seedFee()(uint256)"
cast call $SEED_FACTORY "locked()(bool)"
cast call $SEED_FACTORY "maxSeeds()(uint256)"
```

### Simulate Transaction (Tenderly/Foundry)

```bash
# Foundry simulation
forge script script/TestMint.s.sol --fork-url $RPC_URL

# Or use Tenderly
# Upload transaction to https://dashboard.tenderly.co/simulator
```

---

## 🧪 Test Scenarios

### Test 1: Normal Mint
```typescript
// Expected: Success
{
  recipient: '0x742d...44e',
  snapshotPrice: parseEther('0.011'),
  location: 'berlin',
  beneficiaries: [1, 2, 3, 4],
  value: parseEther('0.05')
}
```

### Test 2: Minimum Payment
```typescript
// Expected: Success
{
  recipient: '0x742d...44e',
  snapshotPrice: parseEther('0.011'),
  location: 'berlin',
  beneficiaries: [1, 2, 3, 4],
  value: getTotalSeedCost() // Exact minimum
}
```

### Test 3: Below Minimum
```typescript
// Expected: Fail - InsufficientPaymentForMinimumSeedPriceAndFee
{
  recipient: '0x742d...44e',
  snapshotPrice: parseEther('0.011'),
  location: 'berlin',
  beneficiaries: [1, 2, 3, 4],
  value: parseEther('0.01') // Too low
}
```

### Test 4: Invalid Beneficiary
```typescript
// Expected: Fail - InvalidBeneficiaryIndex
{
  recipient: '0x742d...44e',
  snapshotPrice: parseEther('0.011'),
  location: 'berlin',
  beneficiaries: [999, 2, 3, 4], // 999 doesn't exist
  value: parseEther('0.05')
}
```

### Test 5: Empty Location
```typescript
// Expected: Fail - LocationCannotBeEmpty
{
  recipient: '0x742d...44e',
  snapshotPrice: parseEther('0.011'),
  location: '', // Empty
  beneficiaries: [1, 2, 3, 4],
  value: parseEther('0.05')
}
```

---

## 🩺 Health Check Script

```typescript
// Run this to check system health
export async function healthCheck() {
  console.log('🏥 System Health Check\n');
  
  // 1. Contracts reachable
  try {
    const price = await publicClient.readContract({
      address: SEED_FACTORY_ADDRESS,
      abi: SeedFactoryAbi,
      functionName: 'seedPrice',
    });
    console.log('✅ SeedFactory: Online');
  } catch {
    console.log('❌ SeedFactory: Offline');
  }
  
  // 2. Seed count
  const seedCount = await publicClient.readContract({
    address: SEED_NFT_ADDRESS,
    abi: SeedNFTAbi,
    functionName: 'getTotalSeeds',
  });
  console.log('✅ Total seeds:', seedCount.toString());
  
  // 3. Factory lock status
  const locked = await publicClient.readContract({
    address: SEED_FACTORY_ADDRESS,
    abi: SeedFactoryAbi,
    functionName: 'locked',
  });
  console.log(locked ? '🔒 Factory: Locked' : '🔓 Factory: Unlocked');
  
  // 4. Max seeds check
  const maxSeeds = await publicClient.readContract({
    address: SEED_FACTORY_ADDRESS,
    abi: SeedFactoryAbi,
    functionName: 'maxSeeds',
  });
  const remaining = Number(maxSeeds) - Number(seedCount);
  console.log('✅ Remaining slots:', remaining);
  
  // 5. Pricing
  const totalCost = await publicClient.readContract({
    address: SEED_FACTORY_ADDRESS,
    abi: SeedFactoryAbi,
    functionName: 'getTotalSeedCost',
  });
  console.log('💰 Min cost:', formatEther(totalCost), 'ETH');
  
  console.log('\n✅ Health check complete');
}
```

---

## 📞 Support Resources

### Documentation
- **Full Analysis**: `SEED_CREATION_ANALYSIS.md`
- **Quick Reference**: `SEED_CREATION_QUICK_REFERENCE.md`
- **Flowchart**: `SEED_CREATION_FLOWCHART.md`

### Code Exploration
```bash
# Search for specific functionality
grep -r "createSeed" contracts/
grep -r "handleMintSeed" app/

# Find all error definitions
grep -r "error " contracts/SeedFactory.sol

# Find event emissions
grep -r "emit " contracts/SeedFactory.sol
```

### Useful Commands

```bash
# Check seed count
cast call $SEED_FACTORY "seedContract()(address)"
cast call $SEED_NFT "getTotalSeeds()(uint256)"

# Check if address is seeder
cast call $SEED_FACTORY "getSeederAllowance(address)(uint256)" $ADDRESS

# Check seed info
cast call $SEED_FACTORY "getSeedInfo(uint256)(address,uint256,bool,uint256,uint256)" 1
```

---

## 🆘 Emergency Procedures

### If Factory is Stuck
```solidity
// Owner can:
1. Unlock factory: setLocked(false)
2. Increase max seeds: setMaxSeeds(newMax)
3. Update seed price: setSeedPrice(newPrice)
4. Update fee recipient: setFeeRecipient(newRecipient)
```

### If Transaction Keeps Failing
```typescript
1. Clear MetaMask nonce (Settings > Advanced > Reset Account)
2. Switch to different RPC endpoint
3. Try with higher gas limit
4. Check contract is not paused/locked
5. Verify all inputs are valid
```

### If Seed Data Not Showing
```typescript
1. Check API route: /api/seed-metadata/[tokenId]
2. Verify blob storage URLs
3. Check CORS settings
4. Try hard refresh (Ctrl+Shift+R)
5. Check browser console for errors
```

---

**Last Updated**: 2025-10-17
**Maintainer**: Way of Flowers Dev Team
**Status**: Active

