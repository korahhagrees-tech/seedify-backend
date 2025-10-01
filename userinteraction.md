## SeedNFT

Purpose: ERC721 Seed tokens with metadata and location.

- Client (read)
  - getTotalSeeds(): total existing seeds
  - getSeedByIndex(index): seedId
  - getSeedMetadata(seedId): { timestamp, blockNumber }
  - getSeedLocation(seedId): string
  - seedCreationTime(seedId), seedCreationBlock(seedId)
  - getSeedsByOwner(owner), ownerOf(tokenId), balanceOf(owner)
  - tokenURI(tokenId), seedURI(seedId)
- User (holder)
  - setApprovalForAll(operator, approved), approve(to, tokenId)
  - transferFrom(...), safeTransferFrom(...)
- Admin
  - mintSeed(to, snapshotPrice, location)
  - setBaseURI(baseURI), setContractURI(newContractURI), setFactory(_factory)

## SeedFactory

Purpose: Seed lifecycle, deposits, pricing, limits.

- Client (read)
  - getSeedInfo(seedId): { owner, depositAmount, withdrawn, creationTime, snapshotCount }
  - getDepositAmount(seedId), getDepositOwner(seedId)
  - getUnlockTime(seedId), validateSeedForSnapshot(seedId)
  - seedSnapshotPrices(seedId), seedPrice(), seedFee()
  - currentMaxSeedDeposit(), lockPeriodSeconds(), locked(), maxSeeds()
  - getTotalDeposits(), getTotalSeedCost(), getTotalSeedValue(), getTotalSeedValue(seedId)
  - seederAllowance(addr) / getSeederAllowance(account)
  - seedContract(), snapshotContract(), snapFactory(), pool(), feeRecipient(), burnRecipient()
- User
  - depositForSeed(seedId) [payable], increaseSeedDeposit(seedId) [payable]
  - withdrawSeedDeposit(seedId), withdrawSeedDepositTo(seedId, destination)
  - makePayment(recipient, amount)
- Admin
  - createSeed(snapshotPrice, location) [payable]
  - setSeedPrice(_newPrice), setSeedFee(_newFee), setSeedSnapshotPrice(seedId, _newPrice)
  - setMaxSeeds(_newMaxSeeds), recalculateMaxSeedDeposit()
  - setLockPeriodSeconds(_newLockPeriodSeconds), setLocked(_locked)
  - setPool(_newPool), setSnapFactory(_newSnapFactory)
  - setSeedContract(_newSeedContract), setSnapshotContract(_newSnapshotContract)
  - setBurnRecipient(newBurnRecipient), setFeeRecipient(newFeeRecipient)
  - setSeederAmount(seeder, amount), claimSeedProfits(seedId)

## SnapshotNFT

Purpose: ERC721 snapshots with rich data.

- Client (read)
  - getTotalSnapshots(), getNextSnapshotId(), getLatestSnapshotId(seedId)
  - getSeedSnapshots(seedId), getSeedSnapshotCount(seedId), getSeedSnapshotPrice(seedId)
  - getSnapshotData(snapshotId), getSnapshotPositionInSeed(snapshotId)
  - getUserSnapshots(user), getUserSnapshotData(user)
  - getBeneficiarySnapshots(beneficiaryIndex), getBeneficiaryTotalValue(beneficiaryIndex)
  - getTotalValueRaised(), seedURI(seedId), tokenURI(tokenId)
- Admin
  - (Snapshots minted via SnapFactory)

## SnapFactory

Purpose: Snapshot minting, allowances, timing, pricing.

- Client (read)
  - getSeedSnapshotCount(seedId), validateSeedForSnapshot(seedId)
  - getUnlockTime(seedId), getDynamicSeedPercentage(seedId)
  - getSeedSnapshotPrice(seedId)
  - distributor(), seedFactory(), snapshotContract(), pool(), lockPeriodSeconds(), locked()
- User
  - mintSnapshot(seedId, beneficiaryIndex, processId, to, feeRecipient) [payable]
- Admin
  - setDistributor(newDistributor), setSnapshotContract(_snapshotContract)
  - setAdminFeeRecipients(_recipients[], _percentages[])
  - setLockPeriodSeconds(_newLockPeriodSeconds), setLocked(_locked)
  - setPool(_pool), setSeedFactory(_newSeedFactory)
  - setSnapshotAllowance(user, allowance), withdrawAdminFees(amount)
  - claimPoolInterest(distributeImmediately)

## Distributor

Purpose: Beneficiary registry and interest distribution.

- Client (read)
  - getBeneficiary(index), getBeneficiaryByCode(code)
  - getAllBeneficiaries(), getBeneficiaryCount(), getTotalBeneficiarySlots()
  - getBeneficiaryName(index), getBeneficiaryCode(index)
  - getBeneficiaryPercentage(index), getBeneficiaryAllocationDetails(index)
  - getClaimableAmount(index) / getClaimableAmount(addr)
  - getDistributionDetails(), getContractState(), totalReceived()
  - isAddressBeneficiary(addr), isOperator(addr), isCodeExists(code)
- User
  - claimShare(beneficiaryIndex), claimAllShares()
- Admin
  - addBeneficiary(addr, name, code), updateBeneficiary(index, newAddr), updateBeneficiaryCode(index, newCode)
  - deactivateBeneficiary(index), reactivateBeneficiary(index)
  - addOperator(operator), removeOperator(operator)
  - setSnapshotNFT(newSnapshotNFT), updateFactory(newFactory)
  - distributeInterest() [payable]

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
