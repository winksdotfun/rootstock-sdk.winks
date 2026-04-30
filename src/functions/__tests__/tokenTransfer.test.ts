import { 
  transferERC20, 
  getTokenBalance, 
  approveToken, 
  getNFTOwner, 
  transferNFT 
} from '../tokenTransfer';
import * as ethers from 'ethers';

jest.mock('ethers', () => {
  const mockContract = jest.fn();
  const mockBrowserProvider = jest.fn();
  return {
    __esModule: true,
    ethers: {
      Contract: mockContract,
      BrowserProvider: mockBrowserProvider,
      parseUnits: jest.fn((v) => v),
      formatUnits: jest.fn((v) => v),
    },
    Contract: mockContract,
    BrowserProvider: mockBrowserProvider,
    parseUnits: jest.fn((v) => v),
    formatUnits: jest.fn((v) => v),
  };
});

describe('tokenTransfer functions', () => {
  let mockSigner: any;
  let mockContractInstance: any;

  beforeEach(() => {
    mockContractInstance = {
      decimals: jest.fn().mockResolvedValue(18),
      transfer: jest.fn().mockResolvedValue({ hash: '0xHash', wait: jest.fn() }),
      balanceOf: jest.fn().mockResolvedValue(BigInt(1000)),
      approve: jest.fn().mockResolvedValue({ hash: '0xHash', wait: jest.fn() }),
      ownerOf: jest.fn().mockResolvedValue('0xOwner'),
      safeTransferFrom: jest.fn().mockResolvedValue({ hash: '0xHash', wait: jest.fn() }),
      allowance: jest.fn().mockResolvedValue(BigInt(500)),
    };
    
    (ethers.Contract as unknown as jest.Mock).mockImplementation(() => mockContractInstance);
    
    mockSigner = {};
  });

  it('transferERC20 should work correctly', async () => {
    const hash = await transferERC20('0xToken', '0xTo', '1.0', mockSigner as any);
    expect(hash).toBe('0xHash');
  });

  it('getTokenBalance should return formatted units', async () => {
    const balance = await getTokenBalance('0xToken', '0xUser', mockSigner as any);
    expect(balance).toBeDefined();
  });
});
