import { Request, Response } from 'express';
import { config } from '../config';

export const healthController = {
  getHealth: (req: Request, res: Response): void => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: config.api.name,
      version: config.api.version,
      uptime: process.uptime(),
      environment: config.server.environment,
      memory: process.memoryUsage(),
      pid: process.pid
    });
  },

  getHealthHead: (req: Request, res: Response): void => {
    // Simple health check without response body
    res.status(200).end();
  }
};
