"use strict";
// Smart contract addresses for the WayOfFlowers dapp
// Updated with latest deployment addresses and network-specific configuration
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_CONTRACTS = exports.defaultNetworkContracts = exports.getContractsForNetwork = exports.getContractsForChainId = exports.INTEREST_BEARING_TOKENS = exports.ART_FACTORY_ADDRESS = exports.AWETH_ADDRESS = exports.AAVE_POOL_V3_ADDRESS = exports.MOCK_AAVE_POOL_ADDRESS = exports.MOCK_AWETH_ADDRESS = exports.WETH9_ADDRESS = exports.AAVE_POOL_ADDRESS = exports.DISTRIBUTOR_ADDRESS = exports.SNAPSHOT_NFT_ADDRESS = exports.SEED_NFT_ADDRESS = exports.SEED_FACTORY_ADDRESS = exports.SNAP_FACTORY_ADDRESS = void 0;
exports.getCurrentNetworkContracts = getCurrentNetworkContracts;
// Import network-specific contracts and fallback contracts
const network_config_1 = require("./network-config");
Object.defineProperty(exports, "defaultNetworkContracts", { enumerable: true, get: function () { return network_config_1.defaultNetworkContracts; } });
Object.defineProperty(exports, "getContractsForChainId", { enumerable: true, get: function () { return network_config_1.getContractsForChainId; } });
Object.defineProperty(exports, "getContractsForNetwork", { enumerable: true, get: function () { return network_config_1.getContractsForNetwork; } });
const fallback_contracts_1 = require("./fallback-contracts");
// Default contract addresses (Base Mainnet)
exports.SNAP_FACTORY_ADDRESS = network_config_1.defaultNetworkContracts.snapFactory;
exports.SEED_FACTORY_ADDRESS = network_config_1.defaultNetworkContracts.seedFactory;
exports.SEED_NFT_ADDRESS = network_config_1.defaultNetworkContracts.seedNFT;
exports.SNAPSHOT_NFT_ADDRESS = network_config_1.defaultNetworkContracts.snapshotNFT;
exports.DISTRIBUTOR_ADDRESS = network_config_1.defaultNetworkContracts.distributor;
exports.AAVE_POOL_ADDRESS = network_config_1.defaultNetworkContracts.aavePool;
exports.WETH9_ADDRESS = network_config_1.defaultNetworkContracts.weth;
exports.MOCK_AWETH_ADDRESS = network_config_1.defaultNetworkContracts.mockAWeth || fallback_contracts_1.FALLBACK_CONTRACTS.mockAWeth;
exports.MOCK_AAVE_POOL_ADDRESS = network_config_1.defaultNetworkContracts.mockAavePool || fallback_contracts_1.FALLBACK_CONTRACTS.mockAavePool;
// Aave V3 specific addresses
exports.AAVE_POOL_V3_ADDRESS = network_config_1.defaultNetworkContracts.aavePoolV3;
exports.AWETH_ADDRESS = network_config_1.defaultNetworkContracts.aWETH;
// Legacy alias for backward compatibility (ArtFactory -> SeedFactory)
exports.ART_FACTORY_ADDRESS = exports.SEED_FACTORY_ADDRESS;
// Interest-bearing tokens configuration
exports.INTEREST_BEARING_TOKENS = [
    { address: exports.AWETH_ADDRESS, symbol: 'aWETH' },
    { address: exports.WETH9_ADDRESS, symbol: 'WETH' },
];
// Export fallback contracts for non-Base networks
var fallback_contracts_2 = require("./fallback-contracts");
Object.defineProperty(exports, "FALLBACK_CONTRACTS", { enumerable: true, get: function () { return fallback_contracts_2.FALLBACK_CONTRACTS; } });
// Function to get contracts for current network (useful for dynamic switching)
function getCurrentNetworkContracts(networkId) {
    if (networkId) {
        return (0, network_config_1.getContractsForNetwork)(networkId);
    }
    // Default to Base Mainnet
    return network_config_1.defaultNetworkContracts;
}
