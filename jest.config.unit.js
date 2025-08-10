module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: [
    '**/test/unit/**/*.test.ts',
    '**/test/unit/**/*.test.js'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
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
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text', 'lcov', 'json', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/dist/',
    'jest.config.js',
    'serverless.ts',
    'webpack.config.js',
    '/__tests__/'
  ]
};
