/**
 * Transaction Controller
 * 
 * Handles transaction status checking endpoints
 */

import { Request, Response } from 'express';
import transactionService from '../services/transactionService';
import type { Hash } from 'viem';

/**
 * Helper function to recursively convert BigInt values to strings for JSON serialization
 * Handles nested objects and arrays
 */
const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
    );
  }
  return obj;
};

const transactionController = {
  /**
   * Check transaction status (waits for confirmations)
   * GET /api/transactions/:hash/status
   * Query params:
   *  - confirmations: number of confirmations to wait for (default: 1)
   *  - timeout: timeout in milliseconds (default: 60000)
   */
  checkStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const { hash } = req.params;
      const confirmations = parseInt(req.query.confirmations as string) || 1;
      const timeout = parseInt(req.query.timeout as string) || 60000;

      // Validate hash format
      if (!hash || !hash.startsWith('0x') || hash.length !== 66) {
        res.status(400).json({
          success: false,
          error: 'Invalid transaction hash',
          message: 'Transaction hash must be a valid 0x-prefixed 66-character hex string',
          timestamp: Date.now(),
        });
        return;
      }

      // Validate confirmations
      if (confirmations < 0 || confirmations > 100) {
        res.status(400).json({
          success: false,
          error: 'Invalid confirmations',
          message: 'Confirmations must be between 0 and 100',
          timestamp: Date.now(),
        });
        return;
      }

      // Validate timeout
      if (timeout < 1000 || timeout > 300000) {
        res.status(400).json({
          success: false,
          error: 'Invalid timeout',
          message: 'Timeout must be between 1000ms (1s) and 300000ms (5min)',
          timestamp: Date.now(),
        });
        return;
      }

      console.log(`📥 Checking transaction status: ${hash} (${confirmations} confirmations, ${timeout}ms timeout)`);

      const status = await transactionService.checkTransactionStatus(
        hash as Hash,
        confirmations,
        timeout
      );

      res.json({
        success: true,
        transaction: serializeBigInt(status),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('❌ Error checking transaction status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check transaction status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
    }
  },

  /**
   * Get transaction receipt (quick check, doesn't wait)
   * GET /api/transactions/:hash/receipt
   */
  getReceipt: async (req: Request, res: Response): Promise<void> => {
    try {
      const { hash } = req.params;

      // Validate hash format
      if (!hash || !hash.startsWith('0x') || hash.length !== 66) {
        res.status(400).json({
          success: false,
          error: 'Invalid transaction hash',
          message: 'Transaction hash must be a valid 0x-prefixed 66-character hex string',
          timestamp: Date.now(),
        });
        return;
      }

      console.log(`📥 Getting transaction receipt: ${hash}`);

      const receipt = await transactionService.getTransactionReceipt(hash as Hash);

      res.json({
        success: true,
        transaction: serializeBigInt(receipt),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('❌ Error getting transaction receipt:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get transaction receipt',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
    }
  },

  /**
   * Check if transaction is confirmed
   * GET /api/transactions/:hash/confirmed
   * Query params:
   *  - confirmations: required number of confirmations (default: 1)
   */
  isConfirmed: async (req: Request, res: Response): Promise<void> => {
    try {
      const { hash } = req.params;
      const requiredConfirmations = parseInt(req.query.confirmations as string) || 1;

      // Validate hash format
      if (!hash || !hash.startsWith('0x') || hash.length !== 66) {
        res.status(400).json({
          success: false,
          error: 'Invalid transaction hash',
          message: 'Transaction hash must be a valid 0x-prefixed 66-character hex string',
          timestamp: Date.now(),
        });
        return;
      }

      console.log(`📥 Checking if transaction is confirmed: ${hash} (${requiredConfirmations} confirmations)`);

      const isConfirmed = await transactionService.isConfirmed(
        hash as Hash,
        requiredConfirmations
      );

      res.json({
        success: true,
        hash: hash,
        isConfirmed: isConfirmed,
        requiredConfirmations: requiredConfirmations,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('❌ Error checking if transaction is confirmed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check transaction confirmation',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
    }
  },
};

export default transactionController;

