import { ethers } from 'ethers';
import { ContractSeedData, ContractSeedMetadata } from '../types/seed';
import { contractConfig } from '../config/contract';
import SeedFactoryABI from '../abi/seedfactory-abi.json';
import SeedNFTABI from '../abi/seednft-abi.json';
import SnapshotNFTABI from '../abi/snapshotnft-abi.json';
import DistributorABI from '../abi/distributor-abi.json';
import { weiToEthExact } from '../utils/eth-utils';

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private seedFactoryContract: ethers.Contract | null = null;
  private seedNFTContract: ethers.Contract | null = null;
  private snapshotNFTContract: ethers.Contract | null = null;
  private distributorContract: ethers.Contract | null = null;
  private rateLimitDelay: number = contractConfig.rateLimitDelay;
  private maxRetries: number = contractConfig.maxRetries;

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(contractConfig.rpcUrl);
    
    // Initialize Seed Factory contract (primary contract for seed data)
    if (contractConfig.seedFactoryAddress && contractConfig.seedFactoryAddress !== '0x0000000000000000000000000000000000000000') {
      this.seedFactoryContract = new ethers.Contract(
        contractConfig.seedFactoryAddress as string,
        SeedFactoryABI,
        this.provider
      );
      
      // Initialize Seed NFT contract for additional data
      if (contractConfig.seedNFTAddress && contractConfig.seedNFTAddress !== '0x0000000000000000000000000000000000000000') {
        this.seedNFTContract = new ethers.Contract(
          contractConfig.seedNFTAddress as string,
          SeedNFTABI,
          this.provider
        );
      }

      // Initialize Snapshot NFT contract for snapshot data
      if (contractConfig.snapshotNFTAddress && contractConfig.snapshotNFTAddress !== '0x0000000000000000000000000000000000000000') {
        this.snapshotNFTContract = new ethers.Contract(
          contractConfig.snapshotNFTAddress as string,
          SnapshotNFTABI,
          this.provider
        );
      }

      // Initialize Distributor contract for beneficiary/location data
      if (contractConfig.distributorAddress && contractConfig.distributorAddress !== '0x0000000000000000000000000000000000000000') {
        this.distributorContract = new ethers.Contract(
          contractConfig.distributorAddress as string,
          DistributorABI,
          this.provider
        );
      }
    } else {
      // Create dummy contracts for mock data mode
      this.seedFactoryContract = null as any;
      this.seedNFTContract = null as any;
      this.snapshotNFTContract = null as any;
      this.distributorContract = null as any;
    }
  }

  /**
   * Add delay to respect rate limits
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a rate limit error
        if (error instanceof Error && (
          error.message.includes('over rate limit') ||
          error.message.includes('rate limit') ||
          error.message.includes('too many requests')
        )) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await this.delay(delay);
          continue;
        }
        
        // For other errors, don't retry
        throw error;
      }
    }
    
    throw lastError!;
  }

  /**
   * Get total number of seeds from the Seed NFT contract
   */
  async getTotalSeeds(): Promise<number> {
    if (!this.seedNFTContract) {
      console.log('Seed NFT contract not initialized - falling back to mock data');
      return 0; // Will trigger mock data fallback
    }
    
    try {
      // Get the actual number of existing seeds from the NFT contract
      const totalSeeds = await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.getTotalSeeds();
      });
      return Number(totalSeeds);
    } catch (error) {
      console.error('Error fetching total seeds from NFT contract:', error);
      console.log('Falling back to mock data mode');
      return 0; // Will trigger mock data fallback
    }
  }

  /**
   * Get seed info from Seed Factory contract with retry logic
   */
  async getSeedInfo(seedId: number): Promise<any | null> {
    if (!this.seedFactoryContract) {
      return null;
    }
    
    try {
      const seedInfo = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.getSeedInfo(seedId);
      });
      
      return {
        owner: seedInfo[0],
        depositAmount: seedInfo[1],
        withdrawn: seedInfo[2],
        creationTime: seedInfo[3],
        snapshotCount: seedInfo[4]
      };
    } catch (error) {
      // Check if it's a contract revert (seed doesn't exist)
      if (error instanceof Error && (
        error.message.includes('execution reverted') ||
        error.message.includes('unknown custom error') ||
        error.message.includes('CALL_EXCEPTION')
      )) {
        console.log(`Seed ${seedId} does not exist or contract reverted`);
        return null;
      }
      
      console.error(`Error fetching seed info for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get seed location from contract with retry logic
   */
  async getSeedLocation(seedId: number): Promise<string | null> {
    if (!this.seedNFTContract) {
      return null;
    }
    
    try {
      const location = await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.getSeedLocation(seedId);
      });
      return location;
    } catch (error) {
      console.log(`Could not fetch location for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get seed owner from contract with retry logic
   */
  async getSeedOwner(seedId: number): Promise<string | null> {
    if (!this.seedNFTContract) {
      return null;
    }
    
    try {
      const owner = await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.ownerOf(seedId);
      });
      return owner;
    } catch (error) {
      console.log(`Could not fetch owner for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Check if seed exists with retry logic
   */
  async seedExists(seedId: number): Promise<boolean> {
    if (!this.seedNFTContract) {
      return false;
    }
    
    try {
      await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.ownerOf(seedId);
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all seeds data from contracts with batching and rate limiting
   */
  async getAllSeedsData(): Promise<ContractSeedData[]> {
    if (!this.seedNFTContract || !this.seedFactoryContract) {
      console.log('Contracts not initialized - returning empty array for mock data fallback');
      return [];
    }
    
    try {
      const totalSeeds = await this.getTotalSeeds();
      
      if (totalSeeds === 0) {
        console.log('No seeds found in contract - returning empty array for mock data fallback');
        return [];
      }

      console.log(`Fetching data for ${totalSeeds} existing seeds with rate limiting...`);
      const seeds: ContractSeedData[] = [];

      // Process seeds in batches to avoid overwhelming the RPC
      const batchSize = contractConfig.batchSize;
      const batches = Math.ceil(totalSeeds / batchSize);

      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize - 1, totalSeeds - 1);
        
        console.log(`Processing batch ${batchIndex + 1}/${batches} (indices ${startIndex}-${endIndex})`);

        // Process seeds in parallel within each batch
        const batchPromises = [];
        for (let i = startIndex; i <= endIndex; i++) {
          batchPromises.push(this.processSeedByIndex(i));
        }

        try {
          const batchResults = await Promise.allSettled(batchPromises);
          
          batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              seeds.push(result.value);
            }
          });

          // Add delay between batches to respect rate limits
          if (batchIndex < batches - 1) {
            await this.delay(this.rateLimitDelay * 2);
          }
        } catch (error) {
          console.error(`Error processing batch ${batchIndex + 1}:`, error);
          // Continue with next batch
        }
      }

      console.log(`Successfully fetched ${seeds.length} valid seeds out of ${totalSeeds} existing seeds`);
      return seeds;
    } catch (error) {
      console.error('Error fetching all seeds data:', error);
      console.log('Falling back to mock data mode');
      return []; // Will trigger mock data fallback
    }
  }

  /**
   * Process a single seed by index with error handling
   */
  private async processSeedByIndex(index: number): Promise<ContractSeedData | null> {
    try {
      // Get the actual seed ID from the NFT contract
      const seedId = await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.getSeedByIndex(index);
      });
      
      return await this.processSeed(Number(seedId));
    } catch (error) {
      console.error(`Error processing seed at index ${index}:`, error);
      return null;
    }
  }

  /**
   * Process a single seed with error handling
   */
  private async processSeed(seedId: number): Promise<ContractSeedData | null> {
    try {
      const seedInfo = await this.getSeedInfo(seedId);
      
      if (!seedInfo || !seedInfo.owner || seedInfo.owner === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Get additional data from Seed NFT contract
      let location = '';
      let timestamp = 0;
      let blockNumber = 0;
      let snapshotPrice = '0';
      
      if (this.seedNFTContract) {
        try {
          // Get location
          location = await this.getSeedLocation(seedId) || '';
          
          // Get metadata (timestamp and blockNumber)
          const metadata = await this.retryWithBackoff(async () => {
            return await this.seedNFTContract!.getSeedMetadata(seedId);
          });
          
          timestamp = Number(metadata[0]);
          blockNumber = Number(metadata[1]);
        } catch (error) {
          console.log(`Could not fetch additional data for seed ${seedId}:`, error);
        }
      }

      // Get snapshot price from factory contract
      if (this.seedFactoryContract) {
        try {
          const price = await this.retryWithBackoff(async () => {
            return await this.seedFactoryContract!.seedSnapshotPrices(seedId);
          });
          snapshotPrice = weiToEthExact(price);
        } catch (error) {
          console.log(`Could not fetch snapshot price for seed ${seedId}:`, error);
        }
      }
      
      const seedData = {
        id: seedId,
        owner: seedInfo.owner,
        location: location,
        timestamp: timestamp || Number(seedInfo.creationTime),
        blockNumber: blockNumber,
        exists: true,
        depositAmount: seedInfo.depositAmount,
        withdrawn: seedInfo.withdrawn,
        snapshotCount: Number(seedInfo.snapshotCount),
        seedImageUrl: undefined as string | undefined, // Will be fetched below
        latestSnapshotUrl: undefined as string | undefined, // Will be fetched below
        snapshotPrice: snapshotPrice
      };

      // Fetch real image URLs from contract tokenURI
      try {
        const seedImageUrl = await this.getSeedImageUrl(seedId);
        console.log(`Fetched seed image URL for seed ${seedId}:`, seedImageUrl);
        if (seedImageUrl) {
          seedData.seedImageUrl = seedImageUrl;
        }
      } catch (error) {
        console.error(`Error fetching seed image URL for seed ${seedId}:`, error);
      }

      // Fetch latest snapshot image URL if seed has snapshots
      if (Number(seedInfo.snapshotCount) > 0) {
        try {
          const latestSnapshotUrl = await this.getLatestSnapshotImageUrl(seedId);
          console.log(`Fetched latest snapshot URL for seed ${seedId}:`, latestSnapshotUrl);
          if (latestSnapshotUrl) {
            seedData.latestSnapshotUrl = latestSnapshotUrl;
          }
        } catch (error) {
          console.error(`Error fetching latest snapshot image for seed ${seedId}:`, error);
        }
      }

      // Fetch additional seed data (unlock time, profits, dynamic percentage)
      try {
        const [unlockTime, profits, dynamicPercentage, totalValue, isEarlyWithdrawn] = await Promise.all([
          this.getSeedUnlockTime(seedId),
          this.getSeedAccumulatedProfits(seedId),
          this.getDynamicSeedPercentage(seedId),
          this.getTotalSeedValue(seedId),
          this.isSeedEarlyWithdrawn(seedId)
        ]);

        return {
          ...seedData,
          unlockTime: unlockTime || undefined,
          accumulatedProfits: profits || undefined,
          dynamicPercentage: dynamicPercentage || undefined,
          totalValue: totalValue || undefined,
          isEarlyWithdrawn: isEarlyWithdrawn
        };
      } catch (error) {
        console.error(`Error fetching extended seed data for seed ${seedId}:`, error);
        return seedData;
      }
    } catch (error) {
      console.error(`Error processing seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get single seed data from Seed Factory contract
   */
  async getSeedData(seedId: number): Promise<ContractSeedData | null> {
    if (!this.seedFactoryContract) {
      return null;
    }
    
    try {
      return await this.processSeed(seedId);
    } catch (error) {
      console.error(`Error fetching seed ${seedId} data:`, error);
      return null;
    }
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    if (contractConfig.seedFactoryAddress) {
      return contractConfig.seedFactoryAddress;
    }
    if (!this.seedFactoryContract) {
      return '0x0000000000000000000000000000000000000000';
    }
    return this.seedFactoryContract.target as string;
  }

  /**
   * Get provider
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get snapshot contract address for write operations
   */
  getSnapshotContractAddress(): string {
    return contractConfig.snapshotNFTAddress || '';
  }

  /**
   * Get distributor contract address for write operations
   */
  getDistributorContractAddress(): string {
    return contractConfig.distributorAddress || '';
  }

  /**
   * Get snap factory contract address for snapshot minting operations
   */
  getSnapFactoryContractAddress(): string {
    return contractConfig.snapFactoryAddress || '';
  }

  /**
   * Get all seeds owned by a specific user
   */
  async getUserSeeds(userAddress: string): Promise<number[]> {
    if (!this.seedNFTContract) {
      return [];
    }

    try {
      const seedIds = await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.getSeedsByOwner(userAddress);
      });

      return seedIds.map((id: any) => Number(id));
    } catch (error) {
      console.error(`Error fetching seeds for user ${userAddress}:`, error);
      return [];
    }
  }

  /**
   * Get count of seeds owned by a user
   */
  async getUserSeedsCount(userAddress: string): Promise<number> {
    if (!this.seedNFTContract) {
      return 0;
    }

    try {
      const balance = await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.balanceOf(userAddress);
      });

      return Number(balance);
    } catch (error) {
      console.error(`Error fetching seed count for user ${userAddress}:`, error);
      return 0;
    }
  }

  /**
   * Get snapshot IDs created by a user
   */
  async getUserSnapshotIds(userAddress: string): Promise<number[]> {
    if (!this.snapshotNFTContract) {
      return [];
    }

    try {
      const snapshotIds = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getUserSnapshots(userAddress);
      });

      return snapshotIds.map((id: any) => Number(id));
    } catch (error) {
      console.error(`Error fetching snapshots for user ${userAddress}:`, error);
      return [];
    }
  }

  /**
   * Get detailed snapshot data for a user
   */
  async getUserSnapshotData(userAddress: string): Promise<any[]> {
    if (!this.snapshotNFTContract) {
      return [];
    }

    try {
      const snapshotData = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getUserSnapshotData(userAddress);
      });

      return snapshotData.map((snapshot: any) => ({
        creator: snapshot.creator,
        value: Number(snapshot.value),
        valueEth: weiToEthExact(snapshot.value),
        beneficiaryIndex: Number(snapshot.beneficiaryIndex),
        seedId: Number(snapshot.seedId),
        timestamp: Number(snapshot.timestamp),
        blockNumber: Number(snapshot.blockNumber),
        positionInSeed: Number(snapshot.positionInSeed),
        processId: snapshot.processId
      }));
    } catch (error) {
      console.error(`Error fetching snapshot data for user ${userAddress}:`, error);
      return [];
    }
  }

  /**
   * Get user's balance in Aave pool
   */
  async getUserPoolBalance(userAddress: string): Promise<string> {
    if (!contractConfig.aavePoolAddress) {
      return '0';
    }

    try {
      const AavePoolABI = require('../abi/aavepool-abi.json');
      const aavePoolContract = new ethers.Contract(
        contractConfig.aavePoolAddress,
        AavePoolABI,
        this.provider
      );

      const balance = await this.retryWithBackoff(async () => {
        return await aavePoolContract.getBalance(userAddress);
      });

      return balance.toString();
    } catch (error) {
      console.error(`Error fetching pool balance for user ${userAddress}:`, error);
      return '0';
    }
  }

  /**
   * Get user's Seed NFT balance
   */
  async getUserSeedNFTBalance(userAddress: string): Promise<string> {
    if (!this.seedNFTContract) {
      return '0';
    }

    try {
      const balance = await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.balanceOf(userAddress);
      });

      return balance.toString();
    } catch (error) {
      console.error(`Error fetching seed NFT balance for user ${userAddress}:`, error);
      return '0';
    }
  }

  /**
   * Get user's Snapshot NFT balance
   */
  async getUserSnapshotNFTBalance(userAddress: string): Promise<string> {
    if (!this.snapshotNFTContract) {
      return '0';
    }

    try {
      const balance = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.balanceOf(userAddress);
      });

      return balance.toString();
    } catch (error) {
      console.error(`Error fetching snapshot NFT balance for user ${userAddress}:`, error);
      return '0';
    }
  }

  /**
   * Parse base64-encoded tokenURI data from contract
   * Format: data:application/json;base64,<base64-encoded-json>
   */
  private parseTokenURI(tokenURI: string): { name: string; description: string; image: string; attributes: any[] } | null {
    try {
      // Check if it's a base64 data URI
      if (!tokenURI.startsWith('data:application/json;base64,')) {
        console.warn('TokenURI is not a base64 data URI:', tokenURI);
        return null;
      }

      // Extract the base64 part
      const base64Data = tokenURI.replace('data:application/json;base64,', '');
      
      // Decode base64
      const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
      
      // Parse JSON
      const metadata = JSON.parse(jsonString);
      
      // Clean up image URL - remove HTML encoding artifacts like <> tags
      let imageUrl = metadata.image || '';
      if (imageUrl) {
        // Remove ALL < and > characters from the URL (they appear in various positions)
        // Examples:
        // <https://...> -> https://...
        // https://.../\u003Eseed1/... -> https://.../seed1/...
        // https://...\u003C...> -> https://...
        imageUrl = imageUrl.replace(/<|>/g, '');
      }
      
      return {
        name: metadata.name || '',
        description: metadata.description || '',
        image: imageUrl,
        attributes: metadata.attributes || []
      };
    } catch (error) {
      console.error('Error parsing tokenURI:', error);
      return null;
    }
  }

  /**
   * Get seed image URL from tokenURI
   */
  async getSeedImageUrl(seedId: number): Promise<string | null> {
    if (!this.seedNFTContract) {
      return null;
    }

    try {
      const tokenURI = await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.tokenURI(seedId);
      });

      const metadata = this.parseTokenURI(tokenURI);
      return metadata?.image || null;
    } catch (error) {
      console.error(`Error fetching seed image URL for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get seed metadata from tokenURI (includes image, name, description, attributes)
   */
  async getSeedTokenMetadata(seedId: number): Promise<{ name: string; description: string; image: string; attributes: any[] } | null> {
    if (!this.seedNFTContract) {
      return null;
    }

    try {
      const tokenURI = await this.retryWithBackoff(async () => {
        return await this.seedNFTContract!.tokenURI(seedId);
      });

      return this.parseTokenURI(tokenURI);
    } catch (error) {
      console.error(`Error fetching seed metadata for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get latest snapshot image URL for a seed from SnapshotNFT.seedURI()
   */
  async getLatestSnapshotImageUrl(seedId: number): Promise<string | null> {
    if (!this.snapshotNFTContract) {
      return null;
    }

    try {
      const seedURI = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.seedURI(seedId);
      });

      const metadata = this.parseTokenURI(seedURI);
      return metadata?.image || null;
    } catch (error) {
      console.error(`Error fetching latest snapshot image for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get snapshot image URL from tokenURI
   */
  async getSnapshotImageUrl(snapshotId: number): Promise<string | null> {
    if (!this.snapshotNFTContract) {
      return null;
    }

    try {
      const tokenURI = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.tokenURI(snapshotId);
      });

      const metadata = this.parseTokenURI(tokenURI);
      return metadata?.image || null;
    } catch (error) {
      console.error(`Error fetching snapshot image URL for snapshot ${snapshotId}:`, error);
      return null;
    }
  }

  /**
   * Get snapshot metadata from tokenURI (includes image, name, description, attributes)
   */
  async getSnapshotTokenMetadata(snapshotId: number): Promise<{ name: string; description: string; image: string; attributes: any[] } | null> {
    if (!this.snapshotNFTContract) {
      return null;
    }

    try {
      const tokenURI = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.tokenURI(snapshotId);
      });

      return this.parseTokenURI(tokenURI);
    } catch (error) {
      console.error(`Error fetching snapshot metadata for snapshot ${snapshotId}:`, error);
      return null;
    }
  }

  /**
   * Get distributor contract financial state
   */
  async getDistributorContractState(): Promise<{
    contractBalance: string;
    totalAllocated: string;
    totalClaimedAll: string;
    remainingToDistribute: string;
  } | null> {
    if (!this.distributorContract) {
      return null;
    }

    try {
      const state = await this.retryWithBackoff(async () => {
        return await this.distributorContract!.getContractState();
      });

      return {
        contractBalance: ethers.formatEther(state.contractBalance),
        totalAllocated: ethers.formatEther(state.totalAllocated),
        totalClaimedAll: ethers.formatEther(state.totalClaimedAll),
        remainingToDistribute: ethers.formatEther(state.remainingToDistribute)
      };
    } catch (error) {
      console.error('Error fetching distributor contract state:', error);
      return null;
    }
  }

  /**
   * Get Aave pool information
   */
  async getPoolInfo(): Promise<{
    totalOriginal: string;
    currentAToken: string;
    claimableInterest: string;
    contractETH: string;
  } | null> {
    if (!contractConfig.aavePoolAddress) {
      return null;
    }

    try {
      const AavePoolABI = require('../abi/aavepool-abi.json');
      const aavePoolContract = new ethers.Contract(
        contractConfig.aavePoolAddress,
        AavePoolABI,
        this.provider
      );

      const poolInfo = await this.retryWithBackoff(async () => {
        return await aavePoolContract.getPoolInfo();
      });

      return {
        totalOriginal: ethers.formatEther(poolInfo.totalOriginal),
        currentAToken: ethers.formatEther(poolInfo.currentAToken),
        claimableInterest: ethers.formatEther(poolInfo.claimableInterest),
        contractETH: ethers.formatEther(poolInfo.contractETH)
      };
    } catch (error) {
      console.error('Error fetching pool info:', error);
      return null;
    }
  }

  /**
   * Get unlock time for a seed (when deposit can be withdrawn)
   */
  async getSeedUnlockTime(seedId: number): Promise<number | null> {
    if (!this.seedFactoryContract) {
      return null;
    }

    try {
      const unlockTime = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.getUnlockTime(seedId);
      });

      return Number(unlockTime);
    } catch (error) {
      console.error(`Error fetching unlock time for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get accumulated profits for a seed
   */
  async getSeedAccumulatedProfits(seedId: number): Promise<string | null> {
    if (!this.seedFactoryContract) {
      return null;
    }

    try {
      const profits = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.getAccumulatedProfits(seedId);
      });

      return ethers.formatEther(profits);
    } catch (error) {
      console.error(`Error fetching accumulated profits for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get dynamic seed percentage (changes over time)
   */
  async getDynamicSeedPercentage(seedId: number): Promise<string | null> {
    if (!this.seedFactoryContract) {
      return null;
    }

    try {
      const percentage = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.getDynamicSeedPercentage(seedId);
      });

      // Convert basis points to percentage (10000 = 100%)
      return (Number(percentage) / 100).toFixed(2);
    } catch (error) {
      console.error(`Error fetching dynamic percentage for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get total seed value
   */
  async getTotalSeedValue(seedId?: number): Promise<string | null> {
    if (!this.seedFactoryContract) {
      return null;
    }

    try {
      const value = await this.retryWithBackoff(async () => {
        if (seedId !== undefined) {
          return await this.seedFactoryContract!['getTotalSeedValue(uint256)'](seedId);
        } else {
          return await this.seedFactoryContract!['getTotalSeedValue()']();
        }
      });

      return ethers.formatEther(value);
    } catch (error) {
      console.error(`Error fetching total seed value:`, error);
      return null;
    }
  }

  /**
   * Check if seed was early withdrawn
   */
  async isSeedEarlyWithdrawn(seedId: number): Promise<boolean> {
    if (!this.seedFactoryContract) {
      return false;
    }

    try {
      const isEarlyWithdrawn = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.isSeedEarlyWithdrawn(seedId);
      });

      return Boolean(isEarlyWithdrawn);
    } catch (error) {
      console.error(`Error checking early withdrawal for seed ${seedId}:`, error);
      return false;
    }
  }

  /**
   * Get beneficiary total value from SnapshotNFT
   */
  async getBeneficiaryTotalValue(beneficiaryIndex: number): Promise<string | null> {
    if (!this.snapshotNFTContract) {
      return null;
    }

    try {
      const value = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getBeneficiaryTotalValue(beneficiaryIndex);
      });

      return ethers.formatEther(value);
    } catch (error) {
      console.error(`Error fetching total value for beneficiary ${beneficiaryIndex}:`, error);
      return null;
    }
  }

  /**
   * Get beneficiary snapshot count
   */
  async getBeneficiarySnapshotCount(beneficiaryIndex: number): Promise<number> {
    if (!this.snapshotNFTContract) {
      return 0;
    }

    try {
      const count = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getBeneficiarySnapshotCount(beneficiaryIndex);
      });

      return Number(count);
    } catch (error) {
      console.error(`Error fetching snapshot count for beneficiary ${beneficiaryIndex}:`, error);
      return 0;
    }
  }

  /**
   * Get claimable interest from Aave pool
   */
  async getClaimableInterest(): Promise<string | null> {
    if (!contractConfig.aavePoolAddress) {
      return null;
    }

    try {
      const AavePoolABI = require('../abi/aavepool-abi.json');
      const aavePoolContract = new ethers.Contract(
        contractConfig.aavePoolAddress,
        AavePoolABI,
        this.provider
      );

      const interest = await this.retryWithBackoff(async () => {
        return await aavePoolContract.getClaimableInterest();
      });

      return ethers.formatEther(interest);
    } catch (error) {
      console.error('Error fetching claimable interest:', error);
      return null;
    }
  }

  /**
   * Get beneficiary data from distributor contract
   * Hardcoded mappings for specific seeds:
   * - Seed 1: Walkers Reserve, El Globo, Jaguar, Pimlico
   * - Seed 2: Grgich Hills, Buena Vista, Jaguar, Pimlico
   * - Others: Default first 4 beneficiaries
   */
  async getSeedBeneficiaries(seedId: number): Promise<{ code: string; index?: number; name?: string }[]> {
    // If distributor not configured, return empty
    if (!this.distributorContract) {
      console.log('Distributor contract not initialized for getSeedBeneficiaries');
      return [];
    }

    try {
      console.log(`Fetching beneficiaries for seed ${seedId}...`);
      
      // Get all beneficiaries
      const allBeneficiaries = await this.getAllBeneficiaries();
      
      if (allBeneficiaries.length === 0) {
        console.log('No beneficiaries found in contract');
        return [];
      }

      // Hardcoded beneficiary mappings for specific seeds
      const seedBeneficiaryMappings: { [key: number]: number[] } = {
        1: [4, 1, 2, 5], // Seed 1: Walkers Reserve, El Globo, Jaguar, Pimlico
        2: [0, 3, 2, 5], // Seed 2: Grgich Hills, Buena Vista, Jaguar, Pimlico
        // Add more seed mappings here as needed
      };

      // Get beneficiary indices for this seed (default to first 4)
      const beneficiaryIndices = seedBeneficiaryMappings[seedId] || [0, 1, 2, 3];

      // Map indices to actual beneficiaries
      const seedBeneficiaries = beneficiaryIndices
        .map(index => allBeneficiaries[index])
        .filter(b => b) // Filter out any undefined (in case index doesn't exist)
        .map((b) => ({
          code: b.code,
          index: b.index,
          name: b.name,
          percentage: b.percentage,
          address: b.address,
          allocatedAmount: b.allocatedAmount,
          totalClaimed: b.totalClaimed,
          claimableAmount: b.claimableAmount,
          isActive: b.isActive,
          beneficiaryValue: b.beneficiaryValue
        }));

      console.log(`Found ${seedBeneficiaries.length} beneficiaries for seed ${seedId}:`, seedBeneficiaries);
      return seedBeneficiaries;
    } catch (error) {
      console.error(`Error fetching beneficiaries for seed ${seedId}:`, error);
      return [];
    }
  }

  /**
   * Get comprehensive beneficiary data from distributor contract
   */
  async getBeneficiaryData(beneficiaryIndex: number): Promise<any | null> {
    if (!this.distributorContract) {
      return null;
    }

    try {
      // Get basic beneficiary data
      const beneficiary = await this.retryWithBackoff(async () => {
        return await this.distributorContract!.getBeneficiary(beneficiaryIndex);
      });

      // Get percentage allocation (in basis points, where 10000 = 100%)
      let percentage = '0.00';
      try {
        const perc = await this.retryWithBackoff(async () => {
          return await this.distributorContract!.getBeneficiaryPercentage(beneficiaryIndex);
        });
        // Convert from basis points to percentage: perc / 10000 * 100 = perc / 100
        const percentageValue = (Number(perc) / 100).toFixed(2);
        percentage = percentageValue;
        console.log(`✅ Beneficiary ${beneficiaryIndex} percentage:`, percentage + '%', `(basis points: ${perc})`);
      } catch (e) {
        console.error(`❌ Could not fetch percentage for beneficiary ${beneficiaryIndex}:`, e);
      }

      // Get allocation details
      let beneficiaryValue = '0';
      try {
        const details = await this.retryWithBackoff(async () => {
          return await this.distributorContract!.getBeneficiaryAllocationDetails(beneficiaryIndex);
        });
        beneficiaryValue = details[0].toString(); // beneficiaryValue
        console.log(`✅ Beneficiary ${beneficiaryIndex} allocation details:`, details);
      } catch (e) {
        console.error(`❌ Could not fetch allocation details for beneficiary ${beneficiaryIndex}:`, e);
      }

      return {
        index: beneficiaryIndex,
        address: beneficiary[0],
        name: beneficiary[1],
        code: beneficiary[2],
        allocatedAmount: (Number(beneficiary[3]) / Math.pow(10, 18)).toFixed(6),
        totalClaimed: (Number(beneficiary[4]) / Math.pow(10, 18)).toFixed(6),
        claimableAmount: (Number(beneficiary[5]) / Math.pow(10, 18)).toFixed(6),
        isActive: beneficiary[6],
        percentage: percentage,
        beneficiaryValue: (Number(beneficiaryValue) / Math.pow(10, 18)).toFixed(6)
      };
    } catch (error) {
      console.error(`Error fetching beneficiary data for index ${beneficiaryIndex}:`, error);
      return null;
    }
  }

  /**
   * Get all beneficiaries from distributor contract
   */
  async getAllBeneficiaries(): Promise<any[]> {
    if (!this.distributorContract) {
      console.log('Distributor contract not initialized');
      return [];
    }

    try {
      console.log('Fetching all beneficiaries from distributor contract...');
      const result = await this.retryWithBackoff(async () => {
        return await this.distributorContract!.getAllBeneficiaries();
      });

      console.log('Raw getAllBeneficiaries result:', result);

      // Parse the result - it returns multiple arrays
      const [addresses, names, codes, allocatedAmounts, totalClaimed, claimableAmounts] = result;

      const beneficiaries = [];
      for (let i = 0; i < addresses.length; i++) {
        // Get percentage for each beneficiary (in basis points, where 10000 = 100%)
        let percentage = '0.00';
        try {
          const perc = await this.retryWithBackoff(async () => {
            return await this.distributorContract!.getBeneficiaryPercentage(i);
          });
          // Convert from basis points to percentage: perc / 10000 * 100 = perc / 100
          const percentageValue = (Number(perc) / 100).toFixed(2);
          percentage = percentageValue;
          console.log(`Beneficiary ${i} (${codes[i]}) percentage:`, percentage + '%', `(basis points: ${perc})`);
        } catch (e) {
          console.error(`Failed to fetch percentage for beneficiary ${i}:`, e);
        }

        // Get allocation details
        let beneficiaryValue = '0';
        try {
          const details = await this.retryWithBackoff(async () => {
            return await this.distributorContract!.getBeneficiaryAllocationDetails(i);
          });
          beneficiaryValue = (Number(details[0]) / Math.pow(10, 18)).toFixed(6);
          console.log(`Beneficiary ${i} (${codes[i]}) value:`, beneficiaryValue);
        } catch (e) {
          console.error(`Failed to fetch allocation details for beneficiary ${i}:`, e);
        }
        
        beneficiaries.push({
          index: i,
          address: addresses[i],
          name: names[i],
          code: codes[i],
          allocatedAmount: (Number(allocatedAmounts[i]) / Math.pow(10, 18)).toFixed(6),
          totalClaimed: (Number(totalClaimed[i]) / Math.pow(10, 18)).toFixed(6),
          claimableAmount: (Number(claimableAmounts[i]) / Math.pow(10, 18)).toFixed(6),
          isActive: true, // All beneficiaries from getAllBeneficiaries are active
          percentage: percentage,
          beneficiaryValue: beneficiaryValue
        });
      }

      console.log(`Successfully fetched ${beneficiaries.length} beneficiaries`);
      return beneficiaries;
    } catch (error) {
      console.error('Error fetching all beneficiaries:', error);
      return [];
    }
  }

  /**
   * Get beneficiary by code
   */
  async getBeneficiaryByCode(code: string): Promise<any | null> {
    if (!this.distributorContract) {
      return null;
    }

    try {
      const beneficiaryIndex = await this.retryWithBackoff(async () => {
        return await this.distributorContract!.getBeneficiaryIndexByCode(code);
      });

      if (beneficiaryIndex !== null && beneficiaryIndex !== undefined) {
        return await this.getBeneficiaryData(Number(beneficiaryIndex));
      }

      return null;
    } catch (error) {
      console.error(`Error fetching beneficiary by code ${code}:`, error);
      return null;
    }
  }

  /**
   * Get location data from beneficiary (location = beneficiary)
   */
  async getLocationFromBeneficiary(beneficiaryIndex: number): Promise<string | null> {
    const beneficiary = await this.getBeneficiaryData(beneficiaryIndex);
    return beneficiary ? beneficiary.code : null;
  }

  // ==================== SNAPSHOT METHODS ====================

  /**
   * Get total number of snapshots
   */
  async getTotalSnapshots(): Promise<number> {
    if (!this.snapshotNFTContract) {
      return 0;
    }

    try {
      const total = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getTotalSnapshots();
      });
      return Number(total);
    } catch (error) {
      console.error('Error fetching total snapshots:', error);
      return 0;
    }
  }

  /**
   * Get snapshots for a specific seed
   */
  async getSeedSnapshots(seedId: number): Promise<number[]> {
    if (!this.snapshotNFTContract) {
      return [];
    }

    try {
      const snapshots = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getSeedSnapshots(seedId);
      });
      return snapshots.map((id: any) => Number(id));
    } catch (error) {
      console.error(`Error fetching snapshots for seed ${seedId}:`, error);
      return [];
    }
  }

  /**
   * Get snapshot count for a specific seed
   */
  async getSeedSnapshotCount(seedId: number): Promise<number> {
    if (!this.snapshotNFTContract) {
      return 0;
    }

    try {
      const count = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getSeedSnapshotCount(seedId);
      });
      return Number(count);
    } catch (error) {
      console.error(`Error fetching snapshot count for seed ${seedId}:`, error);
      return 0;
    }
  }

  /**
   * Get snapshot data by ID
   */
  async getSnapshotData(snapshotId: number): Promise<any | null> {
    if (!this.snapshotNFTContract) {
      return null;
    }

    try {
      const data = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getSnapshotData(snapshotId);
      });
      
      return {
        creator: data.creator,
        value: Number(data.value),
        beneficiaryIndex: Number(data.beneficiaryIndex),
        seedId: Number(data.seedId),
        timestamp: Number(data.timestamp),
        blockNumber: Number(data.blockNumber),
        positionInSeed: Number(data.positionInSeed),
        processId: data.processId
      };
    } catch (error) {
      console.error(`Error fetching snapshot data for ${snapshotId}:`, error);
      return null;
    }
  }

  /**
   * Get snapshots for a specific beneficiary
   */
  async getBeneficiarySnapshots(beneficiaryIndex: number): Promise<number[]> {
    if (!this.snapshotNFTContract) {
      return [];
    }

    try {
      const snapshots = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getBeneficiarySnapshots(beneficiaryIndex);
      });
      return snapshots.map((id: any) => Number(id));
    } catch (error) {
      console.error(`Error fetching snapshots for beneficiary ${beneficiaryIndex}:`, error);
      return [];
    }
  }

  /**
   * Get total value raised
   */
  async getTotalValueRaised(): Promise<string> {
    if (!this.snapshotNFTContract) {
      return '0';
    }

    try {
      const total = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getTotalValueRaised();
      });
      return total.toString();
    } catch (error) {
      console.error('Error fetching total value raised:', error);
      return '0';
    }
  }

  /**
   * Get latest snapshot ID for a seed
   */
  async getLatestSnapshotId(seedId: number): Promise<number | null> {
    if (!this.snapshotNFTContract) {
      return null;
    }

    try {
      const latestId = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getLatestSnapshotId(seedId);
      });
      return Number(latestId);
    } catch (error) {
      console.error(`Error fetching latest snapshot for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get next snapshot ID (global counter)
   */
  async getNextSnapshotId(): Promise<number> {
    if (!this.snapshotNFTContract) {
      return 0;
    }

    try {
      const nextId = await this.retryWithBackoff(async () => {
        return await this.snapshotNFTContract!.getNextSnapshotId();
      });
      return Number(nextId);
    } catch (error) {
      console.error('Error fetching next snapshot ID:', error);
      return 0;
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber(): Promise<number> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      console.error('Error fetching current block number:', error);
      return 0;
    }
  }

  /**
   * Calculate early harvest fee (exit penalty) for a seed
   * Based on linear vesting: 100% tax at creation, 0% tax after lock period
   */
  async calculateEarlyHarvestFee(seedId: number): Promise<{ feePercentage: number; feeAmount: string; canWithdrawWithoutFee: boolean } | null> {
    if (!this.seedFactoryContract || !this.seedNFTContract) {
      return null;
    }

    try {
      const [seedInfo, metadata, unlockTime] = await Promise.all([
        this.getSeedInfo(seedId),
        this.retryWithBackoff(async () => this.seedNFTContract!.getSeedMetadata(seedId)),
        this.getSeedUnlockTime(seedId)
      ]);

      if (!seedInfo || !unlockTime) {
        return null;
      }

      const creationTime = Number(metadata[0]);
      const currentTime = Math.floor(Date.now() / 1000);
      const elapsed = currentTime - creationTime;
      const lockPeriod = unlockTime - creationTime;

      if (elapsed >= lockPeriod) {
        return {
          feePercentage: 0,
          feeAmount: '0',
          canWithdrawWithoutFee: true
        };
      }

      // Calculate tax: 100% at start, decreases linearly to 0%
      const basisPoints = (elapsed * 10000) / lockPeriod;
      const remainingBasisPoints = 10000 - basisPoints;
      const feePercentage = remainingBasisPoints / 100; // Convert to percentage

      const originalDeposit = Number(seedInfo.depositAmount);
      const feeAmountWei = (originalDeposit * remainingBasisPoints) / 10000;
      const feeAmount = weiToEthExact(feeAmountWei);

      return {
        feePercentage: Number(feePercentage.toFixed(2)),
        feeAmount,
        canWithdrawWithoutFee: false
      };
    } catch (error) {
      console.error(`Error calculating early harvest fee for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get the highest deposit amount across all seeds (for 20% share value calculation)
   */
  async getHighestSeedDeposit(): Promise<string | null> {
    if (!this.seedFactoryContract) {
      return null;
    }

    try {
      const maxDeposit = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.currentMaxSeedDeposit();
      });

      return weiToEthExact(maxDeposit);
    } catch (error) {
      console.error('Error fetching highest seed deposit:', error);
      return null;
    }
  }

  /**
   * Get withdrawable amount for a seed (harvestable amount)
   */
  async getWithdrawableAmount(seedId: number): Promise<string | null> {
    if (!this.seedFactoryContract) {
      return null;
    }

    try {
      const totalValue = await this.getTotalSeedValue(seedId);
      if (!totalValue) {
        return null;
      }

      // Check if seed is withdrawn
      const seedInfo = await this.getSeedInfo(seedId);
      if (seedInfo && seedInfo.withdrawn) {
        return '0';
      }

      // Calculate early harvest fee
      const feeInfo = await this.calculateEarlyHarvestFee(seedId);
      if (!feeInfo) {
        return totalValue;
      }

      // Withdrawable = total value - early harvest fee
      const totalValueNum = parseFloat(totalValue);
      const feeAmountNum = parseFloat(feeInfo.feeAmount);
      const withdrawable = totalValueNum - feeAmountNum;

      return withdrawable.toString();
    } catch (error) {
      console.error(`Error calculating withdrawable amount for seed ${seedId}:`, error);
      return null;
    }
  }

  /**
   * Get seed price (cost to create a seed)
   */
  async getSeedPrice(): Promise<string> {
    if (!this.seedFactoryContract) {
      return '0.048'; // Default for mock data
    }

    try {
      const price = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.seedPrice();
      });
      return weiToEthExact(price);
    } catch (error) {
      console.error('Error fetching seed price:', error);
      return '0.048';
    }
  }

  /**
   * Get seed fee (percentage in basis points)
   */
  async getSeedFee(): Promise<string> {
    if (!this.seedFactoryContract) {
      return '500'; // Default 5% (500 basis points)
    }

    try {
      const fee = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.seedFee();
      });
      return fee.toString();
    } catch (error) {
      console.error('Error fetching seed fee:', error);
      return '500';
    }
  }

  /**
   * Get default snapshot price
   */
  async getDefaultSnapshotPrice(): Promise<string> {
    if (!this.seedFactoryContract) {
      return '0.011'; // Default
    }

    try {
      const price = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.defaultSnapshotPrice();
      });
      return weiToEthExact(price);
    } catch (error) {
      console.error('Error fetching default snapshot price:', error);
      return '0.011';
    }
  }

  /**
   * Get maximum seeds allowed
   */
  async getMaxSeeds(): Promise<number> {
    if (!this.seedFactoryContract) {
      return 1000; // Default
    }

    try {
      const maxSeeds = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.maxSeeds();
      });
      return Number(maxSeeds);
    } catch (error) {
      console.error('Error fetching max seeds:', error);
      return 1000;
    }
  }

  /**
   * Check if factory is locked (restricted minting)
   */
  async isFactoryLocked(): Promise<boolean> {
    if (!this.seedFactoryContract) {
      return false;
    }

    try {
      const locked = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.locked();
      });
      return Boolean(locked);
    } catch (error) {
      console.error('Error checking factory lock status:', error);
      return false;
    }
  }

  /**
   * Get seeder allowance for an address
   */
  async getSeederAllowance(address: string): Promise<string> {
    if (!this.seedFactoryContract) {
      return '0';
    }

    try {
      const allowance = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.seederAllowance(address);
      });
      return allowance.toString();
    } catch (error) {
      console.error('Error fetching seeder allowance:', error);
      return '0';
    }
  }

  /**
   * Get owner address of the factory contract
   */
  async getOwner(): Promise<string> {
    if (!this.seedFactoryContract) {
      return '0x0000000000000000000000000000000000000000';
    }

    try {
      const owner = await this.retryWithBackoff(async () => {
        return await this.seedFactoryContract!.owner();
      });
      return owner;
    } catch (error) {
      console.error('Error fetching owner:', error);
      return '0x0000000000000000000000000000000000000000';
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();
