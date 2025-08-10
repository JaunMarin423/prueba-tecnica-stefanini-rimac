import { handler as getHistory } from '../../src/functions/getHistory/handler';
import { createAPIGatewayEvent, createContext } from './test-utils';
import { setupTestEnvironment } from './setup';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

describe('GET /historial', () => {
  let docClient: DynamoDBDocument;
  
  beforeAll(async () => {
    // Setup test environment and get the DynamoDB client
    const setup = await setupTestEnvironment();
    docClient = setup.docClient;
    
    // Insert test data
    const testItems = [
      {
        PK: 'HISTORY#1',
        SK: '2023-01-01T12:00:00Z',
        type: 'HISTORY',
        data: { action: 'test1' },
        GSI1PK: 'TYPE#HISTORY',
        GSI1SK: '2023-01-01T12:00:00Z',
        ttl: Math.floor(Date.now() / 1000) + 3600
      },
      {
        PK: 'HISTORY#2',
        SK: '2023-01-02T12:00:00Z',
        type: 'HISTORY',
        data: { action: 'test2' },
        GSI1PK: 'TYPE#HISTORY',
        GSI1SK: '2023-01-02T12:00:00Z',
        ttl: Math.floor(Date.now() / 1000) + 3600
      }
    ];
    
    await Promise.all(
      testItems.map(item => 
        docClient.put({
          TableName: 'test-table',
          Item: item
        })
      )
    );
  });
  
  afterAll(async () => {
    // Clean up test data
    try {
      await docClient.scan({
        TableName: 'test-table',
        FilterExpression: 'begins_with(PK, :prefix)',
        ExpressionAttributeValues: {
          ':prefix': 'HISTORY#'
        }
      }).then(async (result) => {
        if (result.Items) {
          await Promise.all(
            result.Items.map(item => 
              docClient.delete({
                TableName: 'test-table',
                Key: {
                  PK: item.PK,
                  SK: item.SK
                }
              })
            )
          );
        }
      });
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });
  
  it('should return history items', async () => {
    const event = createAPIGatewayEvent('GET', '/historial');
    const context = createContext();
    
    // Execute the handler with just the event parameter
    const response = await getHistory(event);
    
    // Verify response is defined and has the expected structure
    expect(response).toBeDefined();
    expect(response).toHaveProperty('statusCode');
    expect(response).toHaveProperty('body');
    
    // Type assertion to tell TypeScript that response is APIGatewayProxyResult
    const typedResponse = response as import('aws-lambda').APIGatewayProxyResult;
    
    expect(typedResponse.statusCode).toBe(200);
    
    const body = JSON.parse(typedResponse.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    
    // Verify the first item has the expected structure
    const firstItem = body[0];
    expect(firstItem).toHaveProperty('id');
    expect(firstItem).toHaveProperty('type');
    expect(firstItem).toHaveProperty('data');
    expect(firstItem).toHaveProperty('createdAt');
  });
  
  it('should support pagination', async () => {
    const event = createAPIGatewayEvent(
      'GET', 
      '/historial', 
      undefined,
      undefined,
      { limit: '1' }
    );
    
    const context = createContext();
    
    // Execute the handler with just the event parameter
    const response = await getHistory(event);
    
    // Verify response is defined and has the expected structure
    expect(response).toBeDefined();
    expect(response).toHaveProperty('statusCode');
    expect(response).toHaveProperty('body');
    
    // Type assertion to tell TypeScript that response is APIGatewayProxyResult
    const typedResponse = response as import('aws-lambda').APIGatewayProxyResult;
    
    expect(typedResponse.statusCode).toBe(200);
    
    const body = JSON.parse(typedResponse.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1); // Should be limited to 1 item
  });
});
