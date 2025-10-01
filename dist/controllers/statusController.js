"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusController = void 0;
const config_1 = require("../config");
exports.statusController = {
    getStatus: (req, res) => {
        res.json({
            message: 'Backend server is running!',
            timestamp: new Date().toISOString(),
            server: 'Express.js',
            version: config_1.config.api.version,
            environment: config_1.config.server.environment,
            uptime: process.uptime()
        });
    }
};
