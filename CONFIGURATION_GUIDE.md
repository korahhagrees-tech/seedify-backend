# Configuration Guide

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

### Server Configuration
```env
PORT=3001
NODE_ENV=development
HOST=localhost
BODY_LIMIT=10mb
FRONTEND_URL=http://localhost:3000
```

### Blockchain Configuration
```env
RPC_URL=https://mainnet.base.org
```

### Contract Addresses
```env
SEED_NFT_ADDRESS=0xYourSeedNFTAddress
SEED_FACTORY_ADDRESS=0xYourSeedFactoryAddress
SNAPSHOT_NFT_ADDRESS=0xYourSnapshotNFTAddress
DISTRIBUTOR_ADDRESS=0xYourDistributorAddress
AAVE_POOL_ADDRESS=0xYourAavePoolAddress
```

### SnapFactory Configuration (NEW - Required for minting snapshots)
```env
# The SnapFactory contract address used for minting snapshots
SNAPSHOT_FACTORY=0xYourSnapFactoryAddress
```

### Royalty Configuration (NEW)
```env
# The address that receives 10% royalty fee on snapshot mints
# If set to 0x0000000000000000000000000000000000000000, the fee goes to SnapFactory
# Default: 0xe39C834603f50FFd4eEbf35437a0770CA90a9ACd
ROYALTY_RECIPIENT=0xe39C834603f50FFd4eEbf35437a0770CA90a9ACd
```

### External Services (NEW)
```env
# URL of the external image generation service
# Default: https://wof.up.railway.app
IMAGE_GENERATION_SERVICE_URL=https://wof.up.railway.app
```

### Rate Limiting Configuration
```env
RATE_LIMIT_DELAY=100
MAX_RETRIES=3
BATCH_SIZE=5
```

### Mock Data (for testing without contracts)
```env
USE_MOCK_DATA=false
```

## Required Changes for Snapshot Minting

The following environment variables are **required** for the new snapshot minting flow:

1. **SNAPSHOT_FACTORY**: The address of the SnapFactory contract that handles snapshot minting
2. **ROYALTY_RECIPIENT** (optional): Defaults to `0xe39C834603f50FFd4eEbf35437a0770CA90a9ACd` if not set
3. **IMAGE_GENERATION_SERVICE_URL** (optional): Defaults to `https://wof.up.railway.app` if not set

## Verification

After setting up your environment variables, you can verify the configuration by:

1. Starting the server:
   ```bash
   npm run dev
   ```

2. Visiting `http://localhost:3001/` to see all available endpoints, including:
   - `GET /api/write/snapshots/mint/:seedId` - Prepare mint snapshot transaction
   - `POST /api/snapshot-minted` - Snapshot minted webhook

3. Testing the prepare mint endpoint:
   ```bash
   curl http://localhost:3001/api/write/snapshots/mint/1
   ```

## Troubleshooting

### "Seed not found" error
- Ensure the `SEED_FACTORY_ADDRESS` and `SEED_NFT_ADDRESS` are correctly set
- Verify the RPC_URL is accessible and pointing to the correct network

### "Missing required fields" error
- Check that all required fields are provided in the request body
- Ensure field types match the expected types (numbers, strings, addresses)

### "Image generation service error"
- Verify `IMAGE_GENERATION_SERVICE_URL` is correct
- Check that the external service is accessible from your backend
- Review the error message in the response for details

## Security Notes

- Never commit your `.env` file to version control
- Keep your RPC URLs and sensitive addresses secure
- Use environment-specific `.env` files for different deployment environments
- The `ROYALTY_RECIPIENT` address should be controlled by a trusted party

