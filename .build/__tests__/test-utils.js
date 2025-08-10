"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockApiGatewayEvent = exports.mockContext = exports.mockDynamoDB = void 0;
const aws_sdk_client_mock_1 = require("aws-sdk-client-mock");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const mockDynamoDB = () => {
    const ddbMock = (0, aws_sdk_client_mock_1.mockClient)(lib_dynamodb_1.DynamoDBDocumentClient);
    // Default mock implementations
    ddbMock.on(lib_dynamodb_1.QueryCommand).resolves({ Items: [] });
    ddbMock.on(lib_dynamodb_1.PutCommand).resolves({}); // Successful put operation
    return ddbMock;
};
exports.mockDynamoDB = mockDynamoDB;
const mockContext = () => ({
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test-function',
    logStreamName: '2023/01/01/[$LATEST]test-log-stream',
    getRemainingTimeInMillis: () => 30000,
    done: () => { },
    fail: () => { },
    succeed: () => { },
});
exports.mockContext = mockContext;
const mockApiGatewayEvent = ({ body = null, pathParameters = null, queryStringParameters: queryStringParametersParam = null, httpMethod = 'GET', path = '/', } = {}) => ({
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
exports.mockApiGatewayEvent = mockApiGatewayEvent;
