"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const config_1 = require("../config");
exports.healthController = {
    getHealth: (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: config_1.config.api.name,
            version: config_1.config.api.version,
            uptime: process.uptime(),
            environment: config_1.config.server.environment,
            memory: process.memoryUsage(),
            pid: process.pid
        });
    },
    getHealthHead: (req, res) => {
        // Simple health check without response body
        res.status(200).end();
    }
};
