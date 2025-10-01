import { Router } from 'express';
import { snapshotsController } from '../controllers/snapshotsController';

const router = Router();

router.get('/seed/:seedId', snapshotsController.listBySeed);
router.get('/id/:snapshotId', snapshotsController.getById);
router.get('/beneficiary/:index', snapshotsController.listByBeneficiary);
router.get('/stats', snapshotsController.stats);

export default router;


