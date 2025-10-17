import { Router } from 'express';
import { beneficiariesController } from '../controllers/beneficiariesController';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// Public read endpoints (cache for 60 seconds - beneficiaries change infrequently)
router.get('/', cacheMiddleware(60, 'beneficiaries:all:'), beneficiariesController.listAll);
router.get('/count', cacheMiddleware(60, 'beneficiaries:count:'), beneficiariesController.count);
router.get('/by-code/:code', cacheMiddleware(60, 'beneficiaries:code:'), beneficiariesController.getByCode);
router.get('/:index', cacheMiddleware(60, 'beneficiaries:detail:'), beneficiariesController.getByIndex);

export default router;


