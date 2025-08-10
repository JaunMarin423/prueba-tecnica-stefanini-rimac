// Test to isolate static initialization of DynamoDBService
console.log('=== Starting DynamoDB Static Initialization Test ===');

// Mock AWS SDK modules with minimal implementation
const mockSend = jest.fn();

jest.mock('@aws-sdk/lib-dynamodb', () => {
  console.log('Mocking @aws-sdk/lib-dynamodb');
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => {
        console.log('Mock DynamoDBDocumentClient.from called');
        return { send: mockSend };
      })
    },
    PutCommand: jest.fn().mockImplementation((params) => {
      console.log('Mock PutCommand created with params:', params);
      return { ...params, Command: 'PutCommand' };
    })
  };
});

// Mock environment variables
process.env.DYNAMODB_TABLE = 'test-table';
process.env.IS_OFFLINE = 'true';

// Test suite for static initialization
describe('DynamoDBService - Static Initialization', () => {
  // Store the original environment variables
  const originalEnv = { ...process.env };
  
  afterEach(() => {
    // Restore environment variables after each test
    process.env = { ...originalEnv };
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  it('should not throw when imported', () => {
    console.log('Testing service import');
    let DynamoDBService;
    
    // Try to import the service
    expect(() => {
      DynamoDBService = require('../../../../src/services/dynamodb.service').DynamoDBService;
      console.log('Successfully imported DynamoDBService');
    }).not.toThrow();
    
    // Verify the service was imported
    expect(DynamoDBService).toBeDefined();
  });
  
  it('should initialize static fields', () => {
    console.log('Testing static field initialization');
    const { DynamoDBService } = require('../../../../src/services/dynamodb.service');
    
    // Access a static field to trigger initialization
    expect(() => {
      // @ts-ignore - Accessing private static field for test
      const tableName = DynamoDBService.TABLE_NAME;
      console.log('Table name:', tableName);
      expect(tableName).toBe('test-table');
    }).not.toThrow();
  });
  
  it('should not initialize client until first use', () => {
    console.log('Testing lazy client initialization');
    const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
    
    // Import the service but don't create an instance yet
    const { DynamoDBService } = require('../../../../src/services/dynamodb.service');n
    // Verify the client hasn't been created yet
    expect(DynamoDBDocumentClient.from).not.toHaveBeenCalled();
    
    // Now create an instance
    console.log('Creating service instance');
    const service = new DynamoDBService();
    
    // The client should be initialized now
    expect(DynamoDBDocumentClient.from).toHaveBeenCalled();
    expect(service).toBeInstanceOf(DynamoDBService);
  });
});
