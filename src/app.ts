import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { invalidateCacheMiddleware } from './middleware/cache';
import healthRoutes from './routes/health';
import statusRoutes from './routes/status';
import seedRoutes from './routes/seeds';
import beneficiaryRoutes from './routes/beneficiaries';
import snapshotRoutes from './routes/snapshots';
import adminRoutes from './routes/admin';
import writeRoutes from './routes/write';
import usersRoutes from './routes/users';
import { writeController } from './controllers/writeController';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Logging middleware
app.use(morgan(config.morgan.format));

// Request logging
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: config.server.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.server.bodyLimit }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/seeds', seedRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/snapshots', snapshotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/write', writeRoutes);
app.use('/api/users', usersRoutes);

// Webhook endpoint for snapshot minting (invalidate snapshots, seeds, and users cache)
app.post('/api/snapshot-minted', invalidateCacheMiddleware(['snapshots:', 'seeds:', 'users:']), writeController.snapshotMinted);

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
app.use(errorHandler);

export default app;
