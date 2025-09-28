import { ethers } from 'ethers';
import { ContractSeedData, ContractSeedMetadata } from '../types/seed';
import { contractConfig } from '../config/contract';
import SeedFactoryABI from '../abi/seedfactory-abi.json';
import SeedNFTABI from '../abi/seednft-abi.json';

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private seedFactoryContract: ethers.Contract | null = null;
  private seedNFTContract: ethers.Contract | null = null;
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
    } else {
      // Create dummy contracts for mock data mode
      this.seedFactoryContract = null as any;
      this.seedNFTContract = null as any;
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
      
      return {
        id: seedId,
        owner: seedInfo.owner,
        location: location,
        timestamp: timestamp || Number(seedInfo.creationTime),
        blockNumber: blockNumber,
        exists: true,
        depositAmount: seedInfo.depositAmount,
        withdrawn: seedInfo.withdrawn,
        snapshotCount: Number(seedInfo.snapshotCount)
      };
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
}

// Export singleton instance
export const contractService = new ContractService();
