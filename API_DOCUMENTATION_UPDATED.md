# Seedify Backend API Documentation

## Overview
Complete API documentation for the Seedify Backend (Way of Flowers Project).

**Base URL**: `https://your-backend-url.com/api`  
**Version**: 2.1  
**Last Updated**: January 2025

---

## 📋 Table of Contents

1. [Health & Status Endpoints](#health--status-endpoints)
2. [Seed Endpoints](#seed-endpoints)
3. [Beneficiary Endpoints](#beneficiary-endpoints)
4. [Snapshot Endpoints](#snapshot-endpoints)
5. [User Endpoints](#user-endpoints)
6. [Write Endpoints (Transaction Preparation)](#write-endpoints)
7. [Webhook Endpoints](#webhook-endpoints)
8. [Admin Endpoints](#admin-endpoints)
9. [Environment Configuration](#environment-configuration)
10. [Error Responses](#error-responses)

---

## Health & Status Endpoints

### 1. Health Check
**`GET /api/health`**

Returns detailed health information about the service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "service": "Seedify Backend API",
  "version": "1.0.0",
  "uptime": 3600.5,
  "environment": "production",
  "memory": {
    "rss": 123456789,
    "heapTotal": 98765432,
    "heapUsed": 87654321,
    "external": 12345678
  },
  "pid": 12345
}
```

### 2. Health Head Check
**`HEAD /api/health`**

Simple health check without response body. Returns `200 OK` status.

### 3. Status Check
**`GET /api/status`**

Returns server status information.

**Response:**
```json
{
  "message": "Backend server is running!",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "server": "Express.js",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600.5
}
```

---

## Seed Endpoints

### 1. Get All Seeds
**`GET /api/seeds`**

Returns a list of all seeds with essential data (lightweight response).

**Response:**
```json
{
  "success": true,
  "seeds": [
    {
      "id": "1",
      "label": "Seed 001",
      "name": "Digital Flower 1",
      "description": "A beautiful digital flower planted in berlin. This seed was created on 9/4/2025...",
      "seedImageUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/seed.png",
      "latestSnapshotUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/snap1-4-...png",
      "snapshotCount": 4,
      "owner": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
      "depositAmount": "0.0066",
      "snapshotPrice": "0.011000",
      "isWithdrawn": false,
      "isLive": false,
      "metadata": {
        "exists": true,
        "attributes": [
          { "trait_type": "Type", "value": "Seed" },
          { "trait_type": "Token ID", "value": 1 },
          { "trait_type": "Location", "value": "berlin" },
          { "trait_type": "Created", "value": "2025-09-04T17:05:51.000Z" },
          { "trait_type": "Deposit Amount", "value": "0.0066" },
          { "trait_type": "Snapshot Count", "value": 4 },
          { "trait_type": "Withdrawn", "value": "No" },
          { "trait_type": "Owner", "value": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f" }
        ]
      }
    }
  ],
  "timestamp": 1760179717118
}
```

**Note:** This is a lightweight list view. Beneficiaries, wayOfFlowersData, and story are NOT included. Use `/api/seeds/:id` for full details.

### 2. Get Seed By ID
**`GET /api/seeds/:id`**

Returns complete seed data including beneficiaries with enriched project information.

**Parameters:**
- `id` (path): Seed ID (positive integer)

**Response:**
```json
{
  "success": true,
  "seed": {
    "id": "1",
    "label": "Seed 001",
    "name": "Digital Flower 1",
    "description": "A beautiful digital flower planted in berlin. This seed was created on 9/4/2025...",
    "seedImageUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/seed.png",
    "latestSnapshotUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/snap1-4-...png",
    "snapshotCount": 4,
    "owner": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
    "depositAmount": "0.0066",
    "snapshotPrice": "0.011000",
    "isWithdrawn": false,
    "isLive": false,
    "metadata": {
      "exists": true,
      "attributes": [...]
    },
    "location": "berlin",
    "wayOfFlowersData": {
      "backgroundImageUrl": "/project_images/05__WAL.png",
      "seedEmblemUrl": "/seeds/05__WAL.png",
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
        "code": "05-WAL",
        "index": 4,
        "name": "Walkers Reserve Coastal Restoration & Climate Resilience",
        "percentage": "49.95",
        "address": "0xd2D7441d36569200bA5b7cE9c90623a364dB1297",
        "allocatedAmount": "0.000000",
        "totalClaimed": "0.000000",
        "claimableAmount": "0.000000",
        "isActive": true,
        "beneficiaryValue": "0.033020",
        "slug": "walkers-reserve",
        "projectData": {
          "title": "Walkers Reserve",
          "subtitle": "Coastal Restoration & Climate Resilience",
          "location": "Barbados",
          "area": "3.3 km coastline, 277 acres",
          "description": "From the scarred landscape of decades-old extraction emerges...",
          "benefits": [
            "Storm surge protection",
            "Critical sea turtle habitat preservation",
            "Coastal erosion prevention",
            "Carbon sequestration",
            "Biodiversity creation and protection"
          ],
          "moreDetails": "Walkers Reserve encompasses the Caribbean's most comprehensive...",
          "backgroundImage": "/project_images/05__WAL.png",
          "readMoreLink": "https://barbadostoday.bb/2025/04/03/from-quarry-to-green-hub-walkers-reserve-leads-change/"
        }
      }
    ]
  },
  "timestamp": 1760179717118
}
```

**Seed Beneficiary Mappings (Hardcoded):**
- **Seed 1**: Walkers Reserve, El Globo, Jaguar, Pimlico
- **Seed 2**: Grgich Hills, Buena Vista, Jaguar, Pimlico
- **Other Seeds**: First 4 beneficiaries (Grgich, El Globo, Jaguar, Buena Vista)

**Error Response (404):**
```json
{
  "success": false,
  "error": "Seed not found",
  "message": "Seed with ID 999 does not exist",
  "timestamp": 1760179717118
}
```

### 3. Get Seeds Count
**`GET /api/seeds/count`**

**Response:**
```json
{
  "success": true,
  "count": 3,
  "timestamp": 1760179717118
}
```

### 4. Get Seed Statistics
**`GET /api/seeds/:id/stats`**

Returns comprehensive statistics and financial metrics for a specific seed.

**Parameters:**
- `id` (path): Seed ID

**Response:**
```json
{
  "success": true,
  "stats": {
    "seedId": 1,
    "seedNumber": "001",
    "totalSnapshots": 12,
    "snapshotPrice": "0.011000",
    "snapshotShare": "30.50",
    "mintedOn": "2025-09-04T17:05:51.000Z",
    "lastSnapshotMintDate": "2025-10-14T15:30:00.000Z",
    "maturationDate": "2029-09-04T17:05:51.000Z",
    "nutrientReserveTotal": "1.062600",
    "absoluteNutrientYield": "1.150000",
    "harvestable": "0.920000",
    "earlyHarvestFee": {
      "percentage": 85.25,
      "amount": "0.230000",
      "canWithdrawWithoutFee": false
    },
    "twentyPercentShareValue": "0.200000",
    "highestSeedDeposit": "1.000000",
    "immediateImpact": "0.066000",
    "immediateImpactDate": "2025-10-14T15:30:00.000Z",
    "longtermImpact": "0.025000",
    "longtermImpactDate": null,
    "overallAccumulatedYield": "0.075000",
    "breakdown": {
      "originalDeposit": "1.000000",
      "accumulatedProfits": "0.150000",
      "totalValue": "1.150000",
      "avgSnapshotDistribution": "0.003355",
      "totalSnapshotDistributions": "0.040260"
    }
  },
  "timestamp": 1760179717118
}
```

**Fields Explained:**

**Basic Info:**
- `seedId`: The seed's ID number
- `seedNumber`: Formatted seed number (e.g., "001")
- `totalSnapshots`: Number of snapshots minted for this seed
- `snapshotPrice`: Price to mint a snapshot for this seed (ETH)
- `snapshotShare`: Dynamic percentage (10-20%) that goes to seed from each snapshot

**Dates:**
- `mintedOn`: When the seed was created (ISO format)
- `lastSnapshotMintDate`: When the last snapshot was minted (null if no snapshots)
- `maturationDate`: When seed can be withdrawn without penalty (ISO format)

**Financial Metrics:**
- `nutrientReserveTotal`: Original deposit + accumulated snapshot distributions
  - Formula: `originalDeposit + (totalSnapshots × snapshotPrice × snapshotShare%)`
- `absoluteNutrientYield`: Total value including all profits
  - Formula: Original seed price + funds staked later + accumulated profits
- `harvestable`: Amount that can be withdrawn now (after fees)
- `earlyHarvestFee`: Exit penalty information
  - `percentage`: Tax percentage if withdrawn now (0-100%)
  - `amount`: Tax amount in ETH
  - `canWithdrawWithoutFee`: True if maturation date has passed

**Value Calculations:**
- `twentyPercentShareValue`: 20% of the highest seed deposit in the system
  - Used for dynamic percentage calculations
- `highestSeedDeposit`: The highest deposit among all seeds

**Impact Metrics:**
- `immediateImpact`: Total funding distributed to beneficiaries
  - Formula: `totalSnapshots × snapshotPrice × 0.5` (50% goes to beneficiary)
- `immediateImpactDate`: Date of last snapshot mint (when last distribution occurred)
- `longtermImpact`: Estimated interest distribution per seed
  - Formula: `totalPoolInterest / numberOfSeeds`
- `longtermImpactDate`: Date of last interest distribution (not tracked on-chain, returns null)
- `overallAccumulatedYield`: Total accumulated pool interest across all seeds

**Breakdown:**
- `originalDeposit`: Initial deposit amount
- `accumulatedProfits`: Profits earned from snapshots
- `totalValue`: Current total value (deposit + profits)
- `avgSnapshotDistribution`: Average distribution per snapshot to seed
- `totalSnapshotDistributions`: Total received from all snapshots

### 5. Get Contract Info
**`GET /api/seeds/contract-info`**

**Response:**
```json
{
  "success": true,
  "data": {
    "usingMockData": false,
    "environment": {
      "USE_MOCK_DATA": "false",
      "SEED_FACTORY_ADDRESS": "0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8",
      "RPC_URL": "https://mainnet.base.org"
    },
    "contractAddress": "0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8",
    "provider": "Base Mainnet"
  },
  "timestamp": 1760179717118
}
```

---

## Beneficiary Endpoints

### 1. Get All Beneficiaries
**`GET /api/beneficiaries`**

Returns all beneficiaries with comprehensive data from Distributor contract, enriched with project data.

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
      "percentage": "0.04",
      "beneficiaryValue": "0.033020",
      "slug": "grgich-hills-estate",
      "projectData": {
        "title": "Grgich Hills Estate",
        "subtitle": "Regenerative Sheep Grazing",
        "location": "Rutherford, Napa Valley, California",
        "area": "126.6 hectares",
        "description": "Across Napa's vineyard terraces...",
        "benefits": ["Enhanced nutrient cycling", "Reduced external inputs", "Wildfire mitigation", "Soil carbon storage"],
        "moreDetails": "The project represents a sophisticated evolution...",
        "backgroundImage": "/project_images/01__GRG.png",
        "readMoreLink": "https://app.regen.network/project/KSH01-001"
      }
    }
  ],
  "count": 8,
  "timestamp": 1760179717118
}
```

**Beneficiary Fields Explained:**
- `index`: Beneficiary index in contract (0-7)
- `address`: Ethereum address that receives distributions
- `name`: Full name from Distributor contract
- `code`: Unique identifier (e.g., "01-GRG")
- `allocatedAmount`: Total allocated from contract (ETH)
- `totalClaimed`: Total already claimed (ETH)
- `claimableAmount`: Currently claimable amount (ETH)
- `isActive`: Whether beneficiary is active
- `percentage`: Distribution percentage (converted from basis points: `1409` → `"14.09"`)
- `beneficiaryValue`: Total value raised for this beneficiary (ETH)
- `slug`: URL-friendly slug for routing
- `projectData`: Full project information from `projects.json`
- `readMoreLink`: External link to learn more about the project

### 2. Get Beneficiary Count
**`GET /api/beneficiaries/count`**

**Response:**
```json
{
  "success": true,
  "count": 8,
  "timestamp": 1760179717118
}
```

### 3. Get Beneficiary By Index
**`GET /api/beneficiaries/:index`**

**Parameters:**
- `index` (path): Beneficiary index (0-7)

**Response:**
```json
{
  "success": true,
  "beneficiary": {
    "index": 0,
    "address": "0xd2D7441d36569200bA5b7cE9c90623a364dB1297",
    "name": "Grgich Hills Estate Regenerative Sheep Grazing",
    "code": "01-GRG",
    "allocatedAmount": "0.000000",
    "totalClaimed": "0.000000",
    "claimableAmount": "0.000000",
    "isActive": true,
    "percentage": "0.04",
    "beneficiaryValue": "0.033020",
    "totalValue": "0.033020",
    "snapshotCount": 5,
    "slug": "grgich-hills-estate",
    "projectData": {
      "title": "Grgich Hills Estate",
      "subtitle": "Regenerative Sheep Grazing",
      "location": "Rutherford, Napa Valley, California",
      "area": "126.6 hectares",
      "description": "...",
      "benefits": [...],
      "moreDetails": "...",
      "backgroundImage": "/project_images/01__GRG.png",
      "readMoreLink": "https://app.regen.network/project/KSH01-001"
    }
  },
  "timestamp": 1760179717118
}
```

### 4. Get Beneficiary By Code
**`GET /api/beneficiaries/by-code/:code`**

**Parameters:**
- `code` (path): Beneficiary code (e.g., "01-GRG")

**Example:** `GET /api/beneficiaries/by-code/01-GRG`

**Response:** Same as Get Beneficiary By Index

**Error Response (404):**
```json
{
  "success": false,
  "error": "Beneficiary not found",
  "timestamp": 1760179717118
}
```

---

## Snapshot Endpoints

### 1. Get Snapshots By Seed
**`GET /api/snapshots/seed/:seedId`**

Returns all snapshots for a specific seed with image URLs.

**Parameters:**
- `seedId` (path): Seed ID

**Response:**
```json
{
  "success": true,
  "snapshots": [
    {
      "id": 1,
      "creator": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
      "value": 11000000000000000,
      "valueEth": "0.011000",
      "beneficiaryIndex": 2,
      "seedId": 1,
      "timestamp": 1757530297,
      "blockNumber": 28101234,
      "positionInSeed": 1,
      "processId": "1757530297548-26yju",
      "imageUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/snap1-1-...png"
    }
  ],
  "count": 4,
  "timestamp": 1760179717118
}
```

### 2. Get Snapshot By ID
**`GET /api/snapshots/id/:snapshotId`**

**Parameters:**
- `snapshotId` (path): Snapshot ID

**Response:**
```json
{
  "success": true,
  "snapshot": {
    "id": 1,
    "creator": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
    "value": 11000000000000000,
    "valueEth": "0.011000",
    "beneficiaryIndex": 2,
    "seedId": 1,
    "timestamp": 1757530297,
    "blockNumber": 28101234,
    "positionInSeed": 1,
    "processId": "1757530297548-26yju",
    "imageUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/snap1-1-...png"
  },
  "timestamp": 1760179717118
}
```

### 3. Get Snapshots By Beneficiary
**`GET /api/snapshots/beneficiary/:index`**

Returns all snapshots for a specific beneficiary.

**Parameters:**
- `index` (path): Beneficiary index (0-7)

**Response:** Same format as Get Snapshots By Seed

### 4. Get Snapshot Stats
**`GET /api/snapshots/stats`**

**Response:**
```json
{
  "success": true,
  "total": 42,
  "valueRaised": "462000000000000000",
  "valueRaisedEth": "0.462000",
  "timestamp": 1760179717118
}
```

---

## User Endpoints

All user endpoints require a valid Ethereum address.

### 1. Get User's Seeds
**`GET /api/users/:address/seeds`**

Returns all seeds owned by the user (steward seeds).

**Parameters:**
- `address` (path): Ethereum address

**Response:**
```json
{
  "success": true,
  "seeds": [
    {
      "id": "1",
      "label": "Seed 001",
      "name": "Digital Flower 1",
      "description": "...",
      "seedImageUrl": "https://...",
      "latestSnapshotUrl": "https://...",
      "snapshotCount": 4,
      "owner": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
      "depositAmount": "0.0066",
      "snapshotPrice": "0.011000",
      "isWithdrawn": false,
      "isLive": false,
      "metadata": {...},
      "location": "berlin",
      "wayOfFlowersData": {...},
      "story": {...},
      "beneficiaries": [...]
    }
  ],
  "count": 1,
  "owner": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
  "timestamp": 1760179717118
}
```

### 2. Get User's Seed Count
**`GET /api/users/:address/seeds/count`**

**Response:**
```json
{
  "success": true,
  "count": 1,
  "owner": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
  "timestamp": 1760179717118
}
```

### 3. Get User's Snapshots
**`GET /api/users/:address/snapshots`**

Returns all snapshots created/owned by the user.

**Response:**
```json
{
  "success": true,
  "snapshots": [
    {
      "id": 1,
      "creator": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
      "value": 11000000000000000,
      "valueEth": "0.011000",
      "beneficiaryIndex": 2,
      "seedId": 1,
      "timestamp": 1757530297,
      "blockNumber": 28101234,
      "positionInSeed": 1,
      "processId": "1757530297548-26yju"
    }
  ],
  "count": 4,
  "creator": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
  "timestamp": 1760179717118
}
```

### 4. Get User's Snapshot Count
**`GET /api/users/:address/snapshots/count`**

**Response:**
```json
{
  "success": true,
  "count": 4,
  "creator": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
  "timestamp": 1760179717118
}
```

### 5. Get User's Snapshot Data (Detailed)
**`GET /api/users/:address/snapshots/data`**

Returns detailed snapshot data using contract's `getUserSnapshotData` function.

**Response:**
```json
{
  "success": true,
  "snapshots": [
    {
      "creator": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
      "value": 11000000000000000,
      "valueEth": "0.011000",
      "beneficiaryIndex": 2,
      "seedId": 1,
      "timestamp": 1757530297,
      "blockNumber": 28101234,
      "positionInSeed": 1,
      "processId": "1757530297548-26yju"
    }
  ],
  "count": 4,
  "creator": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
  "timestamp": 1760179717118
}
```

### 6. Get User's Pool Balance
**`GET /api/users/:address/balance`**

Returns user's balance in the Aave pool.

**Response:**
```json
{
  "success": true,
  "balance": "1.234567",
  "balanceWei": "1234567000000000000",
  "user": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
  "timestamp": 1760179717118
}
```

### 7. Get User's Stats
**`GET /api/users/:address/stats`**

Returns aggregate statistics for a user.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSeeds": 1,
    "totalSnapshots": 4,
    "poolBalance": "0.000000",
    "seedNFTBalance": 1,
    "snapshotNFTBalance": 4
  },
  "user": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
  "timestamp": 1760179717118
}
```

### 8. Get User's Portfolio (Complete)
**`GET /api/users/:address/portfolio`**

Returns comprehensive user portfolio including all seeds, snapshots, and financial summary.

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "seeds": [
      {
        "id": "1",
        "label": "Seed 001",
        "name": "Digital Flower 1",
        "description": "...",
        "seedImageUrl": "https://...",
        "latestSnapshotUrl": "https://...",
        "snapshotCount": 4,
        "owner": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
        "depositAmount": "0.0066",
        "snapshotPrice": "0.011000",
        "isWithdrawn": false,
        "isLive": false,
        "metadata": {...},
        "location": "berlin",
        "wayOfFlowersData": {...},
        "story": {...},
        "beneficiaries": [...]
      }
    ],
    "snapshots": [
      {
        "id": 1,
        "creator": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
        "value": 11000000000000000,
        "valueEth": "0.011000",
        "beneficiaryIndex": 2,
        "seedId": 1,
        "timestamp": 1757530297,
        "blockNumber": 28101234,
        "positionInSeed": 1,
        "processId": "1757530297548-26yju"
      }
    ],
    "summary": {
      "totalSeeds": 1,
      "totalSnapshots": 4,
      "totalDeposited": "0.006600",
      "totalSnapshotValue": "0.044000",
      "poolBalance": "0.000000"
    }
  },
  "user": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
  "timestamp": 1760179717118
}
```

**Note:** This is the most comprehensive user endpoint, combining seeds, snapshots, and financial summary.

---

## Write Endpoints

All write endpoints prepare transaction data for the frontend to execute. They **do NOT execute transactions** - the frontend must use a wallet to sign and execute.

**Standard Response Format:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0x...",
    "functionName": "createSeed",
    "args": [...],
    "value": "1000000000000000000",
    "description": "Create a new seed with specified snapshot price and location"
  },
  "message": "Transaction data prepared. Frontend should execute the transaction.",
  "timestamp": 1760179717118
}
```

### 1. Create Seed
**`POST /api/write/seeds/create`**

**Request Body:**
```json
{
  "snapshotPrice": "0.011",
  "location": "berlin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8",
    "functionName": "createSeed",
    "args": [11000000000000000, "berlin"],
    "value": "0",
    "description": "Create a new seed with specified snapshot price and location"
  },
  "message": "Transaction data prepared. Frontend should execute the transaction.",
  "timestamp": 1760179717118
}
```

### 2. Deposit to Seed
**`POST /api/write/seeds/:id/deposit`**

**Parameters:**
- `id` (path): Seed ID

**Request Body:**
```json
{
  "amount": "0.5"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8",
    "functionName": "depositForSeed",
    "args": [1],
    "value": "500000000000000000",
    "description": "Deposit 0.5 ETH to seed 1"
  },
  "message": "Transaction data prepared. Frontend should execute the transaction.",
  "timestamp": 1760179717118
}
```

### 3. Withdraw from Seed
**`POST /api/write/seeds/:id/withdraw`**

**Parameters:**
- `id` (path): Seed ID

**Request Body (optional):**
```json
{
  "amount": "0.25"
}
```
*If amount is not provided, withdraws all.*

**Response:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8",
    "functionName": "withdrawSeedDeposit",
    "args": [1, "250000000000000000"],
    "value": "0",
    "description": "Withdraw 0.25 ETH from seed 1"
  },
  "message": "Transaction data prepared. Frontend should execute the transaction.",
  "timestamp": 1760179717118
}
```

### 4. Claim Seed Profits
**`POST /api/write/seeds/:id/claim-profits`**

**Parameters:**
- `id` (path): Seed ID

**Response:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8",
    "functionName": "claimSeedProfits",
    "args": [1],
    "value": "0",
    "description": "Claim profits for seed 1"
  },
  "message": "Transaction data prepared. Frontend should execute the transaction.",
  "timestamp": 1760179717118
}
```

### 5. Prepare Mint Snapshot
**`GET /api/write/snapshots/mint/:seedId?beneficiaryIndex=0`**

**NEW:** This endpoint prepares ALL data needed for minting a snapshot, including processId, snapshotId, beneficiaryCode, and distribution percentage.

**Parameters:**
- `seedId` (path): Seed ID
- `beneficiaryIndex` (query, optional): Beneficiary index (0-7)

**Response (with beneficiaryIndex):**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0xSnapFactoryAddress",
    "functionName": "mintSnapshot",
    "args": {
      "seedId": 1,
      "beneficiaryIndex": 0,
      "royaltyRecipient": "0xe39C834603f50FFd4eEbf35437a0770CA90a9ACd"
    },
    "value": "11000000000000000",
    "valueEth": "0.011",
    "description": "Mint snapshot for seed 1",
    "seedOwner": "0xD8f39D7e039EB9563C1A2Ed49AC7FDfD4868b77f",
    "processId": "1760179717118-abc123def",
    "snapshotId": 5,
    "blockNumber": 28123456,
    "beneficiaryCode": "01-GRG",
    "beneficiaryDistribution": 25.5
  },
  "message": "Transaction data prepared. Frontend should execute the transaction with these exact values.",
  "timestamp": 1760179717118
}
```

**Frontend Usage:**
1. Call this endpoint with selected beneficiaryIndex
2. Store ALL response data
3. Execute contract call:
```javascript
await writeContract({
  address: data.contractAddress,
  abi: SnapFactoryAbi,
  functionName: 'mintSnapshot',
  args: [
    data.args.seedId,           // from backend
    data.args.beneficiaryIndex, // from backend
    data.processId,              // from backend (generated)
    userWalletAddress,           // only frontend-provided value
    data.args.royaltyRecipient  // from backend
  ],
  value: BigInt(data.value)
});
```
4. After transaction confirms, call webhook with backend data + txHash

**Response (without beneficiaryIndex):**
Returns partial data without beneficiary-specific fields.

---

## Webhook Endpoints

### 1. Snapshot Minted Webhook
**`POST /api/snapshot-minted`**

Called by frontend after successful snapshot mint to trigger external image generation service.

**Request Body:**
```json
{
  "contractAddress": "0xSnapFactoryAddress",
  "seedId": 1,
  "snapshotId": 5,
  "beneficiaryCode": "01-GRG",
  "beneficiaryDistribution": 25.5,
  "creator": "0xUserAddress",
  "txHash": "0xTransactionHash",
  "timestamp": 1760179717,
  "blockNumber": 28123456,
  "processId": "1760179717118-abc123def"
}
```

**Required Fields:**
- `contractAddress`: SnapFactory contract address (from GET response)
- `seedId`: Seed ID (from GET response)
- `snapshotId`: Next snapshot ID (from GET response)
- `beneficiaryCode`: Beneficiary code (from GET response)
- `beneficiaryDistribution`: Distribution percentage (from GET response)
- `creator`: User's wallet address
- `txHash`: Transaction hash from blockchain
- `timestamp`: Current Unix timestamp in seconds
- `blockNumber`: Block number (from GET response or transaction)
- `processId`: Process ID (from GET response - MUST match!)

**Response:**
```json
{
  "success": true,
  "message": "Snapshot minted webhook processed successfully",
  "data": {
    "imageUrl": "https://...",
    "status": "processing"
  },
  "timestamp": 1760179717118
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing required fields",
  "message": "All fields are required: contractAddress, seedId, snapshotId...",
  "timestamp": 1760179717118
}
```

**How It Works:**
1. Backend validates all required fields
2. Forwards request to external image generation service (`IMAGE_GENERATION_SERVICE_URL`)
3. Returns response from image service
4. Image service generates snapshot image and uploads to S3

---

## Admin Endpoints

### 1. Get Admin Statistics
**`GET /api/admin/stats`**

Returns comprehensive statistics from Distributor and Aave Pool contracts.

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
    },
    "claimableInterest": "2.345678"
  },
  "timestamp": 1760179717118
}
```

### 2. Add Beneficiary (Scaffold)
**`POST /api/admin/beneficiaries`**

**Status:** 501 Not Implemented (requires signer integration)

### 3. Deactivate Beneficiary (Scaffold)
**`POST /api/admin/beneficiaries/:index/deactivate`**

**Status:** 501 Not Implemented (requires signer integration)

### 4. Reactivate Beneficiary (Scaffold)
**`POST /api/admin/beneficiaries/:index/reactivate`**

**Status:** 501 Not Implemented (requires signer integration)

### 5. Update Beneficiary Address (Scaffold)
**`POST /api/admin/beneficiaries/:index/update-address`**

**Status:** 501 Not Implemented (requires signer integration)

### 6. Update Beneficiary Code (Scaffold)
**`POST /api/admin/beneficiaries/:index/update-code`**

**Status:** 501 Not Implemented (requires signer integration)

### 7. Distribute Interest (Scaffold)
**`POST /api/admin/distribute-interest`**

**Status:** 501 Not Implemented (requires signer integration)

---

## Environment Configuration

### Required Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=production
HOST=0.0.0.0
BODY_LIMIT=10mb
FRONTEND_URL=https://seedify-neon.vercel.app

# Blockchain Configuration
RPC_URL=https://mainnet.base.org

# Contract Addresses (Base Mainnet)
SEED_NFT_ADDRESS=0xF1d8b736AFf4A22d9c82C91624FC351fdFb63506
SEED_FACTORY_ADDRESS=0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8
SNAPSHOT_NFT_ADDRESS=0x5203D3C460ba2d0156c97D8766cCE70b69eDd3A6
DISTRIBUTOR_ADDRESS=0x9142A61188e829BF924CeffF27e8ed8111700C9B
AAVE_POOL_ADDRESS=0x973842f397af60F68068CCF6F776b4c466Ae1ca6

# SnapFactory Configuration (for snapshot minting)
SNAPSHOT_FACTORY=0xYourSnapFactoryAddress

# Royalty Configuration
ROYALTY_RECIPIENT=0xe39C834603f50FFd4eEbf35437a0770CA90a9ACd

# External Services
IMAGE_GENERATION_SERVICE_URL=https://wof.up.railway.app

# Rate Limiting Configuration
RATE_LIMIT_DELAY=100
MAX_RETRIES=3
BATCH_SIZE=5

# Mock Data (should be false for production)
USE_MOCK_DATA=false
```

---

## Data Sources & Contract Mapping

### Contracts Used

| Contract | Address | Purpose |
|----------|---------|---------|
| **SeedFactory** | `0xF9CBaA0CEFeADf4BCf4dBDC6810c19C92e4688f8` | Seed financial data, deposits, withdrawals |
| **SeedNFT** | `0xF1d8b736AFf4A22d9c82C91624FC351fdFb63506` | Seed metadata, location, images |
| **SnapshotNFT** | `0x5203D3C460ba2d0156c97D8766cCE70b69eDd3A6` | Snapshot data and images |
| **SnapFactory** | `env: SNAPSHOT_FACTORY` | Snapshot minting operations |
| **Distributor** | `0x9142A61188e829BF924CeffF27e8ed8111700C9B` | Beneficiary data and allocations |
| **AavePool** | `0x973842f397af60F68068CCF6F776b4c466Ae1ca6` | Pool balances and interest |

### Data Source Breakdown

| Field | Source | Contract Function |
|-------|--------|-------------------|
| **Basic Seed Data** | SeedFactory | `getSeedInfo(seedId)` |
| **Location** | SeedNFT | `getSeedLocation(seedId)` |
| **Seed Image** | SeedNFT | `tokenURI(seedId)` → base64 JSON |
| **Latest Snapshot Image** | SnapshotNFT | `seedURI(seedId)` → base64 JSON |
| **Snapshot Price** | SeedFactory | `seedSnapshotPrices(seedId)` |
| **Snapshot Data** | SnapshotNFT | `getSnapshotData(snapshotId)` |
| **Next Snapshot ID** | SnapshotNFT | `getNextSnapshotId()` |
| **User's Seeds** | SeedNFT | `getSeedsByOwner(address)` |
| **User's Snapshots** | SnapshotNFT | `getUserSnapshots(address)` |
| **Beneficiary Data** | Distributor | `getBeneficiary(index)`, `getAllBeneficiaries()` |
| **Beneficiary Percentage** | Distributor | `getBeneficiaryPercentage(index)` |
| **Beneficiary Project Data** | Local File | `projects.json` (mapped by code) |
| **Current Block Number** | Provider | `provider.getBlockNumber()` |
| **Seed Deposit Amount** | SeedFactory | `getDepositAmount(seedId)` |
| **Accumulated Profits** | SeedFactory | `getAccumulatedProfits(seedId)` |
| **Total Seed Value** | SeedFactory | `getTotalSeedValue(seedId)` |
| **Unlock Time** | SeedFactory | `getUnlockTime(seedId)` |
| **Dynamic Seed Percentage** | SeedFactory | `getDynamicSeedPercentage(seedId)` |
| **Highest Seed Deposit** | SeedFactory | `currentMaxSeedDeposit()` |
| **Claimable Interest** | AavePool | `getClaimableInterest()` |
| **Early Withdrawal Check** | SeedFactory | `seedWithdrawn[seedId]` mapping |

### Beneficiary Code → Project Mapping

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

## Error Responses

All endpoints return errors in a consistent format:

**Error Response:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": 1760179717118
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error
- `501`: Not Implemented (admin endpoints requiring signer)

**Example Error Responses:**

```json
// 400 - Invalid seed ID
{
  "success": false,
  "error": "Invalid seed ID",
  "message": "Seed ID must be a positive integer",
  "timestamp": 1760179717118
}

// 404 - Seed not found
{
  "success": false,
  "error": "Seed not found",
  "message": "Seed with ID 999 does not exist",
  "timestamp": 1760179717118
}

// 500 - Contract error
{
  "success": false,
  "error": "Failed to fetch seed",
  "message": "execution reverted: Seed does not exist",
  "timestamp": 1760179717118
}
```

---

## Complete Endpoint List

### Health & Status
- `GET /api/health` - Detailed health check
- `HEAD /api/health` - Simple health check
- `GET /api/status` - Server status

### Seeds
- `GET /api/seeds` - List all seeds (lightweight)
- `GET /api/seeds/:id` - Get seed details (with beneficiaries)
- `GET /api/seeds/:id/stats` - Get comprehensive seed statistics
- `GET /api/seeds/count` - Total seeds count
- `GET /api/seeds/contract-info` - Contract configuration

### Beneficiaries
- `GET /api/beneficiaries` - List all beneficiaries (with project data)
- `GET /api/beneficiaries/count` - Total beneficiaries count
- `GET /api/beneficiaries/:index` - Get beneficiary by index
- `GET /api/beneficiaries/by-code/:code` - Get beneficiary by code

### Snapshots
- `GET /api/snapshots/seed/:seedId` - Get snapshots for a seed
- `GET /api/snapshots/id/:snapshotId` - Get snapshot by ID
- `GET /api/snapshots/beneficiary/:index` - Get snapshots for beneficiary
- `GET /api/snapshots/stats` - Snapshot statistics

### Users
- `GET /api/users/:address/seeds` - User's owned seeds
- `GET /api/users/:address/seeds/count` - User's seed count
- `GET /api/users/:address/snapshots` - User's snapshots
- `GET /api/users/:address/snapshots/count` - User's snapshot count
- `GET /api/users/:address/snapshots/data` - Detailed snapshot data
- `GET /api/users/:address/balance` - User's pool balance
- `GET /api/users/:address/stats` - User's aggregate stats
- `GET /api/users/:address/portfolio` - Complete user portfolio

### Write Operations (Transaction Preparation)
- `POST /api/write/seeds/create` - Prepare create seed transaction
- `POST /api/write/seeds/:id/deposit` - Prepare deposit transaction
- `POST /api/write/seeds/:id/withdraw` - Prepare withdraw transaction
- `POST /api/write/seeds/:id/claim-profits` - Prepare claim profits transaction
- `GET /api/write/snapshots/mint/:seedId` - Prepare mint snapshot transaction
- `POST /api/write/admin/beneficiaries` - Prepare add beneficiary transaction
- `POST /api/write/admin/beneficiaries/:id/deactivate` - Prepare deactivate transaction
- `POST /api/write/admin/beneficiaries/:id/reactivate` - Prepare reactivate transaction
- `POST /api/write/admin/distribute-interest` - Prepare distribute interest transaction

### Webhooks
- `POST /api/snapshot-minted` - Snapshot minted webhook (triggers image generation)

### Admin
- `GET /api/admin/stats` - Admin statistics (Distributor + Pool)
- `POST /api/admin/beneficiaries` - Add beneficiary (501 - not implemented)
- `POST /api/admin/beneficiaries/:index/deactivate` - Deactivate (501)
- `POST /api/admin/beneficiaries/:index/reactivate` - Reactivate (501)
- `POST /api/admin/beneficiaries/:index/update-address` - Update address (501)
- `POST /api/admin/beneficiaries/:index/update-code` - Update code (501)
- `POST /api/admin/distribute-interest` - Distribute interest (501)

---

## Important Notes

### NO MOCK DATA Policy

When `USE_MOCK_DATA=false` (production):
- ✅ ALL data comes from smart contracts or `projects.json`
- ❌ NO fallbacks to mock/fake data
- ❌ NO placeholder image URLs
- Returns `404` if resource doesn't exist
- Returns empty array `[]` if no data found
- Returns empty string `""` for images if not available

### Response Structure Philosophy

**All fields the frontend expects are ALWAYS included**, even if empty:

1. **Contract Data** (always populated):
   - Basic seed info, location, snapshot price, beneficiaries
   - Actual data from blockchain

2. **Helper/Frontend Data** (included but may be empty):
   - `wayOfFlowersData`: Empty object or populated from first beneficiary's project background
   - `story`: Empty object (frontend populates)

3. **Enriched Data** (from `projects.json`):
   - `beneficiaries[].projectData`: Full project details
   - `beneficiaries[].slug`: URL-friendly slug
   - `beneficiaries[].projectData.readMoreLink`: External link to learn more

### Percentage Calculation

Contracts store percentages as **basis points** (10000 = 100%):

```
Contract: getBeneficiaryPercentage(0) → 1409 (basis points)
Backend: Converts to "14.09" (percentage string)
Frontend: Display as "14.09%"

Calculation: basisPoints / 100 = percentage
Example: 1409 / 100 = 14.09
```

### Image URLs

- Fetched from `tokenURI()` and `seedURI()` which return base64-encoded JSON
- Backend decodes and extracts image URL
- Cleans HTML encoding artifacts (`<`, `>`, `\u003C`, `\u003E`)
- Returns real S3 URLs: `https://wof-flourishing-backup.s3.amazonaws.com/...`

### Snapshot Minting Flow

```
1. Frontend: GET /api/write/snapshots/mint/:seedId?beneficiaryIndex=X
   ↓
2. Backend: Generates processId, fetches snapshotId, blockNumber, beneficiaryCode, distribution
   ↓
3. Frontend: Stores ALL backend data
   ↓
4. Frontend: Calls mintSnapshot on SnapFactory contract
   - Uses backend's processId, beneficiaryIndex, royaltyRecipient
   - Only adds user's wallet address
   ↓
5. Transaction confirms
   ↓
6. Frontend: POST /api/snapshot-minted
   - Relays backend data + adds txHash and creator address
   ↓
7. Backend: Forwards to image generation service
   ↓
8. Image generated and uploaded to S3
```

**Key Point:** Backend generates processId and all metadata. Frontend just uses it and relays it back!

---

## Contract Function Reference

### SnapFactory.mintSnapshot()

```solidity
function mintSnapshot(
    uint256 seedId,
    uint256 beneficiaryIndex,
    string memory process,
    address to,
    address royaltyRecipient
) external payable returns (uint256)
```

**Parameters:**
- `seedId`: The seed ID
- `beneficiaryIndex`: Beneficiary index (0-7)
- `process`: Unique process ID (generated by backend)
- `to`: Address to mint snapshot to (user's wallet)
- `royaltyRecipient`: Address receiving 10% royalty (or `address(0)` for SnapFactory)

**Returns:** Newly minted snapshot ID

---

## Performance & Optimization

### RPC Rate Limiting

**Built-in Features:**
- Exponential backoff on rate limit errors
- Configurable delays between calls (`RATE_LIMIT_DELAY`)
- Batch processing for multiple seeds (`BATCH_SIZE`)
- Maximum retries on failures (`MAX_RETRIES`)

**Recommended RPC Providers:**
- **Alchemy**: 300 calls/second - `https://base-mainnet.g.alchemy.com/v2/YOUR-KEY`
- **QuickNode**: Custom limits - `https://YOUR-ENDPOINT.quiknode.pro/YOUR-KEY/`
- **Public Base RPC**: 10 calls/second - `https://mainnet.base.org` (rate limited)

### Contract Calls Per Endpoint

| Endpoint | Approx. Calls | Notes |
|----------|---------------|-------|
| `/api/seeds` | ~12 per seed | Batched with rate limiting |
| `/api/seeds/:id` | ~20+ | Includes beneficiary lookups |
| `/api/beneficiaries` | ~3 per beneficiary | Percentage + allocation details |
| `/api/users/:address/portfolio` | ~15+ per seed/snapshot | Most comprehensive |
| `/api/write/snapshots/mint/:seedId` | ~10+ | Fetches snapshots, beneficiary, next ID |

### Optimization Tips

1. **Use Alchemy or QuickNode** for production
2. **Implement caching** (Redis/Memory) for beneficiary data
3. **Increase `BATCH_SIZE`** if RPC can handle it
4. **Consider multicall contract** for batching reads

---

## CORS Configuration

Allowed origins:
- `https://seedify-neon.vercel.app` (production frontend)
- `https://way-of-flower.vercel.app` (alternate domain)
- `http://localhost:3000` (local development)
- `http://localhost:3001` (backend self)
- Custom origin from `FRONTEND_URL` env variable

**Important:** No trailing slashes in CORS origins!

---

## Testing Examples

### Get Seed with Beneficiaries
```bash
curl https://your-backend.com/api/seeds/1
```

### Get All Beneficiaries with Project Data
```bash
curl https://your-backend.com/api/beneficiaries
```

### Get User Portfolio
```bash
curl https://your-backend.com/api/users/0xYourAddress/portfolio
```

### Prepare Mint Snapshot
```bash
curl 'https://your-backend.com/api/write/snapshots/mint/1?beneficiaryIndex=0'
```

### Trigger Snapshot Image Generation
```bash
curl -X POST https://your-backend.com/api/snapshot-minted \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "0x...",
    "seedId": 1,
    "snapshotId": 5,
    "beneficiaryCode": "01-GRG",
    "beneficiaryDistribution": 25.5,
    "creator": "0x...",
    "txHash": "0x...",
    "timestamp": 1760179717,
    "blockNumber": 28123456,
    "processId": "1760179717118-abc123def"
  }'
```

---

## API Evolution & Updates

### Version 2.1 (January 2025)
- ✅ Added `readMoreLink` to all beneficiary project data
- ✅ Added hardcoded seed-to-beneficiary mappings (Seed 1 & 2)
- ✅ Added snapshot minting flow with backend-generated processId
- ✅ Added webhook endpoint for image generation
- ✅ Fixed CORS configuration for production
- ✅ Updated build script to copy JSON files

### Version 2.0 (October 2025)
- ✅ Complete mock data removal
- ✅ Real image URLs from contract tokenURI
- ✅ Beneficiary project data integration
- ✅ Enhanced RPC integration with rate limiting
- ✅ Extended seed data (unlockTime, profits, etc.)

### Version 1.0 (Initial)
- Basic CRUD operations
- Mock data fallbacks
- Simple contract integration

---

## Security Notes

- ✅ Helmet.js for security headers
- ✅ CORS configured for specific origins
- ✅ Request body size limits (10mb)
- ✅ Input validation on all endpoints
- ⚠️ No authentication (public read API)
- ⚠️ Write operations execute on frontend (wallet-based)

---