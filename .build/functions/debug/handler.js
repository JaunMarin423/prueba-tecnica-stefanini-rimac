"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamodb_service_1 = require("../../services/dynamodb.service");
const handler = async () => {
    try {
        // Get all cached items
        const { items: cachedItems } = await dynamodb_service_1.DynamoDBService.scanTable(100);
        // Get history items
        const { items: historyItems } = await dynamodb_service_1.DynamoDBService.queryByType('HISTORY', 100);
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                cacheStats: {
                    totalCachedItems: cachedItems.length,
                    totalHistoryItems: historyItems.length,
                    cacheItems: cachedItems,
                    historyItems: historyItems
                }
            })
        };
    }
    catch (error) {
        console.error('Debug error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: 'Error al obtener el contenido de la caché',
                error: errorMessage
            })
        };
    }
};
exports.handler = handler;
