import { CacheItem } from '../../../../src/services/dynamodb.service';

// Test data
const timestamp = new Date().toISOString();

export const mockItem: CacheItem = {
  PK: 'test-pk',
  SK: 'test-sk',
  type: 'CACHE',
  data: { test: 'data' },
  ttl: Math.floor(Date.now() / 1000) + 3600,
  createdAt: timestamp,
  GSI1PK: 'CACHE',
  GSI1SK: timestamp
};

// Mock the DynamoDB client
export const createMockDynamoDBClient = () => {
  const mockSend = jest.fn();
  
  return {
    send: mockSend,
    mockSend, // Expose for assertions
    mockResolved: (data: any) => {
      mockSend.mockResolvedValueOnce({
        ...data,
        $metadata: { httpStatusCode: 200 }
      });
    },
    mockRejected: (error: Error) => {
      mockSend.mockRejectedValueOnce(error);
    },
    reset: () => {
      mockSend.mockReset();
      mockSend.mockClear();
    }
  };
};

// Mock the DynamoDB commands
export const mockDynamoDBCommands = () => {
  const mockPutCommand = jest.fn().mockImplementation((input) => ({
    name: 'PutCommand',
    input
  }));
  
  const mockGetCommand = jest.fn().mockImplementation((input) => ({
    name: 'GetCommand',
    input
  }));
  
  const mockQueryCommand = jest.fn().mockImplementation((input) => ({
    name: 'QueryCommand',
    input
  }));
  
  const mockScanCommand = jest.fn().mockImplementation((input) => ({
    name: 'ScanCommand',
    input
  }));
  
  const mockDeleteCommand = jest.fn().mockImplementation((input) => ({
    name: 'DeleteCommand',
    input
  }));
  
  return {
    mockPutCommand,
    mockGetCommand,
    mockQueryCommand,
    mockScanCommand,
    mockDeleteCommand,
    resetMocks: () => {
      mockPutCommand.mockClear();
      mockGetCommand.mockClear();
      mockQueryCommand.mockClear();
      mockScanCommand.mockClear();
      mockDeleteCommand.mockClear();
    }
  };
};
