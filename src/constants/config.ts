// Configuration flags for the WayOfFlowers dapp

// Set this to true to require admin authentication for admin pages
// Set this to false to allow anyone to access admin pages (for development/testing)
export const REQUIRE_ADMIN_AUTH = false;

// Storage base URL - can be overridden by environment variable
export const VERCEL_BLOB_STORAGE_URL = process.env.VERCEL_BLOB_STORAGE_URL || 'https://d17wy07434ngk.cloudfront.net'; 