import express from 'express';
import { writeController } from '../controllers/writeController';
import { invalidateCacheMiddleware } from '../middleware/cache';

const router = express.Router();

// Seed operations (invalidate seed and user caches)
router.post('/seeds/create', invalidateCacheMiddleware(['seeds:', 'users:']), writeController.createSeed);
router.post('/seeds/:id/deposit', invalidateCacheMiddleware(['seeds:', 'users:']), writeController.depositToSeed);
router.post('/seeds/:id/withdraw', invalidateCacheMiddleware(['seeds:', 'users:']), writeController.withdrawFromSeed);
router.post('/seeds/:id/claim-profits', invalidateCacheMiddleware(['seeds:', 'users:']), writeController.claimSeedProfits);

// Snapshot operations (read-only, no cache invalidation needed)
router.get('/snapshots/mint/:seedId', writeController.prepareMintSnapshot);

// Admin operations (invalidate beneficiaries cache)
router.post('/admin/beneficiaries', invalidateCacheMiddleware(['beneficiaries:']), writeController.addBeneficiary);
router.post('/admin/beneficiaries/:id/deactivate', invalidateCacheMiddleware(['beneficiaries:']), writeController.deactivateBeneficiary);
router.post('/admin/beneficiaries/:id/reactivate', invalidateCacheMiddleware(['beneficiaries:']), writeController.reactivateBeneficiary);
router.post('/admin/distribute-interest', invalidateCacheMiddleware(['seeds:', 'beneficiaries:']), writeController.distributeInterest);

export default router;
