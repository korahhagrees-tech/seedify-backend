import { Router } from 'express';
import { seedController } from '../controllers/seedController';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// GET /api/seeds - Get all seeds (cache for 30 seconds)
router.get('/', cacheMiddleware(30, 'seeds:all:'), seedController.getAllSeeds);

// GET /api/seeds/count - Get seeds count (cache for 30 seconds)
router.get('/count', cacheMiddleware(30, 'seeds:count:'), seedController.getSeedsCount);

// GET /api/seeds/contract-info - Get contract information (cache for 120 seconds)
router.get('/contract-info', cacheMiddleware(120, 'seeds:contract:'), seedController.getContractInfo);

// GET /api/seeds/:id/stats - Get comprehensive seed statistics (cache for 60 seconds)
router.get('/:id/stats', cacheMiddleware(60, 'seeds:stats:'), seedController.getSeedStats);

// GET /api/seeds/:id - Get seed by ID (cache for 30 seconds)
router.get('/:id', cacheMiddleware(30, 'seeds:detail:'), seedController.getSeedById);

export default router;
