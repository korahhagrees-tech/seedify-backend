# 🌱 Seed Creation Backend System - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Complete Flow Diagram](#complete-flow-diagram)
5. [Frontend Integration](#frontend-integration)
6. [Code Examples](#code-examples)
7. [Error Handling](#error-handling)
8. [Cache Management](#cache-management)

---

## Overview

The **Seed Creation Backend System** provides a comprehensive, lightweight API for creating seeds on the Way of Flowers platform. The backend handles all heavy lifting including:

✅ **Contract data fetching** - Prices, fees, beneficiaries  
✅ **Validation** - Pre-flight checks and access control  
✅ **Cost calculations** - Automatic fee and deposit breakdown  
✅ **Beneficiary management** - Active beneficiaries only  
✅ **Post-creation webhooks** - Image generation, notifications  
✅ **Cache management** - Automatic invalidation on changes  

**Result:** Frontend only needs to make simple API calls and execute contract transactions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  (React/Next.js - Lightweight)                                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ [1] GET /api/write/seeds/prepare/:address
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND API                               │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  prepareSeedCreation()                                 │   │
│  │  • Fetches seed price, fee, limits                     │   │
│  │  • Checks factory lock status                          │   │
│  │  • Validates user permissions                          │   │
│  │  • Filters active beneficiaries                        │   │
│  │  • Calculates cost breakdown                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ Returns complete data
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND                                   │
│  • Displays seed creation modal                                │
│  • Pre-fills data from backend                                 │
│  • User confirms and signs transaction                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ [2] Wallet executes createSeed()
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN                                   │
│  • Transaction confirmed                                        │
│  • Seed NFT minted                                              │
│  • Funds deposited to Aave                                      │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ [3] POST /api/seed-created (webhook)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND API                               │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  seedCreated()                                         │   │
│  │  • Logs seed creation                                  │   │
│  │  • Triggers image generation                           │   │
│  │  • Sends notifications (future)                        │   │
│  │  • Clears caches (seeds, users)                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Prepare Seed Creation (Primary Endpoint)

**Endpoint:** `GET /api/write/seeds/prepare/:address`

**Purpose:** Fetches all necessary data for seed creation in a single call

**Parameters:**
- `address` (path) - User's Ethereum address (0x...)

**Response:**
```json
{
  "success": true,
  "data": {
    "contractAddress": "0xSeedFactoryAddress",
    
    "seedPrice": "0.048",
    "seedFee": "500",
    "feeAmount": "0.002400000000000000",
    "totalMinimumCost": "0.050400000000000000",
    "defaultSnapshotPrice": "0.011",
    
    "canMint": true,
    "isLocked": false,
    "seederAllowance": "0",
    
    "currentSeedCount": 42,
    "maxSeeds": 1000,
    "seedCapReached": false,
    
    "activeBeneficiaries": [
      {
        "index": 0,
        "name": "Grgich Hills Estate",
        "code": "01-GRG",
        "address": "0x..."
      },
      // ... more beneficiaries
    ],
    "beneficiaryCount": 8,
    
    "recommendations": {
      "minimumPayment": "0.050400000000000000",
      "suggestedPayment": "0.055440000000000000",
      "maxBeneficiaries": 4
    },
    
    "validation": {
      "snapshotPriceMin": "0.011",
      "locationRequired": true,
      "beneficiariesRequired": 4,
      "addressFormat": "0x + 40 hex characters"
    }
  },
  "message": "Ready to create seed",
  "timestamp": 1760479789878
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid address",
  "message": "Please provide a valid Ethereum address",
  "timestamp": 1760479789878
}
```

**Cache:** 15 seconds (uses cache middleware)

---

### 2. Validate Seed Creation (Optional Pre-flight)

**Endpoint:** `POST /api/write/seeds/validate`

**Purpose:** Validates all parameters before user signs transaction

**Request Body:**
```json
{
  "recipient": "0x742d35Cc6634C0532925a3b844BC454e4438f44e",
  "snapshotPrice": "0.011",
  "beneficiaryIndices": [4, 1, 2, 5],
  "paymentAmount": "0.06"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "errors": [],
  "warnings": [
    "Extra 0.009600000000000000 ETH will be deposited to Aave for yield generation"
  ],
  "breakdown": {
    "payment": "0.06",
    "fee": "0.002400000000000000",
    "deposit": "0.057600000000000000",
    "perBeneficiary": "0.014400000000000000"
  },
  "timestamp": 1760479789878
}
```

**Error Example:**
```json
{
  "success": true,
  "valid": false,
  "errors": [
    "Invalid recipient address format",
    "Snapshot price must be at least 0.011 ETH",
    "Beneficiary index 99 not found"
  ],
  "warnings": [],
  "breakdown": {
    "payment": "0.06",
    "fee": "0.002400000000000000",
    "deposit": "0.057600000000000000",
    "perBeneficiary": "0.014400000000000000"
  },
  "timestamp": 1760479789878
}
```

---

### 3. Seed Created Webhook

**Endpoint:** `POST /api/seed-created`

**Purpose:** Called after seed is successfully created (post-transaction)

**Request Body:**
```json
{
  "seedId": 43,
  "creator": "0xCreatorAddress",
  "recipient": "0xRecipientAddress",
  "depositAmount": "0.0576",
  "snapshotPrice": "0.011",
  "location": "berlin",
  "beneficiaries": [4, 1, 2, 5],
  "txHash": "0xTransactionHash",
  "blockNumber": 12345678,
  "timestamp": 1760479789
}
```

**Response:**
```json
{
  "success": true,
  "message": "Seed creation recorded successfully",
  "data": {
    "seedId": 43,
    "processed": true
  },
  "timestamp": 1760479789878
}
```

**Actions Triggered:**
- ✅ Clears seed and user caches
- ✅ Logs creation event
- ⏳ Triggers image generation (future)
- ⏳ Sends notification emails (future)
- ⏳ Updates analytics dashboard (future)

---

## Complete Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                    STEP 1: PREPARE SEED CREATION                   │
└────────────────────────────────────────────────────────────────────┘

Frontend:
  const userAddress = "0x742d35...";
  
  const response = await fetch(
    `${API_URL}/api/write/seeds/prepare/${userAddress}`
  );
  
  const data = await response.json();

Backend Process:
  ├─ Fetches seed price from contract             → 0.048 ETH
  ├─ Fetches seed fee from contract               → 500 (5%)
  ├─ Calculates fee amount                        → 0.0024 ETH
  ├─ Calculates total minimum cost                → 0.0504 ETH
  ├─ Fetches default snapshot price               → 0.011 ETH
  ├─ Gets current seed count                      → 42
  ├─ Gets max seeds limit                         → 1000
  ├─ Checks factory lock status                   → false
  ├─ Gets seeder allowance for user               → 0
  ├─ Determines if user can mint                  → true
  ├─ Fetches all beneficiaries                    → 8 total
  ├─ Filters to active beneficiaries only         → 8 active
  └─ Returns complete data package

Frontend receives:
  {
    seedPrice, seedFee, totalMinimumCost,
    activeBeneficiaries, canMint, validation rules, etc.
  }

┌────────────────────────────────────────────────────────────────────┐
│                   STEP 2: USER INTERACTION                         │
└────────────────────────────────────────────────────────────────────┘

Frontend displays modal:
  ┌──────────────────────────────────────────┐
  │  Create Seed                             │
  │                                          │
  │  Snapshot Price: [0.011 ETH]            │
  │  Recipient: [0x742d35...] [Use Mine]    │
  │  Location: [berlin]                      │
  │                                          │
  │  Beneficiaries (select 4):               │
  │  ☑ Walkers Reserve (index 4)            │
  │  ☑ El Globo Habitat (index 1)           │
  │  ☑ Jaguar Stewardship (index 2)         │
  │  ☑ Pimlico Farm (index 5)               │
  │                                          │
  │  Cost Breakdown:                         │
  │  • Seed Price: 0.048 ETH                │
  │  • Fee (5%): 0.0024 ETH                 │
  │  • Total: 0.0504 ETH                    │
  │                                          │
  │  [Cancel]  [Confirm & Mint]             │
  └──────────────────────────────────────────┘

Optional validation (instant feedback):
  await fetch(`${API_URL}/api/write/seeds/validate`, {
    method: 'POST',
    body: JSON.stringify({
      recipient: selectedRecipient,
      snapshotPrice: snapshotPriceInput,
      beneficiaryIndices: selectedBeneficiaries,
      paymentAmount: userPaymentAmount
    })
  });
  
  → Validates immediately, shows errors/warnings

┌────────────────────────────────────────────────────────────────────┐
│                  STEP 3: EXECUTE TRANSACTION                       │
└────────────────────────────────────────────────────────────────────┘

Frontend calls contract:
  const tx = await writeContract({
    address: data.contractAddress,
    abi: SeedFactoryABI,
    functionName: 'createSeed',
    args: [
      recipientAddress,                    // 0x742d35...
      parseEther(snapshotPrice),          // 11000000000000000 wei
      location,                            // "berlin"
      [4, 1, 2, 5]                        // beneficiary indices
    ],
    value: parseEther("0.0504")           // minimum cost
  });

Blockchain processes:
  ├─ Validates inputs
  ├─ Checks access control
  ├─ Mints Seed NFT #43
  ├─ Sets snapshot price
  ├─ Updates beneficiary tracking
  ├─ Deposits 0.048 ETH to Aave
  ├─ Transfers 0.0024 ETH fee
  └─ Emits SeedCreated event

Transaction confirmed:
  • Seed #43 minted
  • Owner: 0x742d35...
  • Deposit: 0.048 ETH in Aave
  • Fee collected: 0.0024 ETH

┌────────────────────────────────────────────────────────────────────┐
│                   STEP 4: POST-CREATION WEBHOOK                    │
└────────────────────────────────────────────────────────────────────┘

Frontend calls webhook:
  const webhookResponse = await fetch(
    `${API_URL}/api/seed-created`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seedId: 43,
        creator: address,
        recipient: recipientAddress,
        depositAmount: "0.048",
        snapshotPrice: "0.011",
        location: "berlin",
        beneficiaries: [4, 1, 2, 5],
        txHash: tx,
        blockNumber: currentBlock,
        timestamp: Math.floor(Date.now() / 1000)
      })
    }
  );

Backend processes:
  ├─ Validates webhook data
  ├─ Logs seed creation
  ├─ Clears seeds cache (all endpoints)
  ├─ Clears users cache (for creator & recipient)
  ├─ [Future] Triggers image generation
  ├─ [Future] Sends notification email
  └─ Returns success

Frontend updates:
  ├─ Shows success message
  ├─ Displays transaction hash
  ├─ Refreshes seed list
  └─ New seed #43 appears in gallery

═══════════════════════════════════════════════════════════════════
                           COMPLETE!
═══════════════════════════════════════════════════════════════════
```

---

## Frontend Integration

### React/Next.js Example

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import SeedFactoryABI from '@/abi/seedfactory-abi.json';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateSeedPage() {
  const { address } = useAccount();
  const [seedData, setSeedData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [recipient, setRecipient] = useState('');
  const [snapshotPrice, setSnapshotPrice] = useState('');
  const [location, setLocation] = useState('berlin');
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<number[]>([]);
  
  const { writeContract, data: txHash } = useWriteContract();
  const { isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash: txHash });

  // STEP 1: Fetch seed creation data
  useEffect(() => {
    if (!address) return;
    
    const fetchSeedData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/write/seeds/prepare/${address}`
        );
        const data = await response.json();
        
        if (data.success) {
          setSeedData(data.data);
          // Pre-fill defaults
          setRecipient(address);
          setSnapshotPrice(data.data.defaultSnapshotPrice);
        }
      } catch (error) {
        console.error('Failed to fetch seed data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeedData();
  }, [address]);

  // STEP 2: Handle seed creation
  const handleCreateSeed = async () => {
    if (!seedData || selectedBeneficiaries.length !== 4) {
      alert('Please select exactly 4 beneficiaries');
      return;
    }

    try {
      // Execute contract transaction
      await writeContract({
        address: seedData.contractAddress as `0x${string}`,
        abi: SeedFactoryABI,
        functionName: 'createSeed',
        args: [
          recipient as `0x${string}`,
          parseEther(snapshotPrice),
          location,
          selectedBeneficiaries.map(BigInt)
        ],
        value: parseEther(seedData.totalMinimumCost)
      });
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  // STEP 3: Handle transaction success
  useEffect(() => {
    if (!isSuccess || !receipt || !seedData) return;

    const sendWebhook = async () => {
      try {
        // Get seed ID from transaction logs
        const seedCreatedLog = receipt.logs.find(
          log => log.topics[0] === '0x...' // SeedCreated event signature
        );
        
        const seedId = parseInt(seedCreatedLog?.topics[1] || '0', 16);
        
        // Call webhook
        await fetch(`${API_URL}/api/seed-created`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seedId,
            creator: address,
            recipient: recipient,
            depositAmount: seedData.seedPrice,
            snapshotPrice: snapshotPrice,
            location: location,
            beneficiaries: selectedBeneficiaries,
            txHash: txHash,
            blockNumber: receipt.blockNumber,
            timestamp: Math.floor(Date.now() / 1000)
          })
        });
        
        alert('Seed created successfully!');
      } catch (error) {
        console.error('Webhook failed:', error);
      }
    };

    sendWebhook();
  }, [isSuccess, receipt]);

  if (loading) return <div>Loading...</div>;
  if (!seedData) return <div>Connect wallet to create seed</div>;
  if (!seedData.canMint) return <div>Cannot mint: {seedData.message}</div>;

  return (
    <div>
      <h1>Create Seed</h1>
      
      {/* Snapshot Price */}
      <input
        type="text"
        value={snapshotPrice}
        onChange={(e) => setSnapshotPrice(e.target.value)}
        placeholder="Snapshot Price (ETH)"
      />
      
      {/* Recipient */}
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient Address"
      />
      <button onClick={() => setRecipient(address)}>Use My Address</button>
      
      {/* Location */}
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
      />
      
      {/* Beneficiaries */}
      <h3>Select 4 Beneficiaries:</h3>
      {seedData.activeBeneficiaries.map((ben: any) => (
        <label key={ben.index}>
          <input
            type="checkbox"
            checked={selectedBeneficiaries.includes(ben.index)}
            onChange={(e) => {
              if (e.target.checked) {
                if (selectedBeneficiaries.length < 4) {
                  setSelectedBeneficiaries([...selectedBeneficiaries, ben.index]);
                }
              } else {
                setSelectedBeneficiaries(
                  selectedBeneficiaries.filter(i => i !== ben.index)
                );
              }
            }}
            disabled={
              selectedBeneficiaries.length >= 4 &&
              !selectedBeneficiaries.includes(ben.index)
            }
          />
          {ben.name} ({ben.code})
        </label>
      ))}
      
      {/* Cost Breakdown */}
      <div>
        <h3>Cost Breakdown:</h3>
        <p>Seed Price: {seedData.seedPrice} ETH</p>
        <p>Fee ({seedData.seedFee / 100}%): {seedData.feeAmount} ETH</p>
        <p><strong>Total: {seedData.totalMinimumCost} ETH</strong></p>
      </div>
      
      {/* Create Button */}
      <button
        onClick={handleCreateSeed}
        disabled={selectedBeneficiaries.length !== 4}
      >
        Create Seed
      </button>
    </div>
  );
}
```

---

## Code Examples

### Simple Fetch Example

```typescript
// Fetch seed creation data
const response = await fetch(
  `https://api.seedify.com/api/write/seeds/prepare/0x742d35Cc6634C0532925a3b844BC454e4438f44e`
);

const data = await response.json();

console.log('Can mint:', data.data.canMint);
console.log('Total cost:', data.data.totalMinimumCost, 'ETH');
console.log('Active beneficiaries:', data.data.beneficiaryCount);
```

### Validation Example

```typescript
// Validate before submitting
const validation = await fetch(
  'https://api.seedify.com/api/write/seeds/validate',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: '0x742d35Cc6634C0532925a3b844BC454e4438f44e',
      snapshotPrice: '0.011',
      beneficiaryIndices: [4, 1, 2, 5],
      paymentAmount: '0.06'
    })
  }
);

const result = await validation.json();

if (!result.valid) {
  console.error('Validation errors:', result.errors);
} else {
  console.log('Valid! Breakdown:', result.breakdown);
}
```

### Webhook Example

```typescript
// After transaction confirms
await fetch('https://api.seedify.com/api/seed-created', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    seedId: 43,
    creator: '0xCreatorAddress',
    recipient: '0xRecipientAddress',
    depositAmount: '0.048',
    snapshotPrice: '0.011',
    location: 'berlin',
    beneficiaries: [4, 1, 2, 5],
    txHash: '0xTransactionHash',
    blockNumber: 12345678,
    timestamp: Math.floor(Date.now() / 1000)
  })
});
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid address` | Address format wrong | Ensure address is 42 chars (0x + 40 hex) |
| `Factory locked - user not authorized` | Factory is locked | User needs seeder allowance or wait for unlock |
| `Seed cap reached` | Max seeds minted | Wait for admin to increase maxSeeds |
| `Beneficiary index X not found` | Invalid beneficiary | Use beneficiaries from prepareSeedCreation |
| `Snapshot price must be at least X ETH` | Price too low | Use defaultSnapshotPrice or higher |
| `Payment below minimum` | Insufficient ETH | Send at least totalMinimumCost |

### Error Response Format

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": 1760479789878
}
```

### Handling Errors in Frontend

```typescript
try {
  const response = await fetch(`${API_URL}/api/write/seeds/prepare/${address}`);
  const data = await response.json();
  
  if (!data.success) {
    // Handle API error
    console.error('API Error:', data.error, data.message);
    alert(data.message);
    return;
  }
  
  // Success - use data
  setSeedData(data.data);
} catch (error) {
  // Handle network error
  console.error('Network Error:', error);
  alert('Failed to connect to API');
}
```

---

## Cache Management

### Automatic Cache Invalidation

The seed creation webhook automatically clears relevant caches:

```typescript
// When POST /api/seed-created is called:
invalidateCacheMiddleware(['seeds:', 'users:'])

// This clears:
// - seeds:all:/api/seeds
// - seeds:detail:/api/seeds/43
// - seeds:stats:/api/seeds/43/stats
// - users:seeds:/api/users/0x.../seeds
// - users:portfolio:/api/users/0x.../portfolio
// etc.
```

### Cache Durations

| Endpoint | Cache TTL | Notes |
|----------|-----------|-------|
| `prepareSeedCreation` | 15 seconds | User data changes with transactions |
| `validateSeedCreation` | No cache | Always fresh validation |
| `seedCreated` | No cache | Webhook, no caching |

### Manual Cache Clear

If needed, the backend can manually clear caches:

```typescript
import { clearCache } from './middleware/cache';

// Clear all seed-related caches
clearCache('seeds:');

// Clear specific user cache
clearCache(`users:${userAddress}`);

// Clear everything
clearCache();
```

---

## Testing

### Test Preparation Endpoint

```bash
curl https://api.seedify.com/api/write/seeds/prepare/0x742d35Cc6634C0532925a3b844BC454e4438f44e
```

Expected response:
```json
{
  "success": true,
  "data": {
    "canMint": true,
    "seedPrice": "0.048",
    "totalMinimumCost": "0.0504",
    "activeBeneficiaries": [ ... ]
  }
}
```

### Test Validation

```bash
curl -X POST https://api.seedify.com/api/write/seeds/validate \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "0x742d35Cc6634C0532925a3b844BC454e4438f44e",
    "snapshotPrice": "0.011",
    "beneficiaryIndices": [4, 1, 2, 5],
    "paymentAmount": "0.06"
  }'
```

### Test Webhook

```bash
curl -X POST https://api.seedify.com/api/seed-created \
  -H "Content-Type: application/json" \
  -d '{
    "seedId": 43,
    "creator": "0xCreatorAddress",
    "recipient": "0xRecipientAddress",
    "depositAmount": "0.048",
    "snapshotPrice": "0.011",
    "location": "berlin",
    "beneficiaries": [4, 1, 2, 5],
    "txHash": "0xTransactionHash",
    "blockNumber": 12345678,
    "timestamp": 1760479789
  }'
```

---

## Performance Metrics

### Response Times

| Endpoint | Typical Response Time |
|----------|----------------------|
| `prepareSeedCreation` (cold) | 2-3 seconds |
| `prepareSeedCreation` (cached) | 10-50 ms |
| `validateSeedCreation` | 1-2 seconds |
| `seedCreated` (webhook) | 50-200 ms |

### Optimization Features

✅ **Parallel contract calls** - All data fetched simultaneously  
✅ **Server-side caching** - 15 second cache for preparation data  
✅ **ETag support** - 304 responses save bandwidth  
✅ **Retry logic** - Automatic retries on RPC failures  
✅ **Rate limit handling** - Exponential backoff  

---

## Summary

### What Frontend Does (Simple!)

1. ✅ Fetch seed data: `GET /api/write/seeds/prepare/:address`
2. ✅ Display form with pre-filled data
3. ✅ Optional: Validate inputs: `POST /api/write/seeds/validate`
4. ✅ Execute contract transaction (Wagmi/viem)
5. ✅ Call webhook: `POST /api/seed-created`
6. ✅ Show success message

### What Backend Handles (Complex!)

1. ✅ Fetches all contract data (8 contract calls in parallel)
2. ✅ Calculates costs and fees
3. ✅ Validates user permissions
4. ✅ Filters active beneficiaries
5. ✅ Provides validation rules
6. ✅ Processes post-creation webhook
7. ✅ Manages cache invalidation
8. ✅ Handles errors gracefully

**Result:** Frontend is lightweight, backend is robust! 🚀

---

**Generated:** 2025-10-17  
**Version:** 1.0  
**Author:** Seedify Backend Team  
**Network:** Base Mainnet (Chain ID: 8453)

