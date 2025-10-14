import { Request, Response } from 'express';
import { contractService } from '../services/contractService';
import { seedTransformService } from '../services/seedTransformService';
import { weiToEthExact, generateSnapshotImageUrl } from '../utils/eth-utils';

export const usersController = {
  /**
   * Get all seeds owned by a user
   * GET /api/users/:address/seeds
   */
  getUserSeeds: async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        res.status(400).json({
          success: false,
          error: 'Invalid address',
          message: 'Address must be a valid Ethereum address',
          timestamp: Date.now()
        });
        return;
      }

      // Get seed IDs owned by user
      const seedIds = await contractService.getUserSeeds(address);
      
      // Get full seed data for each seed
      const seeds = [];
      for (const seedId of seedIds) {
        const seedData = await contractService.getSeedData(seedId);
        if (seedData) {
          const seed = await seedTransformService.transformContractDataToSeed(seedData);
          seeds.push(seed);
        }
      }

      res.json({
        success: true,
        seeds,
        count: seeds.length,
        owner: address,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching user seeds:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user seeds',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get count of seeds owned by a user
   * GET /api/users/:address/seeds/count
   */
  getUserSeedsCount: async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        res.status(400).json({
          success: false,
          error: 'Invalid address',
          timestamp: Date.now()
        });
        return;
      }

      const count = await contractService.getUserSeedsCount(address);

      res.json({
        success: true,
        count,
        owner: address,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching user seeds count:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user seeds count',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get all snapshots created by a user
   * GET /api/users/:address/snapshots
   */
  getUserSnapshots: async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        res.status(400).json({
          success: false,
          error: 'Invalid address',
          timestamp: Date.now()
        });
        return;
      }

      const snapshotIds = await contractService.getUserSnapshotIds(address);
      
      const snapshots = [];
      const baseUrl = process.env.NEXT_PUBLIC_SNAPSHOT_IMAGE_BASE_URL || 'https://d17wy07434ngk.cloudfront.net';
      
      for (const snapshotId of snapshotIds) {
        const data = await contractService.getSnapshotData(snapshotId);
        if (data) {
          // Fetch real image URL from contract
          const imageUrl = await contractService.getSnapshotImageUrl(snapshotId);
          
          // Generate fallback image URL
          const generatedImageUrl = generateSnapshotImageUrl(baseUrl, data.seedId, snapshotId, data.processId);
          
          snapshots.push({
            id: snapshotId,
            ...data,
            valueEth: weiToEthExact(data.value),
            imageUrl: imageUrl || generatedImageUrl
          });
        }
      }

      res.json({
        success: true,
        snapshots,
        count: snapshots.length,
        creator: address,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching user snapshots:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user snapshots',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get count of snapshots created by a user
   * GET /api/users/:address/snapshots/count
   */
  getUserSnapshotsCount: async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        res.status(400).json({
          success: false,
          error: 'Invalid address',
          timestamp: Date.now()
        });
        return;
      }

      const snapshotIds = await contractService.getUserSnapshotIds(address);

      res.json({
        success: true,
        count: snapshotIds.length,
        creator: address,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching user snapshots count:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user snapshots count',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get detailed snapshot data for a user
   * GET /api/users/:address/snapshots/data
   */
  getUserSnapshotData: async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        res.status(400).json({
          success: false,
          error: 'Invalid address',
          timestamp: Date.now()
        });
        return;
      }

      const snapshotData = await contractService.getUserSnapshotData(address);

      res.json({
        success: true,
        snapshots: snapshotData,
        count: snapshotData.length,
        creator: address,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching user snapshot data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user snapshot data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get user's balance in the Aave pool
   * GET /api/users/:address/balance
   */
  getUserBalance: async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        res.status(400).json({
          success: false,
          error: 'Invalid address',
          timestamp: Date.now()
        });
        return;
      }

      const balance = await contractService.getUserPoolBalance(address);

      res.json({
        success: true,
        balance: weiToEthExact(balance),
        balanceWei: balance,
        user: address,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching user balance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user balance',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get comprehensive user stats
   * GET /api/users/:address/stats
   */
  getUserStats: async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        res.status(400).json({
          success: false,
          error: 'Invalid address',
          timestamp: Date.now()
        });
        return;
      }

      // Get all user data
      const seedIds = await contractService.getUserSeeds(address);
      const snapshotIds = await contractService.getUserSnapshotIds(address);
      const poolBalance = await contractService.getUserPoolBalance(address);
      const seedNFTBalance = await contractService.getUserSeedNFTBalance(address);
      const snapshotNFTBalance = await contractService.getUserSnapshotNFTBalance(address);

      res.json({
        success: true,
        stats: {
          totalSeeds: seedIds.length,
          totalSnapshots: snapshotIds.length,
          poolBalance: weiToEthExact(poolBalance),
          seedNFTBalance: Number(seedNFTBalance),
          snapshotNFTBalance: Number(snapshotNFTBalance)
        },
        user: address,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user stats',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Get comprehensive user portfolio
   * GET /api/users/:address/portfolio
   */
  getUserPortfolio: async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address || !address.startsWith('0x')) {
        res.status(400).json({
          success: false,
          error: 'Invalid address',
          timestamp: Date.now()
        });
        return;
      }

      // Get user seeds with full details
      const seedIds = await contractService.getUserSeeds(address);
      const seeds = [];
      let totalDeposited = 0;

      for (const seedId of seedIds) {
        const seedData = await contractService.getSeedData(seedId);
        if (seedData) {
          const seed = await seedTransformService.transformContractDataToSeed(seedData);
          seeds.push(seed);
          totalDeposited += Number(seedData.depositAmount || 0);
        }
      }

      // Get user snapshots
      const snapshotIds = await contractService.getUserSnapshotIds(address);
      const snapshots = [];
      let totalSnapshotValue = 0;
      const baseUrl = process.env.NEXT_PUBLIC_SNAPSHOT_IMAGE_BASE_URL || 'https://d17wy07434ngk.cloudfront.net';

      for (const snapshotId of snapshotIds) {
        const snapshotData = await contractService.getSnapshotData(snapshotId);
        if (snapshotData) {
          // Fetch real image URL from contract
          const imageUrl = await contractService.getSnapshotImageUrl(snapshotId);
          
          // Generate fallback image URL
          const generatedImageUrl = generateSnapshotImageUrl(baseUrl, snapshotData.seedId, snapshotId, snapshotData.processId);
          
          snapshots.push({
            id: snapshotId,
            ...snapshotData,
            valueEth: weiToEthExact(snapshotData.value),
            imageUrl: imageUrl || generatedImageUrl
          });
          totalSnapshotValue += snapshotData.value;
        }
      }

      // Get pool balance
      const poolBalance = await contractService.getUserPoolBalance(address);

      res.json({
        success: true,
        portfolio: {
          seeds,
          snapshots,
          summary: {
            totalSeeds: seeds.length,
            totalSnapshots: snapshots.length,
            totalDeposited: weiToEthExact(totalDeposited),
            totalSnapshotValue: weiToEthExact(totalSnapshotValue),
            poolBalance: weiToEthExact(poolBalance)
          }
        },
        user: address,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user portfolio',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }
};

