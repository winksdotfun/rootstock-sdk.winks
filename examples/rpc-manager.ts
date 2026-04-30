import { RpcManager } from '../src';

/**
 * This example demonstrates how to use the RpcManager to manage Rootstock RPC nodes,
 * perform health checks, and automatically select the best provider based on latency.
 */
async function main() {
  // 1. Initialize the RpcManager
  const rpc = new RpcManager();

  // 2. Get the best RPC URL for Rootstock Testnet
  const bestUrl = rpc.getBestRpcUrl('testnet');
  console.log('Best Testnet RPC URL:', bestUrl);

  // 3. Create an ethers-compatible provider
  // This provider will automatically fail over if nodes become unhealthy
  const provider = rpc.createProvider('testnet');
  
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log('Current Testnet Block Number:', blockNumber);
  } catch (error) {
    console.error('Failed to fetch block number:', error);
  }

  // 4. Check the health of all configured nodes
  const healthSnapshot = rpc.getHealth('testnet');
  console.log('Health Snapshot:', JSON.stringify(healthSnapshot, null, 2));

  // 5. Switch to Mainnet
  const mainnetUrl = rpc.getBestRpcUrl('mainnet');
  console.log('Best Mainnet RPC URL:', mainnetUrl);
}

if (require.main === module) {
  main();
}
