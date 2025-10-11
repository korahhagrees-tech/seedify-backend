// Export all chain configurations
export { baseMainnet, baseGoerli, baseSepolia } from './base-chain';

// Re-export network contracts
export { 
  defaultNetworkContracts, 
  getContractsForChainId, 
  getContractsForNetwork,
  type NetworkContracts 
} from './network-config';

// Export fallback contracts
export { FALLBACK_CONTRACTS } from './fallback-contracts';

// Export all contract addresses
export * from './contracts';
