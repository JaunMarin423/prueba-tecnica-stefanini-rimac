// // Minimal test for DynamoDBService putItem

// // Mock the DynamoDB client
// const mockSend = jest.fn().mockResolvedValue({ $metadata: { httpStatusCode: 200 } });
// const mockFrom = jest.fn(() => ({
//   send: mockSend
// }));

// // Mock the AWS SDK modules
// jest.mock('@aws-sdk/lib-dynamodb', () => ({
//   DynamoDBDocumentClient: { from: mockFrom },
//   PutCommand: jest.fn().mockImplementation((params) => ({
//     name: 'PutCommand',
//     params
//   }))
// }));

// // Set environment variables
// process.env.DYNAMODB_TABLE = 'test-table';
// process.env.USE_REAL_DYNAMODB = 'false';
// process.env.IS_OFFLINE = 'true';

// // Import the service after mocks are set up
// import { DynamoDBService } from '../../../src/services/dynamodb.service';

// describe('Minimal DynamoDBService putItem Test', () => {
//   let service: DynamoDBService;
//   const mockPutCommand = require('@aws-sdk/lib-dynamodb').PutCommand;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     service = new DynamoDBService();
//   });

//   it('should create a service instance', () => {
//     expect(service).toBeDefined();
//   });

//   it('should call putItem with correct parameters', async () => {
//     // Arrange
//     const testItem = {
//       PK: 'test',
//       SK: 'test',
//       data: { test: 'test' },
//       ttl: Math.floor(Date.now() / 1000) + 3600,
//       type: 'CACHE' as const
//     };

//     // Act
//     await service.putItem(testItem);

//     // Assert
//     expect(mockSend).toHaveBeenCalledTimes(1);
//   });
// });
