import { ethers } from 'ethers';
import { ERC20_ABI, ERC721_ABI, ERC1155_ABI } from '../contracts/tokenContracts';

// Simple function to transfer ERC-20 tokens
export async function transferERC20(
  tokenAddress: string,
  recipientAddress: string,
  amount: string,
  signer: ethers.JsonRpcSigner
): Promise<string> {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);
    
    const tx = await contract.transfer(recipientAddress, amountWei);
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error('ERC-20 transfer failed:', error);
    throw error;
  }
}

// Simple function to get NFT owner
export async function getNFTOwner(
  contractAddress: string,
  tokenId: string,
  provider: ethers.BrowserProvider
): Promise<string> {
  try {
    // Try ERC-721 first
    try {
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
      const owner = await contract.ownerOf(tokenId);
      return owner;
    } catch {
      // If ERC-721 fails, it might be ERC-1155, but ERC-1155 doesn't have ownerOf
      throw new Error('Token not found or not ERC-721');
    }
  } catch (error) {
    console.error('Failed to get NFT owner:', error);
    throw error;
  }
}

// Simple function to transfer NFT
export async function transferNFT(
  contractAddress: string,
  fromAddress: string,
  toAddress: string,
  tokenId: string,
  signer: ethers.JsonRpcSigner
): Promise<string> {
  try {
    // Try ERC-721 first
    try {
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, signer);
      const tx = await contract.safeTransferFrom(fromAddress, toAddress, tokenId);
      await tx.wait();
      return tx.hash;
    } catch {
      // Try ERC-1155
      try {
        const contract = new ethers.Contract(contractAddress, ERC1155_ABI, signer);
        const tx = await contract.safeTransferFrom(fromAddress, toAddress, tokenId, 1, '0x');
        await tx.wait();
        return tx.hash;
      } catch {
        throw new Error('Unsupported NFT standard');
      }
    }
  } catch (error) {
    console.error('NFT transfer failed:', error);
    throw error;
  }
}

// Simple function to approve tokens
export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  signer: ethers.JsonRpcSigner
): Promise<string> {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);
    
    const tx = await contract.approve(spenderAddress, amountWei);
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error('Token approval failed:', error);
    throw error;
  }
}

// Additional utility functions

// Get ERC-20 token balance
export async function getTokenBalance(
  tokenAddress: string,
  accountAddress: string,
  provider: ethers.BrowserProvider
): Promise<string> {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(accountAddress);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Failed to get token balance:', error);
    throw error;
  }
}

// Get ERC-1155 token balance
export async function getERC1155Balance(
  contractAddress: string,
  tokenId: string,
  accountAddress: string,
  provider: ethers.BrowserProvider
): Promise<string> {
  try {
    const contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
    const balance = await contract.balanceOf(accountAddress, tokenId);
    return balance.toString();
  } catch (error) {
    console.error('Failed to get ERC-1155 balance:', error);
    throw error;
  }
}

// Check token allowance
export async function getTokenAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  provider: ethers.BrowserProvider
): Promise<string> {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const allowance = await contract.allowance(ownerAddress, spenderAddress);
    const decimals = await contract.decimals();
    return ethers.formatUnits(allowance, decimals);
  } catch (error) {
    console.error('Failed to get token allowance:', error);
    throw error;
  }
}
