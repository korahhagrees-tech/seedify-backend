"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController_1 = require("../controllers/usersController");
const router = express_1.default.Router();
// User-specific seed endpoints
router.get('/:address/seeds', usersController_1.usersController.getUserSeeds);
router.get('/:address/seeds/count', usersController_1.usersController.getUserSeedsCount);
// User-specific snapshot endpoints
router.get('/:address/snapshots', usersController_1.usersController.getUserSnapshots);
router.get('/:address/snapshots/count', usersController_1.usersController.getUserSnapshotsCount);
router.get('/:address/snapshots/data', usersController_1.usersController.getUserSnapshotData);
// User balance and stats
router.get('/:address/balance', usersController_1.usersController.getUserBalance);
router.get('/:address/stats', usersController_1.usersController.getUserStats);
// User portfolio summary
router.get('/:address/portfolio', usersController_1.usersController.getUserPortfolio);
exports.default = router;
