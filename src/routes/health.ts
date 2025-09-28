import { Router } from 'express';
import { healthController } from '../controllers/healthController';

const router = Router();

router.get('/', healthController.getHealth);
router.head('/', healthController.getHealthHead);

export default router;
