import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, GetCommandOutput, QueryCommandOutput, ScanCommandOutput, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export interface CacheItem {
  PK: string;
  SK: string;
  data: any;
  ttl: number;
  createdAt: string;
  type: 'CACHE' | 'CUSTOM_DATA' | 'HISTORY';
}

export class DynamoDBService {
  private static instance: DynamoDBService;
  private static docClient: any;
  private static inMemoryDB = new Map<string, any>();
  
  // Make the table name configurable for testing
  private static getTableName() {
    return process.env.DYNAMODB_TABLE || 'stefanini-rimac-api-dev';
  }
  
  // Private constructor to prevent direct construction calls with the `new` operator
  private constructor() {}
  
  // Lazy initialization of the DynamoDB client
  private static getClient() {
    if (!DynamoDBService.docClient) {
      const useRealDynamoDB = process.env.USE_REAL_DYNAMODB === 'true' || process.env.IS_OFFLINE === 'false';
      
      if (!useRealDynamoDB) {
        // Mock implementation for testing
        DynamoDBService.docClient = {
          send: async (command: any) => {
            console.log('Mock DynamoDB - Received command:', command.constructor.name);
            
            if (command.input?.Item && command instanceof PutCommand) {
              const item = command.input.Item as CacheItem;
              const key = `${item.PK}_${item.SK}`;
              console.log(`Mock DynamoDB - Storing item with key: ${key}`, item);
              DynamoDBService.inMemoryDB.set(key, item);
              console.log('Mock DynamoDB - Current in-memory DB:', Array.from(DynamoDBService.inMemoryDB.entries()));
              return { $metadata: { httpStatusCode: 200 } };
              
            } else if (command.input?.Key && command instanceof GetCommand) {
              const key = `${command.input.Key.PK}_${command.input.Key.SK}`;
              console.log(`Mock DynamoDB - Getting item with key: ${key}`);
              const item = DynamoDBService.inMemoryDB.get(key);
              console.log('Mock DynamoDB - Retrieved item:', item);
              console.log('Mock DynamoDB - Current in-memory DB:', Array.from(DynamoDBService.inMemoryDB.entries()));
              return { Item: item, $metadata: { httpStatusCode: 200 } };
              
            } else if (command.input?.KeyConditionExpression && command instanceof QueryCommand) {
              const prefix = command.input.ExpressionAttributeValues?.[':type'] || '';
              console.log(`Mock DynamoDB - Querying items with type: ${prefix}`);
              const items = Array.from(DynamoDBService.inMemoryDB.values())
                .filter((item: any) => item.type === prefix)
                .sort((a: any, b: any) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
              console.log(`Mock DynamoDB - Found ${items.length} items`);
              return { Items: items, $metadata: { httpStatusCode: 200 } };
              
            } else if (command instanceof ScanCommand) {
              const items = Array.from(DynamoDBService.inMemoryDB.values());
              console.log(`Mock DynamoDB - Scan returning ${items.length} items`);
              return { 
                Items: items,
                $metadata: { httpStatusCode: 200 } 
              };
            }
            
            console.log('Mock DynamoDB - Unhandled command, returning empty response');
            return { $metadata: { httpStatusCode: 200 } };
          }
        };
      } else {
        // Real DynamoDB client
        const client = new DynamoDBClient({
          region: process.env.AWS_REGION || 'us-east-1'
        });
        DynamoDBService.docClient = DynamoDBDocumentClient.from(client);
      }
    }
    return DynamoDBService.docClient;
  }
  
  // Singleton pattern to ensure only one instance exists
  public static getInstance(): DynamoDBService {
    if (!DynamoDBService.instance) {
      DynamoDBService.instance = new DynamoDBService();
    }
    return DynamoDBService.instance;
  }
  
  // Reset the instance (for testing)
  public static resetInstance() {
    DynamoDBService.instance = new DynamoDBService();
    DynamoDBService.docClient = undefined;
    DynamoDBService.inMemoryDB.clear();
  }
  
  // Instance methods that use the lazy-initialized client
  async putItem(item: Omit<CacheItem, 'createdAt'>) {
    const timestamp = new Date().toISOString();
    const params = {
      TableName: DynamoDBService.getTableName(),
      Item: {
        ...item,
        GSI1PK: item.type,
        GSI1SK: timestamp,
        createdAt: timestamp,
      },
    };

    try {
      const client = DynamoDBService.getClient();
      const command = new PutCommand(params);
      await client.send(command);
      return { ...item, createdAt: timestamp };
    } catch (error) {
      console.error('Error putting item into DynamoDB:', error);
      throw error;
    }
  }
  
  async getItem(pk: string, sk: string): Promise<CacheItem | undefined> {
    const params = {
      TableName: DynamoDBService.getTableName(),
      Key: { PK: pk, SK: sk },
    };

    try {
      const client = DynamoDBService.getClient();
      const command = new GetCommand(params);
      const result = await client.send(command);
      return result.Item as CacheItem | undefined;
    } catch (error) {
      console.error('Error getting item from DynamoDB:', error);
      throw error;
    }
  }
  
  async queryByType(type: string, limit: number = 10, nextToken?: string) {
    const params = {
      TableName: DynamoDBService.getTableName(),
      IndexName: 'GSI1', // Assuming GSI1 is the name of your GSI
      KeyConditionExpression: 'GSI1PK = :type',
      ExpressionAttributeValues: {
        ':type': type,
      },
      Limit: limit,
      ScanIndexForward: false, // Sort by GSI1SK in descending order (newest first)
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
    };

    try {
      const client = DynamoDBService.getClient();
      const command = new QueryCommand(params);
      const result = await client.send(command);
      
      // Encode the LastEvaluatedKey for pagination
      const lastEvaluatedKey = result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') 
        : undefined;
      
      return {
        items: result.Items || [],
        lastEvaluatedKey,
      };
    } catch (error) {
      console.error('Error querying DynamoDB:', error);
      throw error;
    }
  }
  
  async scanTable(limit: number = 10, nextToken?: string) {
    const params = {
      TableName: DynamoDBService.getTableName(),
      Limit: limit,
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
    };

    try {
      const client = DynamoDBService.getClient();
      const command = new ScanCommand(params);
      const result = await client.send(command);
      
      // Encode the LastEvaluatedKey for pagination
      const lastEvaluatedKey = result.LastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') 
        : undefined;
      
      return {
        items: result.Items || [],
        lastEvaluatedKey,
      };
    } catch (error) {
      console.error('Error scanning DynamoDB:', error);
      throw error;
    }
  }
}

export default DynamoDBService.getInstance();
