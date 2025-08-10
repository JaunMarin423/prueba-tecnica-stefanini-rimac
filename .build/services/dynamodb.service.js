"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBService = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
// Check if we should use the real DynamoDB
const USE_REAL_DYNAMODB = process.env.USE_REAL_DYNAMODB === 'true' || process.env.IS_OFFLINE === 'false';
// Mock in-memory database for offline development
const inMemoryDB = new Map();
// Helper function to get the DynamoDB client
function getDynamoDBClient() {
    if (!USE_REAL_DYNAMODB) {
        console.log('Using MOCK DynamoDB (USE_REAL_DYNAMODB is not set to true)');
        // Mock DynamoDB client for offline development
        return {
            send: async (command) => {
                if (command.input?.Item && command instanceof lib_dynamodb_1.PutCommand) {
                    const item = command.input.Item;
                    const key = `${item.PK}_${item.SK}`;
                    inMemoryDB.set(key, item);
                    console.log('Mock DynamoDB - Item saved:', item);
                    return {};
                }
                else if (command.input?.Key && command instanceof lib_dynamodb_1.GetCommand) {
                    const key = `${command.input.Key.PK}_${command.input.Key.SK}`;
                    const item = inMemoryDB.get(key);
                    console.log('Mock DynamoDB - Item retrieved:', item);
                    return item ? { Item: item } : {};
                }
                else if (command.input?.KeyConditionExpression && command instanceof lib_dynamodb_1.QueryCommand) {
                    // Simple mock implementation for query
                    const queryParams = command.input;
                    const prefix = queryParams.ExpressionAttributeValues?.[':type'] || '';
                    const items = Array.from(inMemoryDB.values())
                        .filter((item) => item.type === prefix)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    console.log('Mock DynamoDB - Query result:', items);
                    return { Items: items };
                }
                return {};
            }
        };
    }
    // Use real DynamoDB
    console.log('Using REAL DynamoDB with table:', process.env.DYNAMODB_TABLE);
    const client = new client_dynamodb_1.DynamoDBClient({
        region: process.env.AWS_REGION || 'us-east-1'
    });
    return lib_dynamodb_1.DynamoDBDocumentClient.from(client);
}
class DynamoDBService {
    static async putItem(item) {
        const timestamp = new Date().toISOString();
        const params = {
            TableName: this.TABLE_NAME,
            Item: {
                ...item,
                GSI1PK: item.type,
                GSI1SK: timestamp,
                createdAt: timestamp,
            },
        };
        try {
            await this.docClient.send(new lib_dynamodb_1.PutCommand(params));
            return { ...item, createdAt: timestamp };
        }
        catch (error) {
            console.error('Error putting item into DynamoDB:', error);
            throw error;
        }
    }
    static async getItem(pk, sk) {
        const params = {
            TableName: this.TABLE_NAME,
            Key: {
                PK: pk,
                SK: sk,
            },
        };
        try {
            const result = await this.docClient.send(new lib_dynamodb_1.GetCommand(params));
            return result.Item;
        }
        catch (error) {
            console.error('Error getting item from DynamoDB:', error);
            throw error;
        }
    }
    static async queryByType(type, limit = 10, nextToken) {
        const params = {
            TableName: this.TABLE_NAME,
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :type',
            ExpressionAttributeValues: {
                ':type': type,
            },
            Limit: limit,
            ScanIndexForward: false, // Sort by GSI1SK (timestamp) in descending order
            ...(nextToken && { ExclusiveStartKey: JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8')) }),
        };
        try {
            const result = await this.docClient.send(new lib_dynamodb_1.QueryCommand(params));
            const { Items = [], LastEvaluatedKey } = result;
            return {
                items: Items || [],
                nextToken: LastEvaluatedKey
                    ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64')
                    : undefined,
            };
        }
        catch (error) {
            console.error('Error querying DynamoDB:', error);
            throw error;
        }
    }
    static async scanTable(limit = 10, nextToken) {
        const params = {
            TableName: this.TABLE_NAME,
            Limit: limit,
            ...(nextToken && { ExclusiveStartKey: JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8')) }),
        };
        try {
            const result = await this.docClient.send(new lib_dynamodb_1.ScanCommand(params));
            const { Items = [], LastEvaluatedKey } = result;
            return {
                items: Items || [],
                nextToken: LastEvaluatedKey
                    ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64')
                    : undefined,
            };
        }
        catch (error) {
            console.error('Error scanning DynamoDB:', error);
            throw error;
        }
    }
}
exports.DynamoDBService = DynamoDBService;
DynamoDBService.TABLE_NAME = process.env.DYNAMODB_TABLE || 'stefanini-rimac-api-dev';
DynamoDBService.docClient = getDynamoDBClient();
