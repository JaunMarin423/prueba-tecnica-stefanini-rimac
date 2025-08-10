import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

async function testDynamoDB() {
  const client = new DynamoDB({
    endpoint: 'http://localhost:8000',
    region: 'local',
    credentials: {
      accessKeyId: 'fake',
      secretAccessKey: 'fake'
    }
  });

  const docClient = DynamoDBDocumentClient.from(client);

  try {
    console.log('=== Testing DynamoDB Connection ===');
    
    // List all tables
    console.log('\n1. Listing tables...');
    const tables = await client.listTables({});
    console.log('Tables:', tables.TableNames);

    // Check if test-table exists
    const tableName = 'test-table';
    console.log(`\n2. Checking if '${tableName}' exists...`);
    
    if (tables.TableNames?.includes(tableName)) {
      console.log(`Table '${tableName}' exists`);
      
      // Try to scan the table
      try {
        console.log(`\n3. Scanning '${tableName}'...`);
        const scanResult = await docClient.send(new ScanCommand({
          TableName: tableName,
          Limit: 5
        }));
        
        console.log(`Scan successful. Found ${scanResult.Items?.length || 0} items.`);
        if (scanResult.Items && scanResult.Items.length > 0) {
          console.log('First few items:', JSON.stringify(scanResult.Items, null, 2));
        }
      } catch (scanError) {
        console.error('Error scanning table:', scanError);
      }
    } else {
      console.log(`Table '${tableName}' does not exist`);
      
      // Try to create the table
      try {
        console.log(`\n3. Attempting to create '${tableName}'...`);
        await client.createTable({
          TableName: tableName,
          KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        });
        console.log(`Table '${tableName}' created successfully`);
      } catch (createError: any) {
        console.error('Error creating table:', createError.message);
      }
    }
  } catch (error) {
    console.error('Error testing DynamoDB:', error);
  } finally {
    console.log('\n=== Test Complete ===');
  }
}

testDynamoDB().catch(console.error);
