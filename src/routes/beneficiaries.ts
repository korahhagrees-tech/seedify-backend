import { Router } from 'express';
import { beneficiariesController } from '../controllers/beneficiariesController';

const router = Router();

// Public read endpoints
router.get('/', beneficiariesController.listAll);
router.get('/count', beneficiariesController.count);
router.get('/by-code/:code', beneficiariesController.getByCode);
router.get('/:index', beneficiariesController.getByIndex);

export default router;


