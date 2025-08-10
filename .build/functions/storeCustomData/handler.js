"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const uuid_1 = require("uuid");
const api_response_1 = require("../../utils/api-response");
const dynamodb_service_1 = require("../../services/dynamodb.service");
const handler = async (event) => {
    try {
        if (!event.body) {
            return (0, api_response_1.errorResponse)('Request body is required', 400);
        }
        const data = JSON.parse(event.body);
        // Basic validation
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
            return (0, api_response_1.errorResponse)('Invalid data format. Expected a non-empty object.', 400);
        }
        const itemId = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        const item = {
            PK: `CUSTOM#${itemId}`,
            SK: 'METADATA',
            data,
            type: 'CUSTOM_DATA',
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        await dynamodb_service_1.DynamoDBService.putItem(item);
        return (0, api_response_1.successResponse)({
            id: itemId,
            ...data,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
    }
    catch (error) {
        console.error('Error in storeCustomData:', error);
        if (error instanceof SyntaxError) {
            return (0, api_response_1.errorResponse)('Invalid JSON format in request body', 400);
        }
        if (error instanceof Error) {
            return (0, api_response_1.errorResponse)(error.message, 500);
        }
        return (0, api_response_1.errorResponse)('Internal server error', 500);
    }
};
exports.handler = handler;
