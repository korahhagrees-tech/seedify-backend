"use strict";
// Fallback contract addresses for non-Base networks
// These are the original addresses that were in contracts.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_CONTRACTS = void 0;
exports.FALLBACK_CONTRACTS = {
    // Core contract addresses (original deployment)
    snapFactory: '0xB7C90D454112841323A16CC7623D9011985980a9',
    seedFactory: '0x363214F13A33d9D72460bD386c8B65c6C7F5E283',
    seedNFT: '0x0a660f939C147D329BFe98D9E96e970FB0cbCDe2',
    snapshotNFT: '0xb4Dcdb59789B5eAa53e8EEa2d761a2E4F5360a80',
    distributor: '0xf28605098dA51dd4a4b5398Eb1ec7487549e403c',
    aavePool: '0x466ed8f892DE92eAfDe81746295AC366056F9bFA',
    weth: '0xa2DEf8C3027a09bf976a6922A5Ac1fE3A4c70203',
    mockAWeth: '0xf2513168689404cDd0E9Acc4A8E234Ab3ADb81e2',
    mockAavePool: '0x6D6229A119CdB99199D9ed55D47fCcBe78E2789f',
    // Aave-specific addresses (original deployment)
    aavePoolV3: '0x0000000000000000000000000000000000000000', // Not deployed on other networks
    aWETH: '0xf2513168689404cDd0E9Acc4A8E234Ab3ADb81e2', // Use mock aWETH for other networks
};
