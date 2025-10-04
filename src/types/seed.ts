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

// Lightweight beneficiary reference for backend responses
export interface BeneficiaryRef {
  code: string; // beneficiary code from contracts (acts as ID)
  name?: string; // optional readable name if available
  index?: number; // optional index from distributor
  percentage?: string; // percentage allocation (from getBeneficiaryPercentage)
  address?: string; // beneficiary address
  allocatedAmount?: string; // allocated amount in ETH
  totalClaimed?: string; // total claimed in ETH
  claimableAmount?: string; // claimable amount in ETH
  isActive?: boolean; // whether beneficiary is active
  beneficiaryValue?: string; // total value for beneficiary
  // Enriched project data from projects.json
  projectData?: {
    title: string;
    subtitle: string;
    location: string;
    area: string;
    description: string;
    benefits: string[];
    moreDetails: string;
    backgroundImage: string;
  };
  slug?: string; // URL-friendly slug for routing (e.g., "grgich-hills-estate")
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
  location: string; // Single location string from getSeedLocation(seedId)
  wayOfFlowersData?: WayOfFlowersData; // Optional: NOT from contract, for frontend only
  story?: { title: string; author: string; story: string }; // Optional: NOT from contract
  // Beneficiaries with full details from contract + enriched project data
  beneficiaries?: BeneficiaryRef[];
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
  seedImageUrl?: string;
  latestSnapshotUrl?: string;
  snapshotPrice?: string;
  unlockTime?: number;
  accumulatedProfits?: string;
  dynamicPercentage?: string;
  totalValue?: string;
  isEarlyWithdrawn?: boolean;
}

export interface ContractSeedMetadata {
  timestamp: number;
  blockNumber: number;
}
