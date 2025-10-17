# 🌱 Seed Creation API - Quick Reference

## 📍 Endpoints

### 1. Prepare Seed Creation
```
GET /api/write/seeds/prepare/:address
```

**Purpose:** Get all data needed to create a seed  
**Cache:** 15 seconds  
**Response Time:** 10-50ms (cached), 2-3s (cold)

**Example:**
```bash
GET https://api.seedify.com/api/write/seeds/prepare/0x742d35Cc6634C0532925a3b844BC454e4438f44e
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0x...",
    "seedPrice": "0.048",
    "seedFee": "500",
    "totalMinimumCost": "0.0504",
    "defaultSnapshotPrice": "0.011",
    "canMint": true,
    "activeBeneficiaries": [...],
    "recommendations": {...},
    "validation": {...}
  }
}
```

---

### 2. Validate Seed Parameters
```
POST /api/write/seeds/validate
```

**Purpose:** Pre-flight validation (optional)  
**Cache:** None  
**Response Time:** 1-2s

**Request:**
```json
{
  "recipient": "0x742d35...",
  "snapshotPrice": "0.011",
  "beneficiaryIndices": [4, 1, 2, 5],
  "paymentAmount": "0.06"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "errors": [],
  "warnings": ["Extra X ETH will be deposited to Aave"],
  "breakdown": {
    "payment": "0.06",
    "fee": "0.0024",
    "deposit": "0.0576",
    "perBeneficiary": "0.0144"
  }
}
```

---

### 3. Seed Created Webhook
```
POST /api/seed-created
```

**Purpose:** Post-creation callback  
**Cache:** None (invalidates caches)  
**Response Time:** 50-200ms

**Request:**
```json
{
  "seedId": 43,
  "creator": "0x...",
  "recipient": "0x...",
  "depositAmount": "0.048",
  "snapshotPrice": "0.011",
  "location": "berlin",
  "beneficiaries": [4, 1, 2, 5],
  "txHash": "0x...",
  "blockNumber": 12345678,
  "timestamp": 1760479789
}
```

**Response:**
```json
{
  "success": true,
  "message": "Seed creation recorded successfully",
  "data": {
    "seedId": 43,
    "processed": true
  }
}
```

---

## 🔄 Complete Flow

```typescript
// 1. Prepare
const prep = await fetch(`/api/write/seeds/prepare/${address}`);
const data = await prep.json();

// 2. Validate (optional)
const valid = await fetch('/api/write/seeds/validate', {
  method: 'POST',
  body: JSON.stringify({ ... })
});

// 3. Execute contract
const tx = await writeContract({ ... });

// 4. Webhook
await fetch('/api/seed-created', {
  method: 'POST',
  body: JSON.stringify({ seedId, txHash, ... })
});
```

---

## 📊 Response Fields

### Prepare Response Data

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `contractAddress` | string | SeedFactory address | `"0x..."` |
| `seedPrice` | string | Base seed price (ETH) | `"0.048"` |
| `seedFee` | string | Fee in basis points | `"500"` (5%) |
| `feeAmount` | string | Calculated fee (ETH) | `"0.0024"` |
| `totalMinimumCost` | string | Min payment required | `"0.0504"` |
| `defaultSnapshotPrice` | string | Min snapshot price | `"0.011"` |
| `canMint` | boolean | User can create seed | `true` |
| `isLocked` | boolean | Factory locked status | `false` |
| `seederAllowance` | string | User's mint allowance | `"0"` |
| `currentSeedCount` | number | Total seeds minted | `42` |
| `maxSeeds` | number | Maximum allowed | `1000` |
| `seedCapReached` | boolean | Limit reached | `false` |
| `activeBeneficiaries` | array | Active beneficiaries | `[{...}, ...]` |
| `beneficiaryCount` | number | Count of active ones | `8` |

### Beneficiary Object

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `index` | number | Beneficiary index | `4` |
| `name` | string | Beneficiary name | `"Walkers Reserve..."` |
| `code` | string | Beneficiary code | `"05-WAL"` |
| `address` | string | Ethereum address | `"0x..."` |

### Validation Response

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | All checks passed |
| `errors` | string[] | Validation errors |
| `warnings` | string[] | Non-blocking warnings |
| `breakdown.payment` | string | Total payment |
| `breakdown.fee` | string | Fee amount |
| `breakdown.deposit` | string | Amount to Aave |
| `breakdown.perBeneficiary` | string | Amount per beneficiary |

---

## ⚠️ Error Codes

| HTTP | Error | Meaning |
|------|-------|---------|
| 400 | `Invalid address` | Address format wrong |
| 400 | `Missing required fields` | Incomplete request |
| 403 | `Factory locked` | User unauthorized |
| 403 | `Seed cap reached` | Max seeds minted |
| 500 | `Failed to prepare` | Contract error |

---

## 🎯 Best Practices

### DO:
✅ Cache preparation data for 10-15 seconds  
✅ Use validation endpoint for instant feedback  
✅ Call webhook after transaction confirms  
✅ Handle errors gracefully  
✅ Show loading states  

### DON'T:
❌ Call preparation endpoint on every keystroke  
❌ Skip validation (use it for UX)  
❌ Forget the webhook (breaks cache/analytics)  
❌ Assume data is fresh (check timestamps)  
❌ Ignore `canMint` flag  

---

## 🚀 Quick Start

### Minimal Implementation

```typescript
// 1. Fetch data
const res = await fetch(`/api/write/seeds/prepare/${address}`);
const { data } = await res.json();

// 2. Create seed
const tx = await writeContract({
  address: data.contractAddress,
  abi: SeedFactoryABI,
  functionName: 'createSeed',
  args: [recipient, parseEther(data.defaultSnapshotPrice), 'berlin', [0,1,2,3]],
  value: parseEther(data.totalMinimumCost)
});

// 3. Call webhook
await fetch('/api/seed-created', {
  method: 'POST',
  body: JSON.stringify({ seedId: 43, txHash: tx, ... })
});
```

---

## 📚 Related Documentation

- **Complete Guide:** `SEED_CREATION_BACKEND_GUIDE.md`
- **Contract Analysis:** `SEED_CREATION_ANALYSIS.md`
- **Flowchart:** `SEED_CREATION_FLOWCHART.md`
- **Quick Reference:** `SEED_CREATION_QUICK_REFERENCE.md`

---

**Version:** 1.0  
**Last Updated:** 2025-10-17  
**Base URL:** `https://api.seedify.com`

