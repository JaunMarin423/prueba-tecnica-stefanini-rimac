// Minimal Jest configuration for testing with TypeScript support
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  verbose: true,
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true,
  silent: false,
  transform: {
    '^.+\\.tsx?$': ['@swc/jest', {
      jsc: {
        target: 'es2020',
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
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@services$': '<rootDir>/src/services/index.ts',
  },
  modulePaths: [
    '<rootDir>/src',
  ],
};
