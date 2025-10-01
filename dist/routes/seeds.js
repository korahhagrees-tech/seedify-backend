"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seedController_1 = require("../controllers/seedController");
const router = (0, express_1.Router)();
// GET /api/seeds - Get all seeds
router.get('/', seedController_1.seedController.getAllSeeds);
// GET /api/seeds/count - Get seeds count
router.get('/count', seedController_1.seedController.getSeedsCount);
// GET /api/seeds/contract-info - Get contract information
router.get('/contract-info', seedController_1.seedController.getContractInfo);
// GET /api/seeds/:id - Get seed by ID
router.get('/:id', seedController_1.seedController.getSeedById);
exports.default = router;
