import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import app from './app';
import { config } from './config';

const port = config.server.port;

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🌍 Environment: ${config.server.environment}`);
  console.log(`📝 Logs: ${config.morgan.format}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
