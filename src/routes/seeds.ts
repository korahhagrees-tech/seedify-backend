import { Router } from 'express';
import { seedController } from '../controllers/seedController';

const router = Router();

// GET /api/seeds - Get all seeds
router.get('/', seedController.getAllSeeds);

// GET /api/seeds/count - Get seeds count
router.get('/count', seedController.getSeedsCount);

// GET /api/seeds/contract-info - Get contract information
router.get('/contract-info', seedController.getContractInfo);

// GET /api/seeds/:id - Get seed by ID
router.get('/:id', seedController.getSeedById);

export default router;
