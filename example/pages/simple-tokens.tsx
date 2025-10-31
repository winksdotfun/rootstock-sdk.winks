import React from 'react';
import { transferERC20, getNFTOwner, transferNFT, approveToken } from 'rootstockwinks';
import { ethers } from 'ethers';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function SimpleTokenTransferExample() {
  const [provider, setProvider] = React.useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = React.useState<ethers.JsonRpcSigner | null>(null);
  const [result, setResult] = React.useState<string>('');

  // Initialize provider
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    
    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      setSigner(signer);
      setResult('Wallet connected successfully!');
    } catch (error) {
      setResult('Failed to connect wallet: ' + error);
    }
  };

  const handleERC20Transfer = async () => {
    if (!signer) {
      setResult('Please connect wallet first');
      return;
    }

    try {
      const txHash = await transferERC20(
        '0x1234567890123456789012345678901234567890', // Token address
        '0x0987654321098765432109876543210987654321', // Recipient address
        '1.0', // Amount
        signer
      );
      setResult(`ERC-20 transfer successful! TX: ${txHash}`);
    } catch (error) {
      setResult('ERC-20 transfer failed: ' + error);
    }
  };

  const handleGetNFTOwner = async () => {
    if (!provider) {
      setResult('Provider not initialized');
      return;
    }

    try {
      const owner = await getNFTOwner(
        '0x1234567890123456789012345678901234567890', // NFT contract address
        '123', // Token ID
        provider
      );
      setResult(`NFT owner: ${owner}`);
    } catch (error) {
      setResult('Failed to get NFT owner: ' + error);
    }
  };

  const handleNFTTransfer = async () => {
    if (!signer) {
      setResult('Please connect wallet first');
      return;
    }

    try {
      const txHash = await transferNFT(
        '0x1234567890123456789012345678901234567890', // NFT contract address
        '0x1111111111111111111111111111111111111111', // From address
        '0x2222222222222222222222222222222222222222', // To address
        '123', // Token ID
        signer
      );
      setResult(`NFT transfer successful! TX: ${txHash}`);
    } catch (error) {
      setResult('NFT transfer failed: ' + error);
    }
  };

  const handleTokenApproval = async () => {
    if (!signer) {
      setResult('Please connect wallet first');
      return;
    }

    try {
      const txHash = await approveToken(
        '0x1234567890123456789012345678901234567890', // Token address
        '0x3333333333333333333333333333333333333333', // Spender address
        '100.0', // Amount to approve
        signer
      );
      setResult(`Token approval successful! TX: ${txHash}`);
    } catch (error) {
      setResult('Token approval failed: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple Token Transfer Functions
          </h1>
          <p className="text-lg text-gray-600">
            Direct function calls for ERC-20 tokens and NFTs on Rootstock
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <button
              onClick={connectWallet}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Connect Wallet
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleERC20Transfer}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Transfer ERC-20 Tokens
              </button>

              <button
                onClick={handleGetNFTOwner}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Get NFT Owner
              </button>

              <button
                onClick={handleNFTTransfer}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Transfer NFT
              </button>

              <button
                onClick={handleTokenApproval}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Approve Tokens
              </button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Result:</h3>
                <p className="text-sm">{result}</p>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Usage Examples:</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <pre className="bg-white p-2 rounded border">
{`// Transfer ERC-20 tokens
const txHash = await transferERC20(
  tokenAddress,
  recipientAddress, 
  amount,
  signer
);

// Get NFT owner
const owner = await getNFTOwner(
  contractAddress,
  tokenId,
  provider
);

// Transfer NFT
const txHash = await transferNFT(
  contractAddress,
  fromAddress,
  toAddress,
  tokenId,
  signer
);

// Approve tokens
const txHash = await approveToken(
  tokenAddress,
  spenderAddress,
  amount,
  signer
);`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
