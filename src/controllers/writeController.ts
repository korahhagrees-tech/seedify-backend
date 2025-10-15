import { Request, Response } from 'express';
import { contractService } from '../services/contractService';
import { contractConfig } from '../config/contract';

export const writeController = {
  /**
   * Create a new seed
   * POST /api/write/seeds/create
   */
  createSeed: async (req: Request, res: Response): Promise<void> => {
    try {
      const { snapshotPrice, location } = req.body;

      if (!snapshotPrice || !location) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'snapshotPrice and location are required',
          timestamp: Date.now()
        });
        return;
      }

      // Validate snapshotPrice is a valid number
      const priceInWei = Math.floor(parseFloat(snapshotPrice) * Math.pow(10, 18));
      if (isNaN(priceInWei) || priceInWei <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid snapshotPrice',
          message: 'snapshotPrice must be a positive number',
          timestamp: Date.now()
        });
        return;
      }

      // Return transaction data for frontend to execute
      res.json({
        success: true,
        data: {
          contractAddress: contractService.getContractAddress(),
          functionName: 'createSeed',
          args: [priceInWei, location],
          value: '0', // Will be set by frontend based on seed price
          description: 'Create a new seed with specified snapshot price and location'
        },
        message: 'Transaction data prepared. Frontend should execute the transaction.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error preparing createSeed transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prepare createSeed transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Deposit ETH to a seed
   * POST /api/write/seeds/:id/deposit
   */
  depositToSeed: async (req: Request, res: Response): Promise<void> => {
    try {
      const seedId = Number(req.params.id);
      const { amount } = req.body;

      if (!Number.isFinite(seedId) || seedId < 1) {
        res.status(400).json({
          success: false,
          error: 'Invalid seedId',
          message: 'seedId must be a positive integer',
          timestamp: Date.now()
        });
        return;
      }

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount',
          message: 'amount must be a positive number',
          timestamp: Date.now()
        });
        return;
      }

      const amountInWei = Math.floor(parseFloat(amount) * Math.pow(10, 18));

      res.json({
        success: true,
        data: {
          contractAddress: contractService.getContractAddress(),
          functionName: 'depositForSeed',
          args: [seedId],
          value: amountInWei.toString(),
          description: `Deposit ${amount} ETH to seed ${seedId}`
        },
        message: 'Transaction data prepared. Frontend should execute the transaction.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error preparing deposit transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prepare deposit transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Withdraw from a seed
   * POST /api/write/seeds/:id/withdraw
   */
  withdrawFromSeed: async (req: Request, res: Response): Promise<void> => {
    try {
      const seedId = Number(req.params.id);
      const { amount } = req.body; // Optional, withdraw all if not specified

      if (!Number.isFinite(seedId) || seedId < 1) {
        res.status(400).json({
          success: false,
          error: 'Invalid seedId',
          message: 'seedId must be a positive integer',
          timestamp: Date.now()
        });
        return;
      }

      let amountInWei = '0';
      if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
        amountInWei = Math.floor(parseFloat(amount) * Math.pow(10, 18)).toString();
      }

      res.json({
        success: true,
        data: {
          contractAddress: contractService.getContractAddress(),
          functionName: amount ? 'withdrawSeedDeposit' : 'withdrawSeedDeposit',
          args: amount ? [seedId, amountInWei] : [seedId],
          value: '0',
          description: amount ? `Withdraw ${amount} ETH from seed ${seedId}` : `Withdraw all from seed ${seedId}`
        },
        message: 'Transaction data prepared. Frontend should execute the transaction.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error preparing withdraw transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prepare withdraw transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Claim seed profits
   * POST /api/write/seeds/:id/claim-profits
   */
  claimSeedProfits: async (req: Request, res: Response): Promise<void> => {
    try {
      const seedId = Number(req.params.id);

      if (!Number.isFinite(seedId) || seedId < 1) {
        res.status(400).json({
          success: false,
          error: 'Invalid seedId',
          message: 'seedId must be a positive integer',
          timestamp: Date.now()
        });
        return;
      }

      res.json({
        success: true,
        data: {
          contractAddress: contractService.getContractAddress(),
          functionName: 'claimSeedProfits',
          args: [seedId],
          value: '0',
          description: `Claim profits for seed ${seedId}`
        },
        message: 'Transaction data prepared. Frontend should execute the transaction.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error preparing claim profits transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prepare claim profits transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Prepare mint snapshot transaction data
   * GET /api/write/snapshots/mint/:seedId?beneficiaryIndex=0
   */
  prepareMintSnapshot: async (req: Request, res: Response): Promise<void> => {
    try {
      const seedId = Number(req.params.seedId);
      const beneficiaryIndex = req.query.beneficiaryIndex ? Number(req.query.beneficiaryIndex) : undefined;
      
      if (!Number.isFinite(seedId) || seedId < 1) {
        res.status(400).json({
          success: false,
          error: 'Invalid seedId',
          message: 'seedId must be a positive integer',
          timestamp: Date.now()
        });
        return;
      }

      if (beneficiaryIndex !== undefined && (!Number.isFinite(beneficiaryIndex) || beneficiaryIndex < 0)) {
        res.status(400).json({
          success: false,
          error: 'Invalid beneficiaryIndex',
          message: 'beneficiaryIndex must be a non-negative integer',
          timestamp: Date.now()
        });
        return;
      }

      // Get seed data from contract to retrieve snapshot price
      const seedData = await contractService.getSeedData(seedId);
      
      if (!seedData) {
        res.status(404).json({
          success: false,
          error: 'Seed not found',
          message: `Seed ${seedId} does not exist`,
          timestamp: Date.now()
        });
        return;
      }

      // Get snapshot price from seed data (already in ETH format from contract service)
      const snapshotPriceEth = seedData.snapshotPrice || '0';
      const snapshotPriceWei = Math.floor(parseFloat(snapshotPriceEth) * Math.pow(10, 18));

      // Get contract addresses
      const snapFactoryAddress = contractService.getSnapFactoryContractAddress();
      const royaltyRecipient = contractConfig.royaltyRecipient;

      // Get seed owner (this will be used by frontend for comparison)
      const seedOwner = seedData.owner;

      // Generate unique processId on the backend
      const processId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      // Get current block number
      const currentBlockNumber = await contractService.getCurrentBlockNumber();

      // Get all snapshots for this seed to calculate distribution
      const seedSnapshots = await contractService.getSeedSnapshots(seedId);
      
      // Calculate next positionInSeed (this is what the image generator expects as "snapshotId")
      const nextPositionInSeed = seedSnapshots.length + 1;

      // Prepare response data
      const responseData: any = {
        contractAddress: snapFactoryAddress,
        functionName: 'mintSnapshot',
        args: {
          seedId: seedId,
          royaltyRecipient: royaltyRecipient
        },
        value: snapshotPriceWei.toString(),
        valueEth: snapshotPriceEth,
        description: `Mint snapshot for seed ${seedId}`,
        seedOwner: seedOwner,
        processId: processId,
        snapshotId: nextPositionInSeed,  // This is positionInSeed, NOT global snapshot ID
        blockNumber: currentBlockNumber
      };

      // If beneficiaryIndex is provided, include beneficiary-specific data
      if (beneficiaryIndex !== undefined) {
        // Get beneficiary data
        const beneficiaryData = await contractService.getBeneficiaryData(beneficiaryIndex);
        
        if (!beneficiaryData) {
          res.status(404).json({
            success: false,
            error: 'Beneficiary not found',
            message: `Beneficiary at index ${beneficiaryIndex} does not exist`,
            timestamp: Date.now()
          });
          return;
        }

        // Calculate distribution percentage
        // Get all snapshots data for this seed
        const snapshotDataPromises = seedSnapshots.map(id => contractService.getSnapshotData(id));
        const snapshotsData = await Promise.all(snapshotDataPromises);
        
        // Count how many belong to this beneficiary
        const beneficiarySnapshotCount = snapshotsData.filter(
          snapshot => snapshot && snapshot.beneficiaryIndex === beneficiaryIndex
        ).length;

        const totalSnapshots = seedSnapshots.length;
        const distributionPercentage = totalSnapshots > 0 
          ? Number((((beneficiarySnapshotCount + 1) / (totalSnapshots + 1)) * 100).toFixed(2))
          : 100;

        responseData.args.beneficiaryIndex = beneficiaryIndex;
        responseData.beneficiaryCode = beneficiaryData.code;
        responseData.beneficiaryDistribution = distributionPercentage;
        
        // Note: snapshotId in response represents the next snapshot's positionInSeed
        // Frontend should send this value as "snapshotId" in the webhook (not a separate id field)
      }

      res.json({
        success: true,
        data: responseData,
        message: 'Transaction data prepared. Frontend should execute the transaction with these exact values.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error preparing mint snapshot transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prepare mint snapshot transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Handle snapshot minted webhook (triggers image generation)
   * POST /api/snapshot-minted
   * Note: snapshotId in the request body should contain the positionInSeed value
   */
  snapshotMinted: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        contractAddress, 
        seedId, 
        snapshotId,  // This is actually positionInSeed value
        beneficiaryCode, 
        beneficiaryDistribution, 
        creator, 
        txHash, 
        timestamp, 
        blockNumber, 
        processId 
      } = req.body;

      // Validate required fields
      if (!contractAddress || !seedId || !snapshotId || !beneficiaryCode || 
          beneficiaryDistribution === undefined || !creator || !txHash || 
          !timestamp || !blockNumber || !processId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'All fields are required: contractAddress, seedId, snapshotId (positionInSeed), beneficiaryCode, beneficiaryDistribution, creator, txHash, timestamp, blockNumber, processId',
          timestamp: Date.now()
        });
        return;
      }

      // Forward the request to the external image generation service
      const imageServiceUrl = `${contractConfig.imageGenerationServiceUrl}/api/snapshot-minted`;
      
      console.log('Forwarding snapshot-minted webhook to image generation service:', imageServiceUrl);
      console.log('Payload (snapshotId = positionInSeed):', {
        contractAddress,
        seedId,
        snapshotId,  // positionInSeed value
        beneficiaryCode,
        beneficiaryDistribution,
        creator,
        txHash,
        timestamp,
        blockNumber,
        processId
      });

      const response = await fetch(imageServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractAddress,
          seedId: Number(seedId),
          snapshotId: Number(snapshotId),  // positionInSeed value (NOT the actual snapshot ID)
          beneficiaryCode,
          beneficiaryDistribution: Number(beneficiaryDistribution),
          creator,
          txHash,
          timestamp: Number(timestamp),
          blockNumber: Number(blockNumber),
          processId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image generation service error:', errorText);
        res.status(response.status).json({
          success: false,
          error: 'Image generation service error',
          message: errorText,
          timestamp: Date.now()
        });
        return;
      }

      const result = await response.json();
      console.log('Image generation service response:', result);

      res.json({
        success: true,
        message: 'Snapshot minted webhook processed successfully',
        data: result,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error processing snapshot-minted webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process snapshot-minted webhook',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Add beneficiary (Admin only)
   * POST /api/write/admin/beneficiaries
   */
  addBeneficiary: async (req: Request, res: Response): Promise<void> => {
    try {
      const { beneficiaryAddr, name, code, allocatedAmount } = req.body;

      if (!beneficiaryAddr || !name || !code) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'beneficiaryAddr, name, and code are required',
          timestamp: Date.now()
        });
        return;
      }

      const amountInWei = allocatedAmount ? Math.floor(parseFloat(allocatedAmount) * Math.pow(10, 18)) : 0;

      res.json({
        success: true,
        data: {
          contractAddress: contractService.getDistributorContractAddress(),
          functionName: 'addBeneficiary',
          args: [beneficiaryAddr, name, code, amountInWei],
          value: '0',
          description: `Add beneficiary ${name} (${code})`
        },
        message: 'Transaction data prepared. Frontend should execute the transaction.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error preparing add beneficiary transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prepare add beneficiary transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Deactivate beneficiary (Admin only)
   * POST /api/write/admin/beneficiaries/:id/deactivate
   */
  deactivateBeneficiary: async (req: Request, res: Response): Promise<void> => {
    try {
      const beneficiaryIndex = Number(req.params.id);

      if (!Number.isFinite(beneficiaryIndex) || beneficiaryIndex < 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid beneficiaryIndex',
          message: 'beneficiaryIndex must be a non-negative integer',
          timestamp: Date.now()
        });
        return;
      }

      res.json({
        success: true,
        data: {
          contractAddress: contractService.getDistributorContractAddress(),
          functionName: 'deactivateBeneficiary',
          args: [beneficiaryIndex],
          value: '0',
          description: `Deactivate beneficiary at index ${beneficiaryIndex}`
        },
        message: 'Transaction data prepared. Frontend should execute the transaction.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error preparing deactivate beneficiary transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prepare deactivate beneficiary transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Reactivate beneficiary (Admin only)
   * POST /api/write/admin/beneficiaries/:id/reactivate
   */
  reactivateBeneficiary: async (req: Request, res: Response): Promise<void> => {
    try {
      const beneficiaryIndex = Number(req.params.id);

      if (!Number.isFinite(beneficiaryIndex) || beneficiaryIndex < 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid beneficiaryIndex',
          message: 'beneficiaryIndex must be a non-negative integer',
          timestamp: Date.now()
        });
        return;
      }

      res.json({
        success: true,
        data: {
          contractAddress: contractService.getDistributorContractAddress(),
          functionName: 'reactivateBeneficiary',
          args: [beneficiaryIndex],
          value: '0',
          description: `Reactivate beneficiary at index ${beneficiaryIndex}`
        },
        message: 'Transaction data prepared. Frontend should execute the transaction.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error preparing reactivate beneficiary transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prepare reactivate beneficiary transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  },

  /**
   * Distribute interest (Admin only)
   * POST /api/write/admin/distribute-interest
   */
  distributeInterest: async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({
        success: true,
        data: {
          contractAddress: contractService.getDistributorContractAddress(),
          functionName: 'distributeInterest',
          args: [],
          value: '0',
          description: 'Distribute accumulated interest to beneficiaries'
        },
        message: 'Transaction data prepared. Frontend should execute the transaction.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error preparing distribute interest transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to prepare distribute interest transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }
};
