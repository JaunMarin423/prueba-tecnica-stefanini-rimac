import { APIGatewayProxyResult } from 'aws-lambda';

export const successResponse = <T>(data: T, statusCode = 200): APIGatewayProxyResult => ({
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

export const errorResponse = (
  message: string,
  statusCode = 500,
  errors?: Record<string, string[]>,
): APIGatewayProxyResult => ({
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

import { APIGatewayProxyEvent } from 'aws-lambda';

export const getPaginationParams = (event: APIGatewayProxyEvent) => {
  const limit = event.queryStringParameters?.limit 
    ? parseInt(event.queryStringParameters.limit, 10) 
    : 10;
  
  const nextToken = event.queryStringParameters?.nextToken;
  
  return {
    limit: Math.min(limit, 100), // Cap at 100 items per page
    nextToken: nextToken || undefined, // Ensure nextToken is undefined instead of null
  };
};
