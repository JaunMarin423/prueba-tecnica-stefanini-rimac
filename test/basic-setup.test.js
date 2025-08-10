// Basic test to verify Jest is working
console.log('=== Starting Basic Setup Test (JavaScript) ===');

describe('Basic Setup Test', () => {
  it('should run a simple test', () => {
    console.log('Running basic test');
    expect(1 + 1).toBe(2);
  });

  it('should import core modules', () => {
    console.log('Testing core module import');
    const path = require('path');
    expect(path.join).toBeDefined();
  });
});
