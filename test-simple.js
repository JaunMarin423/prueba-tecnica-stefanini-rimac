// Simple test file in the root directory
console.log('=== Starting simple test in root ===');

test('simple test', () => {
  console.log('Running simple test...');
  expect(1 + 1).toBe(2);
});
