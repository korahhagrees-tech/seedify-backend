import { Seed, SeedSummary, Location, EcosystemProject, WayOfFlowersData, SeedMetadata } from '../types/seed';

export class MockDataService {
  private static instance: MockDataService;
  private seeds: Seed[] = [];

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  private initializeMockData(): void {
    // Mock locations
    const mockLocations: Location[] = [
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
    const mockEcosystemProjects: EcosystemProject[] = [
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
    const mockWayOfFlowersData: WayOfFlowersData = {
      backgroundImageUrl: '/images/way-of-flowers-bg.jpg',
      seedEmblemUrl: '/images/way-of-flowers-emblem.png',
      firstText: 'Welcome to the Way of Flowers',
      secondText: 'Where digital seeds bloom into beautiful possibilities',
      thirdText: 'Join our ecosystem and watch your investments grow',
      mainQuote: 'Every seed planted today becomes the forest of tomorrow',
      author: 'Digital Garden Master'
    };

    // Generate mock seeds
    for (let i = 1; i <= 5; i++) {
      const seed: Seed = {
        id: i.toString(),
        label: `Seed #${i}`,
        name: `Digital Flower ${i}`,
        description: `A beautiful digital flower that represents growth and prosperity. This seed was planted in the digital garden and has been growing steadily.`,
        seedImageUrl: `/images/seeds/seed-${i}.png`,
        latestSnapshotUrl: i % 2 === 0 ? `/images/snapshots/snapshot-${i}-latest.png` : null,
        snapshotCount: Math.floor(Math.random() * 10) + 1,
        owner: `0x${Math.random().toString(16).substr(2, 40)}`,
        depositAmount: (Math.random() * 10 + 0.1).toFixed(4),
        snapshotPrice: (Math.random() * 0.01 + 0.001).toFixed(6),
        isWithdrawn: Math.random() > 0.8,
        isLive: Math.random() > 0.2,
        metadata: {
          exists: true,
          attributes: [
            { trait_type: 'Type', value: 'Seed' },
            { trait_type: 'Generation', value: Math.floor(Math.random() * 5) + 1 },
            { trait_type: 'Rarity', value: Math.random() > 0.7 ? 'Rare' : 'Common' },
            { trait_type: 'Location', value: mockLocations[i % mockLocations.length].name },
            { trait_type: 'Created', value: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        },
        // For summaries route, these heavy arrays are not returned; kept for detail only
        location: mockLocations[i % mockLocations.length].name, // Single location string
        ecosystemProjects: [mockEcosystemProjects[i % mockEcosystemProjects.length]],
        wayOfFlowersData: mockWayOfFlowersData,
        beneficiaries: [
          { code: 'ELGLOBO', name: 'El Globo Habitat Bank', index: 0 },
          { code: 'WALKERS', name: 'Walkers Reserve', index: 1 },
          { code: 'BUENAVISTA', name: 'Buena Vista Heights', index: 2 },
          { code: 'GRGICH', name: 'Grgich Hills Estate', index: 3 }
        ]
      };

      this.seeds.push(seed);
    }
  }

  /**
   * Get all seeds (full data with locations, ecosystem projects, etc.)
   */
  getAllSeeds(): Seed[] {
    return [...this.seeds];
  }

  /**
   * Get all seeds summaries (without locations, ecosystem projects, etc.)
   */
  getAllSeedsSummaries(): SeedSummary[] {
    return this.seeds.map(seed => ({
      id: seed.id,
      label: seed.label,
      name: seed.name,
      description: seed.description,
      seedImageUrl: seed.seedImageUrl,
      latestSnapshotUrl: seed.latestSnapshotUrl,
      snapshotCount: seed.snapshotCount,
      owner: seed.owner,
      depositAmount: seed.depositAmount,
      snapshotPrice: seed.snapshotPrice,
      isWithdrawn: seed.isWithdrawn,
      isLive: seed.isLive,
      metadata: seed.metadata
    }));
  }

  /**
   * Get seed by ID
   */
  getSeedById(id: string): Seed | null {
    return this.seeds.find(seed => seed.id === id) || null;
  }

  /**
   * Add a new seed
   */
  addSeed(seed: Seed): void {
    this.seeds.push(seed);
  }

  /**
   * Update a seed
   */
  updateSeed(id: string, updates: Partial<Seed>): boolean {
    const index = this.seeds.findIndex(seed => seed.id === id);
    if (index !== -1) {
      this.seeds[index] = { ...this.seeds[index], ...updates };
      return true;
    }
    return false;
  }

  /**
   * Delete a seed
   */
  deleteSeed(id: string): boolean {
    const index = this.seeds.findIndex(seed => seed.id === id);
    if (index !== -1) {
      this.seeds.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get seeds count
   */
  getSeedsCount(): number {
    return this.seeds.length;
  }

  /**
   * Reset to initial mock data
   */
  reset(): void {
    this.seeds = [];
    this.initializeMockData();
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();
