import { SignatureManager, Eip1193Provider } from '../src';

/**
 * This example demonstrates how to use the SignatureManager to queue and handle
 * multiple signing requests without overlapping wallet prompts.
 */
async function signatureExample() {
  // 1. Wrap the window.ethereum provider in our EIP-1193 adapter
  // In a real browser environment, window.ethereum would be available
  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    console.error('MetaMask or another wallet is not installed');
    return;
  }

  const eipProvider = new Eip1193Provider(ethereum);
  const sm = new SignatureManager(eipProvider);

  try {
    // 2. Request multiple signatures. These will be queued automatically.
    // The user will see prompts one after another, rather than all at once.
    
    console.log('Requesting message signature...');
    const messageSig = await sm.requestMessageSignature('Welcome to Rootstock!');
    console.log('Message Signature:', messageSig);

    console.log('Requesting personal signature...');
    const personalSig = await sm.requestPersonalSignature('Verify your identity on Winks');
    console.log('Personal Signature:', personalSig);

    // 3. Typed Data Example (EIP-712)
    const domain = {
      name: 'Winks SDK',
      version: '1',
      chainId: 31,
      verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    };

    const types = {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
    };

    const value = {
      name: 'Rootstock Developer',
      wallet: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    };

    console.log('Requesting typed data signature...');
    const typedSig = await sm.requestTypedDataSignature({ domain, types, value });
    console.log('Typed Data Signature:', typedSig);

    // 4. Transaction Signature
    console.log('Requesting transaction signature...');
    const txHash = await sm.requestTransactionSignature({
      to: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      value: 0n,
      data: '0x' as `0x${string}`,
    });
    console.log('Transaction Hash:', txHash);

  } catch (error) {
    console.error('Signature request failed:', error);
  }
}
