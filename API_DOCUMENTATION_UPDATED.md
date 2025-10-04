# Seedify Backend API Documentation

## Overview
This document outlines the complete API structure for the Seedify Backend, including all read and write operations.

**Base URL**: `/api`

## 🆕 Latest Updates (October 2025)

### ✅ **COMPLETE MOCK DATA REMOVAL**
- **ALL mock data removed** - No fallbacks to fake data
- Returns empty arrays/objects when data not available
- Returns 404 when seed doesn't exist

### ✅ **Real Image URLs from Contracts**
- Seed images now fetched from `SeedNFT.tokenURI()` (returns S3 URLs via base64-encoded JSON)
- Snapshot images from `SnapshotNFT.tokenURI()`
- Latest snapshot per seed from `SnapshotNFT.seedURI()`
- **NO placeholder fallbacks** - empty string if not available

### ✅ **Beneficiary Project Data Integration**
- Beneficiaries enriched with full project details from `projects.json`
- Each beneficiary includes: title, subtitle, location, area, description, benefits, moreDetails, backgroundImage
- **Removed** stupid mock ecosystem projects (Berlin Urban Farms, NYC, Tokyo, London)
- Project data mapped by beneficiary code (01-GRG → Grgich Hills Estate, etc.)

### ✅ **Enhanced RPC Integration**
- Supports Alchemy RPC for 300 calls/second (vs 10 on public RPC)
- Rate limiting with exponential backoff
- Batched processing to avoid overwhelming RPC providers

### ✅ **Extended Seed Data**
Seeds now include: `unlockTime`, `accumulatedProfits`, `dynamicPercentage`, `totalValue`, `isEarlyWithdrawn`

### ✅ **Enhanced Beneficiary Data**
Beneficiaries include: `percentage` (converted from basis points), `totalValue`, `snapshotCount`, **plus full project data**

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

**Description:** Returns a lightweight list of all seeds with essential data only.

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
      "seedImageUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/seed.png",
      "latestSnapshotUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/snap1-12-...png",
      "snapshotCount": 12,
      "owner": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
      "depositAmount": "1.0211",
      "snapshotPrice": "0.011000",
      "isWithdrawn": false,
      "isLive": false,
      "metadata": {
        "exists": true,
        "attributes": [
          { "trait_type": "Type", "value": "Seed" },
          { "trait_type": "Token ID", "value": 1 },
          { "trait_type": "Location", "value": "Berlin" }
        ]
      }
    }
  ],
  "timestamp": 1234567890
}
```

**Note:** 
- List view focuses on essential data only
- Beneficiaries, wayOfFlowersData, and story are NOT included to keep response lightweight
- Use `/seeds/:id` for full detail view

### 4. Get Seed By ID
**GET** `/seeds/:id`

**Description:** Returns complete seed data including beneficiaries with enriched project information.

**Response:**
```json
{
  "success": true,
  "seed": {
    "id": "1",
    "label": "Seed #1",
    "name": "Digital Flower 1",
    "description": "A beautiful digital flower planted in Berlin.",
    "seedImageUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/seed.png",
    "latestSnapshotUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/snap1-12-...png",
    "snapshotCount": 12,
    "owner": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
    "depositAmount": "1.0211",
    "snapshotPrice": "0.011000",
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
        "percentage": "14.09",
        "address": "0xd2D7441d36569200bA5b7cE9c90623a364dB1297",
        "allocatedAmount": "0.000000",
        "totalClaimed": "0.000000",
        "claimableAmount": "0.000000",
        "isActive": true,
        "beneficiaryValue": "0.000000",
        "projectData": {
          "title": "Grgich Hills Estate",
          "subtitle": "Regenerative Sheep Grazing",
          "location": "Rutherford, Napa Valley, California",
          "area": "126.6 hectares",
          "description": "Across Napa's vineyard terraces, a carefully orchestrated migration unfolds...",
          "benefits": [
            "Enhanced nutrient cycling",
            "Reduced external inputs",
            "Wildfire mitigation",
            "Soil carbon storage"
          ],
          "moreDetails": "The project represents a sophisticated evolution in sustainable viticulture...",
          "backgroundImage": "/project_images/01__GRG.png"
        }
      }
      // ... 3 more beneficiaries with full project data
    ]
  },
  "timestamp": 1234567890
}
```

**Note:** 
- `location` is a **string from contract** (e.g., "Berlin") - stored when seed was minted
- `wayOfFlowersData` and `story` are **empty objects** (NOT from contract, frontend will populate)
- `beneficiaries` includes **full project data** from `projects.json` mapped by beneficiary code
- ALL data comes from contracts or `projects.json` - **NO MOCK DATA**

**Error Response (404):**
```json
{
  "success": false,
  "error": "Seed not found",
  "message": "Seed with ID 999 does not exist",
  "timestamp": 1234567890
}
```

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

**Description:** Returns all beneficiaries with comprehensive data from the Distributor contract.

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
      "percentage": "14.09",
      "beneficiaryValue": "0.000000"
    }
    // ... more beneficiaries
  ],
  "timestamp": 1234567890
}
```

**Beneficiary Data Includes:**
- `index`: Beneficiary index in contract (0-7)
- `address`: Ethereum address
- `name`: Full name from contract
- `code`: Unique code (e.g., "01-GRG", "02-ELG")
- `allocatedAmount`: Allocated amount in ETH
- `totalClaimed`: Total claimed in ETH
- `claimableAmount`: Currently claimable in ETH
- `isActive`: Whether beneficiary is active
- `percentage`: **Converted from basis points** (e.g., contract returns `1409` → backend returns `"14.09"`)
  - Contract stores as basis points (10000 = 100%)
  - Backend converts: `basisPoints / 100 = percentage`
  - Display as: `percentage + '%'` → `"14.09%"`
- `beneficiaryValue`: Total value raised for this beneficiary in ETH

### 7. Get Beneficiary By Index
**GET** `/beneficiaries/:index`

Returns comprehensive beneficiary data for a specific index.

### 8. Get Beneficiary By Code
**GET** `/beneficiaries/code/:code`

**Example:** `GET /beneficiaries/code/01-GRG`

Returns beneficiary data by their unique code.

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

### 3. Get User's Snapshots
**GET** `/users/:address/snapshots`

### 4. Get User's Snapshot Count
**GET** `/users/:address/snapshots/count`

### 5. Get User's Snapshot Data (Detailed)
**GET** `/users/:address/snapshots/data`

### 6. Get User's Pool Balance
**GET** `/users/:address/balance`

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

### 2. Deposit to Seed
**POST** `/write/seeds/:id/deposit`

### 3. Withdraw from Seed
**POST** `/write/seeds/:id/withdraw`

### 4. Claim Seed Profits
**POST** `/write/seeds/:id/claim-profits`

### 5. Mint Snapshot
**POST** `/write/snapshots/mint`

---

## Admin Endpoints

### 1. Get Admin Statistics
**GET** `/admin/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "distributor": {
      "contractBalance": "10.500000",
      "totalAllocated": "8.750000",
      "totalClaimedAll": "2.100000",
      "remainingToDistribute": "6.650000"
    },
    "pool": {
      "totalOriginal": "50.000000",
      "currentAToken": "52.345678",
      "claimableInterest": "2.345678",
      "contractETH": "0.100000"
    }
  },
  "timestamp": 1234567890
}
```

---

## Data Sources & Contract Mapping

### **Contracts Used:**

| Contract | Address | Purpose |
|----------|---------|---------|
| **SeedFactory** | `0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8` | Seed financial data, deposits, withdrawals |
| **SeedNFT** | `0xF1d8b736AFf4A22d9c82C91624FC351fdFb63506` | Seed metadata, location, images |
| **SnapshotNFT** | `0x5203D3C460ba2d0156c97D8766cCE70b69eDd3A6` | Snapshot data and images |
| **Distributor** | `0x9142A61188e829BF924CeffF27e8ed8111700C9B` | Beneficiary data and allocations |
| **AavePool** | `0x973842f397af60F68068CCF6F776b4c466Ae1ca6` | Pool balances and interest |

### **Data Source Breakdown:**

| Field | Source | Details |
|-------|--------|---------|
| **Basic Seed Data** | `SeedFactory.getSeedInfo()` | Owner, deposit, withdrawn, timestamp, snapshotCount |
| **Location** | `SeedNFT.getSeedLocation()` | String stored on-chain (e.g., "Berlin") |
| **Seed Image** | `SeedNFT.tokenURI()` | Base64-encoded JSON with S3 URL |
| **Latest Snapshot Image** | `SnapshotNFT.seedURI()` → `tokenURI()` | Base64-encoded JSON with S3 URL |
| **Snapshot Price** | `SeedFactory.seedSnapshotPrices()` | Price in wei, converted to ETH |
| **Beneficiaries (contract data)** | `Distributor.getAllBeneficiaries()` | Addresses, names, codes, amounts |
| **Beneficiary Percentage** | `Distributor.getBeneficiaryPercentage()` | Basis points → percentage |
| **Beneficiary Project Data** | `projects.json` (local) | Mapped by beneficiary code |
| **Way of Flowers Data** | NOT from contract | Empty object, frontend populates |
| **Story Data** | NOT from contract | Empty object, frontend populates |

### **Beneficiary Code → Project Mapping:**

```
01-GRG → Grgich Hills Estate (Regenerative Sheep Grazing)
02-ELG → El Globo Habitat Bank (Biodiversity Conservation)
03-JAG → Jaguar Stewardship (Conservation Network)
04-BUE → Buena Vista Heights (Forest Preservation)
05-WAL → Walkers Reserve (Coastal Restoration)
06-PIM → Pimlico Farm (Regenerative Agriculture)
07-HAR → Harvey Manning Park (Urban Forest Conservation)
08-STE → St. Elmo Preservation (Community Conservation)
```

---

## Environment Variables

```env
# Data Mode
USE_MOCK_DATA=false

# Contract Addresses
SEED_NFT_ADDRESS=0xF1d8b736AFf4A22d9c82C91624FC351fdFb63506
SEED_FACTORY_ADDRESS=0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8
SNAPSHOT_NFT_ADDRESS=0x5203D3C460ba2d0156c97D8766cCE70b69eDd3A6
DISTRIBUTOR_ADDRESS=0x9142A61188e829BF924CeffF27e8ed8111700C9B
AAVE_POOL_ADDRESS=0x973842f397af60F68068CCF6F776b4c466Ae1ca6

# RPC Configuration
RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR-API-KEY
RPC_RATE_LIMIT_DELAY=100
RPC_MAX_RETRIES=3
RPC_BATCH_SIZE=5
```

**RPC Providers:**
- **Alchemy** (Recommended): 300 calls/second - `https://base-mainnet.g.alchemy.com/v2/YOUR-KEY`
- **Public Base RPC**: 10 calls/second - `https://mainnet.base.org` (rate limited)
- **QuickNode**: Custom limits - `https://YOUR-ENDPOINT.quiknode.pro/YOUR-KEY/`

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
- `404`: Not Found (seed/beneficiary doesn't exist)
- `500`: Internal Server Error

---

## Important Notes

### **NO MOCK DATA Policy**

When `USE_MOCK_DATA=false`:
- ✅ **ALL data comes from contracts or `projects.json`**
- ❌ **NO fallbacks to mock/fake data**
- ❌ **NO placeholder image URLs**
- Returns `404` if seed doesn't exist
- Returns empty array `[]` if no seeds found
- Returns empty string `""` for images if not available from contract

### **Response Structure Philosophy**

**All fields that the frontend expects are ALWAYS included**, even if empty:

1. **Contract Data** (always populated):
   - Basic seed info, location, snapshot price, beneficiaries
   - These have actual data from the blockchain

2. **Helper/Frontend Data** (included but empty):
   - `wayOfFlowersData`: Empty object `{backgroundImageUrl: '', ...}`
   - `story`: Empty object `{title: '', author: '', story: ''}`

3. **Enriched Data** (from `projects.json`):
   - `beneficiaries[].projectData`: Full project details mapped by code

**Why?** This prevents the frontend from breaking when accessing these fields. The fields exist in the response, they just don't have values because that data isn't in the smart contracts.

### **Percentage Calculation**

Contracts store percentages as **basis points** (10000 = 100%):
```
Contract: getBeneficiaryPercentage(0) → 1409 (basis points)
Backend: Converts to "14.09" (percentage)
Frontend: Display as "14.09%"
```

### **Image URLs**

- Fetched from `tokenURI()` and `seedURI()` which return base64-encoded JSON
- Backend decodes and extracts image URL
- Cleans HTML encoding artifacts (`<`, `>`)
- Returns real S3 URLs (e.g., `https://wof-flourishing-backup.s3.amazonaws.com/...`)

---

## Frontend Integration Example

### Reading Seed Data

```typescript
// Get seed detail
const response = await fetch('/api/seeds/1');
const { seed } = await response.json();

// ✅ These fields ALWAYS exist and have contract data:
console.log(seed.id);              // "1"
console.log(seed.location);        // "Berlin" (from contract)
console.log(seed.snapshotPrice);   // "0.011000"
console.log(seed.seedImageUrl);    // "https://wof-flourishing-backup.s3.amazonaws.com/seed1/seed.png"

// ✅ Beneficiaries with full project data:
console.log(seed.beneficiaries[0].code);              // "01-GRG"
console.log(seed.beneficiaries[0].percentage);        // "14.09"
console.log(seed.beneficiaries[0].projectData.title); // "Grgich Hills Estate"
console.log(seed.beneficiaries[0].projectData.location); // "Rutherford, Napa Valley, California"

// ⚠️ These fields ALWAYS exist but are empty (not from contract):
console.log(seed.wayOfFlowersData);  // {backgroundImageUrl: '', ...} - empty strings
console.log(seed.story);             // {title: '', author: '', story: ''} - empty strings

// Frontend can safely check if they need population:
const needsStory = seed.story.title === ''; // true - frontend should populate
const needsWayOfFlowers = seed.wayOfFlowersData.firstText === ''; // true
```

### Displaying Beneficiary Data

```typescript
// Beneficiaries include full project information
seed.beneficiaries.forEach(ben => {
  console.log(`${ben.code}: ${ben.percentage}%`);
  console.log(`Project: ${ben.projectData.title}`);
  console.log(`Location: ${ben.projectData.location}`);
  console.log(`Benefits: ${ben.projectData.benefits.join(', ')}`);
});
```

---

## Performance & Rate Limiting

### **Contract Calls Per Request:**

- `/api/seeds` (list): **~12 calls per seed**
- `/api/seeds/:id` (detail): **~20+ calls** (includes beneficiary data)

### **Recommendations:**

1. **Use Alchemy RPC** for 300 calls/second (vs 10 on public RPC)
2. **Implement caching** (Redis/Memory) for beneficiary data
3. **Consider multicall contract** to batch multiple reads into one call
4. **Increase rate limit delays** if still hitting limits

---

**Last Updated:** October 2025
**Version:** 2.0 (Mock Data Removal + Project Integration)
