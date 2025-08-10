import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  ScanCommand, 
  DeleteCommand,
  type QueryCommandInput, 
  type ScanCommandInput, 
  type PutCommandInput, 
  type GetCommandInput,
  type QueryCommandOutput,
  type ScanCommandOutput,
  type DeleteCommandInput,
  type DeleteCommandOutput
} from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

// Interface for the DynamoDB client to make it easier to mock
export interface IDynamoDBClient {
  send: (command: any) => Promise<any>;
}

// Interface for the DynamoDB service
export interface IDynamoDBService {
  putItem(item: Omit<CacheItem, 'createdAt'>): Promise<CacheItem>;
  getItem(pk: string, sk: string): Promise<CacheItem | undefined>;
  queryItems(type: string, limit?: number): Promise<CacheItem[]>;
  scanItems(limit?: number): Promise<CacheItem[]>;
  deleteItem(pk: string, sk: string): Promise<boolean>;
  // Static methods
  getItemStatic?(pk: string, sk: string): Promise<CacheItem | undefined>;
}

// Static methods interface
export interface IDynamoDBServiceStatic {
  getItem(pk: string, sk: string): Promise<CacheItem | undefined>;
}

// Helper function to create a real DynamoDB client
export function createDynamoDBClient(): IDynamoDBClient {
  if (process.env.USE_REAL_DYNAMODB !== 'true' && process.env.IS_OFFLINE !== 'false') {
    console.log('Using MOCK DynamoDB (USE_REAL_DYNAMODB is not set to true)');
    return createMockDynamoDBClient();
  }
  
  // Use real DynamoDB
  console.log('Using REAL DynamoDB with table:', process.env.DYNAMODB_TABLE);
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
    },
    endpoint: process.env.IS_OFFLINE ? 'http://localhost:8000' : undefined,
  });
  
  // Create a DynamoDB Document Client from the DynamoDB client
  return DynamoDBDocumentClient.from(client);
}

// In-memory storage for the mock DynamoDB
const inMemoryDB = new Map<string, any>();

// Create a mock DynamoDB client for testing
export function createMockDynamoDBClient(): IDynamoDBClient {
  return {
    send: async (command: any) => {
      const commandName = command.constructor?.name || command.name || 'UnknownCommand';
      console.log('\n--- Mock DynamoDB ---');
      console.log(`Received command: ${commandName}`);
      console.log('Command input:', JSON.stringify(command.input, null, 2));
      console.log('Current in-memory DB state:', Array.from(inMemoryDB.entries()));
      
      if (command.input?.Item && (command.name === 'PutCommand' || command instanceof PutCommand)) {
        const item = command.input.Item as CacheItem;
        const key = `${item.PK}_${item.SK}`;
        console.log(`Mock DynamoDB - Storing item with key: ${key}`, item);
        inMemoryDB.set(key, item);
        console.log('Mock DynamoDB - Current in-memory DB:', Array.from(inMemoryDB.entries()));
        return { $metadata: { httpStatusCode: 200 } };
        
      } else if (command.input?.Key && (command.name === 'GetCommand' || command instanceof GetCommand)) {
        const key = `${command.input.Key.PK}_${command.input.Key.SK}`;
        console.log(`Mock DynamoDB - Getting item with key: ${key}`);
        const item = inMemoryDB.get(key);
        console.log('Mock DynamoDB - Retrieved item:', item);
        console.log('Mock DynamoDB - Current in-memory DB:', Array.from(inMemoryDB.entries()));
        return { Item: item, $metadata: { httpStatusCode: 200 } };
        
      } else if ((command.input?.KeyConditionExpression || command.input?.ExpressionAttributeValues) && 
                (command.name === 'QueryCommand' || command instanceof QueryCommand)) {
        const prefix = command.input.ExpressionAttributeValues?.[':type'] || '';
        console.log(`Mock DynamoDB - Querying items with type: ${prefix}`);
        const items = Array.from(inMemoryDB.values())
          .filter((item: any) => item.type === prefix)
          .sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        console.log(`Mock DynamoDB - Found ${items.length} items`);
        return { Items: items, $metadata: { httpStatusCode: 200 } };
        
      } else if (command.name === 'ScanCommand' || command instanceof ScanCommand) {
        const items = Array.from(inMemoryDB.values());
        console.log(`Mock DynamoDB - Scan returning ${items.length} items`);
        return { 
          Items: items,
          $metadata: { httpStatusCode: 200 } 
        };
        
      } else if (command.name === 'DeleteCommand' || command instanceof DeleteCommand) {
        const key = `${command.input.Key.PK}_${command.input.Key.SK}`;
        const existed = inMemoryDB.has(key);
        if (existed) {
          inMemoryDB.delete(key);
          console.log(`Mock DynamoDB - Deleted item with key: ${key}`);
        } else {
          console.log(`Mock DynamoDB - Item with key ${key} not found for deletion`);
        }
        return { $metadata: { httpStatusCode: 200 } };
      }
      return {};
    }
  };
}

export interface CacheItem {
  PK: string;
  SK: string;
  data: any;
  ttl: number;
  createdAt: string;
  type: 'CACHE' | 'CUSTOM_DATA' | 'HISTORY';
  GSI1PK: string;
  GSI1SK: string;
  [key: string]: any; // Allow additional properties
}

// Default implementation of IDynamoDBService
export class DynamoDBService implements IDynamoDBService, IDynamoDBServiceStatic {
  private static instance: DynamoDBService;
  private docClient: IDynamoDBClient;
  private readonly tableName: string;

  // Make constructor public for testing purposes but mark as @internal
  /** @internal */
  constructor(docClient?: IDynamoDBClient) {
    this.docClient = docClient || createDynamoDBClient();
    this.tableName = process.env.DYNAMODB_TABLE || 'stefanini-rimac-api-dev';
  }

  private static getInstance(): DynamoDBService {
    if (!DynamoDBService.instance) {
      DynamoDBService.instance = new DynamoDBService();
    }
    return DynamoDBService.instance;
  }

  // Instance method that implements the interface
  async getItem(pk: string, sk: string): Promise<CacheItem | undefined> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { PK: pk, SK: sk },
    });

    try {
      const { Item } = await this.docClient.send(command);
      return Item as CacheItem | undefined;
    } catch (error) {
      console.error('Error getting item from DynamoDB:', error);
      throw error;
    }
  }

  async putItem(item: Omit<CacheItem, 'createdAt'>): Promise<CacheItem> {
    const timestamp = new Date().toISOString();
    // Ensure all required CacheItem properties are included
    const itemWithMetadata: CacheItem = {
      ...item,
      // Ensure required fields have default values if not provided
      PK: item.PK,
      SK: item.SK,
      data: item.data || {},
      ttl: item.ttl || Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // Default 30 days
      type: item.type || 'CACHE',
      GSI1PK: item.GSI1PK || item.type,
      GSI1SK: item.GSI1SK || timestamp,
      createdAt: timestamp,
    };
    
    const params = {
      TableName: this.tableName,
      Item: itemWithMetadata,
    };

    try {
      await this.docClient.send(new PutCommand(params));
      return itemWithMetadata;
    } catch (error) {
      console.error('Error putting item into DynamoDB:', error);
      throw error;
    }
  }

  // Static method to put an item
  static async putItemStatic(item: Omit<CacheItem, 'createdAt'>): Promise<CacheItem> {
    const instance = DynamoDBService.getInstance();
    return instance.putItem(item);
  }

  // Static method to get an item by primary key
  static async getItemStatic(pk: string, sk: string): Promise<CacheItem | undefined> {
    const instance = DynamoDBService.getInstance();
    const command = new GetCommand({
      TableName: instance.tableName,
      Key: { PK: pk, SK: sk },
    });

    const response = await instance.docClient.send(command);
    return response.Item as CacheItem | undefined;
  }

  // Instance method for querying items by type
  async queryItems(type: string, limit: number = 10): Promise<CacheItem[]> {
    try {
      // Primero intentamos con el GSI
      try {
        const params = {
          TableName: this.tableName,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :type',
          ExpressionAttributeValues: {
            ':type': type,
          },
          Limit: limit,
          ScanIndexForward: false,
        };

        const result = await this.docClient.send(new QueryCommand(params)) as any;
        const items = result.Items || [];
        return items as CacheItem[];
      } catch (error: any) {
        // Si falla con GSI, intentamos con un scan
        if (error.name === 'ValidationException' && error.message.includes('specified index: GSI1')) {
          console.log('GSI1 no encontrado, usando scan como alternativa');
          
          const scanParams = {
            TableName: this.tableName,
            FilterExpression: '#type = :type',
            ExpressionAttributeNames: {
              '#type': 'type',
            },
            ExpressionAttributeValues: {
              ':type': type,
            },
            Limit: limit,
          };

          const result = await this.docClient.send(new ScanCommand(scanParams)) as any;
          const items = result.Items || [];
          const sortedItems = [...items as CacheItem[]].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          return sortedItems.slice(0, limit);
        }
        throw error; // Relanzar otros errores
      }
    } catch (error) {
      console.error('Error querying DynamoDB:', error);
      throw error;
    }
  }

  async scanItems(limit: number = 10): Promise<CacheItem[]> {
    const params = {
      TableName: this.tableName,
      Limit: limit,
    };

    try {
      const result = await this.docClient.send(new ScanCommand(params));
      return (result.Items || []) as CacheItem[];
    } catch (error) {
      console.error('Error scanning items from DynamoDB:', error);
      throw error;
    }
  }

  async deleteItem(pk: string, sk: string): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: {
        PK: pk,
        SK: sk,
      },
    };

    try {
      const result = await this.docClient.send(new DeleteCommand(params));
      return true; // Assume success if no error is thrown
    } catch (error) {
      console.error('Error deleting item from DynamoDB:', error);
      throw error;
    }
  }
}
