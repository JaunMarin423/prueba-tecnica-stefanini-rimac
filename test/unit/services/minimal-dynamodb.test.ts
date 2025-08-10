// Minimal test for DynamoDBService

console.log('=== Setting up test environment ===');

// Mock the DynamoDB client
const mockSend = jest.fn().mockImplementation(params => {
  console.log('mockSend called with:', { name: params?.name, params });
  return Promise.resolve({});
});

const mockFrom = jest.fn(() => {
  console.log('mockFrom called, creating mock client');
  return { send: mockSend };
});

console.log('Creating mock for @aws-sdk/lib-dynamodb');

// Mock the AWS SDK modules
jest.mock('@aws-sdk/lib-dynamodb', () => {
  console.log('@aws-sdk/lib-dynamodb mock factory called');
  return {
    DynamoDBDocumentClient: { 
      from: mockFrom 
    },
    PutCommand: jest.fn().mockImplementation(params => {
      console.log('PutCommand created with params:', params);
      return { 
        name: 'PutCommand',
        params 
      };
    })
  };
});

console.log('Setting up environment variables');

// Mock environment variables
process.env.DYNAMODB_TABLE = 'test-table';
process.env.USE_REAL_DYNAMODB = 'false';
process.env.IS_OFFLINE = 'true';

console.log('Environment variables set:', {
  DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
  USE_REAL_DYNAMODB: process.env.USE_REAL_DYNAMODB,
  IS_OFFLINE: process.env.IS_OFFLINE
});

console.log('Importing DynamoDBService');
// Import the service after mocks are set up
import { DynamoDBService } from '../../../src/services/dynamodb.service';
console.log('DynamoDBService imported');

describe('Minimal DynamoDBService Test', () => {
  let service: DynamoDBService;

  beforeAll(() => {
    console.log('=== Starting test suite ===');
  });

  beforeEach(() => {
    console.log('\n--- Starting test ---');
    console.log('Clearing all mocks');
    jest.clearAllMocks();
    
    console.log('Creating new DynamoDBService instance');
    service = new DynamoDBService();
    console.log('DynamoDBService instance created');
  });

  it('should create a service instance', () => {
    console.log('Running test: should create a service instance');
    expect(service).toBeDefined();
    console.log('Test passed: service instance created successfully');
  });

  // it('should call putItem with correct parameters', async () => {
  //   console.log('Running test: should call putItem with correct parameters');
    
  //   // Create a test item matching the CacheItem type without the createdAt field
  //   const testItem = {
  //     PK: 'test',
  //     SK: 'test',
  //     data: { test: 'test' },
  //     ttl: Math.floor(Date.now() / 1000) + 3600,
  //     type: 'CACHE' as const
  //   };
    
  //   console.log('Test item created:', testItem);
    
  //   // Mock the response for the PutCommand
  //   console.log('Setting up mock response for putItem');
  //   mockSend.mockResolvedValueOnce({ $metadata: { httpStatusCode: 200 } });
    
  //   // Mock the PutCommand constructor to track its calls
  //   const mockPutCommand = require('@aws-sdk/lib-dynamodb').PutCommand;
    
  //   console.log('Calling service.putItem...');
  //   let result;
  //   try {
  //     result = await service.putItem(testItem);
  //     console.log('service.putItem call completed');
  //   } catch (error) {
  //     console.error('Error in service.putItem:', error);
  //     throw error;
  //   }
    
  //   console.log('Verifying mock calls...');
  //   try {
  //     // Verify the mock was called
  //     expect(mockSend).toHaveBeenCalledTimes(1);
  //     console.log('mockSend was called once');
      
  //     // Verify PutCommand was called with the correct parameters
  //     expect(mockPutCommand).toHaveBeenCalledTimes(1);
  //     console.log('PutCommand was called once');
      
  //     // Get the parameters passed to PutCommand
  //     const [putCommandParams] = mockPutCommand.mock.calls[0];
  //     console.log('PutCommand params:', putCommandParams);
      
  //     // Verify the table name is correct
  //     expect(putCommandParams.TableName).toBe('test-table');
  //     console.log('Table name is correct');
      
  //     // Verify the item has the required fields
  //     expect(putCommandParams.Item.PK).toBe('test');
  //     expect(putCommandParams.Item.SK).toBe('test');
  //     expect(putCommandParams.Item.type).toBe('CACHE');
      
  //     // Verify the service added the GSI fields and createdAt
  //     expect(putCommandParams.Item.GSI1PK).toBe('CACHE');
  //     expect(putCommandParams.Item.GSI1SK).toBeDefined();
  //     expect(putCommandParams.Item.createdAt).toBeDefined();
      
  //     // Verify the result includes all the expected fields
  //     expect(result).toEqual({
  //       ...testItem,
  //       GSI1PK: 'CACHE',
  //       GSI1SK: putCommandParams.Item.GSI1SK,
  //       createdAt: putCommandParams.Item.createdAt
  //     });
      
  //     console.log('All assertions passed');
  //   } catch (error) {
  //     console.error('Assertion failed:', error);
  //     console.log('mockSend.mock.calls:', mockSend.mock.calls);
  //     console.log('mockPutCommand.mock.calls:', mockPutCommand.mock.calls);
  //     throw error;
  //   }
  // });
});
