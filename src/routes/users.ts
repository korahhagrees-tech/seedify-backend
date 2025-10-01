import express from 'express';
import { usersController } from '../controllers/usersController';

const router = express.Router();

// User-specific seed endpoints
router.get('/:address/seeds', usersController.getUserSeeds);
router.get('/:address/seeds/count', usersController.getUserSeedsCount);

// User-specific snapshot endpoints
router.get('/:address/snapshots', usersController.getUserSnapshots);
router.get('/:address/snapshots/count', usersController.getUserSnapshotsCount);
router.get('/:address/snapshots/data', usersController.getUserSnapshotData);

// User balance and stats
router.get('/:address/balance', usersController.getUserBalance);
router.get('/:address/stats', usersController.getUserStats);

// User portfolio summary
router.get('/:address/portfolio', usersController.getUserPortfolio);

export default router;

