// Simple mock for axios that works with TypeScript and Jest
const mockAxios = {
  get: jest.fn().mockResolvedValue({
    data: {},
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {}
  }),
  post: jest.fn().mockResolvedValue({
    data: {},
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {}
  }),
  create: jest.fn(function() {
    return {
      get: this.get,
      post: this.post,
      defaults: this.defaults
    };
  }),
  defaults: {
    headers: {
      common: {}
    }
  }
};

export default mockAxios;
