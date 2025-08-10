// Enable verbose logging for tests
console.log('=== Starting DynamoDB Service Tests ===');

// Mock the AWS SDK modules
const mockSend = jest.fn();

// Mock the DynamoDBDocumentClient
const mockFrom = jest.fn().mockImplementation(() => ({
  send: mockSend
}));

// Store the original implementation
const originalLib = jest.requireActual('@aws-sdk/lib-dynamodb');

// Create a simple mock for DynamoDB commands
const createMockCommand = (name: string) => {
  return jest.fn().mockImplementation((params: any) => ({
    name,
    params,
    [Symbol.toStringTag]: `Mock${name}`
  }));
};

// Mock the DynamoDB client
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  ...originalLib,
  DynamoDBDocumentClient: {
    from: mockFrom
  },
  PutCommand: createMockCommand('PutCommand'),
  GetCommand: createMockCommand('GetCommand'),
  QueryCommand: createMockCommand('QueryCommand'),
  ScanCommand: createMockCommand('ScanCommand'),
  DeleteCommand: createMockCommand('DeleteCommand')
}));

// Import the service after mocks are set up
import { DynamoDBService } from '../src/services/dynamodb.service';

// Import the mocked modules
const { PutCommand, GetCommand, QueryCommand, ScanCommand, DeleteCommand } = jest.requireMock('@aws-sdk/lib-dynamodb');

// Import types
import { CacheItem } from '../src/services/dynamodb.service';

// Mock the environment variables
process.env.DYNAMODB_TABLE = 'test-table';

// Mock date for consistent testing
const mockDateValue = new Date('2023-01-01T00:00:00.000Z');
const RealDate = Date;

// Helper function to create test items with the correct structure
const createTestItem = (baseItem: Omit<CacheItem, 'createdAt' | 'GSI1PK' | 'GSI1SK' | 'PK' | 'SK' | 'data' | 'ttl' | 'type'> & 
  Pick<CacheItem, 'PK' | 'SK' | 'data' | 'ttl' | 'type'>
): CacheItem => {
  const timestamp = new Date().toISOString();
  return {
    ...baseItem,
    GSI1PK: baseItem.type,
    GSI1SK: timestamp,
    createdAt: timestamp
  };
};

// Mock item for testing
const mockItem = createTestItem({
  PK: 'CACHE#test',
  SK: 'test',
  data: { test: 'test' },
  ttl: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  type: 'CACHE' as const
});

// Using the imported CacheItem type from the service

// Interface for mock responses
interface MockResponse {
  Item?: CacheItem | null;
  Items?: CacheItem[];
  LastEvaluatedKey?: { PK: string; SK: string } | null;
  Count?: number;
  ScannedCount?: number;
  $metadata: { httpStatusCode: number };
}

// Type for query/scan responses
interface QueryResponse extends Omit<MockResponse, 'Item'> {
  Items: CacheItem[];
  Count: number;
  ScannedCount: number;
  LastEvaluatedKey: { PK: string; SK: string } | null;
}

// Mock responses for DynamoDB operations
const mockResponses: {
  put: { $metadata: { httpStatusCode: number } };
  get: { Item?: CacheItem | null; $metadata: { httpStatusCode: number } };
  query: QueryResponse;
  scan: QueryResponse;
  delete: { $metadata: { httpStatusCode: number } };
} = {
  put: { $metadata: { httpStatusCode: 200 } },
  get: { 
    Item: null, 
    $metadata: { httpStatusCode: 200 } 
  },
  query: { 
    Items: [], 
    LastEvaluatedKey: null, 
    $metadata: { httpStatusCode: 200 },
    Count: 0,
    ScannedCount: 0
  },
  scan: { 
    Items: [], 
    LastEvaluatedKey: null, 
    $metadata: { httpStatusCode: 200 },
    Count: 0,
    ScannedCount: 0
  },
  delete: { 
    $metadata: { httpStatusCode: 200 } 
  }
};

process.env.USE_REAL_DYNAMODB = 'false';

describe('DynamoDBService', () => {
  console.log('\n--- Starting DynamoDBService test suite ---');
  
  // Log environment variables for debugging
  console.log('Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
    USE_REAL_DYNAMODB: process.env.USE_REAL_DYNAMODB,
    IS_OFFLINE: process.env.IS_OFFLINE
  });
  
  // Mock Date
  beforeAll(() => {
    global.Date = class extends RealDate {
      constructor() {
        super();
        return mockDateValue;
      }
    } as any;
  });

  afterAll(() => {
    global.Date = RealDate;
  });
  
  console.log('Mock item created:', mockItem);
  
  // Mock the DynamoDB client implementation with detailed logging
  mockSend.mockImplementation((command: any) => {
    try {
      console.log('\n--- Mock send called ---');
      console.log('Command type:', command?.name || 'unknown');
      console.log('Command params:', JSON.stringify(command?.params, null, 2));
      
      let response;
      
      switch (command?.name) {
        case 'PutCommand':
          console.log('Processing PutCommand');
          response = mockResponses.put;
          break;
        case 'GetCommand':
          console.log('Processing GetCommand');
          response = mockResponses.get;
          break;
        case 'QueryCommand':
          console.log('Processing QueryCommand');
          response = mockResponses.query;
          break;
        case 'ScanCommand':
          console.log('Processing ScanCommand');
          response = mockResponses.scan;
          break;
        case 'DeleteCommand':
          console.log('Processing DeleteCommand');
          response = mockResponses.delete;
          break;
        default:
          const errorMsg = `Unexpected command: ${command?.name || 'unknown'}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
      }
      
      if (!response) {
        const errorMsg = `No response configured for command: ${command?.name}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Returning response:', JSON.stringify(response, null, 2));
      return Promise.resolve(response);
    } catch (error) {
      console.error('Error in mockSend:', error);
      return Promise.reject(error);
    }
  });

  beforeEach(() => {
    console.log('\n--- Resetting mocks and responses ---');
    
    // Clear all mocks
    jest.clearAllMocks();
    
      console.log('\n--- Resetting mock responses ---');
    
    // Reset mock responses with correct types and detailed logging
    mockResponses.put = { 
      $metadata: { 
        httpStatusCode: 200
      } 
    };
    console.log('Reset mockResponses.put');
    
    mockResponses.get = { 
      Item: null, 
      $metadata: { 
        httpStatusCode: 200
      } 
    };
    console.log('Reset mockResponses.get');
    
    mockResponses.query = { 
      Items: [], 
      LastEvaluatedKey: null, 
      $metadata: { 
        httpStatusCode: 200
      },
      Count: 0,
      ScannedCount: 0
    };
    console.log('Reset mockResponses.query');
    
    mockResponses.scan = { 
      Items: [], 
      LastEvaluatedKey: null, 
      $metadata: { 
        httpStatusCode: 200
      },
      Count: 0,
      ScannedCount: 0
    };
    console.log('Reset mockResponses.scan');
    
    mockResponses.delete = { 
      $metadata: { 
        httpStatusCode: 200
      } 
    };
    console.log('Reset mockResponses.delete');
    
    console.log('Mock responses have been reset');
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('putItem', () => {
    it('debe guardar un ítem correctamente', async () => {
      // Arrange
      const service = new DynamoDBService();
      mockResponses.put = { $metadata: { httpStatusCode: 200 } };
      
      // Act
      const result = await service.putItem({
        PK: 'CACHE#test',
        SK: 'test',
        data: { test: 'test' },
        ttl: Math.floor(Date.now() / 1000) + 3600,
        type: 'CACHE' as const
      });

      // Assert
      expect(PutCommand).toHaveBeenCalledWith({
        TableName: 'test-table',
        Item: expect.objectContaining({
          PK: 'CACHE#test',
          SK: 'test',
          data: { test: 'test' },
          type: 'CACHE',
          GSI1PK: 'CACHE',
          GSI1SK: expect.any(String),
          createdAt: expect.any(String),
          ttl: expect.any(Number)
        })
      });
      
      // Verify the result includes the expected properties
      expect(result).toMatchObject({
        PK: 'CACHE#test',
        SK: 'test',
        data: { test: 'test' },
        type: 'CACHE',
        ttl: expect.any(Number),
        createdAt: expect.any(String)
      });
    });
  });
  
  describe('getItem', () => {
    it('debe devolver un ítem existente', async () => {
      // Arrange
      const service = new DynamoDBService();
const expectedItem = createTestItem({
        PK: 'CACHE#test',
        SK: 'test',
        data: { test: 'test' },
        type: 'CACHE' as const,
        ttl: Math.floor(Date.now() / 1000) + 3600
      });
      
      // Update the mock response to match the DynamoDB DocumentClient response structure
      mockResponses.get = { 
        Item: expectedItem,
        $metadata: { httpStatusCode: 200 }
      };

      // Act
      const result = await service.getItem('CACHE#test', 'test');

      // Assert
      expect(GetCommand).toHaveBeenCalledWith({
        TableName: 'test-table',
        Key: {
          PK: 'CACHE#test',
          SK: 'test'
        }
      });
      
      expect(result).toMatchObject({
        PK: expectedItem.PK,
        SK: expectedItem.SK,
        data: expectedItem.data,
        type: expectedItem.type,
        ttl: expect.any(Number),
        createdAt: expect.any(String),
        GSI1PK: expectedItem.type,
        GSI1SK: expect.any(String)
      });
    });
    
    it('debe devolver undefined para un ítem que no existe', async () => {
      // Arrange
      const service = new DynamoDBService();
      mockResponses.get = { 
        Item: undefined,
        $metadata: { httpStatusCode: 200 }
      };

      // Act
      const result = await service.getItem('CACHE#nonexistent', 'nonexistent');

      // Assert
      expect(GetCommand).toHaveBeenCalledWith({
        TableName: 'test-table',
        Key: {
          PK: 'CACHE#nonexistent',
          SK: 'nonexistent'
        }
      });
      
      expect(result).toBeUndefined(); // La implementación devuelve undefined cuando no encuentra el ítem
    });
  });

  // describe('getItem', () => {
  //   it('debe devolver un ítem existente', async () => {
  //     console.log('\n--- Starting test: debe devolver un ítem existente ---');
      
  //     // Arrange
  //     console.log('1. Creating DynamoDBService instance');
  //     const service = new DynamoDBService();
      
  //     console.log('2. Setting up mock response for getItem');
  //     const expectedItem = { ...mockItem };
  //     mockResponses.get = { 
  //       Item: expectedItem, 
  //       $metadata: { 
  //         httpStatusCode: 200
  //       } 
  //     };

  //     // Act
  //     console.log('3. Calling service.getItem');
  //     const result = await service.getItem('CACHE#test', 'test');
  //     console.log('4. Received result:', JSON.stringify(result, null, 2));

  //     // Assert
  //     console.log('5. Verifying GetCommand was called with correct parameters');
  //     expect(GetCommand).toHaveBeenCalledWith({
  //       TableName: 'test-table',
  //       Key: { 
  //         PK: 'CACHE#test', 
  //         SK: 'test' 
  //       }
  //     const service = new DynamoDBService();
  //     mockResponses.query = {
  //       Items: [mockItem],
  //       LastEvaluatedKey: { PK: 'test', SK: 'test' },
  //       $metadata: { httpStatusCode: 200 }
  //     };

  //     // Act
  //     const result = await service.queryItems('CACHE', 10);

  //     // Assert
  //     expect(QueryCommand).toHaveBeenCalledWith(expect.objectContaining({
  //       TableName: 'test-table',
  //       IndexName: 'GSI1',
  //       KeyConditionExpression: 'GSI1PK = :type',
  //       ExpressionAttributeValues: { ':type': 'CACHE' },
  //       Limit: 10,
  //       ScanIndexForward: false
  //     }));
  //     expect(result).toEqual([mockItem]);
  //   });
  // });

  // describe('scanItems', () => {
  //   it('debe realizar un escaneo de la tabla correctamente', async () => {
  //     // Arrange
  //     const service = new DynamoDBService();
  //     const expectedItem = { 
  //       PK: 'CACHE#test',
  //       SK: 'test',
  //       data: { test: 'test' },
  //       ttl: Math.floor(Date.now() / 1000) + 3600,
  //       type: 'CACHE',
  //       createdAt: new Date().toISOString()
  //     };
      
  //     mockResponses.scan = { 
  //       Items: [expectedItem], 
  //       LastEvaluatedKey: undefined, 
  //       $metadata: { 
  //         httpStatusCode: 200
  //       } 
  //     };

  //     // Act
  //     const result = await service.scanItems(10);

  //     // Assert
  //     expect(ScanCommand).toHaveBeenCalledWith({
  //       TableName: 'test-table',
  //       Limit: 10
  //     });
  //     expect(result).toEqual([expectedItem]);
  //   });
  // });
});
