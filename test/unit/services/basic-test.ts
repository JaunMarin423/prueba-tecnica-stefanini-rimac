// Basic test file to verify the testing environment

describe('Basic Test', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should import DynamoDBService', () => {
    const { DynamoDBService } = require('../../../src/services/dynamodb.service');
    expect(DynamoDBService).toBeDefined();
  });
});
