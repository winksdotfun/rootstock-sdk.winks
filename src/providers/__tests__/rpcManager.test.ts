import { RpcManager } from '../rpcManager';

describe('RpcManager', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('should initialize with default endpoints', () => {
    const rpc = new RpcManager();
    const health = rpc.getHealth('testnet');
    expect(health.length).toBeGreaterThan(0);
    expect(health[0].url).toBe('https://public-node.testnet.rsk.co');
  });

  it('should pick the best RPC based on latency', () => {
    const rpc = new RpcManager({
      testnet: [
        { url: 'https://fast.url' },
        { url: 'https://slow.url' }
      ]
    });

    // Manually update health for testing
    (rpc as any).updateHealth('testnet', 'https://fast.url', true, 10, 0);
    (rpc as any).updateHealth('testnet', 'https://slow.url', true, 100, 0);

    expect(rpc.getBestRpcUrl('testnet')).toBe('https://fast.url');
  });

  it('should fallback to first configured if none are healthy', () => {
    const rpc = new RpcManager({
      testnet: [{ url: 'https://only.url' }]
    });

    (rpc as any).updateHealth('testnet', 'https://only.url', false, 999, 5);

    expect(rpc.getBestRpcUrl('testnet')).toBe('https://only.url');
  });
});
