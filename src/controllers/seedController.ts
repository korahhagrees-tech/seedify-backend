import { Request, Response } from 'express';
import { contractService } from '../services/contractService';
import { seedTransformService } from '../services/seedTransformService';
import { contractConfig } from '../config/contract';
import { GardenDataResponse, SeedDetailResponse } from '../types/seed';

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
  }
};
