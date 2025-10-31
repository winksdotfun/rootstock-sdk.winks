import React, { useState } from 'react';
import { WalletProvider, WalletConnection, useWalletIntegration } from 'rootstockwinks';

// Example component that uses the wallet integration
function WalletDemo() {
  const [message, setMessage] = useState('Hello Rootstock!');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<any>(null);

  const walletIntegration = useWalletIntegration();

  const handleConnectWallet = async () => {
    const result = await walletIntegration.connectWallet();
    setResult(result);
  };

  const handleSwitchToMainnet = async () => {
    const result = await walletIntegration.switchToRootstockMainnet();
    setResult(result);
  };

  const handleSwitchToTestnet = async () => {
    const result = await walletIntegration.switchToRootstockTestnet();
    setResult(result);
  };

  const handleSignMessage = async () => {
    const result = await walletIntegration.requestMessageSignature(message);
    setResult(result);
  };

  const handleSignPersonal = async () => {
    const result = await walletIntegration.requestPersonalSignature(message);
    setResult(result);
  };

  const handleTransferToken = async () => {
    if (!recipientAddress || !amount) {
      setResult({ success: false, error: 'Please fill in all fields' });
      return;
    }

    const result = await walletIntegration.sendTransaction(recipientAddress, amount);
    setResult(result);
  };

  const handleGetBalance = async () => {
    if (!walletIntegration.walletState.address) {
      setResult({ success: false, error: 'Please connect wallet first' });
      return;
    }

    setResult({ success: true, data: { balance: walletIntegration.walletState.balance } });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Rootstock Wallet Integration Demo
      </h1>

      {/* Wallet Connection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
        <WalletConnection />
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Wallet State:</h3>
          <div className="bg-gray-100 p-3 rounded">
            <p><strong>Connected:</strong> {walletIntegration.walletState.isConnected ? 'Yes' : 'No'}</p>
            <p><strong>Address:</strong> {walletIntegration.walletState.address || 'Not connected'}</p>
            <p><strong>Chain ID:</strong> {walletIntegration.walletState.chainId || 'Unknown'}</p>
            <p><strong>Is Rootstock:</strong> {walletIntegration.walletState.isRootstock ? 'Yes' : 'No'}</p>
            <p><strong>Balance:</strong> {walletIntegration.walletState.balance} RBTC</p>
          </div>
        </div>
      </div>

      {/* Network Switching */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Network Switching</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleSwitchToMainnet}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Switch to Rootstock Mainnet
          </button>
          <button
            onClick={handleSwitchToTestnet}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Switch to Rootstock Testnet
          </button>
        </div>
      </div>

      {/* Message Signing */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Message Signing</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Message to sign:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter message to sign"
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleSignMessage}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Message
          </button>
          <button
            onClick={handleSignPersonal}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Personal
          </button>
        </div>
      </div>

      {/* tRBTC Transfer */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Send tRBTC</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Recipient:</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Amount:</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="1.0"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Token:</span> Native tRBTC
          </div>
          <button
            onClick={handleTransferToken}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Send tRBTC
          </button>
          <button
            onClick={handleGetBalance}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Get Balance
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <div className={`p-4 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component with WalletProvider
export default function WalletIntegrationPage() {
  return (
    <WalletProvider>
      <WalletDemo />
    </WalletProvider>
  );
}

