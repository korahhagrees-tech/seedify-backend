"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedController = void 0;
const contractService_1 = require("../services/contractService");
const seedTransformService_1 = require("../services/seedTransformService");
const contract_1 = require("../config/contract");
exports.seedController = {
    /**
     * Get all seeds
     * GET /api/seeds
     */
    getAllSeeds: async (req, res) => {
        try {
            // Always use contract data - NO MOCK DATA
            console.log('Fetching seeds from contract');
            const contractData = await contractService_1.contractService.getAllSeedsData();
            if (contractData.length === 0) {
                // Return empty array if no seeds found - NO FALLBACK TO MOCK
                console.log('No seeds found in contract');
                const response = {
                    success: true,
                    seeds: [],
                    timestamp: Date.now()
                };
                res.json(response);
                return;
            }
            const seeds = seedTransformService_1.seedTransformService.transformContractDataToSeedSummaries(contractData);
            const response = {
                success: true,
                seeds,
                timestamp: Date.now()
            };
            res.json(response);
        }
        catch (error) {
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
    getSeedById: async (req, res) => {
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
            const contractData = await contractService_1.contractService.getSeedData(seedId);
            if (!contractData || !contractData.exists) {
                res.status(404).json({
                    success: false,
                    error: 'Seed not found',
                    message: `Seed with ID ${seedId} does not exist`,
                    timestamp: Date.now()
                });
                return;
            }
            const seed = await seedTransformService_1.seedTransformService.transformContractDataToSeed(contractData);
            const response = {
                success: true,
                seed,
                timestamp: Date.now()
            };
            res.json(response);
        }
        catch (error) {
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
    getSeedsCount: async (req, res) => {
        try {
            // Always use contract data - NO MOCK DATA
            const count = await contractService_1.contractService.getTotalSeeds();
            res.json({
                success: true,
                count,
                timestamp: Date.now()
            });
        }
        catch (error) {
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
    getContractInfo: async (req, res) => {
        try {
            const useMockData = contract_1.contractConfig.useMockData;
            res.json({
                success: true,
                data: {
                    usingMockData: useMockData,
                    environment: {
                        USE_MOCK_DATA: process.env.USE_MOCK_DATA,
                        SEED_FACTORY_ADDRESS: process.env.SEED_FACTORY_ADDRESS,
                        RPC_URL: process.env.RPC_URL
                    },
                    contractAddress: contractService_1.contractService.getContractAddress(),
                    provider: 'Base Mainnet'
                },
                timestamp: Date.now()
            });
        }
        catch (error) {
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
