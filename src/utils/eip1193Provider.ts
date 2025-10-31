/* Minimal EIP-1193 provider adapter */

export type EIP1193RequestArgs = {
  method: string;
  params?: unknown[] | object;
};

export interface EIP1193ProviderLike {
  request(args: EIP1193RequestArgs): Promise<any>;
  on?(event: string, listener: (...args: any[]) => void): void;
  removeListener?(event: string, listener: (...args: any[]) => void): void;
}

export class Eip1193Provider implements EIP1193ProviderLike {
  private readonly underlying: EIP1193ProviderLike;

  constructor(underlying?: EIP1193ProviderLike) {
    if (!underlying && typeof window !== 'undefined') {
      // @ts-ignore
      underlying = (window as any).ethereum as EIP1193ProviderLike;
    }
    if (!underlying) {
      throw new Error('No EIP-1193 provider available');
    }
    this.underlying = underlying;
  }

  async request(args: EIP1193RequestArgs): Promise<any> {
    return this.underlying.request(args);
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.underlying.on?.(event, listener);
  }

  removeListener(event: string, listener: (...args: any[]) => void) {
    this.underlying.removeListener?.(event, listener);
  }
}

export default Eip1193Provider;


