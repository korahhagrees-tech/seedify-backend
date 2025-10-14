import { Request, Response } from 'express';
import { contractService } from '../services/contractService';
import { weiToEthExact, generateSnapshotImageUrl } from '../utils/eth-utils';
import { contractConfig } from '../config/contract';

export const snapshotsController = {
  listBySeed: async (req: Request, res: Response) => {
    try {
      const seedId = Number(req.params.seedId);
      if (!Number.isFinite(seedId) || seedId < 1) {
        res.status(400).json({ success: false, error: 'Invalid seedId', timestamp: Date.now() });
        return;
      }
      
      const snapshotIds = await contractService.getSeedSnapshots(seedId);
      const snapshots = [];
      
      for (const snapshotId of snapshotIds) {
        const data = await contractService.getSnapshotData(snapshotId);
        if (data) {
          // Fetch real image URL from contract
          const imageUrl = await contractService.getSnapshotImageUrl(snapshotId);
          
          // Generate fallback image URL
          const baseUrl = process.env.NEXT_PUBLIC_SNAPSHOT_IMAGE_BASE_URL || 'https://d17wy07434ngk.cloudfront.net';
          const generatedImageUrl = generateSnapshotImageUrl(baseUrl, data.seedId, data.positionInSeed, data.processId);
          
          snapshots.push({
            id: snapshotId,
            ...data,
            valueEth: weiToEthExact(data.value),
            imageUrl: imageUrl || generatedImageUrl
          });
        }
      }
      
      res.json({ success: true, snapshots, count: snapshots.length, timestamp: Date.now() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to list seed snapshots', message: e?.message, timestamp: Date.now() });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const snapshotId = Number(req.params.snapshotId);
      if (!Number.isFinite(snapshotId) || snapshotId < 0) {
        res.status(400).json({ success: false, error: 'Invalid snapshotId', timestamp: Date.now() });
        return;
      }
      
      const data = await contractService.getSnapshotData(snapshotId);
      if (!data) {
        res.status(404).json({ success: false, error: 'Snapshot not found', timestamp: Date.now() });
        return;
      }
      
      // Fetch real image URL from contract
      const imageUrl = await contractService.getSnapshotImageUrl(snapshotId);
      
      // Generate fallback image URL
      const baseUrl = process.env.NEXT_PUBLIC_SNAPSHOT_IMAGE_BASE_URL || 'https://d17wy07434ngk.cloudfront.net';
      const generatedImageUrl = generateSnapshotImageUrl(baseUrl, data.seedId, data.positionInSeed, data.processId);
      
      res.json({ 
        success: true, 
        snapshot: {
          id: snapshotId,
          ...data,
          valueEth: weiToEthExact(data.value),
          imageUrl: imageUrl || generatedImageUrl
        }, 
        timestamp: Date.now() 
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch snapshot', message: e?.message, timestamp: Date.now() });
    }
  },

  listByBeneficiary: async (req: Request, res: Response) => {
    try {
      const index = Number(req.params.index);
      if (!Number.isFinite(index) || index < 0) {
        res.status(400).json({ success: false, error: 'Invalid beneficiary index', timestamp: Date.now() });
        return;
      }
      
      const snapshotIds = await contractService.getBeneficiarySnapshots(index);
      const snapshots = [];
      
      for (const snapshotId of snapshotIds) {
        const data = await contractService.getSnapshotData(snapshotId);
        if (data) {
          // Fetch real image URL from contract
          const imageUrl = await contractService.getSnapshotImageUrl(snapshotId);
          
          // Generate fallback image URL
          const baseUrl = process.env.NEXT_PUBLIC_SNAPSHOT_IMAGE_BASE_URL || 'https://d17wy07434ngk.cloudfront.net';
          const generatedImageUrl = generateSnapshotImageUrl(baseUrl, data.seedId, data.positionInSeed, data.processId);
          
          snapshots.push({
            id: snapshotId,
            ...data,
            valueEth: weiToEthExact(data.value),
            imageUrl: imageUrl || generatedImageUrl
          });
        }
      }
      
      res.json({ success: true, snapshots, count: snapshots.length, timestamp: Date.now() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to list beneficiary snapshots', message: e?.message, timestamp: Date.now() });
    }
  },

  stats: async (_req: Request, res: Response) => {
    try {
      const total = await contractService.getTotalSnapshots();
      const valueRaised = await contractService.getTotalValueRaised();
      
      res.json({ 
        success: true, 
        total, 
        valueRaised, 
        valueRaisedEth: weiToEthExact(valueRaised),
        timestamp: Date.now() 
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch snapshot stats', message: e?.message, timestamp: Date.now() });
    }
  }
};


