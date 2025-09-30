import { EcosystemProject, WayOfFlowersData } from '../types/seed';

export interface LocationMapping {
  locationCode: string;
  locationName: string;
  ecosystemProject: EcosystemProject;
  wayOfFlowersData: WayOfFlowersData;
}

export class MappingService {
  private static instance: MappingService;
  private locationMappings: Map<string, LocationMapping> = new Map();

  private constructor() {
    this.initializeMappings();
  }

  public static getInstance(): MappingService {
    if (!MappingService.instance) {
      MappingService.instance = new MappingService();
    }
    return MappingService.instance;
  }

  private initializeMappings(): void {
    // Initialize with comprehensive location mappings
    const mappings: LocationMapping[] = [
      {
        locationCode: 'NYC',
        locationName: 'New York City',
        ecosystemProject: {
          id: 'nyc-green',
          name: 'NYC Green Initiative',
          description: 'Urban sustainability and green space development in New York City',
          website: 'https://nycgreen.org',
          logoUrl: '/images/ecosystems/nyc-green.png',
          socialMedia: {
            twitter: '@NYCGreen',
            instagram: '@nycgreeninitiative',
            discord: 'nyc-green-community'
          },
          stats: {
            totalSeeds: 0, // Will be updated dynamically
            totalValue: 0, // Will be updated dynamically
            activeProjects: 12,
            communityMembers: 2500
          }
        },
        wayOfFlowersData: {
          id: 'nyc-spring-bloom',
          name: 'NYC Spring Bloom Cycle',
          description: 'Annual flowering schedule for New York City urban gardens',
          bloomSchedule: {
            spring: ['Tulips', 'Daffodils', 'Cherry Blossoms', 'Magnolias'],
            summer: ['Roses', 'Sunflowers', 'Marigolds', 'Zinnias'],
            fall: ['Chrysanthemums', 'Asters', 'Goldenrod', 'Sedum'],
            winter: ['Pansies', 'Winter Jasmine', 'Hellebores', 'Camellias']
          },
          careInstructions: {
            watering: 'Water deeply twice a week during growing season',
            fertilizing: 'Apply organic fertilizer monthly from March to October',
            pruning: 'Prune dead flowers regularly to encourage new blooms',
            soil: 'Use well-draining soil with compost for optimal growth'
          },
          seasonalTips: {
            spring: 'Plant new seeds after last frost, focus on early bloomers',
            summer: 'Provide shade during hottest hours, increase watering frequency',
            fall: 'Harvest seeds for next year, prepare for winter dormancy',
            winter: 'Protect from frost, minimal watering, plan for spring'
          }
        }
      },
      {
        locationCode: 'TOKYO',
        locationName: 'Tokyo',
        ecosystemProject: {
          id: 'tokyo-urban',
          name: 'Tokyo Urban Gardens',
          description: 'Innovative urban farming and community garden initiatives in Tokyo',
          website: 'https://tokyourbangardens.jp',
          logoUrl: '/images/ecosystems/tokyo-urban.png',
          socialMedia: {
            twitter: '@TokyoUrbanGardens',
            instagram: '@tokyourbangardens',
            discord: 'tokyo-urban-community'
          },
          stats: {
            totalSeeds: 0,
            totalValue: 0,
            activeProjects: 8,
            communityMembers: 1800
          }
        },
        wayOfFlowersData: {
          id: 'tokyo-seasonal-cycle',
          name: 'Tokyo Seasonal Flower Cycle',
          description: 'Traditional Japanese gardening principles adapted for urban spaces',
          bloomSchedule: {
            spring: ['Sakura', 'Azaleas', 'Wisteria', 'Peonies'],
            summer: ['Hydrangeas', 'Morning Glories', 'Lotus', 'Sunflowers'],
            fall: ['Chrysanthemums', 'Maple Leaves', 'Cosmos', 'Dahlias'],
            winter: ['Camellias', 'Plum Blossoms', 'Narcissus', 'Cyclamen']
          },
          careInstructions: {
            watering: 'Water early morning or evening, avoid midday heat',
            fertilizing: 'Use traditional Japanese organic methods, monthly application',
            pruning: 'Follow Japanese pruning techniques for natural form',
            soil: 'Well-balanced soil with traditional Japanese amendments'
          },
          seasonalTips: {
            spring: 'Celebrate Hanami season, plant for traditional aesthetics',
            summer: 'Focus on water features and shade-loving plants',
            fall: 'Embrace changing colors, prepare for winter contemplation',
            winter: 'Minimal intervention, focus on structural beauty'
          }
        }
      },
      {
        locationCode: 'LONDON',
        locationName: 'London',
        ecosystemProject: {
          id: 'london-royal-gardens',
          name: 'London Royal Gardens Initiative',
          description: 'Heritage garden preservation and community green space development',
          website: 'https://londonroyalgardens.org.uk',
          logoUrl: '/images/ecosystems/london-royal.png',
          socialMedia: {
            twitter: '@LondonRoyalGardens',
            instagram: '@londonroyalgardens',
            discord: 'london-royal-community'
          },
          stats: {
            totalSeeds: 0,
            totalValue: 0,
            activeProjects: 15,
            communityMembers: 3200
          }
        },
        wayOfFlowersData: {
          id: 'london-heritage-bloom',
          name: 'London Heritage Bloom Cycle',
          description: 'Traditional English garden flowering patterns and seasonal care',
          bloomSchedule: {
            spring: ['Daffodils', 'Tulips', 'Primroses', 'Bluebells'],
            summer: ['Roses', 'Lavender', 'Delphiniums', 'Sweet Peas'],
            fall: ['Asters', 'Chrysanthemums', 'Michaelmas Daisies', 'Sedum'],
            winter: ['Hellebores', 'Winter Pansies', 'Snowdrops', 'Witch Hazel']
          },
          careInstructions: {
            watering: 'Consistent moisture, avoid waterlogging in clay soils',
            fertilizing: 'Traditional English garden fertilizer, bi-weekly in growing season',
            pruning: 'Follow RHS guidelines for optimal plant health',
            soil: 'Rich, well-draining soil with plenty of organic matter'
          },
          seasonalTips: {
            spring: 'Prepare for Chelsea Flower Show season, early planting',
            summer: 'Maintain formal garden structures, regular deadheading',
            fall: 'Harvest for winter arrangements, prepare for dormancy',
            winter: 'Plan next year\'s garden, maintain structure and evergreens'
          }
        }
      },
      {
        locationCode: 'SINGAPORE',
        locationName: 'Singapore',
        ecosystemProject: {
          id: 'singapore-garden-city',
          name: 'Singapore Garden City Project',
          description: 'Tropical urban gardening and vertical farming innovations',
          website: 'https://singaporegardencity.gov.sg',
          logoUrl: '/images/ecosystems/singapore-garden.png',
          socialMedia: {
            twitter: '@SingaporeGardenCity',
            instagram: '@singaporegardencity',
            discord: 'singapore-garden-community'
          },
          stats: {
            totalSeeds: 0,
            totalValue: 0,
            activeProjects: 20,
            communityMembers: 4500
          }
        },
        wayOfFlowersData: {
          id: 'singapore-tropical-cycle',
          name: 'Singapore Tropical Flower Cycle',
          description: 'Year-round tropical flowering patterns for urban environments',
          bloomSchedule: {
            spring: ['Orchids', 'Frangipani', 'Hibiscus', 'Bougainvillea'],
            summer: ['Heliconia', 'Bird of Paradise', 'Ginger', 'Torch Ginger'],
            fall: ['Anthurium', 'Peace Lily', 'Spathiphyllum', 'Caladium'],
            winter: ['Poinsettia', 'Cyclamen', 'Kalanchoe', 'Christmas Cactus']
          },
          careInstructions: {
            watering: 'High humidity environment, mist regularly, well-draining soil',
            fertilizing: 'Tropical plant fertilizer, monthly application year-round',
            pruning: 'Regular pruning to maintain shape in humid conditions',
            soil: 'Well-draining tropical mix with good aeration'
          },
          seasonalTips: {
            spring: 'Take advantage of increased humidity, plant new tropicals',
            summer: 'Provide shade from intense sun, increase air circulation',
            fall: 'Prepare for monsoon season, ensure good drainage',
            winter: 'Maintain humidity levels, protect from temperature drops'
          }
        }
      },
      {
        locationCode: 'BERLIN',
        locationName: 'Berlin',
        ecosystemProject: {
          id: 'berlin-urban-farms',
          name: 'Berlin Urban Farms Collective',
          description: 'Sustainable urban agriculture and community garden networks',
          website: 'https://berlinurbanfarms.de',
          logoUrl: '/images/ecosystems/berlin-urban.png',
          socialMedia: {
            twitter: '@BerlinUrbanFarms',
            instagram: '@berlinurbanfarms',
            discord: 'berlin-urban-community'
          },
          stats: {
            totalSeeds: 0,
            totalValue: 0,
            activeProjects: 18,
            communityMembers: 2800
          }
        },
        wayOfFlowersData: {
          id: 'berlin-sustainable-bloom',
          name: 'Berlin Sustainable Bloom Cycle',
          description: 'Eco-friendly flowering patterns for urban sustainability',
          bloomSchedule: {
            spring: ['Crocus', 'Snowdrops', 'Primroses', 'Forget-me-nots'],
            summer: ['Sunflowers', 'Marigolds', 'Nasturtiums', 'Calendula'],
            fall: ['Asters', 'Goldenrod', 'Echinacea', 'Rudbeckia'],
            winter: ['Winter Aconite', 'Hellebores', 'Witch Hazel', 'Mahonia']
          },
          careInstructions: {
            watering: 'Rainwater collection systems, drought-tolerant varieties',
            fertilizing: 'Compost-based organic fertilizers, minimal chemical use',
            pruning: 'Natural growth patterns, minimal intervention approach',
            soil: 'Rich compost-based soil with focus on sustainability'
          },
          seasonalTips: {
            spring: 'Start seeds indoors, focus on native species',
            summer: 'Water conservation techniques, companion planting',
            fall: 'Seed saving for next year, prepare for winter',
            winter: 'Indoor growing projects, plan for spring sustainability'
          }
        }
      }
    ];

    // Populate the mappings
    mappings.forEach(mapping => {
      this.locationMappings.set(mapping.locationCode, mapping);
    });
  }

  /**
   * Get ecosystem project by location code
   */
  public getEcosystemProjectByLocation(locationCode: string): EcosystemProject | null {
    const mapping = this.locationMappings.get(locationCode.toUpperCase());
    return mapping ? mapping.ecosystemProject : null;
  }

  /**
   * Get way of flowers data by location code
   */
  public getWayOfFlowersDataByLocation(locationCode: string): WayOfFlowersData | null {
    const mapping = this.locationMappings.get(locationCode.toUpperCase());
    return mapping ? mapping.wayOfFlowersData : null;
  }

  /**
   * Get complete location mapping
   */
  public getLocationMapping(locationCode: string): LocationMapping | null {
    return this.locationMappings.get(locationCode.toUpperCase()) || null;
  }

  /**
   * Get all available locations
   */
  public getAllLocations(): LocationMapping[] {
    return Array.from(this.locationMappings.values());
  }

  /**
   * Get location by name (case insensitive)
   */
  public getLocationByName(locationName: string): LocationMapping | null {
    const normalizedName = locationName.toLowerCase();
    for (const mapping of this.locationMappings.values()) {
      if (mapping.locationName.toLowerCase() === normalizedName) {
        return mapping;
      }
    }
    return null;
  }

  /**
   * Update ecosystem project stats dynamically
   */
  public updateEcosystemStats(locationCode: string, stats: Partial<EcosystemProject['stats']>): void {
    const mapping = this.locationMappings.get(locationCode.toUpperCase());
    if (mapping) {
      mapping.ecosystemProject.stats = { ...mapping.ecosystemProject.stats, ...stats };
    }
  }

  /**
   * Add new location mapping
   */
  public addLocationMapping(mapping: LocationMapping): void {
    this.locationMappings.set(mapping.locationCode.toUpperCase(), mapping);
  }

  /**
   * Check if location exists
   */
  public hasLocation(locationCode: string): boolean {
    return this.locationMappings.has(locationCode.toUpperCase());
  }
}

// Export singleton instance
export const mappingService = MappingService.getInstance();
