import { generateTweetUrl, generatePostTransactionTweet, openTweet } from '../social';

describe('social utilities', () => {
  describe('generateTweetUrl', () => {
    it('should generate a correct URL with all parameters', () => {
      const params = {
        text: 'Hello world',
        url: 'https://example.com',
        hashtags: ['tag1', 'tag2'],
        via: 'Rootstock'
      };
      const result = generateTweetUrl(params);
      const url = new URL(result);
      
      expect(url.origin).toBe('https://x.com');
      expect(url.pathname).toBe('/intent/tweet');
      expect(url.searchParams.get('text')).toBe('Hello world');
      expect(url.searchParams.get('url')).toBe('https://example.com');
      expect(url.searchParams.get('hashtags')).toBe('tag1,tag2');
      expect(url.searchParams.get('via')).toBe('Rootstock');
    });

    it('should generate a correct URL with minimum parameters', () => {
      const result = generateTweetUrl({ text: 'Simple text' });
      const url = new URL(result);
      expect(url.searchParams.get('text')).toBe('Simple text');
      expect(url.searchParams.has('url')).toBe(false);
    });
  });

  describe('generatePostTransactionTweet', () => {
    it('should generate a formatted transaction tweet for mainnet', () => {
      const params = {
        action: 'staked',
        amount: '100',
        token: 'RBTC',
        txHash: '0x123',
        network: 'mainnet' as const
      };
      const result = generatePostTransactionTweet(params);
      expect(result).toContain('I+just+staked+100+RBTC+on+the+Rootstock+network');
      expect(result).toContain('https%3A%2F%2Fexplorer.rootstock.io%2Ftx%2F0x123');
      expect(result).toContain('hashtags=Rootstock%2CBitcoin%2CDeFi');
    });

    it('should generate a formatted transaction tweet for testnet', () => {
      const params = {
        action: 'transferred',
        txHash: '0xabc',
        network: 'testnet' as const
      };
      const result = generatePostTransactionTweet(params);
      expect(result).toContain('I+just+transferred+on+the+Rootstock+network');
      expect(result).toContain('https%3A%2F%2Fexplorer.testnet.rootstock.io%2Ftx%2F0xabc');
    });
  });

  describe('openTweet', () => {
    it('should call window.open', () => {
      const originalOpen = window.open;
      window.open = jest.fn();
      
      const testUrl = 'https://x.com/intent/tweet?text=test';
      openTweet(testUrl);
      
      expect(window.open).toHaveBeenCalledWith(testUrl, '_blank', 'noopener,noreferrer');
      
      window.open = originalOpen;
    });
  });
});
