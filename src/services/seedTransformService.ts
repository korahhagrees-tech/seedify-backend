import { Seed, SeedSummary, ContractSeedData, WayOfFlowersData, BeneficiaryRef } from '../types/seed';
import { contractService } from './contractService';
import { projectsService } from './projectsService';

export class SeedTransformService {
  private static instance: SeedTransformService;

  private constructor() {}

  static getInstance(): SeedTransformService {
    if (!SeedTransformService.instance) {
      SeedTransformService.instance = new SeedTransformService();
    }
    return SeedTransformService.instance;
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
  }

  /**
   * Convert project background image path to seed emblem path
   * Example: /project_images/01__GRG.png → /seeds/01_grg.png
   */
  private convertToSeedEmblemPath(backgroundImage: string): string {
    if (!backgroundImage) return '';
    
    // Extract filename from path
    const filename = backgroundImage.split('/').pop() || '';
    
    // Convert to lowercase and replace directory
    // const seedEmblemFilename = filename.toLowerCase();
    const seedEmblemFilename = filename;
    
    return `/seeds/${seedEmblemFilename}`;
  }

  /**
   * Enrich beneficiaries with project data from projects.json
   */
  private enrichBeneficiariesWithProjects(beneficiaries: BeneficiaryRef[]): BeneficiaryRef[] {
    return beneficiaries.map(beneficiary => {
      const projectData = projectsService.getProjectByCode(beneficiary.code);
      
      if (projectData) {
        return {
          ...beneficiary,
          slug: this.generateSlug(projectData.title),
          projectData: {
            title: projectData.title,
            subtitle: projectData.subtitle,
            location: projectData.location,
            area: projectData.area,
            description: projectData.description,
            benefits: projectData.benefits,
            moreDetails: projectData.moreDetails,
            backgroundImage: projectData.backgroundImage
          }
        };
      }
      
      return beneficiary;
    });
  }

  /**
   * Transform contract data to frontend SeedSummary format (for getAllSeeds)
   * NO MOCK DATA - Only return what we have from contracts
   */
  transformContractDataToSeedSummary(contractData: ContractSeedData): SeedSummary {
    const createdDate = new Date(contractData.timestamp * 1000);
    const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days

    // Convert deposit amount from wei to ETH
    const depositAmount = contractData.depositAmount 
      ? (Number(contractData.depositAmount) / Math.pow(10, 18)).toFixed(4)
      : null;

    const locationName = contractData.location || '';

    return {
      id: contractData.id.toString(),
      label: `Seed 00${contractData.id}`,
      name: `Digital Flower ${contractData.id}`,
      description: `A beautiful digital flower planted in ${locationName || 'Unknown'}. This seed was created on ${createdDate.toLocaleDateString()} and represents growth and prosperity in our ecosystem.`,
      seedImageUrl: contractData.seedImageUrl || '', // NO FALLBACK - empty if not from contract
      latestSnapshotUrl: contractData.latestSnapshotUrl || null,
      snapshotCount: contractData.snapshotCount || 0,
      owner: contractData.owner,
      depositAmount: depositAmount,
      snapshotPrice: contractData.snapshotPrice || '0',
      isWithdrawn: contractData.withdrawn || false,
      isLive: isRecent,
      metadata: {
        exists: contractData.exists,
        attributes: [
          { trait_type: 'Type', value: 'Seed' },
          { trait_type: 'Token ID', value: contractData.id },
          { trait_type: 'Location', value: locationName || 'Unknown' },
          { trait_type: 'Created', value: createdDate.toISOString() },
          { trait_type: 'Deposit Amount', value: depositAmount || '0' },
          { trait_type: 'Snapshot Count', value: contractData.snapshotCount || 0 },
          { trait_type: 'Withdrawn', value: contractData.withdrawn ? 'Yes' : 'No' },
          { trait_type: 'Owner', value: contractData.owner }
        ]
      }
    };
  }

  /**
   * Transform contract data to frontend Seed format (for getSeedById)
   * NO MOCK DATA - Only return what we have from contracts + enriched from projects.json
   */
  async transformContractDataToSeed(contractData: ContractSeedData): Promise<Seed> {
    const createdDate = new Date(contractData.timestamp * 1000);
    const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days

    // Convert deposit amount from wei to ETH
    const depositAmount = contractData.depositAmount 
      ? (Number(contractData.depositAmount) / Math.pow(10, 18)).toFixed(4)
      : null;

    // Get beneficiaries from contract
    let beneficiaries: BeneficiaryRef[] = [];
    try {
      const refs = await contractService.getSeedBeneficiaries(contractData.id);
      beneficiaries = refs || [];
    } catch (error) {
      console.error(`Error fetching beneficiaries for seed ${contractData.id}:`, error);
      beneficiaries = [];
    }

    // Enrich beneficiaries with project data from projects.json
    const enrichedBeneficiaries = this.enrichBeneficiariesWithProjects(beneficiaries);

    // Way of Flowers data is NOT from contract - populate from first beneficiary's project data
    const wayOfFlowers: WayOfFlowersData = {
      backgroundImageUrl: '',
      seedEmblemUrl: '',
      firstText: '',
      secondText: '',
      thirdText: '',
      mainQuote: '',
      author: ''
    };

    // If we have beneficiaries with project data, use the first one for wayOfFlowersData
    if (enrichedBeneficiaries.length > 0 && enrichedBeneficiaries[0].projectData) {
      const firstProject = enrichedBeneficiaries[0].projectData;
      wayOfFlowers.backgroundImageUrl = firstProject.backgroundImage;
      wayOfFlowers.seedEmblemUrl = this.convertToSeedEmblemPath(firstProject.backgroundImage);
    }

    const locationName = contractData.location || '';

    return {
      id: contractData.id.toString(),
      label: `Seed 00${contractData.id}`,
      name: `Digital Flower ${contractData.id}`,
      description: `A beautiful digital flower planted in ${locationName || 'Unknown'}. This seed was created on ${createdDate.toLocaleDateString()} and represents growth and prosperity in our ecosystem.`,
      seedImageUrl: contractData.seedImageUrl || '', // NO FALLBACK - empty if not from contract
      latestSnapshotUrl: contractData.latestSnapshotUrl || null,
      snapshotCount: contractData.snapshotCount || 0,
      owner: contractData.owner,
      depositAmount: depositAmount,
      snapshotPrice: contractData.snapshotPrice || '0',
      isWithdrawn: contractData.withdrawn || false,
      isLive: isRecent,
      metadata: {
        exists: contractData.exists,
        attributes: [
          { trait_type: 'Type', value: 'Seed' },
          { trait_type: 'Token ID', value: contractData.id },
          { trait_type: 'Location', value: locationName || 'Unknown' },
          { trait_type: 'Created', value: createdDate.toISOString() },
          { trait_type: 'Deposit Amount', value: depositAmount || '0' },
          { trait_type: 'Snapshot Count', value: contractData.snapshotCount || 0 },
          { trait_type: 'Withdrawn', value: contractData.withdrawn ? 'Yes' : 'No' },
          { trait_type: 'Owner', value: contractData.owner }
        ]
      },
      location: locationName,
      wayOfFlowersData: wayOfFlowers, // NOT from contract - empty object for frontend to populate
      story: { title: '', author: '', story: '' }, // NOT from contract - empty object for frontend to populate
      beneficiaries: enrichedBeneficiaries
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
  async transformContractDataToSeeds(contractDataArray: ContractSeedData[]): Promise<Seed[]> {
    const results: Seed[] = [];
    for (const data of contractDataArray) {
      if (!data.exists) continue;
      results.push(await this.transformContractDataToSeed(data));
    }
    return results;
  }
}

// Export singleton instance
export const seedTransformService = SeedTransformService.getInstance();
