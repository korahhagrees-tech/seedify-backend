import { Request, Response } from 'express';
import { contractService } from '../services/contractService';
import { projectsService } from '../services/projectsService';
import { BeneficiaryRef } from '../types/seed';

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
}

/**
 * Enrich a single beneficiary with project data and slug
 */
function enrichBeneficiary(beneficiary: BeneficiaryRef): BeneficiaryRef {
  const projectData = projectsService.getProjectByCode(beneficiary.code);
  
  if (projectData) {
    return {
      ...beneficiary,
      slug: generateSlug(projectData.title),
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
}

/**
 * Enrich multiple beneficiaries with project data and slugs
 */
function enrichBeneficiaries(beneficiaries: BeneficiaryRef[]): BeneficiaryRef[] {
  return beneficiaries.map(enrichBeneficiary);
}

export const beneficiariesController = {
  listAll: async (_req: Request, res: Response) => {
    try {
      const items = await contractService.getAllBeneficiaries();
      const enrichedItems = enrichBeneficiaries(items);
      res.json({ success: true, beneficiaries: enrichedItems, count: enrichedItems.length, timestamp: Date.now() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to list beneficiaries', message: e?.message, timestamp: Date.now() });
    }
  },

  count: async (_req: Request, res: Response) => {
    try {
      const items = await contractService.getAllBeneficiaries();
      res.json({ success: true, count: items.length, timestamp: Date.now() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch count', message: e?.message, timestamp: Date.now() });
    }
  },

  getByIndex: async (req: Request, res: Response) => {
    try {
      const index = Number(req.params.index);
      if (!Number.isFinite(index) || index < 0) {
        res.status(400).json({ success: false, error: 'Invalid index', timestamp: Date.now() });
        return;
      }
      const data = await contractService.getBeneficiaryData(index);
      if (!data) {
        res.status(404).json({ success: false, error: 'Beneficiary not found', timestamp: Date.now() });
        return;
      }
      
      // Fetch additional beneficiary stats
      const [totalValue, snapshotCount] = await Promise.all([
        contractService.getBeneficiaryTotalValue(index),
        contractService.getBeneficiarySnapshotCount(index)
      ]);
      
      // Enrich with project data and slug
      const enrichedBeneficiary = enrichBeneficiary({
        ...data,
        totalValue: totalValue || '0',
        snapshotCount: snapshotCount || 0
      });
      
      res.json({
        success: true,
        beneficiary: enrichedBeneficiary,
        timestamp: Date.now()
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch beneficiary', message: e?.message, timestamp: Date.now() });
    }
  },

  getByCode: async (req: Request, res: Response) => {
    try {
      const code = String(req.params.code);
      if (!code) {
        res.status(400).json({ success: false, error: 'Missing code', timestamp: Date.now() });
        return;
      }
      const data = await contractService.getBeneficiaryByCode(code);
      if (!data) {
        res.status(404).json({ success: false, error: 'Beneficiary not found', timestamp: Date.now() });
        return;
      }
      
      // Enrich with project data and slug
      const enrichedBeneficiary = enrichBeneficiary(data);
      
      res.json({ success: true, beneficiary: enrichedBeneficiary, timestamp: Date.now() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch beneficiary by code', message: e?.message, timestamp: Date.now() });
    }
  }
};
