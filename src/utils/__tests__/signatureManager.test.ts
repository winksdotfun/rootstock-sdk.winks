import { SignatureManager } from '../signatureManager';
import { BrowserProvider } from 'ethers';

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  const mockBrowserProvider = jest.fn();
  return {
    __esModule: true,
    ...actual,
    ethers: {
      ...actual.ethers,
      BrowserProvider: mockBrowserProvider,
    },
    BrowserProvider: mockBrowserProvider,
  };
});

describe('SignatureManager', () => {
  let sm: SignatureManager;
  let mockProviderInstance: any;

  beforeEach(() => {
    mockProviderInstance = {
      send: jest.fn(),
      getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(31) }),
      getSigner: jest.fn().mockResolvedValue({
        getAddress: jest.fn().mockResolvedValue('0xAddress'),
        sendTransaction: jest.fn().mockResolvedValue({ hash: '0xHash' }),
        signMessage: jest.fn().mockResolvedValue('0xSig'),
        signTypedData: jest.fn().mockResolvedValue('0xTypedSig'),
      }),
      estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
    };

    (BrowserProvider as unknown as jest.Mock).mockImplementation(() => mockProviderInstance);
    
    sm = new SignatureManager({ request: jest.fn() } as any);
  });

  it('connectWallet should switch network if not on Testnet', async () => {
    mockProviderInstance.getNetwork
      .mockResolvedValueOnce({ chainId: BigInt(1) })
      .mockResolvedValueOnce({ chainId: BigInt(31) });
    
    mockProviderInstance.send.mockResolvedValue(true);

    const result = await sm.connectWallet();
    expect(result).toBe(true);
  });

  it('requestTransactionSignature should work correctly', async () => {
    await sm.connectWallet();
    const result = await sm.requestTransactionSignature({ to: '0xTo', value: BigInt(100) } as any);
    
    expect(result.success).toBe(true);
    expect(result.txHash).toBe('0xHash');
  });
});
