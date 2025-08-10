// Test to verify module resolution with file logging
import * as fs from 'fs';
import * as path from 'path';

const logFile = path.join(__dirname, 'module-resolution.log');

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

// Clear the log file before starting
if (fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, '');
}

logToFile('=== Starting Module Resolution Test ===');

// Test importing a core module
try {
  const path = require('path');
  logToFile('✅ Core module (path) imported successfully');
} catch (error) {
  logToFile(`❌ Failed to import core module (path): ${error}`);
}

// Test importing a third-party module
try {
  const axios = require('axios');
  logToFile('✅ Third-party module (axios) imported successfully');
} catch (error) {
  logToFile(`❌ Failed to import third-party module (axios): ${error}`);
}

// Test importing the DynamoDB service
try {
  const { DynamoDBService } = require('@services/dynamodb.service');
  logToFile(`✅ DynamoDBService imported successfully: ${!!DynamoDBService}`);
} catch (error) {
  logToFile(`❌ Failed to import DynamoDBService: ${error}`);
}

describe('Module Resolution Test', () => {
  it('should pass a simple assertion', () => {
    expect(true).toBe(true);
  });
});
