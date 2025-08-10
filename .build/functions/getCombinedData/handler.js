"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const fusion_service_1 = require("../../services/fusion.service");
const fusionService = new fusion_service_1.FusionService();
const handler = async (event) => {
    try {
        const characterId = event.pathParameters?.characterId;
        if (!characterId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Character ID is required' })
            };
        }
        const result = await fusionService.getFusedData(characterId);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, data: result })
        };
    }
    catch (error) {
        console.error('Error in getCombinedData:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error })
        };
    }
};
exports.handler = handler;
