"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const beneficiariesController_1 = require("../controllers/beneficiariesController");
const router = (0, express_1.Router)();
// Public read endpoints
router.get('/', beneficiariesController_1.beneficiariesController.listAll);
router.get('/count', beneficiariesController_1.beneficiariesController.count);
router.get('/by-code/:code', beneficiariesController_1.beneficiariesController.getByCode);
router.get('/:index', beneficiariesController_1.beneficiariesController.getByIndex);
exports.default = router;
