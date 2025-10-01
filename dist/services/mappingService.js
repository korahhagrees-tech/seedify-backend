"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mappingService = exports.MappingService = void 0;
class MappingService {
    constructor() {
        this.locationMappings = new Map();
        this.initializeMappings();
    }
    static getInstance() {
        if (!MappingService.instance) {
            MappingService.instance = new MappingService();
        }
        return MappingService.instance;
    }
    initializeMappings() {
        // Initialize with comprehensive location mappings
        const mappings = [
            {
                locationCode: 'NYC',
                locationName: 'New York City',
                ecosystemProject: {
                    title: 'NYC Green Initiative',
                    subtitle: 'Urban sustainability and green space development',
                    shortText: 'Scaling urban green spaces and regenerative practices across NYC.',
                    extendedText: 'A multi-year effort to build resilient urban ecosystems with community co-stewardship and measurable ecological benefits.',
                    backgroundImageUrl: '/images/ecosystems/nyc-green.png',
                    seedEmblemUrl: '/images/emblems/nyc.png'
                },
                wayOfFlowersData: {
                    backgroundImageUrl: '/images/wof/nyc.jpg',
                    seedEmblemUrl: '/images/emblems/nyc.png',
                    firstText: 'Evolving through',
                    secondText: 'urban regeneration...',
                    thirdText: 'Grown by community stewardship.',
                    mainQuote: 'Cities can flourish when people and nature co-create.',
                    author: 'Way of Flowers'
                }
            },
            {
                locationCode: 'TOKYO',
                locationName: 'Tokyo',
                ecosystemProject: {
                    title: 'Tokyo Urban Gardens',
                    subtitle: 'Innovative urban farming in Tokyo',
                    shortText: 'Community-led gardens integrating tradition with modern urban life.',
                    extendedText: 'From rooftops to pocket parks, citizens are transforming Tokyo into a living mosaic of biodiversity and care.',
                    backgroundImageUrl: '/images/ecosystems/tokyo-urban.png',
                    seedEmblemUrl: '/images/emblems/tokyo.png'
                },
                wayOfFlowersData: {
                    backgroundImageUrl: '/images/wof/tokyo.jpg',
                    seedEmblemUrl: '/images/emblems/tokyo.png',
                    firstText: 'Growing through',
                    secondText: 'seasonal rhythms...',
                    thirdText: 'Cultivated by community wisdom.',
                    mainQuote: 'Care is the form of time plants teach.',
                    author: 'Way of Flowers'
                }
            },
            {
                locationCode: 'LONDON',
                locationName: 'London',
                ecosystemProject: {
                    title: 'London Royal Gardens Initiative',
                    subtitle: 'Heritage garden preservation in London',
                    shortText: 'Community green spaces rooted in longstanding horticultural practice.',
                    extendedText: 'Stewardship of public gardens and microhabitats across London fosters biodiversity and cultural continuity.',
                    backgroundImageUrl: '/images/ecosystems/london-royal.png',
                    seedEmblemUrl: '/images/emblems/london.png'
                },
                wayOfFlowersData: {
                    backgroundImageUrl: '/images/wof/london.jpg',
                    seedEmblemUrl: '/images/emblems/london.png',
                    firstText: 'Listening to',
                    secondText: 'garden heritage...',
                    thirdText: 'Renewed by collective tending.',
                    mainQuote: 'Tradition is a living ecology of care.',
                    author: 'Way of Flowers'
                }
            },
            {
                locationCode: 'SINGAPORE',
                locationName: 'Singapore',
                ecosystemProject: {
                    title: 'Singapore Garden City Project',
                    subtitle: 'Tropical urban gardening and vertical farming',
                    shortText: 'Year-round cultivation across a city designed as a garden.',
                    extendedText: 'Singapore blends public policy and civic imagination to embed living systems into architecture and streetscapes.',
                    backgroundImageUrl: '/images/ecosystems/singapore-garden.png',
                    seedEmblemUrl: '/images/emblems/singapore.png'
                },
                wayOfFlowersData: {
                    backgroundImageUrl: '/images/wof/singapore.jpg',
                    seedEmblemUrl: '/images/emblems/singapore.png',
                    firstText: 'Breathing with',
                    secondText: 'tropical rhythms...',
                    thirdText: 'Designed for continuous flourishing.',
                    mainQuote: 'Tropics teach continuity of care.',
                    author: 'Way of Flowers'
                }
            },
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
                    firstText: 'Practicing',
                    secondText: 'urban ecology...',
                    thirdText: 'Rooted in community repair.',
                    mainQuote: 'Sustainability is a choreography of many hands.',
                    author: 'Way of Flowers'
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
    getEcosystemProjectByLocation(locationCode) {
        const mapping = this.locationMappings.get(locationCode.toUpperCase());
        return mapping ? mapping.ecosystemProject : null;
    }
    /**
     * Get way of flowers data by location code
     */
    getWayOfFlowersDataByLocation(locationCode) {
        const mapping = this.locationMappings.get(locationCode.toUpperCase());
        return mapping ? mapping.wayOfFlowersData : null;
    }
    /**
     * Get complete location mapping
     */
    getLocationMapping(locationCode) {
        return this.locationMappings.get(locationCode.toUpperCase()) || null;
    }
    /**
     * Get all available locations
     */
    getAllLocations() {
        return Array.from(this.locationMappings.values());
    }
    /**
     * Get location by name (case insensitive)
     */
    getLocationByName(locationName) {
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
    updateEcosystemStats(_locationCode, _stats) {
        // No-op for now: EcosystemProject type no longer carries stats in the type system
    }
    /**
     * Add new location mapping
     */
    addLocationMapping(mapping) {
        this.locationMappings.set(mapping.locationCode.toUpperCase(), mapping);
    }
    /**
     * Check if location exists
     */
    hasLocation(locationCode) {
        return this.locationMappings.has(locationCode.toUpperCase());
    }
}
exports.MappingService = MappingService;
// Export singleton instance
exports.mappingService = MappingService.getInstance();
