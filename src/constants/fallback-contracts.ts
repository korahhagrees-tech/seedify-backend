// Fallback contract addresses for non-Base networks
// These are the original addresses that were in contracts.ts

export const FALLBACK_CONTRACTS = {
  // Core contract addresses (original deployment)
  snapFactory: '0xB7C90D454112841323A16CC7623D9011985980a9' as `0x${string}`,
  seedFactory: '0x363214F13A33d9D72460bD386c8B65c6C7F5E283' as `0x${string}`,
  seedNFT: '0x0a660f939C147D329BFe98D9E96e970FB0cbCDe2' as `0x${string}`,
  snapshotNFT: '0xb4Dcdb59789B5eAa53e8EEa2d761a2E4F5360a80' as `0x${string}`,
  distributor: '0xf28605098dA51dd4a4b5398Eb1ec7487549e403c' as `0x${string}`,
  aavePool: '0x466ed8f892DE92eAfDe81746295AC366056F9bFA' as `0x${string}`,
  weth: '0xa2DEf8C3027a09bf976a6922A5Ac1fE3A4c70203' as `0x${string}`,
  mockAWeth: '0xf2513168689404cDd0E9Acc4A8E234Ab3ADb81e2' as `0x${string}`,
  mockAavePool: '0x6D6229A119CdB99199D9ed55D47fCcBe78E2789f' as `0x${string}`,
  
  // Aave-specific addresses (original deployment)
  aavePoolV3: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Not deployed on other networks
  aWETH: '0xf2513168689404cDd0E9Acc4A8E234Ab3ADb81e2' as `0x${string}`, // Use mock aWETH for other networks
} as const;
