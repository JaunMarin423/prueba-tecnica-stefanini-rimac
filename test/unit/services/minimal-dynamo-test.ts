import { DynamoDBService } from '@services/dynamodb.service';

describe('Minimal DynamoDB Test', () => {
  it('should create a DynamoDBService instance', () => {
    console.log('Running minimal test...');
    const service = new DynamoDBService();
    expect(service).toBeInstanceOf(DynamoDBService);
  });
});
