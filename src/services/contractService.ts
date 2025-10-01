import { ethers } from 'ethers';
import { ContractSeedData, ContractSeedMetadata } from '../types/seed';
import { contractConfig } from '../config/contract';
import SeedFactoryABI from '../abi/seedfactory-abi.json';
import SeedNFTABI from '../abi/seednft-abi.json';
import SnapshotNFTABI from '../abi/snapshotnft-abi.json';
import DistributorABI from '../abi/distributor-abi.json';

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
          snapshotPrice = (Number(price) / Math.pow(10, 18)).toFixed(6);
        } catch (error) {
          console.log(`Could not fetch snapshot price for seed ${seedId}:`, error);
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
        snapshotCount: Number(seedInfo.snapshotCount),
        seedImageUrl: undefined, // Will be set by transform service if needed
        latestSnapshotUrl: undefined, // Will be set by transform service if needed
        snapshotPrice: snapshotPrice
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
   * Get beneficiary data from distributor contract
   */
  async getSeedBeneficiaries(seedId: number): Promise<{ code: string; index?: number; name?: string }[]> {
    // If distributor not configured, return empty
    if (!this.distributorContract) {
      console.log('Distributor contract not initialized for getSeedBeneficiaries');
      return [];
    }

    try {
      console.log(`Fetching beneficiaries for seed ${seedId}...`);
      
      // Get all beneficiaries and return first 4 (as per your requirement)
      const allBeneficiaries = await this.getAllBeneficiaries();
      
      if (allBeneficiaries.length === 0) {
        console.log('No beneficiaries found in contract');
        return [];
      }

      // Return first 4 beneficiaries for this seed with full details
      const seedBeneficiaries = allBeneficiaries.slice(0, 4).map((b) => ({
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
}

// Export singleton instance
export const contractService = new ContractService();
