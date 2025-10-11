import { baseMainnet, baseGoerli, baseSepolia, baseMainnetContracts, baseGoerliContracts, baseSepoliaContracts } from './base-chain';
import { FALLBACK_CONTRACTS } from './fallback-contracts';

// Supported networks configuration
export const SUPPORTED_NETWORKS = {
  'base-mainnet': {
    chain: baseMainnet,
    name: 'Base Mainnet',
    description: 'Base mainnet network',
    isTestnet: false,
    isProduction: true,
  },
  'base-goerli': {
    chain: baseGoerli,
    name: 'Base Goerli',
    description: 'Base Goerli testnet',
    isTestnet: true,
    isProduction: false,
  },
  'base-sepolia': {
    chain: baseSepolia,
    name: 'Base Sepolia',
    description: 'Base Sepolia testnet',
    isTestnet: true,
    isProduction: false,
  },
} as const;

// Default network
export const DEFAULT_NETWORK = 'base-mainnet';

// Network selection configuration
export const NETWORK_CONFIG = {
  // Allow users to switch networks
  allowNetworkSwitching: true,
  
  // Default network for new users
  defaultNetwork: DEFAULT_NETWORK,
  
  // Networks available for switching
  availableNetworks: Object.keys(SUPPORTED_NETWORKS),
  
  // Production networks (for mainnet deployments)
  productionNetworks: ['base-mainnet'],
  
  // Testnet networks (for development and testing)
  testnetNetworks: ['base-goerli', 'base-sepolia'],
};

// Helper function to get network info
export function getNetworkInfo(networkId: string) {
  return SUPPORTED_NETWORKS[networkId as keyof typeof SUPPORTED_NETWORKS];
}

// Network contract interface
export interface NetworkContracts {
  // Core contract addresses
  snapFactory: `0x${string}`;
  seedFactory: `0x${string}`;
  seedNFT: `0x${string}`;
  snapshotNFT: `0x${string}`;
  distributor: `0x${string}`;
  aavePool: `0x${string}`;
  weth: `0x${string}`;
  mockAWeth?: `0x${string}`;
  mockAavePool?: `0x${string}`;
  
  // Aave-specific addresses
  aavePoolV3: `0x${string}`;
  aWETH: `0x${string}`;
  
  // Chain configuration
  chainId: number;
  isTestnet: boolean;
}

// Helper function to get contracts for a specific network
export function getContractsForNetwork(networkId: string): NetworkContracts {
  switch (networkId) {
    case 'base-mainnet':
      return {
        ...baseMainnetContracts,
        chainId: baseMainnet.id,
        isTestnet: false,
      };
    case 'base-goerli':
      return {
        ...baseGoerliContracts,
        chainId: baseGoerli.id,
        isTestnet: true,
      };
    case 'base-sepolia':
      return {
        ...baseSepoliaContracts,
        chainId: baseSepolia.id,
        isTestnet: true,
      };

    default:
      // For non-Base networks, return fallback contracts
      return getFallbackContracts();
  }
}

// Helper function to get contracts for a specific chain ID
export function getContractsForChainId(chainId: number): NetworkContracts {
  switch (chainId) {
    case baseMainnet.id:
      return {
        ...baseMainnetContracts,
        chainId: baseMainnet.id,
        isTestnet: false,
      };
    case baseGoerli.id:
      return {
        ...baseGoerliContracts,
        chainId: baseGoerli.id,
        isTestnet: true,
      };
    case baseSepolia.id:
      return {
        ...baseSepoliaContracts,
        chainId: baseSepolia.id,
        isTestnet: true,
      };

    default:
      return getFallbackContracts();
  }
}

// Helper function to get fallback contracts for non-Base networks
export function getFallbackContracts(): NetworkContracts {
  return {
    snapFactory: FALLBACK_CONTRACTS.snapFactory,
    seedFactory: FALLBACK_CONTRACTS.seedFactory,
    seedNFT: FALLBACK_CONTRACTS.seedNFT,
    snapshotNFT: FALLBACK_CONTRACTS.snapshotNFT,
    distributor: FALLBACK_CONTRACTS.distributor,
    aavePool: FALLBACK_CONTRACTS.aavePool,
    weth: FALLBACK_CONTRACTS.weth,
    mockAWeth: FALLBACK_CONTRACTS.mockAWeth,
    mockAavePool: FALLBACK_CONTRACTS.mockAavePool,
    aavePoolV3: FALLBACK_CONTRACTS.aavePoolV3,
    aWETH: FALLBACK_CONTRACTS.aWETH,
    chainId: 1, // Default to mainnet
    isTestnet: false,
  };
}

// Default network contracts (Base Mainnet)
export const defaultNetworkContracts = getContractsForNetwork(getBestAvailableNetwork());

// Helper function to get current network contracts
export function getCurrentNetworkContracts(networkId?: string) {
  if (networkId) {
    return getContractsForNetwork(networkId);
  }
  // Default to Base Mainnet
  return defaultNetworkContracts;
}

// Helper function to check if network is testnet
export function isTestnet(networkId: string): boolean {
  const network = getNetworkInfo(networkId);
  return network?.isTestnet || false;
}

// Helper function to check if network is production
export function isProduction(networkId: string): boolean {
  const network = getNetworkInfo(networkId);
  return network?.isProduction || false;
}

// Environment-based network selection
export function getNetworkForEnvironment(): string {
  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_NETWORK;
  }
  
  // Allow testnet in development
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_DEFAULT_NETWORK || DEFAULT_NETWORK;
  }
  
  return DEFAULT_NETWORK;
}

// Base-specific helper functions
export function isBaseNetwork(networkId: string): boolean {
  return networkId.startsWith('base-');
}

export function isBaseMainnet(networkId: string): boolean {
  return networkId === 'base-mainnet';
}

export function isBaseTestnet(networkId: string): boolean {
  return networkId === 'base-goerli' || networkId === 'base-sepolia';
}

export function getPreferredBaseNetwork(): string {
  // In production, always use Base Mainnet
  if (process.env.NODE_ENV === 'production') {
    return 'base-mainnet';
  }
  
  // In development, allow testnets but prefer mainnet
  const envNetwork = process.env.NEXT_PUBLIC_DEFAULT_NETWORK;
  if (envNetwork && isBaseNetwork(envNetwork)) {
    return envNetwork;
  }
  
  return 'base-mainnet';
}

// Function to get the best available network (prioritizes Base)
export function getBestAvailableNetwork(): string {
  const preferred = getPreferredBaseNetwork();
  
  // If preferred network is available, use it
  if (SUPPORTED_NETWORKS[preferred as keyof typeof SUPPORTED_NETWORKS]) {
    return preferred;
  }
  
  // Fallback to Base Mainnet if available
  if (SUPPORTED_NETWORKS['base-mainnet']) {
    return 'base-mainnet';
  }
  
  // Last resort: return default
  return DEFAULT_NETWORK;
}

// Export types
export type SupportedNetworkId = keyof typeof SUPPORTED_NETWORKS;
export type NetworkInfo = typeof SUPPORTED_NETWORKS[SupportedNetworkId];
