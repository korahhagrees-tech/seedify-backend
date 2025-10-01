import { EcosystemProject, WayOfFlowersData } from '../types/seed';

export interface EcosystemMapping {
  locationCode: string;
  locationName: string;
  ecosystemProject: EcosystemProject;
  wayOfFlowersData: WayOfFlowersData;
}

export class EcosystemMappingService {
  private static instance: EcosystemMappingService;
  private mappings: Map<string, EcosystemMapping> = new Map();

  private constructor() {
    this.initializeMappings();
  }

  public static getInstance(): EcosystemMappingService {
    if (!EcosystemMappingService.instance) {
      EcosystemMappingService.instance = new EcosystemMappingService();
    }
    return EcosystemMappingService.instance;
  }

  private initializeMappings(): void {
    const mappings: EcosystemMapping[] = [
      {
        locationCode: 'BERLIN',
        locationName: 'Berlin',
        ecosystemProject: {
          title: 'Berlin Urban Farms Collective',
          subtitle: 'Sustainable urban agriculture and networks',
          shortText: 'Community farms and micro-ecologies across Berlin.',
          extendedText: 'Distributed farming experiments cultivate food, knowledge, and solidarity in post-industrial spaces.',
          backgroundImageUrl: '/images/ecosystems/berlin-urban.png',
          seedEmblemUrl: '/images/emblems/berlin.png'
        },
        wayOfFlowersData: {
          backgroundImageUrl: '/images/wof/berlin.jpg',
          seedEmblemUrl: '/images/emblems/berlin.png',
          firstText: 'Evolving through',
          secondText: 'ecosystem nurturing...',
          thirdText: 'Grown by community stewardship.',
          mainQuote: 'Evidence for the non-metaphorical memory of light residing in plant leaves...',
          author: 'Michael Marder'
        }
      },
      {
        locationCode: 'NYC',
        locationName: 'New York City',
        ecosystemProject: {
          title: 'NYC Green Initiative',
          subtitle: 'Urban sustainability and green space development in New York City',
          shortText: 'Urban sustainability and green space development in New York City',
          extendedText: 'Urban sustainability and green space development in New York City',
          backgroundImageUrl: '/images/ecosystems/nyc-green.png',
          seedEmblemUrl: '/images/ecosystems/nyc-green.png'
        },
        wayOfFlowersData: {
          backgroundImageUrl: '/images/way-of-flowers/nyc-spring-bloom.png',
          seedEmblemUrl: '/images/way-of-flowers/nyc-spring-bloom-emblem.png',
          firstText: 'Evolving through',
          secondText: 'ecosystem nurturing...',
          thirdText: 'Grown by community stewardship.',
          mainQuote: 'Evidence for the non-metaphorical memory of light residing in plant leaves...',
          author: 'Michael Marder'
        }
      },
      {
        locationCode: 'TOKYO',
        locationName: 'Tokyo',
        ecosystemProject: {
          title: 'Tokyo Vertical Gardens',
          subtitle: 'High-rise urban farming and vertical agriculture',
          shortText: 'Innovative vertical farming solutions in Tokyo\'s dense urban environment.',
          extendedText: 'Pioneering vertical farming techniques that maximize space efficiency while promoting sustainable urban agriculture in one of the world\'s most densely populated cities.',
          backgroundImageUrl: '/images/ecosystems/tokyo-vertical.png',
          seedEmblemUrl: '/images/emblems/tokyo.png'
        },
        wayOfFlowersData: {
          backgroundImageUrl: '/images/wof/tokyo.jpg',
          seedEmblemUrl: '/images/emblems/tokyo.png',
          firstText: 'Growing through',
          secondText: 'urban transformation...',
          thirdText: 'Cultivated by community wisdom.',
          mainQuote: 'The garden suggests there might be a place where we can meet nature halfway...',
          author: 'Michael Pollan'
        }
      },
      {
        locationCode: 'LONDON',
        locationName: 'London',
        ecosystemProject: {
          title: 'London Community Gardens',
          subtitle: 'Community-driven urban agriculture and green spaces',
          shortText: 'Community gardens transforming London\'s urban landscape.',
          extendedText: 'Grassroots initiatives creating green oases in London, fostering community connections and sustainable food production.',
          backgroundImageUrl: '/images/ecosystems/london-community.png',
          seedEmblemUrl: '/images/emblems/london.png'
        },
        wayOfFlowersData: {
          backgroundImageUrl: '/images/wof/london.jpg',
          seedEmblemUrl: '/images/emblems/london.png',
          firstText: 'Flourishing through',
          secondText: 'community connection...',
          thirdText: 'Nurtured by shared purpose.',
          mainQuote: 'In every walk with nature, one receives far more than they seek...',
          author: 'John Muir'
        }
      },
      {
        locationCode: 'SINGAPORE',
        locationName: 'Singapore',
        ecosystemProject: {
          title: 'Singapore Smart Gardens',
          subtitle: 'Technology-integrated urban farming and smart agriculture',
          shortText: 'Smart technology meets urban farming in Singapore\'s innovative gardens.',
          extendedText: 'Cutting-edge smart farming technologies integrated with urban planning to create sustainable, efficient, and beautiful green spaces.',
          backgroundImageUrl: '/images/ecosystems/singapore-smart.png',
          seedEmblemUrl: '/images/emblems/singapore.png'
        },
        wayOfFlowersData: {
          backgroundImageUrl: '/images/wof/singapore.jpg',
          seedEmblemUrl: '/images/emblems/singapore.png',
          firstText: 'Innovating through',
          secondText: 'smart cultivation...',
          thirdText: 'Enhanced by technology and care.',
          mainQuote: 'The future of agriculture lies in the integration of technology with nature...',
          author: 'Unknown'
        }
      }
    ];

    mappings.forEach(mapping => {
      this.mappings.set(mapping.locationCode, mapping);
    });
  }

  /**
   * Get ecosystem mapping by location code
   */
  getMapping(locationCode: string): EcosystemMapping | null {
    return this.mappings.get(locationCode.toUpperCase()) || null;
  }

  /**
   * Get ecosystem project by location code
   */
  getEcosystemProject(locationCode: string): EcosystemProject | null {
    const mapping = this.getMapping(locationCode);
    return mapping ? mapping.ecosystemProject : null;
  }

  /**
   * Get way of flowers data by location code
   */
  getWayOfFlowersData(locationCode: string): WayOfFlowersData | null {
    const mapping = this.getMapping(locationCode);
    return mapping ? mapping.wayOfFlowersData : null;
  }

  /**
   * Get all available location codes
   */
  getAllLocationCodes(): string[] {
    return Array.from(this.mappings.keys());
  }

  /**
   * Get all mappings
   */
  getAllMappings(): EcosystemMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * Add or update a mapping
   */
  addMapping(mapping: EcosystemMapping): void {
    this.mappings.set(mapping.locationCode, mapping);
  }

  /**
   * Check if location code exists
   */
  hasLocation(locationCode: string): boolean {
    return this.mappings.has(locationCode.toUpperCase());
  }
}

export const ecosystemMappingService = EcosystemMappingService.getInstance();
