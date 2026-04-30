import { faucet } from '../faucet';

describe('faucet', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should request tRBTC successfully', async () => {
    const mockResponse = { txHash: '0xabc', message: 'Success' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await faucet(mockAddress);
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ address: mockAddress }),
    }));
  });

  it('should throw error if address is empty', async () => {
    await expect(faucet('')).rejects.toThrow('address must not be empty');
    await expect(faucet('  ')).rejects.toThrow('address must not be empty');
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Rate limit exceeded' }),
    });

    await expect(faucet(mockAddress)).rejects.toThrow('Rate limit exceeded');
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    await expect(faucet(mockAddress)).rejects.toThrow('Network failure');
  });
});
