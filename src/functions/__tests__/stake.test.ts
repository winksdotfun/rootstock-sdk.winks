import { stakeTransaction, getWalletSigner } from '../stake';
import { JsonRpcProvider, BrowserProvider, ethers } from 'ethers';

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  const mockJsonRpcProvider = jest.fn();
  const mockBrowserProvider = jest.fn();
  return {
    __esModule: true,
    ...actual,
    ethers: {
      ...actual.ethers,
      JsonRpcProvider: mockJsonRpcProvider,
      BrowserProvider: mockBrowserProvider,
    },
    JsonRpcProvider: mockJsonRpcProvider,
    BrowserProvider: mockBrowserProvider,
  };
});

describe('stakeTransaction', () => {
  let mockSigner: any;
  let mockProvider: any;

  beforeEach(() => {
    mockSigner = {
      getAddress: jest.fn().mockResolvedValue('0xSigner'),
      getNonce: jest.fn().mockResolvedValue(10),
      sendTransaction: jest.fn().mockResolvedValue({
        hash: '0xNewTxHash',
        wait: jest.fn().mockResolvedValue({ status: 1, hash: '0xNewTxHash' })
      }),
      signTransaction: jest.fn().mockResolvedValue('0xSignedData'),
      provider: {
        getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(31) })
      }
    };

    mockProvider = {
      getTransaction: jest.fn().mockResolvedValue({
        to: '0xContract',
        from: '0xSigner',
        value: BigInt(100),
        data: '0xdata',
        gasLimit: BigInt(21000),
        nonce: 5,
        gasPrice: BigInt(1000000000)
      })
    };

    (JsonRpcProvider as unknown as jest.Mock).mockImplementation(() => mockProvider);
  });

  it('should execute staking transaction successfully', async () => {
    const result = await stakeTransaction({
      txHash: '0xOldHash',
      signer: mockSigner,
      options: { valueEth: '1.0' }
    });

    expect(result.status).toBe('success');
    expect(result.hash).toBe('0xNewTxHash');
  });

  it('should handle dry run', async () => {
    const result = await stakeTransaction({
      txHash: '0xOldHash',
      signer: mockSigner,
      options: { dryRun: true }
    });

    expect(result.status).toBe('dry-run');
  });
});
