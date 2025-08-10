import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse, getPaginationParams } from '../../utils/api-response';
import { DynamoDBService } from '../../services/dynamodb.service';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { limit, nextToken } = getPaginationParams(event);
    
    // Query history items from DynamoDB
    const result = await DynamoDBService.queryByType(
      'HISTORY',
      limit,
      nextToken
    );
    
    // Format the response
    const items = result.items.map(item => ({
      id: item.SK.replace('CUSTOM#', ''),
      ...item.data,
      createdAt: item.createdAt,
    }));
    
    return successResponse({
      items,
      nextToken: result.nextToken,
      count: items.length,
    });
  } catch (error) {
    console.error('Error in getHistory:', error);
    
    if (error instanceof Error) {
      return errorResponse(error.message, 500);
    }
    
    return errorResponse('Internal server error', 500);
  }
};
