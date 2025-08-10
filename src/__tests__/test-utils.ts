import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

export const mockDynamoDB = () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);
  
  // Default mock implementations
  ddbMock.on(QueryCommand).resolves({ Items: [] });
  ddbMock.on(PutCommand).resolves({}); // Successful put operation
  
  return ddbMock;
};

export const mockContext = () => ({
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'test-function',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/test-function',
  logStreamName: '2023/01/01/[$LATEST]test-log-stream',
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
});

export const mockApiGatewayEvent = ({
  body = null,
  pathParameters = null,
  queryStringParameters: queryStringParametersParam = null,
  httpMethod = 'GET',
  path = '/',
} = {}): any => ({
  resource: path,
  path,
  httpMethod,
  headers: {
    'Content-Type': 'application/json',
  },
  multiValueHeaders: {},
  queryStringParameters: queryStringParametersParam,
  multiValueQueryStringParameters: queryStringParametersParam ? Object.entries(queryStringParametersParam).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: [value]
  }), {}) : null,
  pathParameters,
  stageVariables: null,
  requestContext: {
    resourceId: 'test-resource-id',
    resourcePath: path,
    httpMethod,
    extendedRequestId: 'test-request-id',
    requestTime: '01/Jan/2023:00:00:00 +0000',
    path,
    accountId: '123456789012',
    protocol: 'HTTP/1.1',
    stage: 'test',
    domainPrefix: 'test',
    requestTimeEpoch: 1672531200000,
    requestId: 'test-request-id',
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      sourceIp: '127.0.0.1',
      principalOrgId: null,
      accessKey: null,
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: 'test-user-agent',
      user: null,
    },
    domainName: 'test.execute-api.us-east-1.amazonaws.com',
    apiId: 'test-api-id',
  },
  body: body ? JSON.stringify(body) : null,
  isBase64Encoded: false,
});
