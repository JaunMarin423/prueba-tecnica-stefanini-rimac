// Minimal test file to verify Jest setup
console.log('Minimal test file is being executed');

describe('Minimal Test Suite', () => {
  it('should pass a basic test', () => {
    console.log('Running minimal test...');
    expect(1 + 1).toBe(2);
  });
});
