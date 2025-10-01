"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_CONTRACTS = exports.getContractsForNetwork = exports.getContractsForChainId = exports.defaultNetworkContracts = exports.baseSepolia = exports.baseGoerli = exports.baseMainnet = void 0;
// Export all chain configurations
var base_chain_1 = require("./base-chain");
Object.defineProperty(exports, "baseMainnet", { enumerable: true, get: function () { return base_chain_1.baseMainnet; } });
Object.defineProperty(exports, "baseGoerli", { enumerable: true, get: function () { return base_chain_1.baseGoerli; } });
Object.defineProperty(exports, "baseSepolia", { enumerable: true, get: function () { return base_chain_1.baseSepolia; } });
// Re-export network contracts
var network_config_1 = require("./network-config");
Object.defineProperty(exports, "defaultNetworkContracts", { enumerable: true, get: function () { return network_config_1.defaultNetworkContracts; } });
Object.defineProperty(exports, "getContractsForChainId", { enumerable: true, get: function () { return network_config_1.getContractsForChainId; } });
Object.defineProperty(exports, "getContractsForNetwork", { enumerable: true, get: function () { return network_config_1.getContractsForNetwork; } });
// Export fallback contracts
var fallback_contracts_1 = require("./fallback-contracts");
Object.defineProperty(exports, "FALLBACK_CONTRACTS", { enumerable: true, get: function () { return fallback_contracts_1.FALLBACK_CONTRACTS; } });
// Export all contract addresses
__exportStar(require("./contracts"), exports);
