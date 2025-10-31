'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { ethers } from 'ethers';
import { ERC20_ABI, ERC721_ABI, ERC1155_ABI } from '../contracts/tokenContracts';
import SignatureManager from '../utils/signatureManager';

export interface EnhancedTransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
  signature?: string;
}

export interface TokenTransferParams {
  tokenAddress: string;
  recipientAddress: string;
  amount: string;
  decimals?: number;
}

export interface NFTTransferParams {
  contractAddress: string;
  fromAddress: string;
  toAddress: string;
  tokenId: string;
  amount?: string; // For ERC1155
}

export interface ApprovalParams {
  tokenAddress: string;
  spenderAddress: string;
  amount: string;
  decimals?: number;
}

export function useEnhancedTokenTransfer() {
  const { address, isConnected, connector } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const browserProviderRef = useRef<ethers.BrowserProvider | null>(null);
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

  const getBrowserProvider = useCallback(async (): Promise<ethers.BrowserProvider> => {
    if (browserProviderRef.current) {
      return browserProviderRef.current;
    }

    const provider = await resolveProvider();
    if (!provider) {
      throw new Error('Wallet provider not available');
    }

    const browserProvider = provider instanceof ethers.BrowserProvider
      ? provider
      : new ethers.BrowserProvider(provider as any);

    browserProviderRef.current = browserProvider;
    return browserProvider;
  }, [resolveProvider]);

  const getSigner = useCallback(async () => {
    const provider = await getBrowserProvider();
    return provider.getSigner();
  }, [getBrowserProvider]);

  const getSignatureManager = useCallback(async (): Promise<SignatureManager> => {
    let manager = signatureManagerRef.current;
    if (!manager) {
      const provider = await getBrowserProvider();
      manager = new SignatureManager(provider);
      signatureManagerRef.current = manager;
    }

    if (!manager.hasSigner()) {
      const connected = await manager.connectWallet();
      if (!connected) {
        throw new Error('Unable to connect wallet');
      }
    }

    return manager;
  }, [getBrowserProvider]);

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
        const browserProvider = provider instanceof ethers.BrowserProvider
          ? provider
          : new ethers.BrowserProvider(provider as any);

        browserProviderRef.current = browserProvider;
        signatureManagerRef.current = new SignatureManager(browserProvider);
      } else {
        browserProviderRef.current = null;
        signatureManagerRef.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolveProvider]);

  const ensureRootstockNetwork = async (): Promise<boolean> => {
    if (chain?.id === 31) return true;

    try {
      await switchNetwork?.(31);
      return true;
    } catch (error) {
      console.error('Failed to switch to Rootstock testnet:', error);
      return false;
    }
  };

  const transferERC20 = async (params: TokenTransferParams): Promise<EnhancedTransferResult> => {
    try {
      if (!isConnected) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      const isRootstock = await ensureRootstockNetwork();
      if (!isRootstock) {
        return {
          success: false,
          error: 'Please switch to Rootstock network'
        };
      }

      const contract = new ethers.Contract(params.tokenAddress, ERC20_ABI, await getSigner());
      
      // Convert amount to proper decimals
      const decimals = params.decimals || 18;
      const amountWei = ethers.parseUnits(params.amount, decimals);

      const tx = await contract.transfer(params.recipientAddress, amountWei);
      
      return {
        success: true,
        txHash: tx.hash,
        signature: tx.hash
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transfer failed'
      };
    }
  };

  const transferNFT = async (params: NFTTransferParams): Promise<EnhancedTransferResult> => {
    try {
      if (!isConnected) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      const isRootstock = await ensureRootstockNetwork();
      if (!isRootstock) {
        return {
          success: false,
          error: 'Please switch to Rootstock network'
        };
      }

      // Determine if it's ERC721 or ERC1155
      const contract = new ethers.Contract(params.contractAddress, ERC721_ABI, await getSigner());
      
      try {
        // Try ERC721 transfer
        const tx = await contract.transferFrom(
          params.fromAddress,
          params.toAddress,
          params.tokenId
        );
        
        return {
          success: true,
          txHash: tx.hash,
          signature: tx.hash
        };
      } catch (error) {
        // Try ERC1155 transfer
        const erc1155Contract = new ethers.Contract(params.contractAddress, ERC1155_ABI, await getSigner());
        const amount = params.amount || '1';
        
        const tx = await erc1155Contract.safeTransferFrom(
          params.fromAddress,
          params.toAddress,
          params.tokenId,
          amount,
          '0x' // No data
        );
        
        return {
          success: true,
          txHash: tx.hash,
          signature: tx.hash
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'NFT transfer failed'
      };
    }
  };

  const approveToken = async (params: ApprovalParams): Promise<EnhancedTransferResult> => {
    try {
      if (!isConnected) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      const isRootstock = await ensureRootstockNetwork();
      if (!isRootstock) {
        return {
          success: false,
          error: 'Please switch to Rootstock network'
        };
      }

      const contract = new ethers.Contract(params.tokenAddress, ERC20_ABI, await getSigner());
      
      // Convert amount to proper decimals
      const decimals = params.decimals || 18;
      const amountWei = ethers.parseUnits(params.amount, decimals);

      const tx = await contract.approve(params.spenderAddress, amountWei);
      
      return {
        success: true,
        txHash: tx.hash,
        signature: tx.hash
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Approval failed'
      };
    }
  };

  const getTokenBalance = async (tokenAddress: string, accountAddress: string): Promise<string> => {
    try {
      const provider = await getBrowserProvider();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      const balance = await contract.balanceOf(accountAddress);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  };

  const getNFTOwner = async (contractAddress: string, tokenId: string): Promise<string> => {
    try {
      const provider = await getBrowserProvider();
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
      
      return await contract.ownerOf(tokenId);
    } catch (error) {
      console.error('Failed to get NFT owner:', error);
      return '';
    }
  };

  const getTokenAllowance = async (
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<string> => {
    try {
      const provider = await getBrowserProvider();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      const allowance = await contract.allowance(ownerAddress, spenderAddress);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(allowance, decimals);
    } catch (error) {
      console.error('Failed to get token allowance:', error);
      return '0';
    }
  };

  const requestMessageSignature = async (message: string): Promise<EnhancedTransferResult> => {
    try {
      const signatureManager = await getSignatureManager();
      const result = await signatureManager.requestMessageSignature(message);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Message signing failed'
      };
    }
  };

  const requestPersonalSignature = async (message: string): Promise<EnhancedTransferResult> => {
    try {
      const signatureManager = await getSignatureManager();
      const result = await signatureManager.requestPersonalSignature(message);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Personal signature failed'
      };
    }
  };

  return {
    // Account info
    address,
    isConnected,
    chain,
    
    // Transfer functions
    transferERC20,
    transferNFT,
    approveToken,
    
    // Read functions
    getTokenBalance,
    getNFTOwner,
    getTokenAllowance,
    
    // Signature functions
    requestMessageSignature,
    requestPersonalSignature,
    
    // Network functions
    ensureRootstockNetwork,
    switchNetwork
  };
}

export default useEnhancedTokenTransfer;

