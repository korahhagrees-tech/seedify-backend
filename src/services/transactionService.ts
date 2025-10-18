/**
 * Transaction Service
 * 
 * Provides transaction status checking functionality using Viem
 * (Viem is the underlying library that wagmi uses - works on backend)
 * 
 * This service creates its own Viem client config to avoid affecting other parts of the system
 */

import { createPublicClient, http, type Hash, type TransactionReceipt } from 'viem';
import { base } from 'viem/chains';
import contractConfig from '../config/contract';

// Create a dedicated Viem client for transaction checking
// This is isolated and won't affect other parts of the application
// Uses Base Mainnet (chainId: 8453) as configured in contract config
const transactionClient = createPublicClient({
  chain: base,
  transport: http(contractConfig.rpcUrl),
});

export interface TransactionStatus {
  hash: Hash;
  status: 'success' | 'reverted' | 'pending' | 'not_found';
  blockNumber?: bigint;
  blockHash?: Hash;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  from?: string;
  to?: string;
  contractAddress?: string;
  logs?: any[];
  logsBloom?: string;
  transactionIndex?: number;
  cumulativeGasUsed?: bigint;
  type?: string;
  revertReason?: string;
  confirmations?: number;
}

class TransactionService {
  /**
   * Check the status of a transaction by its hash
   * 
   * @param txHash - The transaction hash to check (0x...)
   * @param confirmations - Number of confirmations to wait for (default: 1)
   * @param timeout - Timeout in milliseconds (default: 60000 - 1 minute)
   * @returns Transaction status information
   */
  async checkTransactionStatus(
    txHash: Hash,
    confirmations: number = 1,
    timeout: number = 60000
  ): Promise<TransactionStatus> {
    try {
      console.log(`🔍 Checking transaction status for: ${txHash}`);
      console.log(`⏱️ Waiting for ${confirmations} confirmation(s) with ${timeout}ms timeout`);

      // Wait for the transaction receipt with specified confirmations
      const receipt: TransactionReceipt = await transactionClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: confirmations,
        timeout: timeout,
      });

      console.log(`✅ Transaction receipt received:`, {
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
      });

      // Get current block number for confirmations count
      const currentBlock = await transactionClient.getBlockNumber();
      const confirmedBlocks = currentBlock - receipt.blockNumber;

      // Parse the receipt status
      let status: 'success' | 'reverted';
      let revertReason: string | undefined;

      if (receipt.status === 'success') {
        status = 'success';
      } else {
        status = 'reverted';
        
        // Try to get revert reason
        try {
          const tx = await transactionClient.getTransaction({ hash: txHash });
          if (tx) {
            // Try to simulate the transaction to get revert reason
            try {
              await transactionClient.call({
                account: tx.from,
                to: tx.to,
                data: tx.input,
                value: tx.value,
                gas: tx.gas,
                gasPrice: tx.gasPrice,
                blockNumber: receipt.blockNumber - 1n,
              });
            } catch (error: any) {
              // Extract revert reason from error
              revertReason = error.shortMessage || error.message || 'Transaction reverted';
              console.log(`❌ Revert reason:`, revertReason);
            }
          }
        } catch (error) {
          console.log('⚠️ Could not fetch detailed revert reason');
          revertReason = 'Transaction reverted (reason unavailable)';
        }
      }

      return {
        hash: txHash,
        status: status,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        from: receipt.from,
        to: receipt.to || undefined,
        contractAddress: receipt.contractAddress || undefined,
        logs: receipt.logs,
        logsBloom: receipt.logsBloom,
        transactionIndex: receipt.transactionIndex,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        type: receipt.type,
        confirmations: Number(confirmedBlocks),
        ...(revertReason && { revertReason }),
      };
    } catch (error: any) {
      console.error(`❌ Error checking transaction status:`, error);

      // Check if transaction is still pending
      if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        console.log(`⏳ Transaction is still pending (timeout reached)`);
        return {
          hash: txHash,
          status: 'pending',
        };
      }

      // Check if transaction doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('could not be found')) {
        console.log(`🔍 Transaction not found on chain`);
        return {
          hash: txHash,
          status: 'not_found',
        };
      }

      // Re-throw for other errors
      throw error;
    }
  }

  /**
   * Quick check if a transaction exists and get its basic status
   * (Doesn't wait for confirmations)
   * 
   * @param txHash - The transaction hash to check
   * @returns Basic transaction status
   */
  async getTransactionReceipt(txHash: Hash): Promise<TransactionStatus> {
    try {
      console.log(`🔍 Getting transaction receipt for: ${txHash}`);

      const receipt = await transactionClient.getTransactionReceipt({ hash: txHash });

      if (!receipt) {
        return {
          hash: txHash,
          status: 'not_found',
        };
      }

      // Get current block for confirmations
      const currentBlock = await transactionClient.getBlockNumber();
      const confirmedBlocks = currentBlock - receipt.blockNumber;

      let status: 'success' | 'reverted' = receipt.status === 'success' ? 'success' : 'reverted';
      let revertReason: string | undefined;

      if (status === 'reverted') {
        revertReason = 'Transaction reverted (use /check-status for detailed reason)';
      }

      return {
        hash: txHash,
        status: status,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        from: receipt.from,
        to: receipt.to || undefined,
        contractAddress: receipt.contractAddress || undefined,
        logs: receipt.logs,
        logsBloom: receipt.logsBloom,
        transactionIndex: receipt.transactionIndex,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        type: receipt.type,
        confirmations: Number(confirmedBlocks),
        ...(revertReason && { revertReason }),
      };
    } catch (error: any) {
      console.error(`❌ Error getting transaction receipt:`, error);

      if (error.message?.includes('not found') || error.message?.includes('could not be found')) {
        // Transaction might be pending or doesn't exist
        // Try to get the transaction itself
        try {
          const tx = await transactionClient.getTransaction({ hash: txHash });
          if (tx) {
            return {
              hash: txHash,
              status: 'pending',
              from: tx.from,
              to: tx.to || undefined,
            };
          }
        } catch {
          // Transaction doesn't exist
          return {
            hash: txHash,
            status: 'not_found',
          };
        }
      }

      throw error;
    }
  }

  /**
   * Check if a transaction is confirmed with a specific number of blocks
   * 
   * @param txHash - The transaction hash
   * @param requiredConfirmations - Required number of confirmations
   * @returns Boolean indicating if transaction has required confirmations
   */
  async isConfirmed(txHash: Hash, requiredConfirmations: number = 1): Promise<boolean> {
    try {
      const receipt = await transactionClient.getTransactionReceipt({ hash: txHash });
      if (!receipt || receipt.status !== 'success') {
        return false;
      }

      const currentBlock = await transactionClient.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;

      return confirmations >= BigInt(requiredConfirmations);
    } catch {
      return false;
    }
  }
}

export default new TransactionService();

