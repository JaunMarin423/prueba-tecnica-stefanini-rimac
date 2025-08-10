import { APIGatewayProxyEvent } from 'aws-lambda';

export function createAPIGatewayEvent(
  httpMethod: string,
  path: string,
  body?: any,
  pathParameters: Record<string, string> | null = null,
  queryStringParameters: Record<string, string> | null = null,
  headers: Record<string, string> = {}
): APIGatewayProxyEvent {
  return {
    httpMethod,
    path,
    pathParameters,
    queryStringParameters,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : null,
    multiValueHeaders: {},
    isBase64Encoded: false,
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api-id',
      httpMethod,
      path,
      protocol: 'HTTP/1.1',
      requestId: 'test-request-id',
      requestTimeEpoch: Date.now(),
      resourceId: 'test-resource-id',
      resourcePath: path,
      stage: 'test',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'test-user-agent',
        userArn: null
      },
      authorizer: {},
      pathParameters: pathParameters,
      requestTime: new Date().toISOString()
    } as any,
    resource: path,
    multiValueQueryStringParameters: null,
    stageVariables: null
  };
}

export function createContext() {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test-function',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test-function',
    logStreamName: '2023/01/01/[$LATEST]test-log-stream',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {}
  };
}
