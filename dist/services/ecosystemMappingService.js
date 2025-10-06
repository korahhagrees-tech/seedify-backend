"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ecosystemMappingService = exports.EcosystemMappingService = void 0;
class EcosystemMappingService {
    constructor() {
        this.mappings = new Map();
        this.initializeMappings();
    }
    static getInstance() {
        if (!EcosystemMappingService.instance) {
            EcosystemMappingService.instance = new EcosystemMappingService();
        }
        return EcosystemMappingService.instance;
    }
    initializeMappings() {
        const mappings = [
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
                    mainQuote: 'Evidence for the non-metaphorical memory of light residing in plant leaves adds insult to the injury suffered by the argument of those who still insist on the exceptionalism of the central nervous system. In other words, when consciousness is wholly embedded in its biochemical substratum, it becomes increasingly indistinguishable from the cellular and molecular processes of other, presumably nonconscious organisms, such as plants.',
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
                    mainQuote: 'Evidence for the non-metaphorical memory of light residing in plant leaves adds insult to the injury suffered by the argument of those who still insist on the exceptionalism of the central nervous system. In other words, when consciousness is wholly embedded in its biochemical substratum, it becomes increasingly indistinguishable from the cellular and molecular processes of other, presumably nonconscious organisms, such as plants.',
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
                    mainQuote: 'Evidence for the non-metaphorical memory of light residing in plant leaves adds insult to the injury suffered by the argument of those who still insist on the exceptionalism of the central nervous system. In other words, when consciousness is wholly embedded in its biochemical substratum, it becomes increasingly indistinguishable from the cellular and molecular processes of other, presumably nonconscious organisms, such as plants.',
                    author: 'Michael Marder'
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
                    mainQuote: 'Evidence for the non-metaphorical memory of light residing in plant leaves adds insult to the injury suffered by the argument of those who still insist on the exceptionalism of the central nervous system. In other words, when consciousness is wholly embedded in its biochemical substratum, it becomes increasingly indistinguishable from the cellular and molecular processes of other, presumably nonconscious organisms, such as plants.',
                    author: 'Michael Marder'
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
                    mainQuote: 'Evidence for the non-metaphorical memory of light residing in plant leaves adds insult to the injury suffered by the argument of those who still insist on the exceptionalism of the central nervous system. In other words, when consciousness is wholly embedded in its biochemical substratum, it becomes increasingly indistinguishable from the cellular and molecular processes of other, presumably nonconscious organisms, such as plants.',
                    author: 'Michael Marder'
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
    getMapping(locationCode) {
        return this.mappings.get(locationCode.toUpperCase()) || null;
    }
    /**
     * Get ecosystem project by location code
     */
    getEcosystemProject(locationCode) {
        const mapping = this.getMapping(locationCode);
        return mapping ? mapping.ecosystemProject : null;
    }
    /**
     * Get way of flowers data by location code
     */
    getWayOfFlowersData(locationCode) {
        const mapping = this.getMapping(locationCode);
        return mapping ? mapping.wayOfFlowersData : null;
    }
    /**
     * Get all available location codes
     */
    getAllLocationCodes() {
        return Array.from(this.mappings.keys());
    }
    /**
     * Get all mappings
     */
    getAllMappings() {
        return Array.from(this.mappings.values());
    }
    /**
     * Add or update a mapping
     */
    addMapping(mapping) {
        this.mappings.set(mapping.locationCode, mapping);
    }
    /**
     * Check if location code exists
     */
    hasLocation(locationCode) {
        return this.mappings.has(locationCode.toUpperCase());
    }
}
exports.EcosystemMappingService = EcosystemMappingService;
exports.ecosystemMappingService = EcosystemMappingService.getInstance();
