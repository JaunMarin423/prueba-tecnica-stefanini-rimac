// Minimal Jest configuration for debugging test detection issues
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/test-minimal.js', '**/test/unit/**/*.test.ts', '**/test/unit/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['.'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  }
}
