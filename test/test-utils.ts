import { mockSend } from './__mocks__/@aws-sdk/lib-dynamodb';

interface MockResponses {
  query: {
    Items: any[];
    LastEvaluatedKey?: Record<string, any>;
    $metadata?: {
      httpStatusCode: number;
    };
  };
  get: {
    Item: any | null;
    $metadata?: {
      httpStatusCode: number;
    };
  };
  put: {
    $metadata?: {
      httpStatusCode: number;
    };
  };
  scan: {
    Items: any[];
    LastEvaluatedKey?: Record<string, any>;
    $metadata?: {
      httpStatusCode: number;
    };
  };
}

/**
 * Helper to configure DynamoDB mock
 */
export function setupDynamoMock() {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Configure default responses for DynamoDB
  const mockResponses: MockResponses = {
    query: { 
      Items: [], 
      LastEvaluatedKey: undefined,
      $metadata: { httpStatusCode: 200 }
    },
    get: { 
      Item: null,
      $metadata: { httpStatusCode: 200 }
    },
    put: {
      $metadata: { httpStatusCode: 200 }
    },
    scan: { 
      Items: [], 
      LastEvaluatedKey: undefined,
      $metadata: { httpStatusCode: 200 }
    },
  };

  // Configure the mock to return the configured responses
  (mockSend as jest.Mock).mockImplementation((command: { input: { Command: string } }) => {
    if (command.input.Command === 'QueryCommand') {
      return Promise.resolve(mockResponses.query);
    }
    if (command.input.Command === 'GetCommand') {
      return Promise.resolve(mockResponses.get);
    }
    if (command.input.Command === 'PutCommand') {
      return Promise.resolve(mockResponses.put);
    }
    if (command.input.Command === 'ScanCommand') {
      return Promise.resolve(mockResponses.scan);
    }
    return Promise.resolve({ $metadata: { httpStatusCode: 200 } });
  });

  return {
    mockResponses,
    mockSend: mockSend as jest.Mock,
  };
}

/**
 * Mocks the global Date object for consistent testing
 * @returns The mocked date
 */
export function mockDate(): Date {
  const mockDate = new Date('2023-01-01T00:00:00Z');
  const mockDateImplementation = class extends Date {
    constructor() {
      super();
      return mockDate;
    }
  };
  
  global.Date = mockDateImplementation as unknown as DateConstructor;
  return mockDate;
}
