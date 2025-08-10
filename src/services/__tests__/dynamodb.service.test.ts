import { DynamoDBService, createDynamoDBClient, createMockDynamoDBClient } from '../dynamodb.service';

describe('DynamoDBService', () => {
  let service: DynamoDBService;
  let mockClient: any;

  const mockItem = {
    PK: 'CACHE#1',
    SK: 'METADATA',
    type: 'CACHE',
    data: { name: 'Luke Skywalker' },
    ttl: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
    GSI1PK: 'TYPE#CACHE',
    GSI1SK: '2023-01-01T00:00:00Z'
  };

  beforeEach(() => {
    // Create a fresh mock client for each test
    mockClient = {
      send: jest.fn()
    };
    
    // Create a new service instance with the mock client
    service = new DynamoDBService(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('should return an item when it exists', async () => {
      // Mock the response from DynamoDB
      mockClient.send.mockResolvedValueOnce({
        Item: mockItem
      });

      const result = await service.getItem('CACHE#1', 'METADATA');
      
      expect(result).toEqual(mockItem);
      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: expect.any(String),
            Key: {
              PK: 'CACHE#1',
              SK: 'METADATA'
            }
          })
        })
      );
    });

    it('should return undefined when item does not exist', async () => {
      mockClient.send.mockResolvedValueOnce({});
      
      const result = await service.getItem('NON_EXISTENT', 'METADATA');
      
      expect(result).toBeUndefined();
    });
  });

  describe('putItem', () => {
    it('should put an item with required fields', async () => {
      const itemToPut = {
        PK: 'CACHE#1',
        SK: 'METADATA',
        type: 'CACHE',
        data: { name: 'Luke Skywalker' },
        ttl: Math.floor(Date.now() / 1000) + 1800,
        GSI1PK: 'TYPE#CACHE',
        GSI1SK: new Date().toISOString()
      };

      mockClient.send.mockResolvedValueOnce({});

      const result = await service.putItem(itemToPut);
      
      expect(result).toMatchObject({
        ...itemToPut,
        createdAt: expect.any(String)
      });
      
      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: expect.any(String),
            Item: expect.objectContaining({
              ...itemToPut,
              createdAt: expect.any(String)
            })
          })
        })
      );
    });
  });

  describe('queryItems', () => {
    it('should query items by type', async () => {
      const mockItems = [
        { ...mockItem, PK: 'CACHE#1' },
        { ...mockItem, PK: 'CACHE#2' }
      ];

      mockClient.send.mockResolvedValueOnce({
        Items: mockItems
      });

      const result = await service.queryItems('CACHE');
      
      expect(result).toEqual(mockItems);
      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: expect.any(String),
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :pk',
            ExpressionAttributeValues: expect.objectContaining({
              ':pk': 'TYPE#CACHE'
            })
          })
        })
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete an item and return true', async () => {
      mockClient.send.mockResolvedValueOnce({});

      const result = await service.deleteItem('CACHE#1', 'METADATA');
      
      expect(result).toBe(true);
      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: expect.any(String),
            Key: {
              PK: 'CACHE#1',
              SK: 'METADATA'
            }
          })
        })
      );
    });
  });
});

describe('createDynamoDBClient', () => {
  it('should return a mock client when not in production', () => {
    const originalEnv = process.env;
    process.env.USE_REAL_DYNAMODB = 'false';
    
    const client = createDynamoDBClient();
    expect(client).toHaveProperty('send');
    
    process.env = originalEnv;
  });
});

describe('createMockDynamoDBClient', () => {
  it('should create a mock client with send method', () => {
    const mockClient = createMockDynamoDBClient();
    expect(mockClient).toHaveProperty('send');
    expect(typeof mockClient.send).toBe('function');
  });
});
