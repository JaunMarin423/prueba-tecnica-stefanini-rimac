// Test file for DynamoDBService
import { DynamoDBService, type CacheItem } from '../../../src/services/dynamodb.service';
import { mockItem, createMockDynamoDBClient } from './__mocks__/dynamodb-mocks';

// Mock the AWS SDK
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: jest.fn().mockImplementation((input) => ({
    input,
    command: 'PutCommand'
  })),
  GetCommand: jest.fn().mockImplementation((input) => ({
    input,
    command: 'GetCommand'
  })),
  QueryCommand: jest.fn().mockImplementation((input) => ({
    input,
    command: 'QueryCommand'
  })),
  ScanCommand: jest.fn().mockImplementation((input) => ({
    input,
    command: 'ScanCommand'
  })),
  DeleteCommand: jest.fn().mockImplementation((input) => ({
    input,
    command: 'DeleteCommand'
  }))
}));

describe('DynamoDBService', () => {
  let mockClient: ReturnType<typeof createMockDynamoDBClient>;
  let service: DynamoDBService;
  
  // Reset all mocks before each test
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new mock client for each test
    mockClient = createMockDynamoDBClient();
    
    // Create a new instance of the service with the mock client
    service = new DynamoDBService(mockClient);
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env.DYNAMODB_TABLE = 'test-table';
    
    // Create a new mock client for each test
    mockClient = createMockDynamoDBClient();
    
    // Create a new instance of the service with the mock client
    service = new DynamoDBService(mockClient);
  });

  describe('putItem', () => {
    it('should successfully put an item in the table', async () => {
      // Setup mock response
      mockClient.mockResolved({});

      // Execute the method with a new object that doesn't include createdAt
      const { createdAt, ...itemToSave } = mockItem;
      
      await service.putItem(itemToSave as Omit<CacheItem, 'createdAt'>);
      
      // Verify the mock was called with the correct parameters
      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith({
        input: {
          TableName: 'test-table',
          Item: expect.objectContaining({
            ...mockItem,
            GSI1PK: 'CACHE',
            GSI1SK: expect.any(String),
            createdAt: expect.any(String)
          })
        },
        command: 'PutCommand'
      });
    });
  });

  describe('getItem', () => {
    it('should retrieve an item by PK and SK', async () => {
      // Setup mock response
      mockClient.mockResolved({
        Item: mockItem
      });

      const result = await service.getItem(mockItem.PK, mockItem.SK);
      
      // Verify the result and mock calls
      expect(result).toEqual(mockItem);
      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith({
        input: {
          TableName: 'test-table',
          Key: {
            PK: mockItem.PK,
            SK: mockItem.SK
          }
        },
        command: 'GetCommand'
      });
    });

    it('should return undefined when item is not found', async () => {
      // Setup mock response for item not found
      mockClient.mockResolved({});

      const result = await service.getItem('non-existent-pk', 'non-existent-sk');
      
      expect(result).toBeUndefined();
      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith({
        input: {
          TableName: 'test-table',
          Key: {
            PK: 'non-existent-pk',
            SK: 'non-existent-sk'
          }
        },
        command: 'GetCommand'
      });
    });
  });

  describe('queryItems', () => {
    it('should query items by GSI1PK and GSI1SK', async () => {
      // Setup mock response
      const mockItems = [mockItem];
      mockClient.mockResolved({
        Items: mockItems
      });

      // Execute the method
      const result = await service.queryItems('CACHE');
      
      // Verify the result and mock calls
      expect(result).toEqual(mockItems);
      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith({
        input: {
          TableName: 'test-table',
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :type',
          ExpressionAttributeValues: {
            ':type': 'CACHE'
          },
          Limit: 10,
          ScanIndexForward: false
        },
        command: 'QueryCommand'
      });
    });
  });

  describe('scanItems', () => {
    it('should scan the table with default limit', async () => {
      const mockItems = [mockItem];
      
      // Setup mock response
      mockClient.mockResolved({
        Items: mockItems
      });

      // Execute the method
      const result = await service.scanItems();
      
      // Verify the result and mock calls
      expect(result).toEqual(mockItems);
      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith({
        input: {
          TableName: 'test-table',
          Limit: 10
        },
        command: 'ScanCommand'
      });
    });
    
    it('should use the provided limit', async () => {
      const mockItems = [mockItem];
      
      // Setup mock response
      mockClient.mockResolved({
        Items: mockItems
      });

      // Execute the method with custom limit
      const result = await service.scanItems(5);
      
      // Verify the result and mock calls
      expect(result).toEqual(mockItems);
      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith({
        input: {
          TableName: 'test-table',
          Limit: 5
        },
        command: 'ScanCommand'
      });
    });
  });

  describe('deleteItem', () => {
    it('should delete an existing item', async () => {
      // Setup mock response
      mockClient.mockResolved({});

      // Execute the method
      await service.deleteItem('test-pk', 'test-sk');
      
      // Verify the mock was called with the correct parameters
      expect(mockClient.send).toHaveBeenCalledTimes(1);
      expect(mockClient.send).toHaveBeenCalledWith({
        input: {
          TableName: 'test-table',
          Key: {
            PK: 'test-pk',
            SK: 'test-sk'
          }
        },
        command: 'DeleteCommand'
      });
    });
  });
});
