import express from 'express';
import { writeController } from '../controllers/writeController';

const router = express.Router();

// Seed operations
router.post('/seeds/create', writeController.createSeed);
router.post('/seeds/:id/deposit', writeController.depositToSeed);
router.post('/seeds/:id/withdraw', writeController.withdrawFromSeed);
router.post('/seeds/:id/claim-profits', writeController.claimSeedProfits);

// Snapshot operations
router.post('/snapshots/mint', writeController.mintSnapshot);

// Admin operations (require special permissions)
router.post('/admin/beneficiaries', writeController.addBeneficiary);
router.post('/admin/beneficiaries/:id/deactivate', writeController.deactivateBeneficiary);
router.post('/admin/beneficiaries/:id/reactivate', writeController.reactivateBeneficiary);
router.post('/admin/distribute-interest', writeController.distributeInterest);

export default router;
