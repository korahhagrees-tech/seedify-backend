import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import SnapFactoryAbi from '../abi/snapfactory-abi.json';
import { SNAP_FACTORY_ADDRESS } from '../constants/contracts';


interface SnapshotMintedPayload {
  contractAddress: string;
  seedId: number;
  snapshotId: number;
  beneficiaryCode: string | null;
  beneficiaryDistribution: string | null;
  creator: string;
  txHash: `0x${string}` | undefined;
  timestamp: number;
  blockNumber: number;
  processId: string;
}

interface UseMintSnapshotProps {
  contractAddress: string;
  seedId: number;
  beneficiaryIndex: string;
  snapshotPrice: bigint | undefined;
  beneficiaryCodes: string[];
  snapshots: Array<{
    beneficiaryIndex: number;
    snapshotId: number;
    timestamp: number;
    blockNumber: number;
    owner: string;
  }>;
  creationBlock: number | undefined;
  refreshSnapshots: () => void;
}

interface UseMintSnapshotReturn {
  handleMintSnapshot: () => Promise<void>;
  mintingSnapshot: boolean;
  mintSnapshotTxHash: `0x${string}` | undefined;
  mintSnapshotSuccess: boolean;
  apiLoading: boolean;
  apiError: string | null;
  apiResponse: any;
}

// Internal API route to securely relay snapshot event to external service
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const INTERNAL_SNAPSHOT_WEBHOOK_ROUTE = `${BACKEND_URL}/api/snapshot-minted`;

export function useMintSnapshot({
  contractAddress,
  seedId,
  beneficiaryIndex,
  snapshotPrice,
  beneficiaryCodes,
  snapshots,
  creationBlock,
  refreshSnapshots,
}: UseMintSnapshotProps): UseMintSnapshotReturn {
  const { address } = useAccount();
  const { writeContractAsync: writeSnapshot, isPending: mintingSnapshot } = useWriteContract();
  
  const [mintSnapshotTxHash, setMintSnapshotTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [lastMintTxHash, setLastMintTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isSuccess: mintSnapshotSuccess } = useWaitForTransactionReceipt({ hash: mintSnapshotTxHash });
  const [lastMintedProcessId, setLastMintedProcessId] = useState<string>('');
  const [pendingExternalPost, setPendingExternalPost] = useState(false);
  const [postedSnapshotIds, setPostedSnapshotIds] = useState<number[]>([]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleMintSnapshot = async () => {
    if (!address) {
      setApiError('Connect your wallet to mint a snapshot.');
      return;
    }

    if (beneficiaryIndex === '') return;
    
    try {
      // Generate a unique process ID ONCE and reuse it for both contract call and API call
      const uniqueProcessId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      console.log('Generated process ID for snapshot:', uniqueProcessId);
      console.log('Expected S3 filename:', `snap${seedId}-${snapshots.length + 1}-${uniqueProcessId}.png`);
      
      // Store the process ID for later use in webhook
      setLastMintedProcessId(uniqueProcessId);
      
      // Use wagmi for client-side minting
      const tx = await writeSnapshot({
        address: SNAP_FACTORY_ADDRESS,  
        abi: SnapFactoryAbi,           
        functionName: 'mintSnapshot',
        args: [seedId, Number(beneficiaryIndex), uniqueProcessId, address, address], 
        value: snapshotPrice ?? BigInt(0),
      });
      setMintSnapshotTxHash(tx as `0x${string}`);
      setLastMintTxHash(tx as `0x${string}`);
      
      // Call external API service to activate image rendering
      setApiLoading(true);
      setApiError(null);
      try {
        // Calculate the actual distribution percentage based on current snapshot counts
        const totalSnapshots = snapshots.length;
        const beneficiarySnapshotCount = snapshots.filter(s => s.beneficiaryIndex === Number(beneficiaryIndex)).length;
        const distributionPercentage = totalSnapshots > 0 ? 
          ((beneficiarySnapshotCount + 1) / (totalSnapshots + 1)) * 100 : 100;
        
        // Get the actual beneficiary code from the contract data
        const actualBeneficiaryCode = beneficiaryCodes[Number(beneficiaryIndex)];
        if (!actualBeneficiaryCode) {
          throw new Error('Beneficiary code not found');
        }
        
        // Validate all required fields are present
        if (!contractAddress || !seedId || !address || !tx) {
          throw new Error('Missing required fields for API call');
        }
        
        // Use the SAME process ID that was used in the contract call
        console.log('Using same process ID for API call:', uniqueProcessId);
        
        const response = await fetch(INTERNAL_SNAPSHOT_WEBHOOK_ROUTE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractAddress: contractAddress,
            seedId: seedId,
            snapshotId: snapshots.length + 1, // Estimate next snapshot ID
            beneficiaryCode: actualBeneficiaryCode,
            beneficiaryDistribution: Number(distributionPercentage.toFixed(2)), // Convert to number as API expects
            creator: address,
            txHash: tx,
            timestamp: Math.floor(Date.now() / 1000), // Use seconds to match backend expectations
            blockNumber: creationBlock || 0,
            processId: uniqueProcessId // Use the SAME process ID from the contract call
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiResponse(data);
        } else {
          const errorData = await response.json();
          throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}${errorData.details ? `: ${errorData.details}` : ''}`);
        }
      } catch (err) {
        console.error('Failed to call external API service:', err);
        setApiError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setApiLoading(false);
      }

    } catch (err) {
      // Handle contract call errors
      console.error('Failed to mint snapshot:', err);
    }
  };

  // Handle successful snapshot minting and update the list
  useEffect(() => {
    if (mintSnapshotSuccess) {
      // Reset transaction hash when transaction is complete
      setMintSnapshotTxHash(undefined);
      
      // Refresh snapshots to include the newly minted one
      refreshSnapshots();

      // Flag to send external webhook after snapshots update
      setPendingExternalPost(true);
    }
  }, [mintSnapshotSuccess, refreshSnapshots]);

  // After snapshots refresh, send external webhook with required data
  useEffect(() => {
    const postIfReady = async () => {
      if (!pendingExternalPost || !address) return;
      if (!snapshots || snapshots.length === 0) return;

      // Find the latest snapshot for this seed owned by the current address
      const ownedSnapshots = snapshots.filter((s) => s.owner && s.owner.toLowerCase() === address.toLowerCase());
      if (ownedSnapshots.length === 0) return;

      const latest = ownedSnapshots.reduce((max, s) => (s.snapshotId > max.snapshotId ? s : max), ownedSnapshots[0]);
      if (postedSnapshotIds.includes(latest.snapshotId)) {
        setPendingExternalPost(false);
        return;
      }

      const payload: SnapshotMintedPayload = {
        contractAddress,
        seedId: seedId,
        snapshotId: latest.snapshotId,
        beneficiaryCode: null, // Update with real code if/when available
        beneficiaryDistribution: null, // Update with real distribution if/when available
        creator: address,
        txHash: lastMintTxHash,
        timestamp: latest.timestamp,
        blockNumber: latest.blockNumber,
        processId: lastMintedProcessId,
      };

      console.log('Webhook payload using process ID:', lastMintedProcessId);
      console.log('Full webhook payload:', payload);

      try {
        await fetch(INTERNAL_SNAPSHOT_WEBHOOK_ROUTE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setPostedSnapshotIds((prev: number[]) => [...prev, latest.snapshotId]);
      } catch (err) {
        console.error('Failed to POST snapshot-minted webhook:', err);
      } finally {
        setPendingExternalPost(false);
      }
    };

    postIfReady();
  }, [pendingExternalPost, snapshots, address, contractAddress, seedId, lastMintTxHash, postedSnapshotIds, lastMintedProcessId]);

  return {
    handleMintSnapshot,
    mintingSnapshot,
    mintSnapshotTxHash,
    mintSnapshotSuccess,
    apiLoading,
    apiError,
    apiResponse,
  };
}
