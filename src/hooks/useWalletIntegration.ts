'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useNetwork, useSwitchNetwork, useBalance } from 'wagmi';
import { ethers } from 'ethers';
import SignatureManager from '../utils/signatureManager';

export interface WalletIntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  txHash?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | undefined;
  chainId: number | undefined;
  isRootstock: boolean;
  balance: string;
  isLoading: boolean;
}

export function useWalletIntegration() {
  const { address, isConnected, connector } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
  });

  const providerRef = useRef<any>(null);
  const signatureManagerRef = useRef<SignatureManager | null>(null);

  const resolveProvider = useCallback(async () => {
    try {
      if (connector) {
        const provider = await connector.getProvider?.();
        if (provider) {
          return provider;
        }
      }
    } catch (error) {
      console.error('Failed to get provider from connector:', error);
    }

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum;
    }

    return null;
  }, [connector]);

  const ensureSignatureManager = useCallback(async (): Promise<SignatureManager> => {
    let manager = signatureManagerRef.current;

    let provider = providerRef.current;
    if (!provider) {
      provider = await resolveProvider();
      if (!provider) {
        throw new Error('Wallet provider not available');
      }
      providerRef.current = provider;
    }

    if (!manager) {
      manager = new SignatureManager(provider as any);
      signatureManagerRef.current = manager;
    }

    if (!manager.hasSigner()) {
      const connected = await manager.connectWallet();
      if (!connected) {
        throw new Error('Unable to connect wallet');
      }
    }

    return manager;
  }, [resolveProvider]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    (async () => {
      const provider = await resolveProvider();
      if (cancelled) {
        return;
      }

      if (provider) {
        providerRef.current = provider;
        signatureManagerRef.current = new SignatureManager(provider as any);
      } else {
        signatureManagerRef.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolveProvider]);

  const walletState: WalletState = {
    isConnected: !!isConnected,
    address,
    chainId: chain?.id,
    isRootstock: chain?.id === 30 || chain?.id === 31,
    balance: balance ? ethers.formatEther(balance.value) : '0',
    isLoading: balanceLoading,
  };

  const connectWallet = async (): Promise<WalletIntegrationResult> => {
    try {
      const provider: any = providerRef.current ?? await resolveProvider();
      if (!provider || typeof provider.request !== 'function') {
        return {
          success: false,
          error: 'No wallet detected. Please install MetaMask or another Web3 wallet.'
        };
      }

      providerRef.current = provider;

      const manager = await ensureSignatureManager();

      const accounts = await provider.request({ method: 'eth_accounts' });

      if (!accounts || accounts.length === 0) {
        return {
          success: false,
          error: 'No accounts found'
        };
      }

      const chainIdHex = await provider.request({ method: 'eth_chainId' });

      return {
        success: true,
        data: {
          address: accounts[0],
          chainId: chainIdHex
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to connect wallet'
      };
    }
  };

  const disconnectWallet = async (): Promise<WalletIntegrationResult> => {
    try {
      // Note: Most wallets don't support programmatic disconnection
      // This would typically be handled by the wallet UI
      return {
        success: true,
        data: { disconnected: true }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to disconnect wallet'
      };
    }
  };

  const switchToRootstockMainnet = async (): Promise<WalletIntegrationResult> => {
    try {
      const signatureManager = await ensureSignatureManager();
      const success = await signatureManager.switchToRootstockMainnet();
      return {
        success,
        error: success ? undefined : 'Failed to switch to Rootstock Mainnet'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to switch network'
      };
    }
  };

  const switchToRootstockTestnet = async (): Promise<WalletIntegrationResult> => {
    try {
      const signatureManager = await ensureSignatureManager();
      const success = await signatureManager.switchToRootstockTestnet();
      return {
        success,
        error: success ? undefined : 'Failed to switch to Rootstock Testnet'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to switch network'
      };
    }
  };

  const requestTransactionSignature = async (
    transaction: ethers.TransactionRequest
  ): Promise<WalletIntegrationResult> => {
    try {
      const signatureManager = await ensureSignatureManager();
      const result = await signatureManager.requestTransactionSignature(transaction);
      return {
        success: result.success,
        txHash: result.txHash,
        error: result.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction signature failed'
      };
    }
  };

  const requestMessageSignature = async (message: string): Promise<WalletIntegrationResult> => {
    try {
      const signatureManager = await ensureSignatureManager();
      const result = await signatureManager.requestMessageSignature(message);
      return {
        success: result.success,
        data: { signature: result.signature },
        error: result.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Message signature failed'
      };
    }
  };

  const requestPersonalSignature = async (message: string): Promise<WalletIntegrationResult> => {
    try {
      const signatureManager = await ensureSignatureManager();
      const result = await signatureManager.requestPersonalSignature(message);
      return {
        success: result.success,
        data: { signature: result.signature },
        error: result.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Personal signature failed'
      };
    }
  };

  const requestTypedDataSignature = async (typedData: any): Promise<WalletIntegrationResult> => {
    try {
      const signatureManager = await ensureSignatureManager();
      const result = await signatureManager.requestTypedDataSignature(typedData);
      return {
        success: result.success,
        data: { signature: result.signature },
        error: result.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Typed data signature failed'
      };
    }
  };

  const getAccount = async (): Promise<string | null> => {
    try {
      const signatureManager = await ensureSignatureManager();
      return await signatureManager.getAccount();
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  };

  const getChainId = async (): Promise<number | null> => {
    try {
      const signatureManager = await ensureSignatureManager();
      return await signatureManager.getChainId();
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return null;
    }
  };

  const sendTransaction = async (
    to: string,
    value: string,
    data?: string
  ): Promise<WalletIntegrationResult> => {
    try {
      const transaction: ethers.TransactionRequest = {
        to,
        value: ethers.parseEther(value),
        data,
      };

      return await requestTransactionSignature(transaction);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  };

  return {
    // Wallet state
    walletState,
    
    // Connection functions
    connectWallet,
    disconnectWallet,
    
    // Network functions
    switchToRootstockMainnet,
    switchToRootstockTestnet,
    
    // Signature functions
    requestTransactionSignature,
    requestMessageSignature,
    requestPersonalSignature,
    requestTypedDataSignature,
    
    // Utility functions
    getAccount,
    getChainId,
    sendTransaction,
    
    // Raw wagmi hooks
    address,
    isConnected,
    chain,
    balance,
    switchNetwork,
  };
}

export default useWalletIntegration;

