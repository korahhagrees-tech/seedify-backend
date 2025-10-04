import { Router } from 'express';
import { adminController } from '../controllers/adminController';

const router = Router();

// Statistics
router.get('/stats', adminController.getStats);

// Beneficiaries management
router.post('/beneficiaries', adminController.addBeneficiary);
router.post('/beneficiaries/:index/deactivate', adminController.deactivateBeneficiary);
router.post('/beneficiaries/:index/reactivate', adminController.reactivateBeneficiary);
router.post('/beneficiaries/:index/update-address', adminController.updateBeneficiaryAddress);
router.post('/beneficiaries/:index/update-code', adminController.updateBeneficiaryCode);

// Distribution
router.post('/distribute-interest', adminController.distributeInterest);

export default router;


