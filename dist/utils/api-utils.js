"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
exports.createNotFoundResponse = createNotFoundResponse;
exports.createUnauthorizedResponse = createUnauthorizedResponse;
const server_1 = require("next/server");
function createSuccessResponse(data, message) {
    return server_1.NextResponse.json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
    }, { status: 200 });
}
function createErrorResponse(error, status = 400, message) {
    return server_1.NextResponse.json({
        success: false,
        error,
        message,
        timestamp: new Date().toISOString(),
    }, { status });
}
function createNotFoundResponse(resource) {
    return server_1.NextResponse.json({
        success: false,
        error: `${resource} not found`,
        timestamp: new Date().toISOString(),
    }, { status: 404 });
}
function createUnauthorizedResponse() {
    return server_1.NextResponse.json({
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
    }, { status: 401 });
}
