"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNetworkContracts = exports.NETWORK_CONFIG = exports.DEFAULT_NETWORK = exports.SUPPORTED_NETWORKS = void 0;
exports.getNetworkInfo = getNetworkInfo;
exports.getContractsForNetwork = getContractsForNetwork;
exports.getContractsForChainId = getContractsForChainId;
exports.getFallbackContracts = getFallbackContracts;
exports.getCurrentNetworkContracts = getCurrentNetworkContracts;
exports.isTestnet = isTestnet;
exports.isProduction = isProduction;
exports.getNetworkForEnvironment = getNetworkForEnvironment;
exports.isBaseNetwork = isBaseNetwork;
exports.isBaseMainnet = isBaseMainnet;
exports.isBaseTestnet = isBaseTestnet;
exports.getPreferredBaseNetwork = getPreferredBaseNetwork;
exports.getBestAvailableNetwork = getBestAvailableNetwork;
const base_chain_1 = require("./base-chain");
const fallback_contracts_1 = require("./fallback-contracts");
// Supported networks configuration
exports.SUPPORTED_NETWORKS = {
    'base-mainnet': {
        chain: base_chain_1.baseMainnet,
        name: 'Base Mainnet',
        description: 'Base mainnet network',
        isTestnet: false,
        isProduction: true,
    },
    'base-goerli': {
        chain: base_chain_1.baseGoerli,
        name: 'Base Goerli',
        description: 'Base Goerli testnet',
        isTestnet: true,
        isProduction: false,
    },
    'base-sepolia': {
        chain: base_chain_1.baseSepolia,
        name: 'Base Sepolia',
        description: 'Base Sepolia testnet',
        isTestnet: true,
        isProduction: false,
    },
};
// Default network
exports.DEFAULT_NETWORK = 'base-mainnet';
// Network selection configuration
exports.NETWORK_CONFIG = {
    // Allow users to switch networks
    allowNetworkSwitching: true,
    // Default network for new users
    defaultNetwork: exports.DEFAULT_NETWORK,
    // Networks available for switching
    availableNetworks: Object.keys(exports.SUPPORTED_NETWORKS),
    // Production networks (for mainnet deployments)
    productionNetworks: ['base-mainnet'],
    // Testnet networks (for development and testing)
    testnetNetworks: ['base-goerli', 'base-sepolia'],
};
// Helper function to get network info
function getNetworkInfo(networkId) {
    return exports.SUPPORTED_NETWORKS[networkId];
}
// Helper function to get contracts for a specific network
function getContractsForNetwork(networkId) {
    switch (networkId) {
        case 'base-mainnet':
            return {
                ...base_chain_1.baseMainnetContracts,
                chainId: base_chain_1.baseMainnet.id,
                isTestnet: false,
            };
        case 'base-goerli':
            return {
                ...base_chain_1.baseGoerliContracts,
                chainId: base_chain_1.baseGoerli.id,
                isTestnet: true,
            };
        case 'base-sepolia':
            return {
                ...base_chain_1.baseSepoliaContracts,
                chainId: base_chain_1.baseSepolia.id,
                isTestnet: true,
            };
        default:
            // For non-Base networks, return fallback contracts
            return getFallbackContracts();
    }
}
// Helper function to get contracts for a specific chain ID
function getContractsForChainId(chainId) {
    switch (chainId) {
        case base_chain_1.baseMainnet.id:
            return {
                ...base_chain_1.baseMainnetContracts,
                chainId: base_chain_1.baseMainnet.id,
                isTestnet: false,
            };
        case base_chain_1.baseGoerli.id:
            return {
                ...base_chain_1.baseGoerliContracts,
                chainId: base_chain_1.baseGoerli.id,
                isTestnet: true,
            };
        case base_chain_1.baseSepolia.id:
            return {
                ...base_chain_1.baseSepoliaContracts,
                chainId: base_chain_1.baseSepolia.id,
                isTestnet: true,
            };
        default:
            return getFallbackContracts();
    }
}
// Helper function to get fallback contracts for non-Base networks
function getFallbackContracts() {
    return {
        snapFactory: fallback_contracts_1.FALLBACK_CONTRACTS.snapFactory,
        seedFactory: fallback_contracts_1.FALLBACK_CONTRACTS.seedFactory,
        seedNFT: fallback_contracts_1.FALLBACK_CONTRACTS.seedNFT,
        snapshotNFT: fallback_contracts_1.FALLBACK_CONTRACTS.snapshotNFT,
        distributor: fallback_contracts_1.FALLBACK_CONTRACTS.distributor,
        aavePool: fallback_contracts_1.FALLBACK_CONTRACTS.aavePool,
        weth: fallback_contracts_1.FALLBACK_CONTRACTS.weth,
        mockAWeth: fallback_contracts_1.FALLBACK_CONTRACTS.mockAWeth,
        mockAavePool: fallback_contracts_1.FALLBACK_CONTRACTS.mockAavePool,
        aavePoolV3: fallback_contracts_1.FALLBACK_CONTRACTS.aavePoolV3,
        aWETH: fallback_contracts_1.FALLBACK_CONTRACTS.aWETH,
        chainId: 1, // Default to mainnet
        isTestnet: false,
    };
}
// Default network contracts (Base Mainnet)
exports.defaultNetworkContracts = getContractsForNetwork(getBestAvailableNetwork());
// Helper function to get current network contracts
function getCurrentNetworkContracts(networkId) {
    if (networkId) {
        return getContractsForNetwork(networkId);
    }
    // Default to Base Mainnet
    return exports.defaultNetworkContracts;
}
// Helper function to check if network is testnet
function isTestnet(networkId) {
    const network = getNetworkInfo(networkId);
    return network?.isTestnet || false;
}
// Helper function to check if network is production
function isProduction(networkId) {
    const network = getNetworkInfo(networkId);
    return network?.isProduction || false;
}
// Environment-based network selection
function getNetworkForEnvironment() {
    if (process.env.NODE_ENV === 'production') {
        return exports.DEFAULT_NETWORK;
    }
    // Allow testnet in development
    if (process.env.NODE_ENV === 'development') {
        return process.env.NEXT_PUBLIC_DEFAULT_NETWORK || exports.DEFAULT_NETWORK;
    }
    return exports.DEFAULT_NETWORK;
}
// Base-specific helper functions
function isBaseNetwork(networkId) {
    return networkId.startsWith('base-');
}
function isBaseMainnet(networkId) {
    return networkId === 'base-mainnet';
}
function isBaseTestnet(networkId) {
    return networkId === 'base-goerli' || networkId === 'base-sepolia';
}
function getPreferredBaseNetwork() {
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
function getBestAvailableNetwork() {
    const preferred = getPreferredBaseNetwork();
    // If preferred network is available, use it
    if (exports.SUPPORTED_NETWORKS[preferred]) {
        return preferred;
    }
    // Fallback to Base Mainnet if available
    if (exports.SUPPORTED_NETWORKS['base-mainnet']) {
        return 'base-mainnet';
    }
    // Last resort: return default
    return exports.DEFAULT_NETWORK;
}
