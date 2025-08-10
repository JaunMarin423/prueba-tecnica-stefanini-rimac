import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export type ApiGatewayEvent = Omit<APIGatewayProxyEvent, 'pathParameters' | 'queryStringParameters'> & {
  pathParameters: { [name: string]: string } | null;
  queryStringParameters: { [name: string]: string } | null;
};

export type ApiHandler = (
  event: ApiGatewayEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

export interface ApiResponse extends Omit<APIGatewayProxyResult, 'body'> {
  body: string;
}

export interface PaginationParams {
  limit: number;
  nextToken?: string;
}
