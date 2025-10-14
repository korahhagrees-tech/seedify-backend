/**
 * Utility functions for ETH value conversions
 */

/**
 * Convert wei to ETH with proper decimal handling
 * Automatically determines the right number of decimals (up to 18)
 * Removes trailing zeros for cleaner display
 * 
 * @param weiValue - Value in wei (as string, number, or bigint)
 * @param minDecimals - Minimum decimals to show (default: 0)
 * @param maxDecimals - Maximum decimals to show (default: 18)
 * @returns ETH value as string with appropriate decimals
 */
export function weiToEth(
  weiValue: string | number | bigint,
  minDecimals: number = 0,
  maxDecimals: number = 18
): string {
  const weiNum = typeof weiValue === 'bigint' ? Number(weiValue) : Number(weiValue);
  
  if (isNaN(weiNum) || weiNum === 0) {
    return '0';
  }

  // Convert wei to ETH (divide by 10^18)
  const ethValue = weiNum / Math.pow(10, 18);
  
  // Convert to string with full precision
  const ethString = ethValue.toFixed(maxDecimals);
  
  // Remove trailing zeros
  let result = ethString.replace(/\.?0+$/, '');
  
  // Ensure minimum decimals if specified
  if (minDecimals > 0 && !result.includes('.')) {
    result += '.' + '0'.repeat(minDecimals);
  } else if (minDecimals > 0 && result.includes('.')) {
    const currentDecimals = result.split('.')[1].length;
    if (currentDecimals < minDecimals) {
      result += '0'.repeat(minDecimals - currentDecimals);
    }
  }
  
  return result;
}

/**
 * Convert wei to ETH keeping all significant digits (no truncation)
 * Best for displaying exact values
 */
export function weiToEthExact(weiValue: string | number | bigint): string {
  return weiToEth(weiValue, 0, 18);
}

/**
 * Convert wei to ETH with minimum 6 decimals for consistency
 * Use for most display purposes
 */
export function weiToEthDisplay(weiValue: string | number | bigint): string {
  return weiToEth(weiValue, 6, 18);
}

/**
 * Generate snapshot image URL from base URL, seedId, snapshotId, and processId
 * Pattern: {baseUrl}/seed{seedId}/snap{seedId}-{snapshotId}-{processId}.png
 * 
 * @param baseUrl - Base URL for images (e.g., from env variable)
 * @param seedId - The seed ID
 * @param snapshotId - The snapshot ID (positionInSeed)
 * @param processId - The unique process ID
 * @returns Full image URL
 */
export function generateSnapshotImageUrl(
  baseUrl: string,
  seedId: number,
  snapshotId: number,
  processId: string
): string {
  // Remove trailing slash from baseUrl if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}/seed${seedId}/snap${seedId}-${snapshotId}-${processId}.png`;
}

/**
 * Format seed number with leading zeros (e.g., 1 -> "001")
 */
export function formatSeedNumber(seedId: number, padding: number = 3): string {
  return seedId.toString().padStart(padding, '0');
}

