import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'stefanini-rimac-api',
  frameworkVersion: '3',
  plugins: [
    'serverless-offline',
    'serverless-esbuild',
    'serverless-iam-roles-per-function',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      DYNAMODB_TABLE: '${self:service}-${sls:stage}',
      REGION: '${self:provider.region}',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
            ],
            Resource: [
              'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}',
              'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}/index/*'
            ],
          },
        ],
      },
    },
  },
  functions: {
    debug: {
      handler: 'src/functions/debug/handler.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'debug/cache',
            cors: true,
          },
        },
      ],
    },
    getCombinedData: {
      handler: 'src/functions/getCombinedData/handler.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'fusionados/{characterId}',
            cors: true,
          },
        },
      ],
    },
    storeCustomData: {
      handler: 'src/functions/storeCustomData/handler.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'almacenar',
            cors: true,
          },
        },
      ],
    },
    getHistory: {
      handler: 'src/functions/getHistory/handler.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'historial',
            cors: true,
          },
        },
      ],
    },
  },
  package: { 
    individually: true,
    patterns: [
      '!node_modules/**',
      '!.git/**',
      '!dist/**',
      '!.serverless/**',
      '!.idea/**',
      '!.vscode/**',
      '!.eslintrc.js',
      '!.prettierrc.js',
      '!jest.config.js',
      '!webpack.config.js',
      '!tsconfig.json',
      '!tsconfig.build.json',
      '!package*.json',
      '!yarn.lock',
      '!package-lock.json',
    ],
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      ApiGatewayRestApi: {
        Type: 'AWS::ApiGateway::RestApi',
        Properties: {
          Name: '${self:service}-${sls:stage}',
        },
      },
      DynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Retain',
        UpdateReplacePolicy: 'Retain',
        Properties: {
          TableName: '${self:provider.environment.DYNAMODB_TABLE}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            {
              AttributeName: 'PK',
              AttributeType: 'S',
            },
            {
              AttributeName: 'SK',
              AttributeType: 'S',
            },
            {
              AttributeName: 'GSI1PK',
              AttributeType: 'S',
            },
            {
              AttributeName: 'GSI1SK',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'PK',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'SK',
              KeyType: 'RANGE',
            },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'GSI1',
              KeySchema: [
                { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
              ],
              Projection: {
                ProjectionType: 'ALL'
              }
            }
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;