export const contractConfig = {
  // Use mock data by default for development
  useMockData: process.env.USE_MOCK_DATA === 'true' || !process.env.SEED_FACTORY_ADDRESS,
  
  // RPC Configuration
  rpcUrl: process.env.RPC_URL || 'https://mainnet.base.org',
  
  // Contract Addresses
  seedNFTAddress: process.env.SEED_NFT_ADDRESS,
  seedFactoryAddress: process.env.SEED_FACTORY_ADDRESS,
  snapshotNFTAddress: process.env.SNAPSHOT_NFT_ADDRESS,
  distributorAddress: process.env.DISTRIBUTOR_ADDRESS,
  
  // Network Configuration
  chainId: 8453, // Base Mainnet
  networkName: 'Base Mainnet',
  
  // Rate Limiting Configuration
  rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '100'), // ms between calls
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  batchSize: parseInt(process.env.BATCH_SIZE || '5'),
  
  // API Configuration
  apiVersion: '1.0.0',
  apiName: 'Seedify Backend API'
};

export default contractConfig;
