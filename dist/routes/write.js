"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const writeController_1 = require("../controllers/writeController");
const router = express_1.default.Router();
// Seed operations
router.post('/seeds/create', writeController_1.writeController.createSeed);
router.post('/seeds/:id/deposit', writeController_1.writeController.depositToSeed);
router.post('/seeds/:id/withdraw', writeController_1.writeController.withdrawFromSeed);
router.post('/seeds/:id/claim-profits', writeController_1.writeController.claimSeedProfits);
// Snapshot operations
router.get('/snapshots/mint/:seedId', writeController_1.writeController.prepareMintSnapshot);
// Admin operations (require special permissions)
router.post('/admin/beneficiaries', writeController_1.writeController.addBeneficiary);
router.post('/admin/beneficiaries/:id/deactivate', writeController_1.writeController.deactivateBeneficiary);
router.post('/admin/beneficiaries/:id/reactivate', writeController_1.writeController.reactivateBeneficiary);
router.post('/admin/distribute-interest', writeController_1.writeController.distributeInterest);
exports.default = router;
