module.exports = {
  testEnvironment: 'node',
  verbose: true,
  // Run both unit and integration tests
  testMatch: [
    '**/test/unit/**/*.test.ts',
    '**/test/integration/*.test.ts'
  ],
  // Setup files run before tests
  setupFilesAfterEnv: ['<rootDir>/test/setup-integration.ts'],
  // Ignore specific test files
  testPathIgnorePatterns: [
    '/node_modules/',
    '/test/unit/__mocks__/',
    '/test/unit/services/__mocks__/',
    // Keep these patterns but clean them up
    '/test/unit/services/fusion.service.test.ts',
    '/test/unit/services/minimal-put.test.ts',
    '/test/unit/services/dynamodb-mock.test.ts',
    '/test/unit/services/dynamodb.stepbystep.test.ts',
    '/test/unit/services/dynamodb.static.test.ts',
    '/test/unit/services/dynamodb.step1.test.ts',
    '/test/unit/services/dynamodb.step2.test.ts',
    '/test/unit/services/dynamodb.step4.test.ts',
    '/test/unit/services/minimal-dynamo-test.ts',
    '/test/unit/services/simple-put.test.ts',
    '/test/unit/services/test-simple.js',
    '/test/unit/services/basic-test.ts',
    '/test/unit/services/dynamodb.simplified.test.ts',
    '/.build/__tests__/'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['.'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleNameMapper: {
    '^@functions/(.*)$': '<rootDir>/src/functions/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/dist/',
    'jest.config.js',
    'serverless.ts',
    'webpack.config.js',
    '/__tests__/',
    '.d.ts',
  ],
};
