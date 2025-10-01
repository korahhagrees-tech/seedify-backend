"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedController = void 0;
const contractService_1 = require("../services/contractService");
const mockDataService_1 = require("../services/mockDataService");
const seedTransformService_1 = require("../services/seedTransformService");
const contract_1 = require("../config/contract");
exports.seedController = {
    /**
     * Get all seeds
     * GET /api/seeds
     */
    getAllSeeds: async (req, res) => {
        try {
            const useMockData = contract_1.contractConfig.useMockData;
            let seeds;
            if (useMockData) {
                // Use mock data for development
                console.log('Using mock data for seeds');
                seeds = mockDataService_1.mockDataService.getAllSeedsSummaries();
            }
            else {
                // Use real contract data
                console.log('Fetching seeds from contract');
                const contractData = await contractService_1.contractService.getAllSeedsData();
                if (contractData.length === 0) {
                    // Fallback to mock data if no contract data
                    console.log('No contract data found, falling back to mock data');
                    seeds = mockDataService_1.mockDataService.getAllSeedsSummaries();
                }
                else {
                    seeds = seedTransformService_1.seedTransformService.transformContractDataToSeedSummaries(contractData);
                }
            }
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
            const useMockData = contract_1.contractConfig.useMockData;
            let seed;
            if (useMockData) {
                // Use mock data for development
                console.log(`Using mock data for seed ${seedId}`);
                seed = mockDataService_1.mockDataService.getSeedById(id);
                if (!seed) {
                    // Create a mock seed if it doesn't exist
                    seed = seedTransformService_1.seedTransformService.createMockSeed(seedId);
                }
            }
            else {
                // Use real contract data
                console.log(`Fetching seed ${seedId} from contract`);
                const contractData = await contractService_1.contractService.getSeedData(seedId);
                if (!contractData) {
                    // Fallback to mock data if contract data not found
                    console.log(`Seed ${seedId} not found in contract, falling back to mock data`);
                    seed = mockDataService_1.mockDataService.getSeedById(id);
                    if (!seed) {
                        // Create a mock seed if it doesn't exist
                        seed = seedTransformService_1.seedTransformService.createMockSeed(seedId);
                    }
                }
                else {
                    seed = await seedTransformService_1.seedTransformService.transformContractDataToSeed(contractData);
                }
            }
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
            const useMockData = contract_1.contractConfig.useMockData;
            let count;
            if (useMockData) {
                count = mockDataService_1.mockDataService.getSeedsCount();
            }
            else {
                try {
                    count = await contractService_1.contractService.getTotalSeeds();
                    if (count === 0) {
                        // Fallback to mock data count if no contract data
                        console.log('No seeds found in contract, falling back to mock data count');
                        count = mockDataService_1.mockDataService.getSeedsCount();
                    }
                }
                catch (error) {
                    console.error('Error fetching seeds count from contract:', error);
                    console.log('Falling back to mock data count');
                    count = mockDataService_1.mockDataService.getSeedsCount();
                }
            }
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
                    contractAddress: useMockData ? null : contractService_1.contractService.getContractAddress(),
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
