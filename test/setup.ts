// Configuración global para las pruebas
import { config } from 'dotenv';
import path from 'path';

// Cargar variables de entorno de prueba
config({ path: path.resolve(__dirname, '../.env.test') });

// Configurar valores por defecto para las variables de entorno
process.env.DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'test-table';
process.env.IS_OFFLINE = 'true';
process.env.USE_REAL_DYNAMODB = 'false';

// Configurar el mock de console para pruebas
const originalConsole = { ...console };

global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configurar el mock de Date para pruebas
global.Date.now = jest.fn(() => new Date('2023-01-01T00:00:00Z').getTime());
