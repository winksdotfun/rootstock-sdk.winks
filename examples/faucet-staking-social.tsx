import React, { useState } from 'react';
import { 
  faucet, 
  stakeTransaction, 
  getWalletSigner, 
  generatePostTransactionTweet, 
  openTweet 
} from '../src';

/**
 * This example combines Faucet, Staking, and Social Sharing utilities.
 */
export default function FaucetAndStaking() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // 1. Faucet Example
  const handleFaucet = async () => {
    if (!address) return alert('Enter address');
    setLoading(true);
    try {
      const result = await faucet(address);
      setStatus(`Funded! TX: ${result.txHash}`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Staking Example
  const handleStake = async () => {
    try {
      const signer = await getWalletSigner();
      
      const result = await stakeTransaction({
        txHash: "0x...", // Original tx to stake against or reference
        signer,
        options: {
          valueEth: "0.1" // Staking 0.1 tRBTC
        }
      });

      if (result.status === "success" && result.hash) {
        setStatus(`Staked successfully! TX: ${result.hash}`);
        
        // 3. Social Sharing Example
        const tweetUrl = generatePostTransactionTweet({
          action: "staked",
          amount: "0.1",
          token: "tRBTC",
          txHash: result.hash,
          network: "testnet"
        });
        
        if (window.confirm("Success! Want to share this on X (Twitter)?")) {
          openTweet(tweetUrl);
        }
      }
    } catch (err: any) {
      setStatus(`Staking error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Rootstock Utilities</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Faucet</h3>
        <input 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          placeholder="0x..." 
        />
        <button onClick={handleFaucet} disabled={loading}>
          Get tRBTC
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Staking</h3>
        <button onClick={handleStake}>
          Stake 0.1 tRBTC
        </button>
      </div>

      {status && <p><strong>Status:</strong> {status}</p>}
    </div>
  );
}
