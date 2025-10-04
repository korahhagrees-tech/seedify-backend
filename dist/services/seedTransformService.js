"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTransformService = exports.SeedTransformService = void 0;
const ecosystemMappingService_1 = require("./ecosystemMappingService");
const contractService_1 = require("./contractService");
class SeedTransformService {
    constructor() {
        this.mockLocations = [];
        this.mockEcosystemProjects = [];
        this.mockWayOfFlowersData = {
            backgroundImageUrl: '',
            seedEmblemUrl: '',
            firstText: '',
            secondText: '',
            thirdText: '',
            mainQuote: '',
            author: ''
        };
        this.initializeMockData();
    }
    static getInstance() {
        if (!SeedTransformService.instance) {
            SeedTransformService.instance = new SeedTransformService();
        }
        return SeedTransformService.instance;
    }
    initializeMockData() {
        // Mock locations
        this.mockLocations = [
            {
                id: '1',
                name: 'Digital Garden',
                slug: 'digital-garden',
                image: '/images/locations/digital-garden.jpg',
                position: {
                    top: '20%',
                    left: '30%',
                    width: '200px',
                    height: '150px',
                    transform: 'rotate(5deg)'
                },
                labelPosition: {
                    top: '25%',
                    left: '35%',
                    transform: 'translateX(-50%)'
                }
            },
            {
                id: '2',
                name: 'Virtual Forest',
                slug: 'virtual-forest',
                image: '/images/locations/virtual-forest.jpg',
                position: {
                    top: '60%',
                    left: '70%',
                    width: '180px',
                    height: '140px',
                    transform: 'rotate(-3deg)'
                },
                labelPosition: {
                    top: '65%',
                    left: '75%',
                    transform: 'translateX(-50%)'
                }
            }
        ];
        // Mock ecosystem projects
        this.mockEcosystemProjects = [
            {
                title: 'Flower Power',
                subtitle: 'Sustainable Digital Art',
                shortText: 'Creating beautiful digital flowers that grow and evolve',
                extendedText: 'Our ecosystem focuses on sustainable digital art creation through blockchain technology, ensuring each digital flower has real value and meaning.',
                backgroundImageUrl: '/images/projects/flower-power-bg.jpg',
                seedEmblemUrl: '/images/projects/flower-power-emblem.png'
            },
            {
                title: 'Garden of Dreams',
                subtitle: 'Community-Driven Growth',
                shortText: 'A community where every seed matters',
                extendedText: 'Join our community-driven platform where every digital seed contributes to a larger ecosystem of growth and prosperity.',
                backgroundImageUrl: '/images/projects/garden-dreams-bg.jpg',
                seedEmblemUrl: '/images/projects/garden-dreams-emblem.png'
            }
        ];
        // Mock Way of Flowers data
        this.mockWayOfFlowersData = {
            backgroundImageUrl: '/images/way-of-flowers-bg.jpg',
            seedEmblemUrl: '/images/way-of-flowers-emblem.png',
            firstText: 'Welcome to the Way of Flowers',
            secondText: 'Where digital seeds bloom into beautiful possibilities',
            thirdText: 'Join our ecosystem and watch your investments grow',
            mainQuote: 'Every seed planted today becomes the forest of tomorrow',
            author: 'Digital Garden Master'
        };
    }
    /**
     * Transform contract data to frontend SeedSummary format (for getAllSeeds)
     */
    transformContractDataToSeedSummary(contractData) {
        const createdDate = new Date(contractData.timestamp * 1000);
        const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
        // Convert deposit amount from wei to ETH
        const depositAmount = contractData.depositAmount
            ? (Number(contractData.depositAmount) / Math.pow(10, 18)).toFixed(4)
            : '0.0000';
        // Get location name from ecosystem mapping service or use contract location directly
        const locationMapping = ecosystemMappingService_1.ecosystemMappingService.getMapping(contractData.location || '');
        const locationName = locationMapping ? locationMapping.locationName : contractData.location || 'Unknown Location';
        return {
            id: contractData.id.toString(),
            label: `Seed 00${contractData.id}`,
            name: `Digital Flower ${contractData.id}`,
            description: `A beautiful digital flower planted in ${locationName}. This seed was created on ${createdDate.toLocaleDateString()} and represents growth and prosperity in our ecosystem.`,
            seedImageUrl: contractData.seedImageUrl || `/images/seeds/seed-${contractData.id}.png`,
            latestSnapshotUrl: contractData.latestSnapshotUrl || (contractData.snapshotCount && contractData.snapshotCount > 0 ? `/images/snapshots/snapshot-${contractData.id}-latest.png` : null),
            snapshotCount: contractData.snapshotCount || 0,
            owner: contractData.owner,
            depositAmount: depositAmount,
            snapshotPrice: contractData.snapshotPrice || '0.000000',
            isWithdrawn: contractData.withdrawn || false,
            isLive: isRecent,
            metadata: {
                exists: contractData.exists,
                attributes: [
                    { trait_type: 'Type', value: 'Seed' },
                    { trait_type: 'Token ID', value: contractData.id },
                    { trait_type: 'Location', value: locationName },
                    { trait_type: 'Created', value: createdDate.toISOString() },
                    { trait_type: 'Deposit Amount', value: depositAmount },
                    { trait_type: 'Snapshot Count', value: contractData.snapshotCount || 0 },
                    { trait_type: 'Withdrawn', value: contractData.withdrawn ? 'Yes' : 'No' },
                    { trait_type: 'Owner', value: contractData.owner }
                ]
            }
        };
    }
    /**
     * Transform contract data to frontend Seed format (for getSeedById)
     */
    async transformContractDataToSeed(contractData) {
        const createdDate = new Date(contractData.timestamp * 1000);
        const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
        // Convert deposit amount from wei to ETH
        const depositAmount = contractData.depositAmount
            ? (Number(contractData.depositAmount) / Math.pow(10, 18)).toFixed(4)
            : '0.0000';
        // Beneficiaries: exactly four per seed if possible
        let beneficiaries = [];
        try {
            const refs = await contractService_1.contractService.getSeedBeneficiaries(contractData.id);
            beneficiaries = (refs || []).slice(0, 4);
        }
        catch (_e) {
            beneficiaries = [];
        }
        // Fallback to first 4 known mappings if not provided by contract
        if (beneficiaries.length < 4) {
            const allMappings = ecosystemMappingService_1.ecosystemMappingService.getAllMappings();
            for (let i = 0; i < 4; i++) {
                const m = allMappings[i % allMappings.length];
                if (!beneficiaries.find(b => b.code === m.locationCode)) {
                    beneficiaries.push({ code: m.locationCode, name: m.locationName, index: i });
                }
                if (beneficiaries.length === 4)
                    break;
            }
        }
        // Derive ecosystem projects from beneficiaries (NOT from contract!)
        const ecosystemProjects = beneficiaries
            .map(b => ecosystemMappingService_1.ecosystemMappingService.getMapping(b.code))
            .filter((m) => !!m)
            .map(m => m.ecosystemProject);
        // Way of Flowers data is NOT from contract - return empty object structure for frontend
        const wayOfFlowers = {
            backgroundImageUrl: '',
            seedEmblemUrl: '',
            firstText: '',
            secondText: '',
            thirdText: '',
            mainQuote: '',
            author: ''
        };
        // Location string from contract is informational only; do not expose `locations` in response
        const locationName = ecosystemMappingService_1.ecosystemMappingService.getMapping(contractData.location || '')?.locationName
            || contractData.location || 'Unknown';
        return {
            id: contractData.id.toString(),
            label: `Seed 00${contractData.id}`,
            name: `Digital Flower ${contractData.id}`,
            description: `A beautiful digital flower planted in ${locationName}. This seed was created on ${createdDate.toLocaleDateString()} and represents growth and prosperity in our ecosystem.`,
            seedImageUrl: contractData.seedImageUrl || `/images/seeds/seed-${contractData.id}.png`,
            latestSnapshotUrl: contractData.latestSnapshotUrl || (contractData.snapshotCount && contractData.snapshotCount > 0 ? `/images/snapshots/snapshot-${contractData.id}-latest.png` : null),
            snapshotCount: contractData.snapshotCount || 0,
            owner: contractData.owner,
            depositAmount: depositAmount,
            snapshotPrice: contractData.snapshotPrice || '0.000000',
            isWithdrawn: contractData.withdrawn || false,
            isLive: isRecent,
            metadata: {
                exists: contractData.exists,
                attributes: [
                    { trait_type: 'Type', value: 'Seed' },
                    { trait_type: 'Token ID', value: contractData.id },
                    { trait_type: 'Location', value: locationName },
                    { trait_type: 'Created', value: createdDate.toISOString() },
                    { trait_type: 'Deposit Amount', value: depositAmount },
                    { trait_type: 'Snapshot Count', value: contractData.snapshotCount || 0 },
                    { trait_type: 'Withdrawn', value: contractData.withdrawn ? 'Yes' : 'No' },
                    { trait_type: 'Owner', value: contractData.owner }
                ]
            },
            location: locationName, // Single location string from contract
            ecosystemProjects: ecosystemProjects.length > 0 ? ecosystemProjects : undefined, // Optional: mapped from location
            wayOfFlowersData: wayOfFlowers, // NOT from contract - empty object for frontend to populate
            story: { title: '', author: '', story: '' }, // NOT from contract - empty object for frontend to populate
            beneficiaries
        };
    }
    /**
     * Transform multiple contract data to frontend SeedSummary format (for getAllSeeds)
     */
    transformContractDataToSeedSummaries(contractDataArray) {
        return contractDataArray
            .filter(data => data.exists)
            .map(data => this.transformContractDataToSeedSummary(data));
    }
    /**
     * Transform multiple contract data to frontend Seed format (for getSeedById)
     */
    async transformContractDataToSeeds(contractDataArray) {
        const results = [];
        for (const data of contractDataArray) {
            if (!data.exists)
                continue;
            results.push(await this.transformContractDataToSeed(data));
        }
        return results;
    }
    /**
     * Create a mock seed summary for development/testing (for getAllSeeds)
     */
    createMockSeedSummary(id) {
        const contractData = {
            id,
            owner: `0x${Math.random().toString(16).substr(2, 40)}`,
            location: this.mockLocations[id % this.mockLocations.length].name,
            timestamp: Math.floor(Date.now() / 1000) - Math.random() * 30 * 24 * 60 * 60, // Random time in last 30 days
            blockNumber: 1000000 + id,
            exists: true
        };
        return this.transformContractDataToSeedSummary(contractData);
    }
    /**
     * Create a mock seed for development/testing (for getSeedById)
     */
    createMockSeed(id) {
        const contractData = {
            id,
            owner: `0x${Math.random().toString(16).substr(2, 40)}`,
            location: this.mockLocations[id % this.mockLocations.length].name,
            timestamp: Math.floor(Date.now() / 1000) - Math.random() * 30 * 24 * 60 * 60,
            blockNumber: 1000000 + id,
            exists: true
        };
        const createdDate = new Date(contractData.timestamp * 1000);
        const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
        const depositAmount = contractData.depositAmount
            ? (Number(contractData.depositAmount) / Math.pow(10, 18)).toFixed(4)
            : '0.0000';
        const locationMapping = ecosystemMappingService_1.ecosystemMappingService.getMapping(contractData.location || '');
        const locationName = locationMapping ? locationMapping.locationName : contractData.location || 'Unknown Location';
        const ecosystemProject = locationMapping ? locationMapping.ecosystemProject : null;
        const wayOfFlowersData = locationMapping ? locationMapping.wayOfFlowersData : this.mockWayOfFlowersData;
        const location = {
            id: contractData.location || 'unknown',
            name: locationName,
            slug: (contractData.location || 'unknown').toLowerCase(),
            image: `/images/locations/${contractData.location || 'default'}.jpg`,
            position: {
                top: '50%',
                left: '50%',
                width: '100px',
                height: '100px',
                transform: 'translate(-50%, -50%)'
            },
            labelPosition: {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }
        };
        const ecosystemProjects = ecosystemProject ? [ecosystemProject] : [];
        return {
            id: contractData.id.toString(),
            label: `Seed 00${contractData.id}`,
            name: `Digital Flower ${contractData.id}`,
            description: `A beautiful digital flower planted in ${locationName}. This seed was created on ${createdDate.toLocaleDateString()} and represents growth and prosperity in our ecosystem.`,
            seedImageUrl: contractData.seedImageUrl || `/images/seeds/seed-${contractData.id}.png`,
            latestSnapshotUrl: contractData.latestSnapshotUrl || (contractData.snapshotCount && contractData.snapshotCount > 0 ? `/images/snapshots/snapshot-${contractData.id}-latest.png` : null),
            snapshotCount: contractData.snapshotCount || 0,
            owner: contractData.owner,
            depositAmount: depositAmount,
            snapshotPrice: (Math.random() * 0.01 + 0.001).toFixed(6),
            isWithdrawn: false,
            isLive: isRecent,
            metadata: {
                exists: contractData.exists,
                attributes: [
                    { trait_type: 'Type', value: 'Seed' },
                    { trait_type: 'Token ID', value: contractData.id },
                    { trait_type: 'Location', value: locationName },
                    { trait_type: 'Created', value: createdDate.toISOString() },
                    { trait_type: 'Deposit Amount', value: depositAmount },
                    { trait_type: 'Snapshot Count', value: contractData.snapshotCount || 0 },
                    { trait_type: 'Withdrawn', value: 'No' },
                    { trait_type: 'Owner', value: contractData.owner }
                ]
            },
            location: locationName, // Single location string from contract
            ecosystemProjects: ecosystemProjects,
            wayOfFlowersData: wayOfFlowersData,
            beneficiaries: []
        };
    }
    /**
     * Get mock locations
     */
    getMockLocations() {
        return [...this.mockLocations];
    }
    /**
     * Get mock ecosystem projects
     */
    getMockEcosystemProjects() {
        return [...this.mockEcosystemProjects];
    }
    /**
     * Get mock Way of Flowers data
     */
    getMockWayOfFlowersData() {
        return { ...this.mockWayOfFlowersData };
    }
}
exports.SeedTransformService = SeedTransformService;
// Export singleton instance
exports.seedTransformService = SeedTransformService.getInstance();
