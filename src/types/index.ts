import React from 'react';

export interface MetaData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
  author?: string;
  [key: string]: string | undefined;
}

export interface WinksProps {
  apikey: string;
  children: React.ReactNode;
  fallback?: MetaData;
}

// Simple token transfer function types
export interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

// Wallet Integration Types
export interface WalletState {
  isConnected: boolean;
  address: string | undefined;
  chainId: number | undefined;
  isRootstock: boolean;
  balance: string;
  isLoading: boolean;
}

export interface WalletIntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  txHash?: string;
}

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

// Enhanced Token Transfer Types
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