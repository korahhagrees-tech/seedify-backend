# Decimal Precision Fix & Snapshot Image URL Implementation

## Issue Identified

**Problem:** Wei to ETH conversions were using `.toFixed(6)` which truncates values to 6 decimal places.

**Impact:** Snapshot prices requiring 7+ decimal places were being incorrectly displayed.

**Example:**
- Actual value: `1100000000000` wei = `0.0000011` ETH (7 decimals)
- Displayed value (WRONG): `0.000001` ETH (truncated to 6 decimals)

---

## Solution Implemented

### 1. Created Utility Functions

**File:** `src/utils/eth-utils.ts`

#### Core Function: `weiToEthExact()`
```typescript
export function weiToEthExact(weiValue: string | number | bigint): string
```

**Features:**
- Handles up to 18 decimal places (full ETH precision)
- Automatically removes trailing zeros
- Preserves all significant digits
- No arbitrary truncation

**Examples:**
- `1100000000000` → `"0.0000011"` (7 decimals preserved)
- `11000000000000000` → `"0.011"` (trailing zeros removed)
- `1000000000000000000` → `"1"` (whole number, no decimals)

#### Helper Functions:
- `weiToEth(value, minDecimals, maxDecimals)` - Flexible conversion with control
- `weiToEthDisplay(value)` - For UI display (minimum 6 decimals)
- `generateSnapshotImageUrl()` - Creates snapshot image URLs
- `formatSeedNumber()` - Formats seed numbers with leading zeros

---

## Files Updated

### 1. `src/controllers/snapshotsController.ts`
**Changes:**
- Replaced all `.toFixed(6)` with `weiToEthExact()`
- Added snapshot image URL generation
- Applied to:
  - `listBySeed` - Snapshots for a seed
  - `getById` - Single snapshot
  - `listByBeneficiary` - Snapshots for beneficiary
  - `stats` - Total value raised

**Image URL Pattern:**
```
{baseUrl}/seed{seedId}/snap{seedId}-{positionInSeed}-{processId}.png
```

**Example:**
```
https://wof-flourishing-backup.s3.amazonaws.com/seed1/snap1-11-1758216369627-p04rc.png
```

### 2. `src/controllers/usersController.ts`
**Changes:**
- Fixed decimal precision in:
  - `getUserSnapshots` - User's snapshots
  - `getUserBalance` - Pool balance
  - `getUserStats` - Aggregate stats
  - `getUserPortfolio` - Complete portfolio
- Added snapshot image URLs to all snapshot responses

### 3. `src/services/contractService.ts`
**Changes:**
- Updated `getUserSnapshotData()` to use `weiToEthExact()`
- Fixed snapshot price conversion in `processSeed()`
- Updated `calculateEarlyHarvestFee()` to use exact decimals
- Updated `getHighestSeedDeposit()` to use exact decimals
- Updated `getWithdrawableAmount()` to preserve precision

### 4. `src/controllers/seedController.ts`
**Changes:**
- Added import for `weiToEthExact`
- Updated seed stats endpoint to use `.toString()` instead of `.toFixed(6)`
- Preserves full precision in all calculated values

---

## Snapshot Image URL Implementation

### Pattern
```
{NEXT_PUBLIC_SNAPSHOT_IMAGE_BASE_URL}/seed{seedId}/snap{seedId}-{positionInSeed}-{processId}.png
```

### Components
- `seedId`: The seed this snapshot belongs to
- `positionInSeed`: The snapshot's position within the seed (from contract)
- `processId`: Unique process identifier (from contract)

### Environment Variable
```env
NEXT_PUBLIC_SNAPSHOT_IMAGE_BASE_URL=https://wof-flourishing-backup.s3.amazonaws.com
```

**Default:** `https://wof-flourishing-backup.s3.amazonaws.com`

### Fallback Strategy
1. Try to fetch imageUrl from contract's `tokenURI()`
2. If not available, generate URL using pattern
3. Always includes imageUrl in response

---

## Affected Endpoints

### Now Return Exact Decimals:

**Snapshots:**
- `GET /api/snapshots/seed/:seedId`
- `GET /api/snapshots/id/:snapshotId`
- `GET /api/snapshots/beneficiary/:index`
- `GET /api/snapshots/stats`

**Users:**
- `GET /api/users/:address/snapshots`
- `GET /api/users/:address/snapshots/data`
- `GET /api/users/:address/balance`
- `GET /api/users/:address/stats`
- `GET /api/users/:address/portfolio`

**Seeds:**
- `GET /api/seeds` (snapshot prices)
- `GET /api/seeds/:id` (snapshot prices, deposit amounts)
- `GET /api/seeds/:id/stats` (all financial metrics)

---

## Testing

### Before Fix:
```json
{
  "value": 1100000000000,
  "valueEth": "0.000001"  // WRONG - truncated
}
```

### After Fix:
```json
{
  "value": 1100000000000,
  "valueEth": "0.0000011",  // CORRECT - full precision
  "imageUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed3/snap3-74-1760472116694-hq1h2qke1.png"
}
```

### Test Cases:

| Wei Value | Correct ETH | Old Output | New Output |
|-----------|-------------|------------|------------|
| 1100000000000 | 0.0000011 | 0.000001 ❌ | 0.0000011 ✅ |
| 11000000000000000 | 0.011 | 0.011000 ⚠️ | 0.011 ✅ |
| 1000000000000000000 | 1 | 1.000000 ⚠️ | 1 ✅ |
| 123456789012345678 | 0.123456789012345678 | 0.123457 ❌ | 0.123456789012345678 ✅ |

---

## Benefits

1. **Accuracy:** All ETH values now display with full precision (up to 18 decimals)
2. **Flexibility:** Automatically adjusts decimal places based on value
3. **Clean Display:** Removes unnecessary trailing zeros
4. **Image URLs:** All snapshot responses include proper image URLs
5. **Consistency:** Single utility function used across entire codebase

---

## Migration Notes

**No Breaking Changes:**
- All endpoints return the same structure
- Only the precision of numeric values improved
- Frontend can handle the additional precision automatically

**Environment Variable:**
Add to `.env`:
```env
NEXT_PUBLIC_SNAPSHOT_IMAGE_BASE_URL=https://wof-flourishing-backup.s3.amazonaws.com
```

---

## Deployment Checklist

- ✅ Utility functions created
- ✅ All controllers updated
- ✅ ContractService updated
- ✅ Snapshot image URLs implemented
- ✅ No linter errors
- ✅ All endpoints tested
- ✅ Documentation updated

---

**Status:** Complete  
**Impact:** High (fixes critical display bug)  
**Breaking Changes:** None  
**Ready for Deploy:** Yes

