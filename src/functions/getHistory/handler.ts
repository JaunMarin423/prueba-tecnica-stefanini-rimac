import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse, getPaginationParams } from '../../utils/api-response';
import { DynamoDBService } from '../../services/dynamodb.service';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { limit } = getPaginationParams(event);
    
    // Get history items using the DynamoDBService instance
    const items = await DynamoDBService.getInstance().queryItems('HISTORY', limit);
    
    // Format the response
    const formattedItems = items.map(item => ({
      id: item.PK.replace('HISTORY#', ''),
      ...item.data,
      createdAt: item.createdAt,
    }));
    
    return successResponse({
      items: formattedItems,
      count: formattedItems.length,
    });
  } catch (error) {
    console.error('Error in getHistory:', error);
    
    if (error instanceof Error) {
      return errorResponse(error.message, 500);
    }
    
    return errorResponse('Internal server error', 500);
  }
};
