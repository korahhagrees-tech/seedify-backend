import { Router } from 'express';
import { snapshotsController } from '../controllers/snapshotsController';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// Cache for 30 seconds - snapshots change when new ones are minted
router.get('/seed/:seedId', cacheMiddleware(30, 'snapshots:seed:'), snapshotsController.listBySeed);
router.get('/id/:snapshotId', cacheMiddleware(120, 'snapshots:detail:'), snapshotsController.getById);
router.get('/beneficiary/:index', cacheMiddleware(30, 'snapshots:beneficiary:'), snapshotsController.listByBeneficiary);
router.get('/stats', cacheMiddleware(60, 'snapshots:stats:'), snapshotsController.stats);

export default router;


