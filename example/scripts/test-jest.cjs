const { execSync } = require('child_process');
const path = require('path');

const sdkRoot = path.join(__dirname, '..', '..');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, COLORS.green);
}

function logError(message) {
  log(`❌ ${message}`, COLORS.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, COLORS.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, COLORS.cyan);
}

async function runJestTests() {
  log('\n' + '='.repeat(60), COLORS.bright);
  log('🧪 Running Jest Unit Tests', COLORS.bright);
  log('='.repeat(60) + '\n');

  try {
    logInfo('Running Jest tests with real Rootstock RPC data (NO MOCKS)...\n');

    execSync('npx jest', {
      stdio: 'inherit',
      cwd: sdkRoot,
      env: {
        ...process.env,
        ROOTSTOCK_MAINNET_RPC: 'https://public-node.rsk.co',
        ROOTSTOCK_TESTNET_RPC: 'https://public-node.testnet.rsk.co',
      },
    });

    logSuccess('\nAll Jest tests passed!');
    return true;
  } catch (error) {
    logError(`Jest tests failed: ${error.message}`);
    return false;
  }
}

runJestTests()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
