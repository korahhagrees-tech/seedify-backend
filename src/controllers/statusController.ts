import { Request, Response } from 'express';
import { config } from '../config';

export const statusController = {
  getStatus: (req: Request, res: Response): void => {
    res.json({
      message: 'Backend server is running!',
      timestamp: new Date().toISOString(),
      server: 'Express.js',
      version: config.api.version,
      environment: config.server.environment,
      uptime: process.uptime()
    });
  }
};
