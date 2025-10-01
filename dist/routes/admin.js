"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Beneficiaries management
router.post('/beneficiaries', adminController_1.adminController.addBeneficiary);
router.post('/beneficiaries/:index/deactivate', adminController_1.adminController.deactivateBeneficiary);
router.post('/beneficiaries/:index/reactivate', adminController_1.adminController.reactivateBeneficiary);
router.post('/beneficiaries/:index/update-address', adminController_1.adminController.updateBeneficiaryAddress);
router.post('/beneficiaries/:index/update-code', adminController_1.adminController.updateBeneficiaryCode);
// Distribution
router.post('/distribute-interest', adminController_1.adminController.distributeInterest);
exports.default = router;
