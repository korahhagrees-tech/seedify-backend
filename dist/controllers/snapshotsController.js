"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshotsController = void 0;
const contractService_1 = require("../services/contractService");
exports.snapshotsController = {
    listBySeed: async (req, res) => {
        try {
            const seedId = Number(req.params.seedId);
            if (!Number.isFinite(seedId) || seedId < 1) {
                res.status(400).json({ success: false, error: 'Invalid seedId', timestamp: Date.now() });
                return;
            }
            const snapshotIds = await contractService_1.contractService.getSeedSnapshots(seedId);
            const snapshots = [];
            for (const snapshotId of snapshotIds) {
                const data = await contractService_1.contractService.getSnapshotData(snapshotId);
                if (data) {
                    // Fetch real image URL from contract
                    const imageUrl = await contractService_1.contractService.getSnapshotImageUrl(snapshotId);
                    snapshots.push({
                        id: snapshotId,
                        ...data,
                        valueEth: (data.value / Math.pow(10, 18)).toFixed(6),
                        imageUrl: imageUrl || undefined
                    });
                }
            }
            res.json({ success: true, snapshots, count: snapshots.length, timestamp: Date.now() });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to list seed snapshots', message: e?.message, timestamp: Date.now() });
        }
    },
    getById: async (req, res) => {
        try {
            const snapshotId = Number(req.params.snapshotId);
            if (!Number.isFinite(snapshotId) || snapshotId < 0) {
                res.status(400).json({ success: false, error: 'Invalid snapshotId', timestamp: Date.now() });
                return;
            }
            const data = await contractService_1.contractService.getSnapshotData(snapshotId);
            if (!data) {
                res.status(404).json({ success: false, error: 'Snapshot not found', timestamp: Date.now() });
                return;
            }
            // Fetch real image URL from contract
            const imageUrl = await contractService_1.contractService.getSnapshotImageUrl(snapshotId);
            res.json({
                success: true,
                snapshot: {
                    id: snapshotId,
                    ...data,
                    valueEth: (data.value / Math.pow(10, 18)).toFixed(6),
                    imageUrl: imageUrl || undefined
                },
                timestamp: Date.now()
            });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch snapshot', message: e?.message, timestamp: Date.now() });
        }
    },
    listByBeneficiary: async (req, res) => {
        try {
            const index = Number(req.params.index);
            if (!Number.isFinite(index) || index < 0) {
                res.status(400).json({ success: false, error: 'Invalid beneficiary index', timestamp: Date.now() });
                return;
            }
            const snapshotIds = await contractService_1.contractService.getBeneficiarySnapshots(index);
            const snapshots = [];
            for (const snapshotId of snapshotIds) {
                const data = await contractService_1.contractService.getSnapshotData(snapshotId);
                if (data) {
                    // Fetch real image URL from contract
                    const imageUrl = await contractService_1.contractService.getSnapshotImageUrl(snapshotId);
                    snapshots.push({
                        id: snapshotId,
                        ...data,
                        valueEth: (data.value / Math.pow(10, 18)).toFixed(6),
                        imageUrl: imageUrl || undefined
                    });
                }
            }
            res.json({ success: true, snapshots, count: snapshots.length, timestamp: Date.now() });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to list beneficiary snapshots', message: e?.message, timestamp: Date.now() });
        }
    },
    stats: async (_req, res) => {
        try {
            const total = await contractService_1.contractService.getTotalSnapshots();
            const valueRaised = await contractService_1.contractService.getTotalValueRaised();
            res.json({
                success: true,
                total,
                valueRaised,
                valueRaisedEth: (Number(valueRaised) / Math.pow(10, 18)).toFixed(6),
                timestamp: Date.now()
            });
        }
        catch (e) {
            res.status(500).json({ success: false, error: 'Failed to fetch snapshot stats', message: e?.message, timestamp: Date.now() });
        }
    }
};
