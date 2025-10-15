import { Request, Response } from 'express';
import { contractService } from '../services/contractService';
import { seedTransformService } from '../services/seedTransformService';
import { contractConfig } from '../config/contract';
import { GardenDataResponse, SeedDetailResponse } from '../types/seed';
import { weiToEthExact } from '../utils/eth-utils';

export const seedController = {
  /**
   * Get all seeds
   * GET /api/seeds
   */
  getAllSeeds: async (req: Request, res: Response): Promise<void> => {
    try {
      // Always use contract data - NO MOCK DATA
      console.log('Fetching seeds from contract');
      const contractData = await contractService.getAllSeedsData();
      
      if (contractData.length === 0) {
        // Return empty array if no seeds found - NO FALLBACK TO MOCK
        console.log('No seeds found in contract');
        const response: GardenDataResponse = {
          success: true,
          seeds: [],
          timestamp: Date.now()
        };
        res.json(response);
        return;
      }

      const seeds = seedTransformService.transformContractDataToSeedSummaries(contractData);

      const response: GardenDataResponse = {
        success: true,
        seeds,
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching seeds:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch seeds',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get seed by ID
   * GET /api/seeds/:id
   */
  getSeedById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const seedId = parseInt(id, 10);

      if (isNaN(seedId) || seedId < 1) {
        res.status(400).json({
          success: false,
          error: 'Invalid seed ID',
          message: 'Seed ID must be a positive integer',
          timestamp: Date.now()
        });
        return;
      }

      // Always use contract data - NO MOCK DATA
      console.log(`Fetching seed ${seedId} from contract`);
      const contractData = await contractService.getSeedData(seedId);
      
      if (!contractData || !contractData.exists) {
        res.status(404).json({
          success: false,
          error: 'Seed not found',
          message: `Seed with ID ${seedId} does not exist`,
          timestamp: Date.now()
        });
        return;
      }

      const seed = await seedTransformService.transformContractDataToSeed(contractData);

      const response: SeedDetailResponse = {
        success: true,
        seed,
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      console.error(`Error fetching seed ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch seed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get seeds count
   * GET /api/seeds/count
   */
  getSeedsCount: async (req: Request, res: Response): Promise<void> => {
    try {
      // Always use contract data - NO MOCK DATA
      const count = await contractService.getTotalSeeds();

      res.json({
        success: true,
        count,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching seeds count:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch seeds count',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get contract info
   * GET /api/seeds/contract-info
   */
  getContractInfo: async (req: Request, res: Response): Promise<void> => {
    try {
      const useMockData = contractConfig.useMockData;
      
      res.json({
        success: true,
        data: {
          usingMockData: useMockData,
          environment: {
            USE_MOCK_DATA: process.env.USE_MOCK_DATA,
            SEED_FACTORY_ADDRESS: process.env.SEED_FACTORY_ADDRESS,
            RPC_URL: process.env.RPC_URL
          },
          contractAddress: contractService.getContractAddress(),
          provider: 'Base Mainnet'
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching contract info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch contract info',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get comprehensive seed statistics
   * GET /api/seeds/:id/stats
   */
  getSeedStats: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const seedId = parseInt(id, 10);

      if (isNaN(seedId) || seedId < 1) {
        res.status(400).json({
          success: false,
          error: 'Invalid seed ID',
          message: 'Seed ID must be a positive integer',
          timestamp: Date.now()
        });
        return;
      }

      // Get seed data from contract
      const seedData = await contractService.getSeedData(seedId);
      
      if (!seedData || !seedData.exists) {
        res.status(404).json({
          success: false,
          error: 'Seed not found',
          message: `Seed with ID ${seedId} does not exist`,
          timestamp: Date.now()
        });
        return;
      }

      // Fetch all necessary data in parallel
      const [
        snapshotCount,
        dynamicPercentage,
        metadata,
        unlockTime,
        profits,
        totalValue,
        highestDeposit,
        earlyFee,
        withdrawable,
        claimableInterest,
        totalSeeds
      ] = await Promise.all([
        contractService.getSeedSnapshotCount(seedId),
        contractService.getDynamicSeedPercentage(seedId),
        contractService.getProvider().send('eth_getBlockByNumber', ['latest', false]),
        contractService.getSeedUnlockTime(seedId),
        contractService.getSeedAccumulatedProfits(seedId),
        contractService.getTotalSeedValue(seedId),
        contractService.getHighestSeedDeposit(),
        contractService.calculateEarlyHarvestFee(seedId),
        contractService.getWithdrawableAmount(seedId),
        contractService.getClaimableInterest(),
        contractService.getTotalSeeds()
      ]);

      // Get seed metadata for creation time
      const seedMetadata = await contractService.getProvider().send('eth_call', [
        {
          to: contractConfig.seedNFTAddress,
          data: '0x...' // getSeedMetadata call
        },
        'latest'
      ]).catch(() => null);

      const creationTime = seedData.timestamp;
      const createdDate = new Date(creationTime * 1000);

      // Calculate values first (needed for beneficiary stats)
      const snapshotPrice = parseFloat(seedData.snapshotPrice || '0');
      const depositAmount = parseFloat(seedData.depositAmount || '0');
      const dynamicPercent = parseFloat(dynamicPercentage || '0');

      // Get last snapshot mint date
      const snapshots = await contractService.getSeedSnapshots(seedId);
      let lastSnapshotDate = null;
      if (snapshots.length > 0) {
        const lastSnapshotId = snapshots[snapshots.length - 1];
        const lastSnapshot = await contractService.getSnapshotData(lastSnapshotId);
        if (lastSnapshot) {
          lastSnapshotDate = new Date(lastSnapshot.timestamp * 1000).toISOString();
        }
      }

      // Get beneficiaries for this seed with their stats
      const seedBeneficiaries = await contractService.getSeedBeneficiaries(seedId) as any[];
      const beneficiaryStats = [];

      for (const ben of seedBeneficiaries) {
        const beneficiary = ben as any; // Cast to access all fields
        if (beneficiary.index !== undefined) {
          // Get snapshot count for this beneficiary
          const beneficiarySnapshotCount = await contractService.getBeneficiarySnapshotCount(beneficiary.index);
          
          // Get total value raised for this beneficiary
          const beneficiaryTotalValue = await contractService.getBeneficiaryTotalValue(beneficiary.index);
          
          // Calculate snapshots gain (total value from snapshot mints)
          const snapshotsGain = beneficiarySnapshotCount * snapshotPrice;
          
          beneficiaryStats.push({
            name: beneficiary.name || '',
            code: beneficiary.code || '',
            index: beneficiary.index,
            address: beneficiary.address || '',
            benefitShare: beneficiary.percentage || '0', // Percentage allocation
            snapshotsGain: snapshotsGain.toString(), // Total from snapshot mints
            unclaimed: beneficiary.claimableAmount || '0', // Claimable amount
            claimed: beneficiary.totalClaimed || '0', // Already claimed
            yieldShare: beneficiary.allocatedAmount || '0', // Allocated from interest distributions
            garden: beneficiaryTotalValue || '0', // Total value raised for beneficiary
            snapshotCount: beneficiarySnapshotCount, // Number of snapshots
            totalValue: beneficiaryTotalValue || '0' // Total beneficiary value
          });
        }
      }
      
      // Nutrient Reserve Total = original deposit + snapshot steward distributions (10-20% per snapshot)
      const avgSnapshotDistribution = snapshotPrice * (dynamicPercent / 100);
      const totalSnapshotDistributions = avgSnapshotDistribution * snapshotCount;
      const nutrientReserveTotal = depositAmount + totalSnapshotDistributions;

      // Absolute Nutrient Yield = original seed price + funds added later (total value)
      const absoluteNutrientYield = parseFloat(totalValue || '0');

      // 20% Share Value = 20% of highest deposit
      const twentyPercentShareValue = parseFloat(highestDeposit || '0') * 0.2;

      // Immediate Impact = total snapshots × snapshot price × 0.5 (50% goes to beneficiary)
      const immediateImpact = snapshotCount * snapshotPrice * 0.5;

      // Long-term Impact = total pool interest / number of seeds
      const longtermImpact = totalSeeds > 0 ? parseFloat(claimableInterest || '0') / totalSeeds : 0;

      // Overall Accumulated Yield = total pool interest
      const overallYield = parseFloat(claimableInterest || '0');

      res.json({
        success: true,
        stats: {
          // Basic info
          seedId: seedId,
          seedNumber: `00${seedId}`,
          openSeaUrl: `https://opensea.io/collection/way-of-flowers-snapshots-621788326?traits=[{"traitType":"Seed","values":["${seedId}"]}]`,
          
          // Snapshot info
          totalSnapshots: snapshotCount,
          snapshotPrice: seedData.snapshotPrice,
          snapshotShare: dynamicPercentage, // 10-20% dynamic percentage
          
          // Dates
          mintedOn: createdDate.toISOString(),
          lastSnapshotMintDate: lastSnapshotDate,
          maturationDate: unlockTime ? new Date(unlockTime * 1000).toISOString() : null,
          
          // Financial metrics
          nutrientReserveTotal: nutrientReserveTotal.toString(),
          absoluteNutrientYield: absoluteNutrientYield.toString(),
          harvestable: withdrawable,
          earlyHarvestFee: earlyFee ? {
            percentage: earlyFee.feePercentage,
            amount: earlyFee.feeAmount,
            canWithdrawWithoutFee: earlyFee.canWithdrawWithoutFee
          } : null,
          
          // Value calculations
          twentyPercentShareValue: twentyPercentShareValue.toString(),
          highestSeedDeposit: highestDeposit,
          
          // Impact metrics
          immediateImpact: immediateImpact.toString(),
          immediateImpactDate: lastSnapshotDate, // Same as last snapshot mint
          longtermImpact: longtermImpact.toString(),
          longtermImpactDate: null, // Date of last interest distribution (not tracked on-chain)
          overallAccumulatedYield: overallYield.toString(),
          
          // Beneficiary stats for this seed
          beneficiaries: beneficiaryStats,
          
          // Detailed breakdown
          breakdown: {
            originalDeposit: depositAmount.toString(),
            accumulatedProfits: profits || '0',
            totalValue: totalValue || '0',
            avgSnapshotDistribution: avgSnapshotDistribution.toString(),
            totalSnapshotDistributions: totalSnapshotDistributions.toString()
          }
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`Error fetching seed stats for ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch seed statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }
};
