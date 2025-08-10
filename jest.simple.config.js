// Minimal Jest configuration for testing
module.exports = {
  testEnvironment: 'node',  // Use Node.js environment
  roots: ['<rootDir>/test'],  // Look in the test directory
  testMatch: ['**/*.test.ts', '**/*.test.js'],  // Look for both .test.ts and .test.js files
  testPathIgnorePatterns: ['/node_modules/'],  // Ignore node_modules
  verbose: true,  // Show detailed test output
  testTimeout: 30000,  // 30 second timeout
  detectOpenHandles: true,  // Detect open handles
  forceExit: true,  // Force exit when done
  
  // Custom test environment to capture console.log
  testEnvironment: './test/test-environment.js',
  
  // Show console output
  silent: false,
  
  // Show test coverage
  collectCoverage: false,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup-tests.ts'],
  transform: {
    '^.+\\.tsx?$': ['@swc/jest', {
      jsc: {
        target: 'es2020',  // Target modern JavaScript
        parser: {
          syntax: 'typescript',
          tsx: false,
          decorators: false,
          dynamicImport: false,
        },
        transform: null,
      },
    }],
  },
};
