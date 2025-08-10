// Simple test to verify module imports
console.log('=== Starting Simple Import Test ===');

// Test importing a core module
import * as path from 'path';

// Test importing a third-party module
import * as axios from 'axios';

// Test importing a local module
import * as example from '../../../example-module';

describe('Simple Import Test', () => {
  it('should import core modules', () => {
    console.log('Testing core module import');
    expect(path.join).toBeDefined();
  });

  // it('should import third-party modules', () => {
  //   console.log('Testing third-party module import');
  //   expect(axios.get).toBeDefined();
  // });

  it('should import local modules', () => {
    console.log('Testing local module import');
    expect(example.hello).toBeDefined();
    expect(example.hello()).toBe('world');
  });
});
