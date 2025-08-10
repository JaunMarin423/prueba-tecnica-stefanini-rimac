// Custom test environment to capture console output
const NodeEnvironment = require('jest-environment-node');

class CustomTestEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    console.log('Custom test environment setup');
  }

  async setup() {
    await super.setup();
    console.log('Test environment setup complete');
  }

  async teardown() {
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
}

module.exports = CustomTestEnvironment;
