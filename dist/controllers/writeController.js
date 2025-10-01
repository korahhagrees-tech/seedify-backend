"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeController = void 0;
const contractService_1 = require("../services/contractService");
exports.writeController = {
    /**
     * Create a new seed
     * POST /api/write/seeds/create
     */
    createSeed: async (req, res) => {
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
                    contractAddress: contractService_1.contractService.getContractAddress(),
                    functionName: 'createSeed',
                    args: [priceInWei, location],
                    value: '0', // Will be set by frontend based on seed price
                    description: 'Create a new seed with specified snapshot price and location'
                },
                message: 'Transaction data prepared. Frontend should execute the transaction.',
                timestamp: Date.now()
            });
        }
        catch (error) {
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
    depositToSeed: async (req, res) => {
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
                    contractAddress: contractService_1.contractService.getContractAddress(),
                    functionName: 'depositForSeed',
                    args: [seedId],
                    value: amountInWei.toString(),
                    description: `Deposit ${amount} ETH to seed ${seedId}`
                },
                message: 'Transaction data prepared. Frontend should execute the transaction.',
                timestamp: Date.now()
            });
        }
        catch (error) {
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
    withdrawFromSeed: async (req, res) => {
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
                    contractAddress: contractService_1.contractService.getContractAddress(),
                    functionName: amount ? 'withdrawSeedDeposit' : 'withdrawSeedDeposit',
                    args: amount ? [seedId, amountInWei] : [seedId],
                    value: '0',
                    description: amount ? `Withdraw ${amount} ETH from seed ${seedId}` : `Withdraw all from seed ${seedId}`
                },
                message: 'Transaction data prepared. Frontend should execute the transaction.',
                timestamp: Date.now()
            });
        }
        catch (error) {
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
    claimSeedProfits: async (req, res) => {
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
                    contractAddress: contractService_1.contractService.getContractAddress(),
                    functionName: 'claimSeedProfits',
                    args: [seedId],
                    value: '0',
                    description: `Claim profits for seed ${seedId}`
                },
                message: 'Transaction data prepared. Frontend should execute the transaction.',
                timestamp: Date.now()
            });
        }
        catch (error) {
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
     * Mint a snapshot
     * POST /api/write/snapshots/mint
     */
    mintSnapshot: async (req, res) => {
        try {
            const { seedId, beneficiaryIndex, processId, value, projectCode } = req.body;
            if (!seedId || !beneficiaryIndex || !processId || !value) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required fields',
                    message: 'seedId, beneficiaryIndex, processId, and value are required',
                    timestamp: Date.now()
                });
                return;
            }
            const valueInWei = Math.floor(parseFloat(value) * Math.pow(10, 18));
            if (isNaN(valueInWei) || valueInWei <= 0) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid value',
                    message: 'value must be a positive number',
                    timestamp: Date.now()
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    contractAddress: contractService_1.contractService.getSnapshotContractAddress(),
                    functionName: 'mintSnapshot',
                    args: [seedId, beneficiaryIndex, processId, '0x0000000000000000000000000000000000000000', valueInWei, projectCode || ''],
                    value: valueInWei.toString(),
                    description: `Mint snapshot for seed ${seedId} with beneficiary ${beneficiaryIndex}`
                },
                message: 'Transaction data prepared. Frontend should execute the transaction.',
                timestamp: Date.now()
            });
        }
        catch (error) {
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
     * Add beneficiary (Admin only)
     * POST /api/write/admin/beneficiaries
     */
    addBeneficiary: async (req, res) => {
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
                    contractAddress: contractService_1.contractService.getDistributorContractAddress(),
                    functionName: 'addBeneficiary',
                    args: [beneficiaryAddr, name, code, amountInWei],
                    value: '0',
                    description: `Add beneficiary ${name} (${code})`
                },
                message: 'Transaction data prepared. Frontend should execute the transaction.',
                timestamp: Date.now()
            });
        }
        catch (error) {
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
    deactivateBeneficiary: async (req, res) => {
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
                    contractAddress: contractService_1.contractService.getDistributorContractAddress(),
                    functionName: 'deactivateBeneficiary',
                    args: [beneficiaryIndex],
                    value: '0',
                    description: `Deactivate beneficiary at index ${beneficiaryIndex}`
                },
                message: 'Transaction data prepared. Frontend should execute the transaction.',
                timestamp: Date.now()
            });
        }
        catch (error) {
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
    reactivateBeneficiary: async (req, res) => {
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
                    contractAddress: contractService_1.contractService.getDistributorContractAddress(),
                    functionName: 'reactivateBeneficiary',
                    args: [beneficiaryIndex],
                    value: '0',
                    description: `Reactivate beneficiary at index ${beneficiaryIndex}`
                },
                message: 'Transaction data prepared. Frontend should execute the transaction.',
                timestamp: Date.now()
            });
        }
        catch (error) {
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
    distributeInterest: async (req, res) => {
        try {
            res.json({
                success: true,
                data: {
                    contractAddress: contractService_1.contractService.getDistributorContractAddress(),
                    functionName: 'distributeInterest',
                    args: [],
                    value: '0',
                    description: 'Distribute accumulated interest to beneficiaries'
                },
                message: 'Transaction data prepared. Frontend should execute the transaction.',
                timestamp: Date.now()
            });
        }
        catch (error) {
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
