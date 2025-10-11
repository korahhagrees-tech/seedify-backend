"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beneficiariesController = void 0;
const contractService_1 = require("../services/contractService");
const projectsService_1 = require("../services/projectsService");
/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
/**
 * Enrich a single beneficiary with project data and slug
 */
function enrichBeneficiary(beneficiary) {
    const projectData = projectsService_1.projectsService.getProjectByCode(beneficiary.code);
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
function enrichBeneficiaries(beneficiaries) {
    return beneficiaries.map(enrichBeneficiary);
}
exports.beneficiariesController = {
    listAll: async (_req, res) => {
        try {
            const items = await contractService_1.contractService.getAllBeneficiaries();
            const enrichedItems = enrichBeneficiaries(items);
            res.json({ success: true, beneficiaries: enrichedItems, count: enrichedItems.length, timestamp: Date.now() });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to list beneficiaries', message: e?.message, timestamp: Date.now() });
        }
    },
    count: async (_req, res) => {
        try {
            const items = await contractService_1.contractService.getAllBeneficiaries();
            res.json({ success: true, count: items.length, timestamp: Date.now() });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch count', message: e?.message, timestamp: Date.now() });
        }
    },
    getByIndex: async (req, res) => {
        try {
            const index = Number(req.params.index);
            if (!Number.isFinite(index) || index < 0) {
                res.status(400).json({ success: false, error: 'Invalid index', timestamp: Date.now() });
                return;
            }
            const data = await contractService_1.contractService.getBeneficiaryData(index);
            if (!data) {
                res.status(404).json({ success: false, error: 'Beneficiary not found', timestamp: Date.now() });
                return;
            }
            // Fetch additional beneficiary stats
            const [totalValue, snapshotCount] = await Promise.all([
                contractService_1.contractService.getBeneficiaryTotalValue(index),
                contractService_1.contractService.getBeneficiarySnapshotCount(index)
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
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch beneficiary', message: e?.message, timestamp: Date.now() });
        }
    },
    getByCode: async (req, res) => {
        try {
            const code = String(req.params.code);
            if (!code) {
                res.status(400).json({ success: false, error: 'Missing code', timestamp: Date.now() });
                return;
            }
            const data = await contractService_1.contractService.getBeneficiaryByCode(code);
            if (!data) {
                res.status(404).json({ success: false, error: 'Beneficiary not found', timestamp: Date.now() });
                return;
            }
            // Enrich with project data and slug
            const enrichedBeneficiary = enrichBeneficiary(data);
            res.json({ success: true, beneficiary: enrichedBeneficiary, timestamp: Date.now() });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch beneficiary by code', message: e?.message, timestamp: Date.now() });
        }
    }
};
