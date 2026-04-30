import React from 'react';
import { 
  WalletProvider, 
  WalletConnection, 
  useWalletIntegration 
} from '../src';

/**
 * This example shows how to set up the WalletProvider and use the 
 * WalletConnection component along with the useWalletIntegration hook.
 */

// 1. Wrap your application root with WalletProvider
export default function App() {
  return (
    <WalletProvider>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Rootstock Winks SDK</h1>
        <p>Wallet Integration Example</p>
        
        {/* 2. Place the WalletConnection component anywhere */}
        <div style={{ marginBottom: '20px' }}>
          <WalletConnection 
            showBalance={true} 
            showNetwork={true} 
          />
        </div>

        <WalletDashboard />
      </div>
    </WalletProvider>
  );
}

// 3. Use the hook in any child component
function WalletDashboard() {
  const { 
    walletState, 
    switchToRootstockTestnet, 
    sendTransaction 
  } = useWalletIntegration();

  const handleSend = async () => {
    try {
      const recipient = '0x1234567890123456789012345678901234567890';
      const amount = '0.001'; // in tRBTC
      
      const result = await sendTransaction(recipient, amount);
      
      if (result.success) {
        alert(`Transaction sent! Hash: ${result.txHash}`);
      } else {
        alert(`Failed: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!walletState.isConnected) {
    return <p>Please connect your wallet to see more options.</p>;
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
      <h3>Wallet Status</h3>
      <p>Address: {walletState.address}</p>
      <p>Chain ID: {walletState.chainId}</p>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={switchToRootstockTestnet}>
          Switch to Testnet
        </button>
        
        <button onClick={handleSend}>
          Send 0.001 tRBTC
        </button>
      </div>
    </div>
  );
}
