"use client";

// Core Winks component
export { default as Winks } from './components/Winks';

// Wallet Integration Components
export { default as WalletProvider } from './providers/WalletProvider';
export { default as WalletConnection } from './components/WalletConnection';

// Wallet Integration Hooks
export { default as useWalletIntegration } from './hooks/useWalletIntegration';
export { default as useEnhancedTokenTransfer } from './hooks/useEnhancedTokenTransfer';

// Simple Token Transfer Functions
export { 
  transferERC20,
  getNFTOwner,
  transferNFT,
  approveToken,
  getTokenBalance,
  getERC1155Balance,
  getTokenAllowance
} from './functions/tokenTransfer';

// Signature Manager
export { default as SignatureManager } from './utils/signatureManager';
export { default as Eip1193Provider } from './utils/eip1193Provider';
export { default as RpcManager } from './providers/rpcManager';

// Types
export type { 
  WinksProps, 
  MetaData,
  TransferResult,
  TokenInfo,
  WalletState,
  WalletIntegrationResult,
  SignatureRequest,
  SignatureResult,
  EnhancedTransferResult,
  TokenTransferParams,
  NFTTransferParams,
  ApprovalParams
} from './types'; 