import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../../utils/api-response';
import { DynamoDBService } from '../../services/dynamodb.service';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const data = JSON.parse(event.body);
    
    // Basic validation
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return errorResponse('Invalid data format. Expected a non-empty object.', 400);
    }

    const itemId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const item = {
      PK: `CUSTOM#${itemId}`,
      SK: 'METADATA',
      data,
      type: 'CUSTOM_DATA',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await DynamoDBService.putItem(item);

    return successResponse({
      id: itemId,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  } catch (error) {
    console.error('Error in storeCustomData:', error);
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON format in request body', 400);
    }
    
    if (error instanceof Error) {
      return errorResponse(error.message, 500);
    }
    
    return errorResponse('Internal server error', 500);
  }
};
