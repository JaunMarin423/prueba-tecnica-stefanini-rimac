// Mock para axios
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  create: jest.fn(() => mockAxios),
  defaults: {
    headers: {
      common: {}
    }
  }
};

// Configurar valores por defecto
mockAxios.get.mockResolvedValue({ data: {} });
mockAxios.post.mockResolvedValue({ data: {} });

module.exports = mockAxios;
