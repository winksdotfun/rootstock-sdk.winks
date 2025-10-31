import { ethers } from 'ethers';

export type RootstockNetwork = 'mainnet' | 'testnet';

export interface RpcEndpoint {
  url: string;
  weight?: number; // optional weighting for selection
}

export interface RpcHealth {
  url: string;
  isHealthy: boolean;
  latencyMs: number;
  lastCheckedAt: number;
  consecutiveFailures: number;
}

export interface RpcManagerOptions {
  mainnet?: RpcEndpoint[];
  testnet?: RpcEndpoint[];
  healthCheckIntervalMs?: number;
  maxConsecutiveFailuresBeforeDisable?: number;
  requestTimeoutMs?: number;
}

const DEFAULT_MAINNET: RpcEndpoint[] = [
  { url: 'https://public-node.rsk.co' },
];

const DEFAULT_TESTNET: RpcEndpoint[] = [
  { url: 'https://public-node.testnet.rsk.co' },
];

export class RpcManager {
  private options: Required<RpcManagerOptions>;
  private healthByNetwork: Record<RootstockNetwork, Map<string, RpcHealth>>;
  private timers: Record<RootstockNetwork, any>;

  constructor(options: RpcManagerOptions = {}) {
    this.options = {
      mainnet: options.mainnet ?? DEFAULT_MAINNET,
      testnet: options.testnet ?? DEFAULT_TESTNET,
      healthCheckIntervalMs: options.healthCheckIntervalMs ?? 30_000,
      maxConsecutiveFailuresBeforeDisable: options.maxConsecutiveFailuresBeforeDisable ?? 3,
      requestTimeoutMs: options.requestTimeoutMs ?? 10_000,
    } as Required<RpcManagerOptions>;

    this.healthByNetwork = { mainnet: new Map(), testnet: new Map() };
    this.timers = { mainnet: null, testnet: null };

    this.initialize('mainnet');
    this.initialize('testnet');
  }

  private initialize(network: RootstockNetwork) {
    const endpoints = this.getEndpoints(network);
    for (const ep of endpoints) {
      this.healthByNetwork[network].set(ep.url, {
        url: ep.url,
        isHealthy: true,
        latencyMs: Number.MAX_SAFE_INTEGER,
        lastCheckedAt: 0,
        consecutiveFailures: 0,
      });
    }
    this.startHealthChecks(network);
  }

  private getEndpoints(network: RootstockNetwork): RpcEndpoint[] {
    return network === 'mainnet' ? this.options.mainnet : this.options.testnet;
  }

  private startHealthChecks(network: RootstockNetwork) {
    const run = async () => {
      await this.checkAll(network);
    };
    run();
    this.timers[network] = setInterval(run, this.options.healthCheckIntervalMs);
  }

  private async checkAll(network: RootstockNetwork) {
    const endpoints = this.getEndpoints(network);
    await Promise.all(
      endpoints.map(async (ep) => this.checkEndpoint(network, ep.url))
    );
  }

  private async checkEndpoint(network: RootstockNetwork, url: string) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.options.requestTimeoutMs);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
        signal: controller.signal,
      } as any);
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.error) throw new Error('RPC error');
      const latency = Date.now() - start;
      this.updateHealth(network, url, true, latency, 0);
    } catch (e) {
      const health = this.healthByNetwork[network].get(url);
      const failures = (health?.consecutiveFailures ?? 0) + 1;
      this.updateHealth(network, url, failures < this.options.maxConsecutiveFailuresBeforeDisable, Number.MAX_SAFE_INTEGER, failures);
    }
  }

  private updateHealth(network: RootstockNetwork, url: string, isHealthy: boolean, latencyMs: number, consecutiveFailures: number) {
    const current = this.healthByNetwork[network].get(url);
    this.healthByNetwork[network].set(url, {
      url,
      isHealthy,
      latencyMs,
      lastCheckedAt: Date.now(),
      consecutiveFailures,
    });
  }

  getBestRpcUrl(network: RootstockNetwork): string {
    const entries = Array.from(this.healthByNetwork[network].values()).filter(h => h.isHealthy);
    if (entries.length === 0) {
      // Fallback to first configured
      return this.getEndpoints(network)[0].url;
    }
    // Pick lowest latency
    entries.sort((a, b) => a.latencyMs - b.latencyMs);
    return entries[0].url;
  }

  createProvider(network: RootstockNetwork): ethers.JsonRpcProvider {
    const url = this.getBestRpcUrl(network);
    return new ethers.JsonRpcProvider(url);
  }

  getHealth(network: RootstockNetwork): RpcHealth[] {
    return Array.from(this.healthByNetwork[network].values());
  }
}

export default RpcManager;


