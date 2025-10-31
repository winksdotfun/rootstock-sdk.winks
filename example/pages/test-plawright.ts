const { execSync } = require('child_process');
const path = require('path');

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

async function checkPlaywrightInstalled() {
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function installPlaywrightBrowsers() {
  try {
    logInfo('Installing Playwright browsers...');
    execSync('npx playwright install chromium', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    logSuccess('Playwright browsers installed');
    return true;
  } catch (error) {
    logError(`Failed to install Playwright browsers: ${error.message}`);
    return false;
  }
}

async function checkExampleAppRunning() {
  const http = require('http');
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', { timeout: 2000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runPlaywrightTests() {
  log('\n' + '='.repeat(60), COLORS.bright);
  log('🎭 Running Playwright E2E Tests', COLORS.bright);
  log('='.repeat(60) + '\n');

  try {
    // Check if Playwright is installed
    if (!await checkPlaywrightInstalled()) {
      logWarning('Playwright not found. Installing...');
      // It will be installed via npx
    }

    // Check if example app is running
    logInfo('Checking if example app is running on http://localhost:3000...');
    const appRunning = await checkExampleAppRunning();
    
    if (!appRunning) {
      logError('Example app is NOT running on http://localhost:3000');
      logWarning('\n⚠️  E2E tests require the example app to be running!');
      logInfo('\n💡 To start the example app:');
      logInfo('   1. Open a new terminal');
      logInfo('   2. Run: cd example && npm run dev');
      logInfo('   3. Wait for "Ready in ..." message');
      logInfo('   4. Then run this test script again\n');
      logInfo('   Or run tests anyway (they will likely fail):');
      logInfo('   npm run test:e2e -- --ignore-snapshots\n');
      
      // Ask if user wants to continue anyway
      return false;
    }
    
    logSuccess('✅ Example app is running!');
    logInfo('\nRunning Playwright E2E tests with real Rootstock RPC data (NO MOCKS)...\n');
    
    // Run Playwright tests
    execSync('npx playwright test', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        // Ensure tests use real RPC endpoints
        ROOTSTOCK_MAINNET_RPC: 'https://public-node.rsk.co',
        ROOTSTOCK_TESTNET_RPC: 'https://public-node.testnet.rsk.co',
      },
    });
    
    logSuccess('\n✅ All Playwright E2E tests passed!');
    return true;
  } catch (error) {
    logError(`Playwright tests failed: ${error.message}`);
    if (!error.message.includes('ECONNREFUSED') && !error.message.includes('timeout')) {
      logInfo('\n💡 Make sure the example app is running: cd example && npm run dev');
    }
    return false;
  }
}

// Run tests
runPlaywrightTests()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });

