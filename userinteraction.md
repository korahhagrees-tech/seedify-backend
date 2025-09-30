## SeedNFT

- User interactions (public)
  - (none; seeds are minted via factory)
- Views (user-relevant)
  - getSeedsByOwner(address owner) returns (uint256[])
  - getSeedMetadata(uint256 seedId) returns (uint256 timestamp, uint256 blockNumber)
  - getSeedLocation(uint256 seedId) returns (string)
  - seedCreationTime(uint256 seedId) returns (uint256)
  - tokenURI(uint256 tokenId) returns (string)
  - getTotalSeeds() returns (uint256)

## SeedFactory

- User interactions (permissionless; holder-gated where noted)
  - withdrawSeedDeposit(uint256 seedId)
  - withdrawSeedDepositTo(uint256 seedId, address destination)
 - Views (user-relevant)
  - getTotalSeedCost() returns (uint256)
  - seedSnapshotPrices(uint256 seedId) returns (uint256)
  - getSeedInfo(uint256 seedId) returns (address owner, uint256 depositAmount, bool withdrawn, uint256 creationTime, uint256 snapshotCount)
  - getDepositOwner(uint256 seedId) returns (address)
  - isSeedEarlyWithdrawn(uint256 seedId) returns (bool)
  - getDepositAmount(uint256 seedId) returns (uint256)
  - getUnlockTime(uint256 seedId) returns (uint256)
  - getDynamicSeedPercentage(uint256 seedId) returns (uint256 percentageBPS)
  - validateSeedForSnapshot(uint256 seedId) returns (bool)

## SnapshotNFT

- User interactions (public)
  - (reads only; snapshots are minted via SnapFactory)
- Views (user-relevant)
  - getUserSnapshots(address user) returns (uint256[])
  - getSeedSnapshotPrice(uint256 seedId) returns (uint256)
  - getSnapshotData(uint256 snapshotId) returns (SnapshotData)
  - getSeedSnapshots(uint256 seedId) returns (uint256[])
  - getBeneficiarySnapshots(uint256 beneficiaryIndex) returns (uint256[])
  - getSeedSnapshotCount(uint256 seedId) returns (uint256)
  - getBeneficiaryTotalValue(uint256 beneficiaryIndex) returns (uint256)
  - getUserSnapshotData(address user) returns (SnapshotData[])
  - getSeedSnapshotData(uint256 seedId) returns (SnapshotData[])
  - seedURI(uint256 seedId) returns (string)
  - tokenURI(uint256 tokenId) returns (string)
  - getTotalValueRaised() returns (uint256)

## SnapFactory

- User interactions
  - (none; snapshot minting may require allowance/lock conditions)
- Views (user-relevant)
  - getSeedSnapshotCount(uint256 seedId) returns (uint256)
  - validateSeedForSnapshot(uint256 seedId) returns (bool)
  - getUnlockTime(uint256 seedId) returns (uint256)
  - getDynamicSeedPercentage(uint256 seedId) returns (uint256)
  - getSeedSnapshotPrice(uint256 seedId) returns (uint256)
  - getSnapshotPrice(uint256 seedId) returns (uint256)

## Distributor

- User interactions (public)
  - claimShare(uint256 beneficiaryIndex)
  - claimAllShares()
- Views (user-relevant)
  - getClaimableAmount(uint256 beneficiaryIndex) returns (uint256)
  - getClaimableAmount(address beneficiaryAddr) returns (uint256)
  - getBeneficiary(uint256 index) returns (addr, name, code, allocatedAmount, totalClaimed, claimableAmount, active)
  - getAllBeneficiaries() returns (addresses, names, codes, allocatedAmounts, totalClaimed, claimableAmounts)
  - getBeneficiaryCount() returns (uint256)
  - getTotalBeneficiarySlots() returns (uint256)
  - getBeneficiaryName(uint256 index) returns (string)
  - getBeneficiaryCode(uint256 index) returns (string)
  - getBeneficiaryByCode(string code) returns (index, addr, name, allocatedAmount, totalClaimed, claimableAmount, active)
  - getBeneficiaryPercentage(uint256 beneficiaryIndex) returns (uint256 percentageBPS)
  - isAddressBeneficiary(address addr) returns (bool)

---

## Typical user flows

- Withdraw Seed Deposit (seed holder)
  1) SeedFactory.withdrawSeedDeposit(seedId) or withdrawSeedDepositTo(seedId, destination)
  2) Early withdrawal applies linear tax to burnRecipient; post-lock is full refund

- Claim Beneficiary Interest
  1) Anyone can call Distributor.claimShare(index) for a beneficiary
  2) Or Distributor.claimAllShares() to iterate over all

- Read Data
  - Use the Views listed per contract (getters for seeds, snapshots, prices, allocations, percentages, etc.)
