import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Initialize cache with default TTL
const cache = new NodeCache({
  stdTTL: 60, // Default 60 seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Don't clone data (better performance)
});

/**
 * Generate ETag from response data
 */
const generateETag = (data: any): string => {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `"${hash}"`;
};

/**
 * Cache middleware with ETag support
 * @param ttl Time to live in seconds
 * @param keyPrefix Prefix for cache key
 */
export const cacheMiddleware = (ttl: number = 60, keyPrefix: string = '') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `${keyPrefix}${req.originalUrl || req.url}`;
    
    // Check if data is in cache
    const cachedData = cache.get<any>(cacheKey);
    
    if (cachedData) {
      // Generate ETag from cached data
      const etag = generateETag(cachedData);
      
      // Check if client has a matching ETag
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        // Data unchanged, return 304 Not Modified
        res.status(304).end();
        return;
      }
      
      // Return cached data with ETag
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', `public, max-age=${ttl}`);
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Data not in cache, intercept response
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      // Cache the response data
      cache.set(cacheKey, data, ttl);
      
      // Generate and set ETag
      const etag = generateETag(data);
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', `public, max-age=${ttl}`);
      res.setHeader('X-Cache', 'MISS');
      
      // Send the response
      return originalJson(data);
    };

    next();
  };
};

/**
 * Clear cache by pattern
 */
export const clearCache = (pattern?: string): void => {
  if (pattern) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    matchingKeys.forEach(key => cache.del(key));
    console.log(`Cache cleared: ${matchingKeys.length} keys matching "${pattern}"`);
  } else {
    cache.flushAll();
    console.log('Cache cleared: all keys');
  }
};

/**
 * Clear specific cache key
 */
export const clearCacheKey = (key: string): void => {
  cache.del(key);
  console.log(`Cache cleared: ${key}`);
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return cache.getStats();
};

/**
 * Cache invalidation middleware for write operations
 */
export const invalidateCacheMiddleware = (patterns: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to clear cache after successful response
    res.json = function(data: any) {
      // Only clear cache on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(pattern => clearCache(pattern));
      }
      return originalJson(data);
    };
    
    next();
  };
};

export default cache;

