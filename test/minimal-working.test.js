// Minimal working test to verify Jest setup
console.log('=== Starting minimal working test ===');

describe('Minimal Working Test', () => {
  it('should pass a simple assertion', () => {
    console.log('Running minimal test...');
    expect(1 + 1).toBe(2);
  });
});
