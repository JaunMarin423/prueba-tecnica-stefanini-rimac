// Mock para @aws-sdk/lib-dynamodb
const mockSend = jest.fn();

const mockDynamoDBDocumentClient = {
  send: mockSend,
};

const DynamoDBDocumentClient = {
  from: jest.fn(() => mockDynamoDBDocumentClient),
};

// Mock de los comandos con propiedades de tipo necesarias
const createMockCommand = (commandName: string) => {
  const mock = jest.fn().mockImplementation((params: any) => ({
    input: {
      ...params,
      Command: commandName,
    },
  }));
  
  // Añadir propiedades de tipo para TypeScript
  Object.defineProperty(mock, 'name', { value: commandName });
  return mock;
};

const QueryCommand = createMockCommand('QueryCommand');
const GetCommand = createMockCommand('GetCommand');
const PutCommand = createMockCommand('PutCommand');
const ScanCommand = createMockCommand('ScanCommand');

export {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  mockSend
};
