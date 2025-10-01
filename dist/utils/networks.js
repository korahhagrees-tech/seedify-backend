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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlchemyHttpUrl = void 0;
const chains = __importStar(require("viem/chains"));
// Mapping of chainId to RPC chain name an format followed by alchemy and infura
const RPC_CHAIN_NAMES = {
    [chains.mainnet.id]: "eth-mainnet",
    [chains.goerli.id]: "eth-goerli",
    [chains.sepolia.id]: "eth-sepolia",
    [chains.optimism.id]: "opt-mainnet",
    [chains.optimismGoerli.id]: "opt-goerli",
    [chains.optimismSepolia.id]: "opt-sepolia",
    [chains.arbitrum.id]: "arb-mainnet",
    [chains.arbitrumGoerli.id]: "arb-goerli",
    [chains.arbitrumSepolia.id]: "arb-sepolia",
    [chains.polygon.id]: "polygon-mainnet",
    [chains.polygonMumbai.id]: "polygon-mumbai",
    [chains.polygonAmoy.id]: "polygon-amoy",
    [chains.astar.id]: "astar-mainnet",
    [chains.polygonZkEvm.id]: "polygonzkevm-mainnet",
    [chains.polygonZkEvmTestnet.id]: "polygonzkevm-testnet",
    [chains.base.id]: "base-mainnet",
    [chains.baseGoerli.id]: "base-goerli",
    [chains.baseSepolia.id]: "base-sepolia",
};
const getAlchemyHttpUrl = (chainId) => {
    return RPC_CHAIN_NAMES[chainId]
        ? `https://${RPC_CHAIN_NAMES[chainId]}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
        : undefined;
};
exports.getAlchemyHttpUrl = getAlchemyHttpUrl;
