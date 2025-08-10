// Enable debug logging for AWS SDK
process.env.DEBUG = 'aws-sdk:*';

import { handler as storeCustomData } from '../../src/functions/storeCustomData/handler';
import { createAPIGatewayEvent, createContext } from './test-utils';
import { setupTestEnvironment } from './setup';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  DeleteCommand, 
  GetCommand,
  ScanCommandOutput,
  GetCommandOutput,
  PutCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBService } from '../../src/services/dynamodb.service';

// Enable debug logging for tests
console.debug = (...args: any[]) => {
  console.log('[DEBUG]', ...args);
};

interface TestItem {
  PK: string;
  SK: string;
  [key: string]: any;
}

describe('POST /almacenar', () => {
  let docClient: DynamoDBDocumentClient;
  
  beforeAll(async () => {
    console.log('Setting up test environment...');
    
    try {
      // Setup test environment
      await setupTestEnvironment();
      
      // Create a new DynamoDB client for testing
      const client = new DynamoDBClient({
        endpoint: 'http://localhost:8000',
        region: 'local',
        credentials: {
          accessKeyId: 'fake',
          secretAccessKey: 'fake'
        },
        maxAttempts: 3
      });
      
      docClient = DynamoDBDocumentClient.from(client);
      
      // Create a raw DynamoDB client for table operations
      const dynamoDB = new DynamoDB({
        endpoint: 'http://localhost:8000',
        region: 'local',
        credentials: {
          accessKeyId: 'fake',
          secretAccessKey: 'fake'
        }
      });
      
      // Ensure the test table exists
      try {
        await dynamoDB.createTable({
          TableName: 'test-table',
          KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
            { AttributeName: 'GSI1PK', AttributeType: 'S' },
            { AttributeName: 'GSI1SK', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'GSI1',
              KeySchema: [
                { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
              ],
              Projection: {
                ProjectionType: 'ALL'
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
              }
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        });
        console.log('Test table created');
      } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
          console.log('Test table already exists');
        } else {
          console.error('Error creating test table:', error);
          throw error;
        }
      }
      
      console.log('Test environment setup complete');
    } catch (error) {
      console.error('Error in beforeAll:', error);
      throw error;
    }
  });
  
  afterEach(async () => {
    // Clean up test data after each test
    try {
      // Scan for test items to clean up
      const scanCommand = new ScanCommand({
        TableName: 'test-table',
        FilterExpression: 'begins_with(PK, :prefix)',
        ExpressionAttributeValues: {
          ':prefix': 'CUSTOM#'
        }
      });
      
      const result = await docClient.send(scanCommand) as ScanCommandOutput & { Items?: TestItem[] };
      
      if (result.Items && result.Items.length > 0) {
        await Promise.all(
          result.Items.map((item: TestItem) => {
            const deleteCommand = new DeleteCommand({
              TableName: 'test-table',
              Key: {
                PK: item.PK,
                SK: item.SK
              }
            });
            return docClient.send(deleteCommand);
          })
          );
        }
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });
  
  it('should store custom data and return the ID', async () => {
    // Set test environment variables
    process.env.DYNAMODB_TABLE = 'test-table';
    process.env.IS_OFFLINE = 'true';
    
    const testData = {
      name: 'Test Data',
      value: 42
    };
    
    console.log('\n===== STARTING TEST: should store custom data and return the ID =====');
    console.log('Test environment variables:', {
      DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
      IS_OFFLINE: process.env.IS_OFFLINE,
      NODE_ENV: process.env.NODE_ENV
    });
    
    console.log('\n=== STARTING TEST: should store custom data and return the ID ===');
    console.log('Test Data:', JSON.stringify(testData, null, 2));
    
    // Log environment variables for debugging
    const envVars = {
      DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
      USE_REAL_DYNAMODB: process.env.USE_REAL_DYNAMODB,
      IS_OFFLINE: process.env.IS_OFFLINE,
      NODE_ENV: process.env.NODE_ENV,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '***' : 'not set',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '***' : 'not set',
      AWS_REGION: process.env.AWS_REGION || 'not set'
    };
    console.log('Environment Variables:', JSON.stringify(envVars, null, 2));
    
    // Verify DynamoDB connection and list tables
    try {
      const dynamoDB = new DynamoDB({
        endpoint: 'http://localhost:8000',
        region: 'local',
        credentials: {
          accessKeyId: 'fake',
          secretAccessKey: 'fake'
        }
      });
      
      console.log('Listing DynamoDB tables...');
      const tables = await dynamoDB.listTables({});
      console.log('Available tables:', tables.TableNames);
      
      // Try to describe the test table
      try {
        const tableInfo = await dynamoDB.describeTable({ TableName: 'test-table' });
        console.log('Test table exists and is active:', tableInfo.Table?.TableStatus);
      } catch (error: any) {
        console.error('Error describing test table:', error.message);
      }
      
      // Try to scan the test table
      try {
        const scanResult = await docClient.send(new ScanCommand({
          TableName: 'test-table',
          Limit: 1
        }));
        console.log(`Test table scan successful, found ${scanResult.Items?.length || 0} items`);
      } catch (error: any) {
        console.error('Error scanning test table:', error.message);
      }
    } catch (error: any) {
      console.error('DynamoDB connection error:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    const event = createAPIGatewayEvent(
      'POST', 
      '/almacenar', 
      testData
    );
    
    console.log('Created API Gateway event:', JSON.stringify(event, null, 2));
    
    const context = createContext();
    
    // Execute the handler with just the event parameter
    let response;
    try {
      console.log('\n===== CALLING HANDLER =====');
      console.log('Event:', JSON.stringify(event, null, 2));
      
      // Add a small delay to ensure DynamoDB is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      response = await storeCustomData(event);
      
      console.log('\n===== HANDLER RESPONSE =====');
      console.log('Status Code:', response.statusCode);
      console.log('Response Body:', response.body);
      
      // Verify the data was stored in DynamoDB
      try {
        const ddb = new DynamoDB({
          endpoint: 'http://localhost:8000',
          region: 'local',
          credentials: { accessKeyId: 'fake', secretAccessKey: 'fake' }
        });
        
        const result = await ddb.scan({ TableName: 'test-table' });
        console.log('\n===== DYNAMODB CONTENTS =====');
        console.log('Items in table:', JSON.stringify(result.Items, null, 2));
      } catch (dbError) {
        console.error('Error querying DynamoDB:', dbError);
      }
      
    } catch (error: any) {
      console.error('\n===== HANDLER ERROR =====');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    // Verify response is defined and has the expected structure
    expect(response).toBeDefined();
    expect(response).toHaveProperty('statusCode');
    expect(response).toHaveProperty('body');
    
    // Type assertion to tell TypeScript that response is APIGatewayProxyResult
    const typedResponse = response as import('aws-lambda').APIGatewayProxyResult;
    
    expect(typedResponse.statusCode).toBe(200);
    
    const body = JSON.parse(typedResponse.body);
    expect(body).toHaveProperty('message');
    expect(body.message).toContain('successfully');
    expect(body).toHaveProperty('data');
    expect(body.data).toMatchObject(testData);
    
    // Verify data was stored in DynamoDB
    const getCommand = new GetCommand({
      TableName: 'test-table',
      Key: {
        PK: `CUSTOM#${body.id}`,
        SK: 'METADATA'
      }
    });
    const result = await docClient.send(getCommand) as GetCommandOutput & { Item?: TestItem };
    
    expect(result.Item).toBeDefined();
    expect(result.Item?.data).toEqual(testData);
  });
  
  it('should return 400 for invalid input', async () => {
    console.log('\n=== STARTING TEST: should return 400 for invalid input ===');
    
    // Log environment variables for debugging
    console.log('Environment Variables:', {
      DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
      USE_REAL_DYNAMODB: process.env.USE_REAL_DYNAMODB,
      IS_OFFLINE: process.env.IS_OFFLINE
    });
    const event = createAPIGatewayEvent(
      'POST', 
      '/almacenar', 
      {} // Empty data
    );
    
    const context = createContext();
    
    // Execute the handler with just the event parameter
    const response = await storeCustomData(event);
    
    // Verify response is defined and has the expected structure
    expect(response).toBeDefined();
    expect(response).toHaveProperty('statusCode');
    expect(response).toHaveProperty('body');
    
    // Type assertion to tell TypeScript that response is APIGatewayProxyResult
    const typedResponse = response as import('aws-lambda').APIGatewayProxyResult;
    
    expect(typedResponse.statusCode).toBe(400);
    expect(JSON.parse(typedResponse.body).message).toContain('Validation Error');
  });
});
