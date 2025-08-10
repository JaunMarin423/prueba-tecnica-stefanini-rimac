import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBService } from '../../services/dynamodb.service';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    // Get all cached items
    const cachedItems = await DynamoDBService.getInstance().scanItems(100);
    
    // Get history items
    const historyItems = await DynamoDBService.getInstance().queryItems('HISTORY', 100);

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
  } catch (error: unknown) {
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
