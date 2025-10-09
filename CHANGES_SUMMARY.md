# Snapshot Minting Changes Summary

## Overview
This document summarizes the changes made to support the new snapshot minting flow using the `mintSnapshot` function on the SnapFactory contract.

## Files Modified

### 1. `src/config/contract.ts`
**Changes:**
- Added `snapFactoryAddress` configuration (from `SNAP_FACTORY_ADDRESS` env variable)
- Added `royaltyRecipient` configuration (from `ROYALTY_RECIPIENT` env variable, defaults to `0xe39C834603f50FFd4eEbf35437a0770CA90a9ACd`)
- Added `imageGenerationServiceUrl` configuration (from `IMAGE_GENERATION_SERVICE_URL` env variable, defaults to `https://wof.up.railway.app`)

**Purpose:** Configure the new contract addresses and service URLs needed for snapshot minting.

### 2. `src/services/contractService.ts`
**Changes:**
- Added `getSnapFactoryContractAddress()` method

**Purpose:** Provide a method to retrieve the SnapFactory contract address for snapshot minting operations.

### 3. `src/controllers/writeController.ts`
**Changes:**
- Added import for `contractConfig`
- Replaced `mintSnapshot` method with two new methods:
  1. `prepareMintSnapshot` (GET) - Prepares transaction data for minting
  2. `snapshotMinted` (POST) - Handles snapshot minted webhook

**Purpose:** 
- `prepareMintSnapshot`: Generate the necessary data for the frontend to call `mintSnapshot` on the contract
- `snapshotMinted`: Receive webhook from frontend after successful mint and forward to image generation service

### 4. `src/routes/write.ts`
**Changes:**
- Changed `router.post('/snapshots/mint', writeController.mintSnapshot)` 
- To: `router.get('/snapshots/mint/:seedId', writeController.prepareMintSnapshot)`

**Purpose:** Update the route to use GET instead of POST and accept seedId as a path parameter.

### 5. `src/app.ts`
**Changes:**
- Added import for `writeController`
- Added new route: `app.post('/api/snapshot-minted', writeController.snapshotMinted)`
- Updated root endpoint documentation to include `snapshotMinted: '/api/snapshot-minted'`

**Purpose:** Register the snapshot-minted webhook endpoint at the app level.

## New Files Created

### 1. `SNAPSHOT_MINTING_API.md`
Complete API documentation for the new snapshot minting endpoints, including:
- Environment variables
- Endpoint specifications
- Request/response formats
- Integration flow
- Example frontend implementation

### 2. `CONFIGURATION_GUIDE.md`
Configuration guide with:
- All required environment variables
- Setup instructions
- Verification steps
- Troubleshooting tips

### 3. `CHANGES_SUMMARY.md` (this file)
Summary of all changes made to the codebase.

## New Environment Variables Required

```env
# Required
SNAP_FACTORY_ADDRESS=0xYourSnapFactoryAddress

# Optional (with defaults)
ROYALTY_RECIPIENT=0xe39C834603f50FFd4eEbf35437a0770CA90a9ACd
IMAGE_GENERATION_SERVICE_URL=https://wof.up.railway.app
```

## API Endpoints

### New Endpoints

1. **GET `/api/write/snapshots/mint/:seedId`**
   - Prepares mint snapshot transaction data
   - Returns contract address, function name, args, and value
   - Frontend uses this data to prepare the wallet interaction

2. **POST `/api/snapshot-minted`**
   - Receives snapshot minted webhook from frontend
   - Validates all required fields
   - Forwards request to external image generation service
   - Returns success/error response

### Removed Endpoints

- **POST `/api/write/snapshots/mint`** (replaced with GET endpoint)

## Contract Function Used

```solidity
function mintSnapshot(
    uint256 seedId,
    uint256 beneficiaryIndex,
    string memory process,
    address to,
    address royaltyRecipient
) external payable returns (uint256)
```

## Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User selects seed and beneficiary                           │
│     ↓                                                           │
│  2. Call GET /api/write/snapshots/mint/:seedId                  │
│     ↓                                                           │
│  3. Receive transaction data from backend                       │
│     - contractAddress (SnapFactory)                             │
│     - value (snapshot price)                                    │
│     - royaltyRecipient                                          │
│     ↓                                                           │
│  4. Generate unique processId                                   │
│     Example: `${Date.now()}-${Math.random()...}`                │
│     ↓                                                           │
│  5. Get user's wallet address                                   │
│     ↓                                                           │
│  6. Call mintSnapshot on SnapFactory contract                   │
│     args: [seedId, beneficiaryIndex, processId, userAddr, royalty]│
│     value: snapshotPrice                                        │
│     ↓                                                           │
│  7. Wait for transaction confirmation                           │
│     ↓                                                           │
│  8. Call POST /api/snapshot-minted with all details             │
│     - contractAddress, seedId, snapshotId                       │
│     - beneficiaryCode, beneficiaryDistribution                  │
│     - creator, txHash, timestamp, blockNumber                   │
│     - processId (same as step 4)                                │
│     ↓                                                           │
│  9. Backend forwards to image generation service                │
│     ↓                                                           │
│ 10. Image is generated and stored                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Differences from Previous Implementation

### Before (depositForSeed)
- Used POST endpoint with all data in request body
- Called `depositForSeed` function on SeedFactory
- Backend prepared all transaction arguments
- Limited flexibility for frontend

### After (mintSnapshot)
- Uses GET endpoint to fetch transaction data first
- Calls `mintSnapshot` function on SnapFactory
- Frontend generates processId and provides user address
- Better separation of concerns
- Supports royalty recipient configuration
- Webhook pattern for triggering image generation

## Testing the Changes

### 1. Test Prepare Mint Endpoint
```bash
curl http://localhost:3001/api/write/snapshots/mint/1
```

Expected response:
```json
{
  "success": true,
  "data": {
    "contractAddress": "0x...",
    "functionName": "mintSnapshot",
    "args": {
      "seedId": 1,
      "royaltyRecipient": "0xe39C834603f50FFd4eEbf35437a0770CA90a9ACd"
    },
    "value": "1000000000000000000",
    "valueEth": "1.0",
    "description": "Mint snapshot for seed 1",
    "seedOwner": "0x..."
  },
  "message": "Transaction data prepared. Frontend should execute the transaction.",
  "timestamp": 1234567890
}
```

### 2. Test Snapshot Minted Webhook
```bash
curl -X POST http://localhost:3001/api/snapshot-minted \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "0xdev",
    "seedId": 10,
    "snapshotId": 1,
    "beneficiaryCode": "01-GRG",
    "beneficiaryDistribution": 25.5,
    "creator": "0xowner",
    "txHash": "0xsnapshot123",
    "timestamp": 1690000000,
    "blockNumber": 1000001,
    "processId": "489851"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Snapshot minted webhook processed successfully",
  "data": {
    // Response from image generation service
  },
  "timestamp": 1234567890
}
```

## Migration Notes

If you're migrating from the old implementation:

1. Update your `.env` file with the new environment variables
2. Update your frontend code to use the new two-step flow:
   - First, call GET `/api/write/snapshots/mint/:seedId`
   - Then, execute the contract transaction
   - Finally, call POST `/api/snapshot-minted` with the results
3. Ensure the `processId` is the same in both the contract call and the webhook call
4. Test thoroughly on a testnet before deploying to production

## Backward Compatibility

⚠️ **Breaking Changes:**
- The POST `/api/write/snapshots/mint` endpoint has been removed
- Frontend code must be updated to use the new flow
- The contract function called has changed from `depositForSeed` to `mintSnapshot`

## Support

For questions or issues:
1. Check the `SNAPSHOT_MINTING_API.md` documentation
2. Review the `CONFIGURATION_GUIDE.md` for setup help
3. Examine `src/services/useMintSnapshot.ts` for a working frontend example
4. Check server logs for detailed error messages

## Checklist for Deployment

- [ ] Update `.env` file with `SNAP_FACTORY_ADDRESS`
- [ ] Set `ROYALTY_RECIPIENT` (or use default)
- [ ] Verify `IMAGE_GENERATION_SERVICE_URL` is correct
- [ ] Update frontend to use new two-step minting flow
- [ ] Test on testnet first
- [ ] Verify image generation service is accessible
- [ ] Check all error handling paths
- [ ] Monitor server logs during initial deployment
- [ ] Test with different beneficiary indices
- [ ] Verify royalty distribution is working correctly

