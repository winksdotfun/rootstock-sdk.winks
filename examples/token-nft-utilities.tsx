import React from 'react';
import { useEnhancedTokenTransfer, WalletProvider } from '../src';

/**
 * This example demonstrates the useEnhancedTokenTransfer hook for managing
 * ERC-20 tokens, ERC-721 NFTs, and ERC-1155 tokens on Rootstock.
 */

export function TokenTransferDashboard() {
  const {
    transferERC20,
    getTokenBalance,
    transferNFT,
    getNFTOwner,
    isConnected,
    address
  } = useEnhancedTokenTransfer();

  const handleERC20Transfer = async () => {
    const tokenAddress = '0x...'; // ERC-20 contract address
    const recipient = '0x...';
    const amount = '100.0'; // Tokens as string (human readable)

    const result = await transferERC20(tokenAddress, recipient, amount);
    if (result.success) {
      console.log('Transfer successful:', result.txHash);
    } else {
      console.error('Transfer failed:', result.error);
    }
  };

  const checkBalance = async () => {
    const tokenAddress = '0x...';
    if (!address) return;
    
    const balance = await getTokenBalance(tokenAddress, address);
    console.log(`Balance of ${tokenAddress}: ${balance}`);
  };

  const handleNFTTransfer = async () => {
    const nftAddress = '0x...'; // ERC-721 or ERC-1155 contract address
    const recipient = '0x...';
    const tokenId = '1';

    const result = await transferNFT(nftAddress, address!, recipient, tokenId);
    if (result.success) {
      console.log('NFT Transfer successful:', result.txHash);
    }
  };

  if (!isConnected) {
    return <div>Please connect your wallet to use token utilities.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button onClick={handleERC20Transfer}>Transfer ERC-20</button>
      <button onClick={checkBalance}>Check ERC-20 Balance</button>
      <button onClick={handleNFTTransfer}>Transfer NFT</button>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <TokenTransferDashboard />
    </WalletProvider>
  );
}
