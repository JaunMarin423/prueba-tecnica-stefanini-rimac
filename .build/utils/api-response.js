"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, statusCode = 200) => ({
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
        success: true,
        data,
    }),
});
exports.successResponse = successResponse;
const errorResponse = (message, statusCode = 500, errors) => ({
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
        success: false,
        message,
        ...(errors && { errors }),
    }),
});
exports.errorResponse = errorResponse;
const getPaginationParams = (event) => {
    const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit, 10) : 10;
    const nextToken = event.queryStringParameters?.nextToken;
    return {
        limit: Math.min(limit, 100), // Cap at 100 items per page
        nextToken,
    };
};
exports.getPaginationParams = getPaginationParams;
