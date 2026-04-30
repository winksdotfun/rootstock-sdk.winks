import { renderHook, act } from '@testing-library/react';
import { useWalletIntegration } from '../useWalletIntegration';
import { useAccount, useNetwork, useBalance } from 'wagmi';
import { ethers } from 'ethers';

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useNetwork: jest.fn(),
  useSwitchNetwork: jest.fn().mockReturnValue({ switchNetwork: jest.fn() }),
  useBalance: jest.fn(),
}));

jest.mock('../../utils/signatureManager', () => {
  return jest.fn().mockImplementation(() => ({
    hasSigner: jest.fn().mockReturnValue(true),
    connectWallet: jest.fn().mockResolvedValue(true),
    requestTransactionSignature: jest.fn().mockResolvedValue({ success: true, txHash: '0xHash' }),
    requestMessageSignature: jest.fn().mockResolvedValue({ success: true, signature: '0xSig' }),
    switchToRootstockTestnet: jest.fn().mockResolvedValue(true),
    getAccount: jest.fn().mockResolvedValue('0xAddress'),
    getChainId: jest.fn().mockResolvedValue(31),
  }));
});

describe('useWalletIntegration', () => {
  beforeEach(() => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0xAddress',
      isConnected: true,
      connector: { getProvider: jest.fn().mockResolvedValue({}) }
    });
    (useNetwork as jest.Mock).mockReturnValue({
      chain: { id: 31 }
    });
    (useBalance as jest.Mock).mockReturnValue({
      data: { value: BigInt(10**18) },
      isLoading: false
    });
  });

  it('should return correct wallet state', () => {
    const { result } = renderHook(() => useWalletIntegration());
    
    expect(result.current.walletState.isConnected).toBe(true);
    expect(result.current.walletState.address).toBe('0xAddress');
    expect(result.current.walletState.chainId).toBe(31);
    expect(result.current.walletState.isRootstock).toBe(true);
    expect(result.current.walletState.balance).toBe('1.0');
  });

  it('sendTransaction should work correctly', async () => {
    const { result } = renderHook(() => useWalletIntegration());
    
    let txResult: any;
    await act(async () => {
      txResult = await result.current.sendTransaction('0xTo', '0.5');
    });

    expect(txResult.success).toBe(true);
    expect(txResult.txHash).toBe('0xHash');
  });

  it('requestMessageSignature should work correctly', async () => {
    const { result } = renderHook(() => useWalletIntegration());
    
    let sigResult: any;
    await act(async () => {
      sigResult = await result.current.requestMessageSignature('Hello');
    });

    expect(sigResult.success).toBe(true);
    expect(sigResult.data.signature).toBe('0xSig');
  });
});
