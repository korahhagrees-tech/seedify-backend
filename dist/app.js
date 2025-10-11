"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const health_1 = __importDefault(require("./routes/health"));
const status_1 = __importDefault(require("./routes/status"));
const seeds_1 = __importDefault(require("./routes/seeds"));
const beneficiaries_1 = __importDefault(require("./routes/beneficiaries"));
const snapshots_1 = __importDefault(require("./routes/snapshots"));
const admin_1 = __importDefault(require("./routes/admin"));
const write_1 = __importDefault(require("./routes/write"));
const users_1 = __importDefault(require("./routes/users"));
const writeController_1 = require("./controllers/writeController");
// Create Express app
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)(config_1.config.cors));
// Logging middleware
app.use((0, morgan_1.default)(config_1.config.morgan.format));
// Request logging
app.use(requestLogger_1.requestLogger);
// Body parsing middleware
app.use(express_1.default.json({ limit: config_1.config.server.bodyLimit }));
app.use(express_1.default.urlencoded({ extended: true, limit: config_1.config.server.bodyLimit }));
// Routes
app.use('/api/health', health_1.default);
app.use('/api/status', status_1.default);
app.use('/api/seeds', seeds_1.default);
app.use('/api/beneficiaries', beneficiaries_1.default);
app.use('/api/snapshots', snapshots_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/write', write_1.default);
app.use('/api/users', users_1.default);
// Webhook endpoint for snapshot minting
app.post('/api/snapshot-minted', writeController_1.writeController.snapshotMinted);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Seedify Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            status: '/api/status',
            seeds: '/api/seeds',
            beneficiaries: '/api/beneficiaries',
            snapshots: '/api/snapshots',
            admin: '/api/admin',
            write: '/api/write',
            users: '/api/users',
            snapshotMinted: '/api/snapshot-minted'
        }
    });
});
// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Not Found',
//     message: `Route ${req.originalUrl} not found`,
//     timestamp: new Date().toISOString()
//   });
// });
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
