// Smart contract addresses for the WayOfFlowers dapp
// Updated with latest deployment addresses and network-specific configuration

// Import network-specific contracts and fallback contracts
import { defaultNetworkContracts, getContractsForChainId, getContractsForNetwork } from './network-config';
import { FALLBACK_CONTRACTS } from './fallback-contracts';

// Default contract addresses (Base Mainnet)
export const SNAP_FACTORY_ADDRESS = defaultNetworkContracts.snapFactory;
export const SEED_FACTORY_ADDRESS = defaultNetworkContracts.seedFactory;
export const SEED_NFT_ADDRESS = defaultNetworkContracts.seedNFT;
export const SNAPSHOT_NFT_ADDRESS = defaultNetworkContracts.snapshotNFT;
export const DISTRIBUTOR_ADDRESS = defaultNetworkContracts.distributor;
export const AAVE_POOL_ADDRESS = defaultNetworkContracts.aavePool;
export const WETH9_ADDRESS = defaultNetworkContracts.weth;
export const MOCK_AWETH_ADDRESS = defaultNetworkContracts.mockAWeth || FALLBACK_CONTRACTS.mockAWeth;
export const MOCK_AAVE_POOL_ADDRESS = defaultNetworkContracts.mockAavePool || FALLBACK_CONTRACTS.mockAavePool;

// Aave V3 specific addresses
export const AAVE_POOL_V3_ADDRESS = defaultNetworkContracts.aavePoolV3;
export const AWETH_ADDRESS = defaultNetworkContracts.aWETH;

// Legacy alias for backward compatibility (ArtFactory -> SeedFactory)
export const ART_FACTORY_ADDRESS = SEED_FACTORY_ADDRESS;

// Interest-bearing tokens configuration
export const INTEREST_BEARING_TOKENS = [
  { address: AWETH_ADDRESS, symbol: 'aWETH' },
  { address: WETH9_ADDRESS, symbol: 'WETH' },
];

// Helper functions to get network-specific contracts
export { getContractsForChainId, getContractsForNetwork };
export { defaultNetworkContracts };

// Export fallback contracts for non-Base networks
export { FALLBACK_CONTRACTS } from './fallback-contracts';

// Function to get contracts for current network (useful for dynamic switching)
export function getCurrentNetworkContracts(networkId?: string) {
  if (networkId) {
    return getContractsForNetwork(networkId);
  }
  // Default to Base Mainnet
  return defaultNetworkContracts;
}