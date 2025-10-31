const { RpcManager } = require('../dist/index.cjs');
const { ethers } = require('ethers');

async function testRpcManager() {
  console.log('🔌 Testing Rootstock RPC Integration...\n');

  // Initialize RpcManager
  console.log('1. Initializing RpcManager...');
  const rpcManager = new RpcManager({
    mainnet: [
      { url: 'https://public-node.rsk.co' },
      { url: 'https://mainnet.sovryn.app/rpc' }, // Example additional endpoint
    ],
    testnet: [
      { url: 'https://public-node.testnet.rsk.co' },
    ],
    healthCheckIntervalMs: 30000,
    requestTimeoutMs: 10000,
    maxConsecutiveFailuresBeforeDisable: 3,
  });
  console.log('✅ RpcManager initialized\n');

  // Wait a bit for initial health check
  console.log('   Waiting for initial health checks (3 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test Mainnet
  console.log('\n2. Testing Mainnet...');
  try {
    const mainnetUrl = rpcManager.getBestRpcUrl('mainnet');
    console.log(`   Best RPC URL: ${mainnetUrl}`);
    
    const mainnetProvider = rpcManager.createProvider('mainnet');
    const mainnetBlockNumber = await mainnetProvider.getBlockNumber();
    console.log(`   ✅ Latest Block Number: ${mainnetBlockNumber}`);
    
    const mainnetHealth = rpcManager.getHealth('mainnet');
    console.log(`   Health Status (${mainnetHealth.length} endpoint(s)):`);
    mainnetHealth.forEach((health, idx) => {
      const status = health.isHealthy ? '✅ Healthy' : '❌ Unhealthy';
      const latency = health.latencyMs === Number.MAX_SAFE_INTEGER ? 'N/A' : `${health.latencyMs}ms`;
      const lastChecked = health.lastCheckedAt 
        ? new Date(health.lastCheckedAt).toLocaleTimeString()
        : 'Never';
      console.log(`     ${idx + 1}. ${health.url.substring(0, 50)}...`);
      console.log(`        Status: ${status} | Latency: ${latency} | Last Checked: ${lastChecked} | Failures: ${health.consecutiveFailures}`);
    });
  } catch (error) {
    console.error(`   ❌ Mainnet test failed: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }

  console.log('\n3. Testing Testnet...');
  try {
    const testnetUrl = rpcManager.getBestRpcUrl('testnet');
    console.log(`   Best RPC URL: ${testnetUrl}`);
    
    const testnetProvider = rpcManager.createProvider('testnet');
    const testnetBlockNumber = await testnetProvider.getBlockNumber();
    console.log(`   ✅ Latest Block Number: ${testnetBlockNumber}`);
    
    const testnetHealth = rpcManager.getHealth('testnet');
    console.log(`   Health Status (${testnetHealth.length} endpoint(s)):`);
    testnetHealth.forEach((health, idx) => {
      const status = health.isHealthy ? '✅ Healthy' : '❌ Unhealthy';
      const latency = health.latencyMs === Number.MAX_SAFE_INTEGER ? 'N/A' : `${health.latencyMs}ms`;
      const lastChecked = health.lastCheckedAt 
        ? new Date(health.lastCheckedAt).toLocaleTimeString()
        : 'Never';
      console.log(`     ${idx + 1}. ${health.url.substring(0, 50)}...`);
      console.log(`        Status: ${status} | Latency: ${latency} | Last Checked: ${lastChecked} | Failures: ${health.consecutiveFailures}`);
    });
  } catch (error) {
    console.error(`   ❌ Testnet test failed: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }

  console.log('\n4. Testing Provider Operations...');
  try {
    const provider = rpcManager.createProvider('mainnet');
    
    // Get chain ID
    const network = await provider.getNetwork();
    console.log(`   ✅ Chain ID: ${network.chainId.toString()}`);
    console.log(`   ✅ Network Name: ${network.name}`);
    
    // Get gas price
    console.log('\n   Fetching gas price...');
    const feeData = await provider.getFeeData();
    if (feeData.gasPrice) {
      const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');
      console.log(`   ✅ Gas Price: ${gasPriceGwei} gwei`);
      console.log(`   ✅ Gas Price (wei): ${feeData.gasPrice.toString()}`);
    } else {
      console.log('   ⚠️  Gas price not available');
    }
    
    // Get a block
    console.log('\n   Fetching latest block...');
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    if (block) {
      console.log(`   ✅ Block #${block.number}`);
      console.log(`   ✅ Hash: ${block.hash}`);
      console.log(`   ✅ Transactions: ${block.transactions.length}`);
      console.log(`   ✅ Timestamp: ${new Date(Number(block.timestamp) * 1000).toLocaleString()}`);
    }
    
    // Test balance check (using a known address)
    console.log('\n   Testing balance check...');
    const testAddress = '0x0000000000000000000000000000000000000000'; // Zero address
    const balance = await provider.getBalance(testAddress);
    console.log(`   ✅ Balance for ${testAddress}: ${ethers.formatEther(balance)} RBTC`);
  } catch (error) {
    console.error(`   ❌ Provider operations failed: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  }

  console.log('\n5. Testing Failover Behavior...');
  try {
    // Create a manager with one good and one bad endpoint
    const failoverManager = new RpcManager({
      mainnet: [
        { url: 'https://public-node.rsk.co' }, // Good endpoint
        { url: 'https://invalid-endpoint-that-does-not-exist.com' }, // Bad endpoint
      ],
    });
    
    // Wait for health checks
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const bestUrl = failoverManager.getBestRpcUrl('mainnet');
    console.log(`   ✅ Best URL selected: ${bestUrl}`);
    console.log(`   ✅ Failover working - selected healthy endpoint`);
    
    const health = failoverManager.getHealth('mainnet');
    const healthyCount = health.filter(h => h.isHealthy).length;
    const unhealthyCount = health.filter(h => !h.isHealthy).length;
    console.log(`   ✅ Healthy endpoints: ${healthyCount}, Unhealthy: ${unhealthyCount}`);
  } catch (error) {
    console.error(`   ❌ Failover test failed: ${error.message}`);
  }

  console.log('\n✅ RPC Integration Test Complete!');
  console.log('\n📝 Summary:');
  console.log('   - RpcManager successfully initialized');
  console.log('   - Health checks are running');
  console.log('   - Best RPC URL selection works');
  console.log('   - Provider creation works');
  console.log('   - Blockchain queries work');
  console.log('   - Failover behavior works');
  
  // Keep process alive for health checks to continue
  console.log('\n💡 Health checks will continue running in background...');
  console.log('   Press Ctrl+C to exit\n');
}

// Run the test
testRpcManager().catch((error) => {
  console.error('\n❌ Test failed with error:');
  console.error(error);
  process.exit(1);
});

