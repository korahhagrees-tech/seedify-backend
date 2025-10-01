# Seedify Backend API Documentation

## Overview
This document outlines the complete API structure for the Seedify Backend, including all read and write operations.

**Base URL**: `/api`

## Authentication
Currently, no authentication is required for read operations. Write operations require wallet interaction on the frontend.

---

## Read Endpoints

### 1. Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1234567890
}
```

### 2. System Status
**GET** `/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "contractsConnected": true,
    "usingMockData": false
  },
  "timestamp": 1234567890
}
```

### 3. Get All Seeds
**GET** `/seeds`

**Response:**
```json
{
  "success": true,
  "seeds": [
    {
      "id": "1",
      "label": "Seed #1",
      "name": "Digital Flower 1",
      "description": "A beautiful digital flower planted in Berlin.",
      "seedImageUrl": "/images/seeds/seed-1.png",
      "latestSnapshotUrl": "/images/snapshots/snapshot-1-latest.png",
      "snapshotCount": 12,
      "owner": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
      "depositAmount": "1.0211",
      "snapshotPrice": "0.004070",
      "isWithdrawn": false,
      "isLive": false,
      "location": "Berlin",
      "beneficiaries": [
        {
          "code": "01-GRG",
          "name": "Grgich Hills Estate Regenerative Sheep Grazing",
          "index": 0,
          "percentage": "25.00",
          "address": "0xd2D7441d36569200bA5b7cE9c90623a364dB1297",
          "allocatedAmount": "0.000000",
          "totalClaimed": "0.000000",
          "claimableAmount": "0.000000",
          "isActive": true,
          "beneficiaryValue": "0.000000"
        }
        // ... 3 more beneficiaries
      ]
    }
  ],
  "timestamp": 1234567890
}
```

**Note:** 
- List view focuses on essential data only
- `ecosystemProjects`, `wayOfFlowersData`, and `story` are NOT included in list view to keep response lightweight
- Full detail view (`/seeds/:id`) includes these fields but they may be empty/null as they're not from the contract

### 4. Get Seed By ID
**GET** `/seeds/:id`

**Response:**
```json
{
  "success": true,
  "seed": {
    "id": "1",
    "label": "Seed #1",
    "name": "Digital Flower 1",
    "description": "A beautiful digital flower planted in Berlin.",
    "seedImageUrl": "/images/seeds/seed-1.png",
    "latestSnapshotUrl": "/images/snapshots/snapshot-1-latest.png",
    "snapshotCount": 12,
    "owner": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
    "depositAmount": "1.0211",
    "snapshotPrice": "0.004070",
    "isWithdrawn": false,
    "isLive": false,
    "metadata": {
      "exists": true,
      "attributes": [
        { "trait_type": "Type", "value": "Seed" },
        { "trait_type": "Token ID", "value": 1 },
        { "trait_type": "Location", "value": "Berlin" }
      ]
    },
    "location": "Berlin",
    "ecosystemProjects": [
      {
        "title": "Berlin Urban Farms Collective",
        "subtitle": "Sustainable urban agriculture",
        "shortText": "Community farms across Berlin.",
        "extendedText": "Detailed description...",
        "backgroundImageUrl": "/images/ecosystems/berlin.png",
        "seedEmblemUrl": "/images/emblems/berlin.png"
      }
    ],
    "wayOfFlowersData": {
      "backgroundImageUrl": "",
      "seedEmblemUrl": "",
      "firstText": "",
      "secondText": "",
      "thirdText": "",
      "mainQuote": "",
      "author": ""
    },
    "story": {
      "title": "",
      "author": "",
      "story": ""
    },
    "beneficiaries": [
      {
        "code": "01-GRG",
        "name": "Grgich Hills Estate Regenerative Sheep Grazing",
        "index": 0,
        "percentage": "25.00",
        "address": "0xd2D7441d36569200bA5b7cE9c90623a364dB1297",
        "allocatedAmount": "0.000000",
        "totalClaimed": "0.000000",
        "claimableAmount": "0.000000",
        "isActive": true,
        "beneficiaryValue": "0.000000"
      }
      // ... 3 more beneficiaries
    ]
  },
  "timestamp": 1234567890
}
```

**Note:** 
- `ecosystemProjects` is included in response but may be empty array `[]` if no mapping exists (NOT from contract, mapped from location)
- `wayOfFlowersData` is included in response as an **empty object with empty strings** (NOT from contract, frontend will populate later)
- `story` is included in response as an **empty object with empty strings** (NOT from contract, frontend will populate later)
- **These fields are present with empty values so frontend doesn't break**
- All beneficiary data comes from the Distributor contract and is fully populated

### 5. Get Seeds Count
**GET** `/seeds/count`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "timestamp": 1234567890
}
```

### 6. Get All Beneficiaries
**GET** `/beneficiaries`

**Response:**
```json
{
  "success": true,
  "beneficiaries": [
    {
      "index": 0,
      "address": "0xd2D7441d36569200bA5b7cE9c90623a364dB1297",
      "name": "Grgich Hills Estate Regenerative Sheep Grazing",
      "code": "01-GRG",
      "allocatedAmount": "0.000000",
      "totalClaimed": "0.000000",
      "claimableAmount": "0.000000",
      "isActive": true,
      "percentage": "2500",
      "beneficiaryValue": "0.000000"
    }
    // ... more beneficiaries
  ],
  "timestamp": 1234567890
}
```

**Beneficiary Data Includes:**
- `index`: Beneficiary index in contract
- `address`: Ethereum address
- `name`: Full name
- `code`: Unique code (e.g., "01-GRG")
- `allocatedAmount`: Allocated amount in ETH
- `totalClaimed`: Total claimed in ETH
- `claimableAmount`: Currently claimable in ETH
- `isActive`: Whether beneficiary is active
- `percentage`: Percentage allocation as a **calculated percentage string** (e.g., "14.09", "25.00", "100.00")
  - Contract returns basis points (10000 = 100%), backend converts to percentage
  - Example: Contract returns `1409` → Backend returns `"14.09"`
  - To display: `percentage + '%'` → `"14.09%"`
- `beneficiaryValue`: Total value for beneficiary in ETH

### 7. Get Beneficiary By Index
**GET** `/beneficiaries/:index`

Returns comprehensive beneficiary data including percentage, allocation details, and activity status.

### 8. Get Beneficiary By Code
**GET** `/beneficiaries/code/:code`

Returns beneficiary data by their unique code (e.g., "01-GRG").

### 9. Get Snapshots By Seed
**GET** `/snapshots/seed/:seedId`

**Response:**
```json
{
  "success": true,
  "snapshots": [
    {
      "id": 1,
      "creator": "0x...",
      "value": 1000000000000000,
      "valueEth": "0.001000",
      "beneficiaryIndex": 0,
      "seedId": 1,
      "timestamp": 1234567890,
      "blockNumber": 12345,
      "positionInSeed": 0,
      "processId": "process-123"
    }
  ],
  "count": 1,
  "timestamp": 1234567890
}
```

### 10. Get Snapshots By Beneficiary
**GET** `/snapshots/beneficiary/:beneficiaryIndex`

Returns all snapshots for a specific beneficiary.

### 11. Get Snapshot Stats
**GET** `/snapshots/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSnapshots": 100,
    "totalValueRaised": "1.234567",
    "latestSnapshotId": 100
  },
  "timestamp": 1234567890
}
```

---

## User-Specific Endpoints

These endpoints return data specific to a user's wallet address.

### 1. Get User's Seeds
**GET** `/users/:address/seeds`

Returns all seeds owned by the specified address.

**Response:**
```json
{
  "success": true,
  "seeds": [
    {
      "id": "1",
      "label": "Seed #1",
      // ... full seed data
    }
  ],
  "count": 1,
  "owner": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
  "timestamp": 1234567890
}
```

### 2. Get User's Seed Count
**GET** `/users/:address/seeds/count`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "owner": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
  "timestamp": 1234567890
}
```

### 3. Get User's Snapshots
**GET** `/users/:address/snapshots`

Returns all snapshots created by the user.

**Response:**
```json
{
  "success": true,
  "snapshots": [
    {
      "id": 1,
      "creator": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
      "value": 1000000000000000,
      "valueEth": "0.001000",
      "beneficiaryIndex": 0,
      "seedId": 1,
      "timestamp": 1234567890,
      "blockNumber": 12345,
      "positionInSeed": 0,
      "processId": "process-123"
    }
  ],
  "count": 1,
  "creator": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
  "timestamp": 1234567890
}
```

### 4. Get User's Snapshot Count
**GET** `/users/:address/snapshots/count`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "creator": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
  "timestamp": 1234567890
}
```

### 5. Get User's Snapshot Data (Detailed)
**GET** `/users/:address/snapshots/data`

Returns detailed snapshot data including all metadata.

### 6. Get User's Pool Balance
**GET** `/users/:address/balance`

Returns the user's balance in the Aave pool.

**Response:**
```json
{
  "success": true,
  "balance": "1.234567",
  "balanceWei": "1234567000000000000",
  "user": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
  "timestamp": 1234567890
}
```

### 7. Get User's Stats
**GET** `/users/:address/stats`

Comprehensive user statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSeeds": 3,
    "totalSnapshots": 5,
    "poolBalance": "1.234567",
    "seedNFTBalance": 3,
    "snapshotNFTBalance": 5
  },
  "user": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
  "timestamp": 1234567890
}
```

### 8. Get User's Portfolio (Complete)
**GET** `/users/:address/portfolio`

Complete user portfolio with all seeds, snapshots, and summary.

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "seeds": [...],
    "snapshots": [...],
    "summary": {
      "totalSeeds": 3,
      "totalSnapshots": 5,
      "totalDeposited": "5.123456",
      "totalSnapshotValue": "0.050000",
      "poolBalance": "1.234567"
    }
  },
  "user": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
  "timestamp": 1234567890
}
```

---

## Write Endpoints

All write endpoints return transaction data that the frontend must execute using the connected wallet.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0x...",
    "functionName": "createSeed",
    "args": [...],
    "value": "0",
    "description": "Human-readable description"
  },
  "message": "Transaction data prepared. Frontend should execute the transaction.",
  "timestamp": 1234567890
}
```

### 1. Create Seed
**POST** `/write/seeds/create`

**Request:**
```json
{
  "snapshotPrice": "0.01",
  "location": "BERLIN"
}
```

### 2. Deposit to Seed
**POST** `/write/seeds/:id/deposit`

**Request:**
```json
{
  "amount": "1.5"
}
```

### 3. Withdraw from Seed
**POST** `/write/seeds/:id/withdraw`

**Request:**
```json
{
  "amount": "1.0"
}
```

### 4. Claim Seed Profits
**POST** `/write/seeds/:id/claim-profits`

No request body required.

### 5. Mint Snapshot
**POST** `/write/snapshots/mint`

**Request:**
```json
{
  "seedId": 1,
  "beneficiaryIndex": 0,
  "processId": "process-123",
  "value": "0.01",
  "projectCode": "01-GRG"
}
```

---

## Admin Endpoints

### 1. Add Beneficiary
**POST** `/write/admin/beneficiaries`

**Request:**
```json
{
  "beneficiaryAddr": "0x...",
  "name": "New Beneficiary",
  "code": "05-NEW",
  "allocatedAmount": "0.0"
}
```

### 2. Deactivate Beneficiary
**POST** `/write/admin/beneficiaries/:id/deactivate`

### 3. Reactivate Beneficiary
**POST** `/write/admin/beneficiaries/:id/reactivate`

### 4. Distribute Interest
**POST** `/write/admin/distribute-interest`

---

## Data Sources

| Field | Source | Available |
|-------|--------|-----------|
| **Basic Seed Data** | SeedNFT + SeedFactory Contract | ✅ |
| **Location** | SeedNFT Contract | ✅ |
| **Snapshot Price** | SeedFactory Contract | ✅ |
| **Beneficiaries (Full Data)** | Distributor Contract | ✅ |
| **Beneficiary Percentage** | Distributor Contract | ✅ |
| **Beneficiary Allocation** | Distributor Contract | ✅ |
| **Ecosystem Projects** | Mapping Service (not contract) | ⚠️ In response, may be empty [] |
| **Way of Flowers Data** | NOT from contract | ⚠️ In response, empty object with empty strings |
| **Story Data** | NOT from contract | ⚠️ In response, empty object with empty strings |
| **Images** | Placeholder URLs | ⚠️ Fallback |

---

## Environment Variables

```env
USE_MOCK_DATA=false
SEED_FACTORY_ADDRESS=0x...
SEED_NFT_ADDRESS=0x...
SNAPSHOT_NFT_ADDRESS=0x...
DISTRIBUTOR_ADDRESS=0x...
RPC_URL=https://mainnet.base.org
RPC_RATE_LIMIT_DELAY=100
RPC_MAX_RETRIES=3
RPC_BATCH_SIZE=5
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": 1234567890
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found
- `500`: Internal Server Error

---

## Important Notes

### Response Structure Philosophy

**All fields that the frontend expects are ALWAYS included in the response**, even if the data doesn't exist in the contract:

1. **Contract Data** (populated with real values):
   - Basic seed info, location, snapshot price, beneficiaries
   - These have actual data from the blockchain

2. **Helper/Frontend Data** (included but empty):
   - `ecosystemProjects`: `[]` or mapped from location if available
   - `wayOfFlowersData`: Empty object with empty strings `{backgroundImageUrl: '', ...}` (frontend can populate later)
   - `story`: Empty object with empty strings `{title: '', author: '', story: ''}` (frontend can populate later)

**Why?** This prevents the frontend from breaking when accessing these fields. The fields are present in the response structure, they just don't have values because that data isn't stored in the smart contracts.

### General Notes

1. **Contract Data Only**: When `USE_MOCK_DATA=false`, all data comes from smart contracts
2. **Beneficiary Data**: Comprehensive beneficiary data includes percentage, allocation details, and all related fields
3. **Optional Fields**: `ecosystemProjects`, `wayOfFlowersData`, and `story` are PRESENT in response but may be empty/null
4. **Write Operations**: All write operations return transaction data for frontend execution
5. **Rate Limiting**: RPC calls are rate-limited and batched to avoid "over rate limit" errors
6. **Fallback Data**: Image URLs fall back to placeholder paths if not available from metadata

---

## Frontend Integration Example

### Reading Seed Data

```typescript
// Get seed detail
const response = await fetch('/api/seeds/1');
const { seed } = await response.json();

// ✅ These fields ALWAYS exist and have contract data:
console.log(seed.id);              // "1"
console.log(seed.location);        // "Berlin"
console.log(seed.snapshotPrice);   // "0.004070"
console.log(seed.beneficiaries);   // [{code: "01-GRG", percentage: "14.09", ...}, ...]

// ⚠️ These fields ALWAYS exist but may be empty (not from contract):
console.log(seed.ecosystemProjects); // [] or [{...}] if mapped from location
console.log(seed.wayOfFlowersData);  // {backgroundImageUrl: '', seedEmblemUrl: '', ...} - empty strings
console.log(seed.story);             // {title: '', author: '', story: ''} - empty strings

// Frontend can safely access these without checking if they exist:
const hasEcosystem = seed.ecosystemProjects?.length > 0;
const needsStory = seed.story.title === ''; // Frontend knows to populate from own source
const needsWayOfFlowers = seed.wayOfFlowersData.firstText === ''; // Frontend knows to populate
```

### Writing Seed Data

```typescript
// Create new seed
const txDataResponse = await fetch('/api/write/seeds/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    snapshotPrice: "0.01",
    location: "BERLIN"
  })
});

const { data } = await txDataResponse.json();
// Execute transaction with wallet
const tx = await contract[data.functionName](...data.args, {
  value: data.value
});
await tx.wait();
```

