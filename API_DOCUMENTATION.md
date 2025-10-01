# Seedify Backend API Documentation

## Overview

The Seedify Backend API provides endpoints to interact with the Seedify smart contract ecosystem. The API can operate in two modes:

1. **Mock Data Mode** (Default): Uses mock data for development and testing
2. **Contract Mode**: Connects to real smart contracts on Base Mainnet

## Configuration

Set environment variables to configure the API:

```bash
# Use mock data (default)
USE_MOCK_DATA=true

# Use real contract data
USE_MOCK_DATA=false
RPC_URL=https://mainnet.base.org
SEED_FACTORY_ADDRESS=0xYourSeedFactory
SEED_NFT_ADDRESS=0xYourSeedNFT
SNAPSHOT_NFT_ADDRESS=0xYourSnapshotNFT
DISTRIBUTOR_ADDRESS=0xYourDistributor

# Optional tuning (defaults shown)
RATE_LIMIT_DELAY=100
MAX_RETRIES=3
BATCH_SIZE=5
```

## API Endpoints

### Health & Status

#### GET /api/health
Returns server health status with uptime and environment info.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Seedify Backend API",
  "version": "1.0.0",
  "uptime": 123.456,
  "environment": "development",
  "memory": { "rss": 123456, "heapTotal": 123456, "heapUsed": 123456 },
  "pid": 1234
}
```

#### GET /api/status
Simple status check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Seeds

#### GET /api/seeds
Get all available seeds (lightweight summaries). Heavy fields like beneficiaries/ecosystem projects are omitted here.

**Response:**
```json
{
  "success": true,
  "seeds": [
    {
      "id": "1",
      "label": "Seed #1",
      "name": "Digital Flower 1",
      "description": "A beautiful digital flower...",
      "seedImageUrl": "/images/seeds/seed-1.png",
      "latestSnapshotUrl": "/images/snapshots/snapshot-1-latest.png",
      "snapshotCount": 5,
      "owner": "0x1234...",
      "depositAmount": "1.2345",
      "snapshotPrice": "0.001234",
      "isWithdrawn": false,
      "isLive": true,
      "metadata": {
        "exists": true,
        "attributes": [
          { "trait_type": "Type", "value": "Seed" },
          { "trait_type": "Token ID", "value": 1 }
        ]
      }
    }
  ],
  "timestamp": 1704067200000
}
```

#### GET /api/seeds/:id
Get a specific seed by ID. Includes detailed derived data, including beneficiaries and related ecosystem content.

**Parameters:**
- `id` (number): The seed ID

**Response:**
```json
{
  "success": true,
  "seed": {
    "id": "1",
    "label": "Seed #1",
    "name": "Digital Flower 1",
    "description": "A beautiful digital flower...",
    "seedImageUrl": "/images/seeds/seed-1.png",
    "latestSnapshotUrl": "/images/snapshots/snapshot-1-latest.png",
    "snapshotCount": 5,
    "owner": "0x1234...",
    "depositAmount": "1.2345",
    "snapshotPrice": "0.001234",
    "isWithdrawn": false,
    "isLive": true,
    "metadata": {
      "exists": true,
      "attributes": [...]
    },
    "beneficiaries": [
      { "code": "ELGLOBO", "index": 0, "name": "El Globo Habitat Bank" },
      { "code": "WALKERS", "index": 1, "name": "Walkers Reserve" },
      { "code": "BUENAVISTA", "index": 2, "name": "Buena Vista Heights" },
      { "code": "GRGICH", "index": 3, "name": "Grgich Hills Estate" }
    ],
    "locations": [...],
    "ecosystemProjects": [...],
    "wayOfFlowersData": {...}
  },
  "timestamp": 1704067200000
}
```

#### GET /api/seeds/count
Get the total number of seeds.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "timestamp": 1704067200000
}
```

#### GET /api/seeds/contract-info
Get contract information and current mode.

**Response:**
```json
{
  "success": true,
  "data": {
    "usingMockData": true,
    "message": "Currently using mock data for development",
    "contractAddress": null
  },
  "timestamp": 1704067200000
}
```

## Data Types

### Seed Interface
```typescript
interface Seed {
  id: string;
  label: string;
  name: string;
  description: string;
  seedImageUrl: string;
  latestSnapshotUrl: string | null;
  snapshotCount: number;
  owner: string;
  depositAmount: string | null;
  snapshotPrice: string;
  isWithdrawn: boolean;
  isLive: boolean;
  metadata: SeedMetadata;
  // Only on detail endpoint
  beneficiaries?: Array<{ code: string; index?: number; name?: string }>;
  locations?: Location[];
  ecosystemProjects?: EcosystemProject[];
  wayOfFlowersData?: WayOfFlowersData;
}
```

### SeedMetadata Interface
```typescript
interface SeedMetadata {
  exists: boolean;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "timestamp": 1704067200000
}
```

## Smart Contract Integration

When `USE_MOCK_DATA=false`, the API connects to the following smart contracts:

- **SeedNFT**: Main NFT contract for seeds
- **SeedFactory**: Factory contract for creating seeds
- **SnapshotNFT**: Contract for seed snapshots
- **Distributor**: Contract for reward distribution

The API uses the following contract functions:
- SeedNFT: `getTotalSeeds()`, `getSeedByIndex(index)`, `getSeedMetadata(seedId)`, `getSeedLocation(seedId)`, `ownerOf(seedId)`
- SeedFactory: `getSeedInfo(seedId)`, `getDepositAmount(seedId)`, `getUnlockTime(seedId)`, `seedSnapshotPrices(seedId)`
- SnapshotNFT: `getSeedSnapshots(seedId)`, `getSnapshotData(snapshotId)`, `getBeneficiarySnapshots(index)`, `getTotalSnapshots()`, `getTotalValueRaised()`
- Distributor: `getAllBeneficiaries()`, `getBeneficiary(index)`, `getBeneficiaryByCode(code)`

## Development

### Running with Mock Data
```bash
npm run dev
# API will use mock data by default
```

### Running with Real Contract Data
```bash
USE_MOCK_DATA=false \
SEED_NFT_ADDRESS=0xYourContractAddress \
npm run dev
```

### Testing Endpoints
```bash
# Get all seeds
curl http://localhost:3001/api/seeds

# Get specific seed
curl http://localhost:3001/api/seeds/1

# Get seeds count
curl http://localhost:3001/api/seeds/count

# Get contract info
curl http://localhost:3001/api/seeds/contract-info

# Beneficiaries
curl http://localhost:3001/api/beneficiaries
curl http://localhost:3001/api/beneficiaries/0
curl http://localhost:3001/api/beneficiaries/by-code/ELGLOBO

# Snapshots
curl http://localhost:3001/api/snapshots/seed/1
curl http://localhost:3001/api/snapshots/id/1001
curl http://localhost:3001/api/snapshots/beneficiary/0
curl http://localhost:3001/api/snapshots/stats
```

## Future Enhancements

- Admin write endpoints with signer integration
- Real-time updates via WebSocket
- Caching layer for better performance
- Rate limiting and authentication
