import { Seed, SeedSummary, ContractSeedData, Location, EcosystemProject, WayOfFlowersData, SeedMetadata } from '../types/seed';
import { mappingService } from './mappingService';
import { contractService } from './contractService';

export class SeedTransformService {
  private static instance: SeedTransformService;
  private mockLocations: Location[] = [];
  private mockEcosystemProjects: EcosystemProject[] = [];
  private mockWayOfFlowersData: WayOfFlowersData = {
    backgroundImageUrl: '',
    seedEmblemUrl: '',
    firstText: '',
    secondText: '',
    thirdText: '',
    mainQuote: '',
    author: ''
  };

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): SeedTransformService {
    if (!SeedTransformService.instance) {
      SeedTransformService.instance = new SeedTransformService();
    }
    return SeedTransformService.instance;
  }

  private initializeMockData(): void {
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
  transformContractDataToSeedSummary(contractData: ContractSeedData): SeedSummary {
    const createdDate = new Date(contractData.timestamp * 1000);
    const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days

    // Convert deposit amount from wei to ETH
    const depositAmount = contractData.depositAmount 
      ? (Number(contractData.depositAmount) / Math.pow(10, 18)).toFixed(4)
      : '0.0000';

    // Get location name from mapping service
    const locationMapping = mappingService.getLocationMapping(contractData.location || '');
    const locationName = locationMapping ? locationMapping.locationName : contractData.location || 'Unknown Location';

    return {
      id: contractData.id.toString(),
      label: `Seed #${contractData.id}`,
      name: `Digital Flower ${contractData.id}`,
      description: `A beautiful digital flower planted in ${locationName}. This seed was created on ${createdDate.toLocaleDateString()} and represents growth and prosperity in our ecosystem.`,
      seedImageUrl: `/images/seeds/seed-${contractData.id}.png`,
      latestSnapshotUrl: contractData.snapshotCount && contractData.snapshotCount > 0 ? `/images/snapshots/snapshot-${contractData.id}-latest.png` : null,
      snapshotCount: contractData.snapshotCount || 0,
      owner: contractData.owner,
      depositAmount: depositAmount,
      snapshotPrice: (Math.random() * 0.01 + 0.001).toFixed(6), // Mock data - would need factory contract
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
  transformContractDataToSeed(contractData: ContractSeedData): Seed {
    const createdDate = new Date(contractData.timestamp * 1000);
    const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days

    // Convert deposit amount from wei to ETH
    const depositAmount = contractData.depositAmount 
      ? (Number(contractData.depositAmount) / Math.pow(10, 18)).toFixed(4)
      : '0.0000';

    // Get complete hierarchy from mapping service
    const locationMapping = mappingService.getLocationMapping(contractData.location || '');
    const locationName = locationMapping ? locationMapping.locationName : contractData.location || 'Unknown Location';
    const ecosystemProject = locationMapping ? locationMapping.ecosystemProject : null;
    const wayOfFlowersData = locationMapping ? locationMapping.wayOfFlowersData : null;

    // Create location object
    const location: Location = {
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

    // Create ecosystem projects array (only for this specific location)
    const ecosystemProjects: EcosystemProject[] = ecosystemProject ? [ecosystemProject] : [];

    // Create way of flowers data
    const wayOfFlowers: WayOfFlowersData = wayOfFlowersData || this.mockWayOfFlowersData;

    return {
      id: contractData.id.toString(),
      label: `Seed #${contractData.id}`,
      name: `Digital Flower ${contractData.id}`,
      description: `A beautiful digital flower planted in ${locationName}. This seed was created on ${createdDate.toLocaleDateString()} and represents growth and prosperity in our ecosystem.`,
      seedImageUrl: `/images/seeds/seed-${contractData.id}.png`,
      latestSnapshotUrl: contractData.snapshotCount && contractData.snapshotCount > 0 ? `/images/snapshots/snapshot-${contractData.id}-latest.png` : null,
      snapshotCount: contractData.snapshotCount || 0,
      owner: contractData.owner,
      depositAmount: depositAmount,
      snapshotPrice: (Math.random() * 0.01 + 0.001).toFixed(6), // Mock data - would need factory contract
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
      locations: [location], // Only include the specific location for this seed
      ecosystemProjects: ecosystemProjects, // Only include the ecosystem project for this location
      wayOfFlowersData: wayOfFlowers // Include the way of flowers data for this location
    };
  }

  /**
   * Transform multiple contract data to frontend SeedSummary format (for getAllSeeds)
   */
  transformContractDataToSeedSummaries(contractDataArray: ContractSeedData[]): SeedSummary[] {
    return contractDataArray
      .filter(data => data.exists)
      .map(data => this.transformContractDataToSeedSummary(data));
  }

  /**
   * Transform multiple contract data to frontend Seed format (for getSeedById)
   */
  transformContractDataToSeeds(contractDataArray: ContractSeedData[]): Seed[] {
    return contractDataArray
      .filter(data => data.exists)
      .map(data => this.transformContractDataToSeed(data));
  }

  /**
   * Create a mock seed summary for development/testing (for getAllSeeds)
   */
  createMockSeedSummary(id: number): SeedSummary {
    const contractData: ContractSeedData = {
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
  createMockSeed(id: number): Seed {
    const contractData: ContractSeedData = {
      id,
      owner: `0x${Math.random().toString(16).substr(2, 40)}`,
      location: this.mockLocations[id % this.mockLocations.length].name,
      timestamp: Math.floor(Date.now() / 1000) - Math.random() * 30 * 24 * 60 * 60, // Random time in last 30 days
      blockNumber: 1000000 + id,
      exists: true
    };

    return this.transformContractDataToSeed(contractData);
  }

  /**
   * Get mock locations
   */
  getMockLocations(): Location[] {
    return [...this.mockLocations];
  }

  /**
   * Get mock ecosystem projects
   */
  getMockEcosystemProjects(): EcosystemProject[] {
    return [...this.mockEcosystemProjects];
  }

  /**
   * Get mock Way of Flowers data
   */
  getMockWayOfFlowersData(): WayOfFlowersData {
    return { ...this.mockWayOfFlowersData };
  }
}

// Export singleton instance
export const seedTransformService = SeedTransformService.getInstance();
