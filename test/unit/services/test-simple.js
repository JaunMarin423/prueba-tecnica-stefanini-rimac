// Simple test to verify Jest is working

console.log('=== Starting Simple Test ===');

describe('Simple Test', () => {
  it('should pass a simple test', () => {
    console.log('Running simple test...');
    expect(true).toBe(true);
  });

  it('should use the mock DynamoDB client', () => {
    console.log('Running DynamoDB client test...');
    const mockSend = jest.fn();
    const mockFrom = jest.fn(() => ({
      send: mockSend
    }));

    // Mock the DynamoDBDocumentClient
    jest.mock('@aws-sdk/lib-dynamodb', () => ({
      DynamoDBDocumentClient: {
        from: mockFrom
      }
    }));

    // Import the service after mocks are set up
    const { DynamoDBService } = require('../../../src/services/dynamodb.service');
    
    // Create an instance of the service
    const service = new DynamoDBService();
    
    console.log('Service instance:', service);
    
    // Verify the mock was called
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(service.docClient).toBeDefined();
    expect(typeof service.docClient.send).toBe('function');
    
    console.log('DynamoDB client test passed');
  });
});
