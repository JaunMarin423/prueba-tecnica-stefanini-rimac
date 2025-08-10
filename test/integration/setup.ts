import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBService } from '../../src/services/dynamodb.service';

// Mock DynamoDB Local
const dynamoDBClient = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'local',
  credentials: {
    accessKeyId: 'fake',
    secretAccessKey: 'fake'
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// Create test table if it doesn't exist
async function setupTestTable() {
  try {
    const command = new CreateTableCommand({
      TableName: 'test-table',
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
        { AttributeName: 'GSI1PK', AttributeType: 'S' },
        { AttributeName: 'GSI1SK', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1',
          KeySchema: [
            { AttributeName: 'GSI1PK', KeyType: 'HASH' },
            { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    });
  } catch (error) {
    // Table likely already exists
    if (!(error as any).name?.includes('ResourceInUseException')) {
      console.error('Error creating test table:', error);
    }
  }
}

// Initialize test environment
async function setupTestEnvironment() {
  // Set test environment variables
  process.env.DYNAMODB_TABLE = 'test-table';
  process.env.REGION = 'local';
  process.env.DYNAMODB_ENDPOINT = 'http://localhost:8000';
  
  // Setup test table
  await setupTestTable();
  
  // Initialize DynamoDBService with test client
  const dynamoDBService = new DynamoDBService(docClient as any);
  
  return {
    dynamoDBService,
    docClient
  };
}

export { setupTestEnvironment };
