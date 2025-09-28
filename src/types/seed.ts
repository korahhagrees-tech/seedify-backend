export interface SeedMetadata {
  exists: boolean;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  image: string;
  position: {
    top: string;
    left: string;
    width: string;
    height: string;
    transform: string;
  };
  labelPosition: {
    top: string;
    left: string;
    transform: string;
  };
}

export interface EcosystemProject {
  title: string;
  subtitle: string;
  shortText: string;
  extendedText: string;
  backgroundImageUrl: string;
  seedEmblemUrl: string;
}

export interface WayOfFlowersData {
  backgroundImageUrl: string;
  seedEmblemUrl: string;
  firstText: string;
  secondText: string;
  thirdText: string;
  mainQuote: string;
  author: string;
}

export interface Seed {
  id: string;
  label: string;
  name: string;
  description: string;
  seedImageUrl: string;
  latestSnapshotUrl: string | null;
  snapshotCount: number;
  owner: string;
  depositAmount: string | null;
  snapshotPrice: string;
  isWithdrawn: boolean;
  isLive: boolean;
  metadata: SeedMetadata;
  // Additional data for components
  locations: Location[];
  ecosystemProjects: EcosystemProject[];
  wayOfFlowersData: WayOfFlowersData;
}

export interface SeedSummary {
  id: string;
  label: string;
  name: string;
  description: string;
  seedImageUrl: string;
  latestSnapshotUrl: string | null;
  snapshotCount: number;
  owner: string;
  depositAmount: string | null;
  snapshotPrice: string;
  isWithdrawn: boolean;
  isLive: boolean;
  metadata: SeedMetadata;
}

export interface GardenDataResponse {
  success: boolean;
  seeds: SeedSummary[];
  timestamp: number;
}

export interface SeedDetailResponse {
  success: boolean;
  seed: Seed;
  timestamp: number;
}

// Raw contract data interfaces
export interface ContractSeedData {
  id: number;
  owner: string;
  location: string;
  timestamp: number;
  blockNumber: number;
  exists: boolean;
  depositAmount?: string;
  withdrawn?: boolean;
  snapshotCount?: number;
}

export interface ContractSeedMetadata {
  timestamp: number;
  blockNumber: number;
}
