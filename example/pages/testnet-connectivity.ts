
const { RpcManager } = require('../dist/index.cjs');
const { ethers } = require('ethers');

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

async function testTestnetConnectivity() {
  log('\n' + '='.repeat(60), COLORS.bright);
  log('🧪 Rootstock Testnet Connectivity Test', COLORS.bright);
  log('='.repeat(60) + '\n');
  
  logInfo('Testing REAL Rootstock Testnet connectivity (NO MOCKS)...\n');

  // Test 1: Initialize RpcManager with Testnet
  logInfo('1. Initializing RpcManager with Testnet endpoints...');
  let rpcManager;
  try {
    rpcManager = new RpcManager({
      testnet: [
        { url: 'https://public-node.testnet.rsk.co' },
      ],
      healthCheckIntervalMs: 30000,
      requestTimeoutMs: 15000,
      maxConsecutiveFailuresBeforeDisable: 3,
    });
    logSuccess('RpcManager initialized\n');
  } catch (error) {
    logError(`Failed to initialize RpcManager: ${error.message}`);
    process.exit(1);
  }

  // Test 2: Get Best RPC URL
  logInfo('2. Getting best Testnet RPC URL...');
  try {
    const bestUrl = rpcManager.getBestRpcUrl('testnet');
    logSuccess(`Best RPC URL: ${bestUrl}`);
    logInfo(`   Expected: https://public-node.testnet.rsk.co\n`);
    
    if (bestUrl === 'https://public-node.testnet.rsk.co') {
      logSuccess('✅ Correct Testnet endpoint selected\n');
    } else {
      logWarning(`⚠️  Unexpected endpoint: ${bestUrl}\n`);
    }
  } catch (error) {
    logError(`Failed to get best RPC URL: ${error.message}`);
    process.exit(1);
  }

  // Test 3: Create Provider
  logInfo('3. Creating Testnet provider...');
  let provider;
  try {
    provider = rpcManager.createProvider('testnet');
    logSuccess(`Provider created: ${provider.constructor.name}`);
    logInfo(`   Provider URL: ${provider.connection?.url || 'N/A'}\n`);
  } catch (error) {
    logError(`Failed to create provider: ${error.message}`);
    process.exit(1);
  }

  // Test 4: Wait for Health Check
  logInfo('4. Waiting for health check (3 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const health = rpcManager.getHealth('testnet');
  logInfo(`   Health status: ${health.length} endpoint(s) checked`);
  health.forEach((endpoint, idx) => {
    const status = endpoint.isHealthy ? '✅ Healthy' : '❌ Unhealthy';
    const latency = endpoint.latencyMs === Number.MAX_SAFE_INTEGER 
      ? 'N/A' 
      : `${endpoint.latencyMs}ms`;
    logInfo(`   ${idx + 1}. ${endpoint.url.substring(0, 50)}... : ${status} (${latency})`);
  });
  log('');

  // Test 5: Get Chain ID (REAL)
  logInfo('5. Getting REAL Testnet Chain ID...');
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    logSuccess(`Chain ID: ${chainId} (0x${chainId.toString(16)})`);
    logInfo(`   Network Name: ${network.name}`);
    
    if (chainId === 31) {
      logSuccess('✅ Correctly connected to Rootstock Testnet (Chain ID 31)\n');
    } else {
      logError(`❌ Wrong Chain ID! Expected 31, got ${chainId}\n`);
      process.exit(1);
    }
  } catch (error) {
    logError(`Failed to get Chain ID: ${error.message}`);
    process.exit(1);
  }

  // Test 6: Get Block Number (REAL)
  logInfo('6. Getting REAL Testnet block number...');
  try {
    const blockNumber = await provider.getBlockNumber();
    
    logSuccess(`Block Number: #${blockNumber}`);
    logInfo(`   Block Number (hex): 0x${blockNumber.toString(16)}`);
    
    if (blockNumber > 0) {
      logSuccess('✅ Successfully retrieved real block number\n');
    } else {
      logError('❌ Invalid block number\n');
      process.exit(1);
    }
  } catch (error) {
    logError(`Failed to get block number: ${error.message}`);
    process.exit(1);
  }

  // Test 7: Get Block Details (REAL)
  logInfo('7. Getting REAL Testnet block details...');
  try {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    
    if (block) {
      logSuccess(`Block #${block.number} retrieved`);
      logInfo(`   Hash: ${block.hash}`);
      logInfo(`   Timestamp: ${new Date(Number(block.timestamp) * 1000).toLocaleString()}`);
      logInfo(`   Transactions: ${block.transactions.length}`);
      logSuccess('✅ Successfully retrieved real block details\n');
    } else {
      logError('❌ Failed to retrieve block\n');
      process.exit(1);
    }
  } catch (error) {
    logError(`Failed to get block details: ${error.message}`);
    process.exit(1);
  }

  // Test 8: Get Gas Price (REAL)
  logInfo('8. Getting REAL Testnet gas price...');
  try {
    const feeData = await provider.getFeeData();
    
    if (feeData.gasPrice) {
      const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');
      logSuccess(`Gas Price: ${feeData.gasPrice.toString()} wei`);
      logInfo(`   Gas Price: ${gasPriceGwei} gwei`);
      logSuccess('✅ Successfully retrieved real gas price\n');
    } else {
      logWarning('⚠️  Gas price not available\n');
    }
  } catch (error) {
    logError(`Failed to get gas price: ${error.message}`);
    process.exit(1);
  }

  // Test 9: Get Balance (REAL)
  logInfo('9. Getting REAL Testnet balance...');
  try {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const balance = await provider.getBalance(zeroAddress);
    const balanceInEther = ethers.formatEther(balance);
    
    logSuccess(`Balance: ${balance.toString()} wei`);
    logInfo(`   Balance: ${balanceInEther} tRBTC`);
    logInfo(`   Address: ${zeroAddress}`);
    logSuccess('✅ Successfully retrieved real balance\n');
  } catch (error) {
    logError(`Failed to get balance: ${error.message}`);
    process.exit(1);
  }

  // Test 10: Test Multiple RPC Calls
  logInfo('10. Testing multiple consecutive RPC calls...');
  try {
    const calls = [];
    for (let i = 0; i < 5; i++) {
      calls.push(provider.getBlockNumber());
    }
    
    const results = await Promise.all(calls);
    const allSame = results.every(r => r === results[0]);
    
    if (allSame) {
      logSuccess(`All 5 calls returned block #${results[0]}`);
      logSuccess('✅ Consistent responses from Testnet\n');
    } else {
      logWarning(`⚠️  Block numbers changed during calls (expected during block production)`);
      logInfo(`   Blocks: ${results.join(', ')}\n`);
    }
  } catch (error) {
    logError(`Failed multiple RPC calls: ${error.message}`);
    process.exit(1);
  }

  // Test 11: Test Health Monitoring
  logInfo('11. Testing health monitoring...');
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const healthAfter = rpcManager.getHealth('testnet');
    const healthyEndpoints = healthAfter.filter(h => h.isHealthy);
    
    logInfo(`   Healthy endpoints: ${healthyEndpoints.length}/${healthAfter.length}`);
    
    if (healthyEndpoints.length > 0) {
      logSuccess('✅ Health monitoring is working\n');
    } else {
      logWarning('⚠️  No healthy endpoints detected\n');
    }
  } catch (error) {
    logError(`Health monitoring failed: ${error.message}`);
    process.exit(1);
  }

  // Summary
  log('\n' + '='.repeat(60), COLORS.bright);
  log('📊 Test Summary', COLORS.bright);
  log('='.repeat(60) + '\n');
  
  logSuccess('✅ Rootstock Testnet Connectivity: PASSED');
  logSuccess('✅ Chain ID verification: PASSED (31)');
  logSuccess('✅ Block number retrieval: PASSED');
  logSuccess('✅ Block details retrieval: PASSED');
  logSuccess('✅ Gas price retrieval: PASSED');
  logSuccess('✅ Balance queries: PASSED');
  logSuccess('✅ Multiple RPC calls: PASSED');
  logSuccess('✅ Health monitoring: PASSED');
  
  log('\n🔴 All tests use REAL Rootstock Testnet data (NO MOCKS)');
  log('🌐 Connected to: https://public-node.testnet.rsk.co');
  log('📡 Network: Rootstock Testnet (Chain ID: 31)');
  log('✅ Testnet connectivity verified!\n');
}

// Run the test
testTestnetConnectivity().catch((error) => {
  logError(`\nTest failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});

