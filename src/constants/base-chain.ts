import { defineChain } from "viem";

export const baseMainnet = /*#__PURE__*/ defineChain({
  id: 8453,
  network: "base-mainnet",
  name: "Base",
  iconUrl: "/icons/base-icon.png",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://base-rpc.publicnode.com"],
    },
    public: {
      http: ["https://base-rpc.publicnode.com"],
    },
    alchemy: {
      http: ["https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}"],
    },
    infura: {
      http: ["https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
    },
    etherscan: {
      name: "Basescan",
      url: "https://basescan.org",
    },
  },
  contracts: {
    // Base-specific contract addresses
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1375688,
    },
  },
  testnet: false,
});

// Base Mainnet contract addresses (Updated with latest deployment - 2024)
export const baseMainnetContracts = {
  snapFactory: '0x1B64F0128D8C71798091cAE1b9d5209C4F8c327D' as `0x${string}`, // SnapFactory for minting snapshots
  seedFactory: '0x778F8351B865202A57132E2146cCb8a8a5842DBf' as `0x${string}`, // SeedFactory for seed management
  seedNFT: '0x8F3F276A948cD1e4cD84b9eB0B6f59344a658792' as `0x${string}`,
  snapshotNFT: '0x8e3E09a5ba0fAAe553f08BBFb9de92b14f79a645' as `0x${string}`,
  distributor: '0xCd74f52086eB5f5b38051A03a03d440747E1c95c' as `0x${string}`,
  aavePool: '0xa56EE8982c5bA0D78A32caB82b4e47Baf0Bfac02' as `0x${string}`,
  weth: '0x4200000000000000000000000000000000000006' as `0x${string}`,
  aavePoolV3: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5' as `0x${string}`,
  aWETH: '0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7' as `0x${string}`,
  // Mock addresses for compatibility (not used on Base but needed for balance checking)
  mockAWeth: '0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7' as `0x${string}`, // Use real aWETH address
  mockAavePool: '0xa56EE8982c5bA0D78A32caB82b4e47Baf0Bfac02' as `0x${string}`, // Use real AavePool address
};

export const baseGoerli = /*#__PURE__*/ defineChain({
  id: 84531,
  network: "base-goerli",
  name: "Base Goerli",
  iconUrl: "/icons/base-icon.png",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://goerli.base.org"],
    },
    public: {
      http: ["https://goerli.base.org"],
    },
    alchemy: {
      http: ["https://base-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}"],
    },
    infura: {
      http: ["https://base-goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan Goerli",
      url: "https://goerli.basescan.org",
    },
    etherscan: {
      name: "Basescan Goerli",
      url: "https://goerli.basescan.org",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1375688,
    },
  },
  testnet: true,
});

export const baseSepolia = /*#__PURE__*/ defineChain({
  id: 84532,
  network: "base-sepolia",
  name: "Base Sepolia",
  iconUrl: "/icons/base-icon.png",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
    public: {
      http: ["https://sepolia.base.org"],
    },
    alchemy: {
      http: ["https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}"],
    },
    infura: {
      http: ["https://base-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan Sepolia",
      url: "https://sepolia.basescan.org",
    },
    etherscan: {
      name: "Basescan Sepolia",
      url: "https://sepolia.basescan.org",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1375688,
    },
  },
  testnet: true,
});

// Base Goerli contract addresses (placeholder for future deployment)
export const baseGoerliContracts = {
  snapFactory: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Goerli
  seedFactory: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Goerli
  seedNFT: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Goerli
  snapshotNFT: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Goerli
  distributor: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Goerli
  aavePool: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Goerli
  weth: '0x4200000000000000000000000000000000000006' as `0x${string}`,
  aavePoolV3: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Base Goerli Aave Pool V3
  aWETH: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Base Goerli aWETH
};

// Base Sepolia contract addresses (placeholder for future deployment)
export const baseSepoliaContracts = {
  snapFactory: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Sepolia
  seedFactory: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Sepolia
  seedNFT: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Sepolia
  snapshotNFT: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Sepolia
  distributor: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Sepolia
  aavePool: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy to Base Sepolia
  weth: '0x4200000000000000000000000000000000000006' as `0x${string}`,
  aavePoolV3: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Base Sepolia Aave Pool V3
  aWETH: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Base Sepolia aWETH
};
