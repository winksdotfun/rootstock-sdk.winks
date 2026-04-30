import { renderHook, act } from '@testing-library/react';
import { useEnhancedTokenTransfer } from '../useEnhancedTokenTransfer';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { Contract, BrowserProvider } from 'ethers';

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useNetwork: jest.fn(),
  useSwitchNetwork: jest.fn().mockReturnValue({ switchNetwork: jest.fn() }),
}));

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  const mockContract = jest.fn();
  const mockBrowserProvider = jest.fn();
  return {
    __esModule: true,
    ...actual,
    ethers: {
      ...actual.ethers,
      Contract: mockContract,
      BrowserProvider: mockBrowserProvider,
    },
    Contract: mockContract,
    BrowserProvider: mockBrowserProvider,
  };
});

describe('useEnhancedTokenTransfer', () => {
  let mockContractInstance: any;
  let mockBrowserProviderInstance: any;

  beforeEach(() => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0xAddress',
      isConnected: true,
      connector: { getProvider: jest.fn().mockResolvedValue({}) }
    });
    (useNetwork as jest.Mock).mockReturnValue({
      chain: { id: 31 }
    });

    mockContractInstance = {
      decimals: jest.fn().mockResolvedValue(18),
      transfer: jest.fn().mockResolvedValue({ hash: '0xTxHash' }),
      balanceOf: jest.fn().mockResolvedValue(BigInt(10**18)),
    };
    (Contract as unknown as jest.Mock).mockImplementation(() => mockContractInstance);

    mockBrowserProviderInstance = {
      getSigner: jest.fn().mockResolvedValue({
        getAddress: jest.fn().mockResolvedValue('0xAddress'),
        hash: '0xHash',
        wait: jest.fn()
      }),
      on: jest.fn(),
      removeListener: jest.fn(),
      getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(31) }),
    };
    (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockBrowserProviderInstance);
  });

  it('transferERC20 should work correctly', async () => {
    const { result } = renderHook(() => useEnhancedTokenTransfer());
    
    let transferResult: any;
    await act(async () => {
      transferResult = await result.current.transferERC20({
        tokenAddress: '0xToken',
        recipientAddress: '0xTo',
        amount: '1.0'
      });
    });

    expect(transferResult.success).toBe(true);
    expect(transferResult.txHash).toBe('0xTxHash');
  });
});
