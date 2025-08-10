// Setup file for Jest tests
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '.env.test' });

// Set default environment variables for testing
process.env.NODE_ENV = 'test';

// Global setup for all tests
beforeAll(() => {
  console.log('Global test setup');
});

// Global teardown for all tests
afterAll(() => {
  console.log('Global test teardown');
});

// Configure global test timeout
jest.setTimeout(30000);
