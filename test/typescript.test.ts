// Simple TypeScript test
describe('TypeScript Test', () => {
  interface TestData {
    id: number;
    name: string;
  }

  it('should work with TypeScript types', () => {
    const data: TestData = {
      id: 1,
      name: 'test'
    };
    
    expect(data.id).toBe(1);
    expect(data.name).toBe('test');
  });
});
