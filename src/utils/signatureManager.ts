import { ethers } from 'ethers';
import type { EIP1193ProviderLike } from './eip1193Provider';

export interface SignatureRequest {
  type: 'transaction' | 'message' | 'typedData';
  data: any;
  description?: string;
}

export interface SignatureResult {
  success: boolean;
  signature?: string;
  error?: string;
  txHash?: string;
}

export class SignatureManager {
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner | null = null;
  private queue: Promise<any> = Promise.resolve();

  constructor(provider: ethers.BrowserProvider | EIP1193ProviderLike) {
    this.provider = provider instanceof ethers.BrowserProvider
      ? provider
      : new ethers.BrowserProvider(provider as any);
  }

  async connectWallet(): Promise<boolean> {
    try {
      await this.provider.send('eth_requestAccounts', []);

      let network = await this.provider.getNetwork();
      if (Number(network.chainId) !== 31) {
        const switched = await this.switchToRootstockTestnet();
        if (!switched) {
          return false;
        }
        network = await this.provider.getNetwork();
      }

      this.signer = await this.provider.getSigner();
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  hasSigner(): boolean {
    return this.signer !== null;
  }

  async requestTransactionSignature(transaction: ethers.TransactionRequest): Promise<SignatureResult> {
    try {
      if (!this.signer) {
        const connected = await this.connectWallet();
        if (!connected) {
          return {
            success: false,
            error: 'Wallet not connected'
          };
        }
      }

      // Estimate gas if not provided
      if (!transaction.gasLimit) {
        try {
          transaction.gasLimit = await this.provider.estimateGas(transaction);
        } catch (error) {
          console.warn('Failed to estimate gas:', error);
        }
      }

      // Send transaction
      const exec = async () => this.signer!.sendTransaction(transaction);
      const tx = await (this.queue = this.queue.then(exec, exec));
      
      return {
        success: true,
        txHash: tx.hash,
        signature: tx.hash
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  async requestMessageSignature(message: string): Promise<SignatureResult> {
    try {
      if (!this.signer) {
        const connected = await this.connectWallet();
        if (!connected) {
          return {
            success: false,
            error: 'Wallet not connected'
          };
        }
      }

      const exec = async () => this.signer!.signMessage(message);
      const signature = await (this.queue = this.queue.then(exec, exec));
      
      return {
        success: true,
        signature
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  async requestTypedDataSignature(typedData: any): Promise<SignatureResult> {
    try {
      if (!this.signer) {
        const connected = await this.connectWallet();
        if (!connected) {
          return {
            success: false,
            error: 'Wallet not connected'
          };
        }
      }

      const exec = async () => this.signer!.signTypedData(
        typedData.domain,
        typedData.types,
        typedData.value
      );
      const signature = await (this.queue = this.queue.then(exec, exec));
      
      return {
        success: true,
        signature
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  async requestPersonalSignature(message: string): Promise<SignatureResult> {
    try {
      if (!this.signer) {
        const connected = await this.connectWallet();
        if (!connected) {
          return {
            success: false,
            error: 'Wallet not connected'
          };
        }
      }

      // Convert message to hex
      const messageHex = ethers.toUtf8Bytes(message);
      const exec = async () => this.signer!.signMessage(messageHex);
      const signature = await (this.queue = this.queue.then(exec, exec));
      
      return {
        success: true,
        signature
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  private parseError(error: any): string {
    if (error.code === 4001) {
      return 'User rejected the request';
    }
    if (error.code === -32603) {
      return 'Internal JSON-RPC error';
    }
    if (error.code === 4902) {
      return 'Unrecognized request method';
    }
    if (error.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }

  async getAccount(): Promise<string | null> {
    try {
      if (!this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }
      return await this.signer!.getAddress();
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }

  async getChainId(): Promise<number | null> {
    try {
      const network = await this.provider.getNetwork();
      return Number(network.chainId);
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return null;
    }
  }

  async switchToRootstockMainnet(): Promise<boolean> {
    try {
      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: '0x1e' } // 30 in hex
      ]);
      this.signer = null;
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        try {
          await this.provider.send('wallet_addEthereumChain', [
            {
              chainId: '0x1e',
              chainName: 'Rootstock Mainnet',
              nativeCurrency: {
                name: 'Rootstock Bitcoin',
                symbol: 'RBTC',
                decimals: 18,
              },
              rpcUrls: ['https://public-node.rsk.co'],
              blockExplorerUrls: ['https://explorer.rootstock.io'],
            },
          ]);
          return true;
        } catch (addError) {
          console.error('Failed to add Rootstock Mainnet:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Rootstock Mainnet:', error);
      return false;
    }
  }

  async switchToRootstockTestnet(): Promise<boolean> {
    try {
      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: '0x1f' } // 31 in hex
      ]);
      this.signer = null;
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        try {
          await this.provider.send('wallet_addEthereumChain', [
            {
              chainId: '0x1f',
              chainName: 'Rootstock Testnet',
              nativeCurrency: {
                name: 'Test Rootstock Bitcoin',
                symbol: 'tRBTC',
                decimals: 18,
              },
              rpcUrls: ['https://public-node.testnet.rsk.co'],
              blockExplorerUrls: ['https://explorer.testnet.rootstock.io'],
            },
          ]);
          return true;
        } catch (addError) {
          console.error('Failed to add Rootstock Testnet:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Rootstock Testnet:', error);
      return false;
    }
  }
}

export default SignatureManager;
