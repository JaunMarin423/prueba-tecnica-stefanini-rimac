// Configuration for running TypeScript tests with Jest
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['<rootDir>/test', '<rootDir>/src'],
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
      },
    }],
  },
  moduleNameMapper: {
    '^@services/(.*)$': '<rootDir>/src/services/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  detectOpenHandles: true,
  forceExit: true,
}
