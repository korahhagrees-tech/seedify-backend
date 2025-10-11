"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractConfig = void 0;
exports.contractConfig = {
    // Use mock data only if explicitly set to 'true' OR if no contract address is provided
    useMockData: process.env.USE_MOCK_DATA === 'true' ||
        !process.env.SEED_FACTORY_ADDRESS ||
        process.env.SEED_FACTORY_ADDRESS === '0x0000000000000000000000000000000000000000',
    // RPC Configuration
    rpcUrl: process.env.RPC_URL || 'https://mainnet.base.org',
    // Contract Addresses
    seedNFTAddress: process.env.SEED_NFT_ADDRESS,
    seedFactoryAddress: process.env.SEED_FACTORY_ADDRESS,
    snapshotNFTAddress: process.env.SNAPSHOT_NFT_ADDRESS,
    distributorAddress: process.env.DISTRIBUTOR_ADDRESS,
    aavePoolAddress: process.env.AAVE_POOL_ADDRESS,
    snapFactoryAddress: process.env.SNAPSHOT_FACTORY,
    // Royalty and Fee Configuration
    royaltyRecipient: process.env.ROYALTY_RECIPIENT || '0xe39C834603f50FFd4eEbf35437a0770CA90a9ACd',
    // Network Configuration
    chainId: 8453, // Base Mainnet
    networkName: 'Base Mainnet',
    // Rate Limiting Configuration
    rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '100'), // ms between calls
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    batchSize: parseInt(process.env.BATCH_SIZE || '5'),
    // API Configuration
    apiVersion: '1.0.0',
    apiName: 'Seedify Backend API',
    // External Service Configuration
    imageGenerationServiceUrl: process.env.IMAGE_GENERATION_SERVICE_URL || 'https://wof.up.railway.app'
};
exports.default = exports.contractConfig;
