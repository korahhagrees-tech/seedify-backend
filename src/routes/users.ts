import express from 'express';
import { usersController } from '../controllers/usersController';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

// User-specific seed endpoints (cache for 15 seconds - user data changes with transactions)
router.get('/:address/seeds', cacheMiddleware(15, 'users:seeds:'), usersController.getUserSeeds);
router.get('/:address/seeds/count', cacheMiddleware(15, 'users:seeds-count:'), usersController.getUserSeedsCount);

// User-specific snapshot endpoints (cache for 15 seconds)
router.get('/:address/snapshots', cacheMiddleware(15, 'users:snapshots:'), usersController.getUserSnapshots);
router.get('/:address/snapshots/count', cacheMiddleware(15, 'users:snapshots-count:'), usersController.getUserSnapshotsCount);
router.get('/:address/snapshots/data', cacheMiddleware(15, 'users:snapshots-data:'), usersController.getUserSnapshotData);

// User balance and stats (cache for 15 seconds)
router.get('/:address/balance', cacheMiddleware(15, 'users:balance:'), usersController.getUserBalance);
router.get('/:address/stats', cacheMiddleware(15, 'users:stats:'), usersController.getUserStats);

// User portfolio summary (cache for 15 seconds)
router.get('/:address/portfolio', cacheMiddleware(15, 'users:portfolio:'), usersController.getUserPortfolio);

export default router;

