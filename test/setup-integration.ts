// Configure environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DYNAMODB_TABLE = 'test-table';
process.env.REGION = 'local';
process.env.DYNAMODB_ENDPOINT = 'http://localhost:8000';
process.env.OPENWEATHER_API_KEY = 'test-api-key';

// Increase Jest timeout for integration tests
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Any global setup can go here
});

afterAll(async () => {
  // Any global teardown can go here
});
