// Simplified version of DynamoDB service test
console.log('=== Loading simplified test file ===');

// Import the service first to see if there are any loading issues
try {
  console.log('Attempting to import DynamoDBService...');
  const { DynamoDBService } = require('@services/dynamodb.service');
  console.log('DynamoDBService imported successfully:', !!DynamoDBService);
} catch (error) {
  console.error('Error importing DynamoDBService:', error);
}

import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Mock the AWS SDK modules
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const original = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...original,
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: jest.fn()
      }))
    },
    PutCommand: jest.fn(),
    GetCommand: jest.fn(),
    QueryCommand: jest.fn(),
    ScanCommand: jest.fn()
  };
});

describe('DynamoDBService - Simplified', () => {
  let service: any;
  let mockSend: jest.Mock;

  beforeEach(() => {
    console.log('=== Starting test setup ===');
    
    // Reset all mocks
    jest.clearAllMocks();
    console.log('Mocks cleared');
    
    // Create a fresh instance of the service for each test
    jest.isolateModules(() => {
      try {
        console.log('Attempting to import DynamoDBService in isolateModules...');
        const { DynamoDBService } = require('@services/dynamodb.service');
        console.log('DynamoDBService imported in isolateModules:', !!DynamoDBService);
        service = DynamoDBService;
      } catch (error) {
        console.error('Error in isolateModules:', error);
        throw error; // Re-throw to fail the test
      }
    });
    
    // Set up the mock implementation for the send method
    mockSend = jest.fn();
    (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue({
      send: mockSend
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
