"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const api_response_1 = require("../../utils/api-response");
const dynamodb_service_1 = require("../../services/dynamodb.service");
const handler = async (event) => {
    try {
        const { limit, nextToken } = (0, api_response_1.getPaginationParams)(event);
        // Query history items from DynamoDB
        const result = await dynamodb_service_1.DynamoDBService.queryByType('HISTORY', limit, nextToken);
        // Format the response
        const items = result.items.map(item => ({
            id: item.SK.replace('CUSTOM#', ''),
            ...item.data,
            createdAt: item.createdAt,
        }));
        return (0, api_response_1.successResponse)({
            items,
            nextToken: result.nextToken,
            count: items.length,
        });
    }
    catch (error) {
        console.error('Error in getHistory:', error);
        if (error instanceof Error) {
            return (0, api_response_1.errorResponse)(error.message, 500);
        }
        return (0, api_response_1.errorResponse)('Internal server error', 500);
    }
};
exports.handler = handler;
