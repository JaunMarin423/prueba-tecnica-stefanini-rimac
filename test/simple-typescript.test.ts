// Simple TypeScript test
interface TestData {
  id: number;
  name: string;
}

describe('Simple TypeScript Test', () => {
  it('should work with TypeScript types', () => {
    const data: TestData = {
      id: 1,
      name: 'test'
    };
    
    expect(data.id).toBe(1);
    expect(data.name).toBe('test');
  });
});
