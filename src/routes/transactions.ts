/**
 * Transaction Routes
 * 
 * Handles transaction status checking endpoints
 */

import { Router } from 'express';
import transactionController from '../controllers/transactionController';

const router = Router();

/**
 * GET /api/transactions/:hash/status
 * Check transaction status (waits for confirmations)
 * 
 * Query Parameters:
 *  - confirmations: number (default: 1) - Number of confirmations to wait for
 *  - timeout: number (default: 60000) - Timeout in milliseconds
 * 
 * Example: GET /api/transactions/0x123.../status?confirmations=2&timeout=30000
 */
router.get('/:hash/status', transactionController.checkStatus);

/**
 * GET /api/transactions/:hash/receipt
 * Get transaction receipt (quick check, doesn't wait)
 * 
 * Example: GET /api/transactions/0x123.../receipt
 */
router.get('/:hash/receipt', transactionController.getReceipt);

/**
 * GET /api/transactions/:hash/confirmed
 * Check if transaction is confirmed
 * 
 * Query Parameters:
 *  - confirmations: number (default: 1) - Required number of confirmations
 * 
 * Example: GET /api/transactions/0x123.../confirmed?confirmations=3
 */
router.get('/:hash/confirmed', transactionController.isConfirmed);

export default router;

