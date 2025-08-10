// src/functions/getCombinedData/handler.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { FusionService, FusedCharacterData, FusedCharacterListResponse } from '../../services/fusion.service';

const fusionService = new FusionService();

/**
 * Lambda handler for GET /fusionados/{characterId?} endpoint
 * Fetches and returns combined character and weather data
 * 
 * @param event - API Gateway event
 * @returns API Gateway response with status code and body
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const characterId = event.pathParameters?.characterId;
    
    // Validate characterId if provided
    if (characterId) {
      const id = parseInt(characterId, 10);
      if (isNaN(id) || id < 1) {
        return {
          statusCode: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          },
          body: JSON.stringify({ 
            success: false, 
            message: 'Invalid character ID. Must be a positive number.' 
          })
        };
      }
    }
    
    // Get the data from the service
    const result = await fusionService.getFusedData(characterId);
    
    // Determine cache headers based on whether the data was cached
    const cacheControl = (result as any)?.metadata?.cached 
      ? 'public, max-age=300' // 5 minutes for cached responses
      : 'no-cache';
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        success: true, 
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          cached: (result as any)?.metadata?.cached || false
        }
      })
    };
    
  } catch (error) {
    console.error('Error in getCombinedData:', error);
    
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    let statusCode = 500;
    
    // Handle 404 for non-existent characters
    if (errorMessage.includes('Not Found') || errorMessage.includes('404')) {
      statusCode = 404;
    }
    // Handle invalid input
    else if (errorMessage.includes('Invalid') || errorMessage.includes('must be')) {
      statusCode = 400;
    }
    
    return {
      statusCode,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        success: false, 
        message: errorMessage,
        requestId: event.requestContext?.requestId || 'unknown'
      })
    };
  }
};