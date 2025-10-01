"use strict";
// Configuration flags for the WayOfFlowers dapp
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERCEL_BLOB_STORAGE_URL = exports.REQUIRE_ADMIN_AUTH = void 0;
// Set this to true to require admin authentication for admin pages
// Set this to false to allow anyone to access admin pages (for development/testing)
exports.REQUIRE_ADMIN_AUTH = false;
// Storage base URL - can be overridden by environment variable
exports.VERCEL_BLOB_STORAGE_URL = process.env.VERCEL_BLOB_STORAGE_URL || 'https://wof-flourishing-backup.s3.amazonaws.com';
