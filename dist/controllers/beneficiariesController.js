"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beneficiariesController = void 0;
const contractService_1 = require("../services/contractService");
exports.beneficiariesController = {
    listAll: async (_req, res) => {
        try {
            const items = await contractService_1.contractService.getAllBeneficiaries();
            res.json({ success: true, beneficiaries: items, count: items.length, timestamp: Date.now() });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to list beneficiaries', message: e?.message, timestamp: Date.now() });
        }
    },
    count: async (_req, res) => {
        try {
            const items = await contractService_1.contractService.getAllBeneficiaries();
            res.json({ success: true, count: items.length, timestamp: Date.now() });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch count', message: e?.message, timestamp: Date.now() });
        }
    },
    getByIndex: async (req, res) => {
        try {
            const index = Number(req.params.index);
            if (!Number.isFinite(index) || index < 0) {
                res.status(400).json({ success: false, error: 'Invalid index', timestamp: Date.now() });
                return;
            }
            const data = await contractService_1.contractService.getBeneficiaryData(index);
            if (!data) {
                res.status(404).json({ success: false, error: 'Beneficiary not found', timestamp: Date.now() });
                return;
            }
            res.json({ success: true, beneficiary: data, timestamp: Date.now() });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch beneficiary', message: e?.message, timestamp: Date.now() });
        }
    },
    getByCode: async (req, res) => {
        try {
            const code = String(req.params.code);
            if (!code) {
                res.status(400).json({ success: false, error: 'Missing code', timestamp: Date.now() });
                return;
            }
            const data = await contractService_1.contractService.getBeneficiaryByCode(code);
            if (!data) {
                res.status(404).json({ success: false, error: 'Beneficiary not found', timestamp: Date.now() });
                return;
            }
            res.json({ success: true, beneficiary: data, timestamp: Date.now() });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch beneficiary by code', message: e?.message, timestamp: Date.now() });
        }
    }
};
