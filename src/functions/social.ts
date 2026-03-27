/**
 * Configuration for generating a Twitter/X sharing intent URL.
 */
export interface TweetParams {
  /** The main text content of the tweet */
  text: string;
  /** An optional URL to append and feature in the tweet card */
  url?: string;
  /** A list of hashtags (without the # symbol) */
  hashtags?: string[];
  /** A Twitter username to attribute the tweet to (e.g. "Rootstock") */
  via?: string;
}

/**
 * Generates a standard Twitter (X) intent URL for sharing.
 * 
 * @param {TweetParams} params - The tweet configuration
 * @returns {string} The fully formed twitter.com/intent/tweet URL
 */
export function generateTweetUrl(params: TweetParams): string {
  const url = new URL("https://x.com/intent/tweet");
  
  if (params.text) {
    url.searchParams.set("text", params.text);
  }
  
  if (params.url) {
    url.searchParams.set("url", params.url);
  }
  
  if (params.hashtags && params.hashtags.length > 0) {
    url.searchParams.set("hashtags", params.hashtags.join(","));
  }
  
  if (params.via) {
    url.searchParams.set("via", params.via);
  }
  
  return url.toString();
}

/**
 * Parameters for creating a post-transaction tweet.
 */
export interface PostTxTweetParams {
  /** The action performed (e.g. "staked", "swapped", "transferred") */
  action: string;
  /** The amount of tokens involved (e.g. "100", "0.5") */
  amount?: string;
  /** The token symbol (e.g. "tRBTC", "MoC") */
  token?: string;
  /** The transaction hash to link to */
  txHash?: string;
  /** The network, determines the block explorer URL */
  network?: "mainnet" | "testnet";
  /** Override default hashtags */
  hashtags?: string[];
}

/**
 * Generates a specialized Twitter (X) intent URL specifically formulated
 * for sharing post-transaction success on Rootstock.
 * 
 * @param {PostTxTweetParams} params - The transaction context
 * @returns {string} The formatted tweet URL
 */
export function generatePostTransactionTweet(params: PostTxTweetParams): string {
  const isTestnet = params.network === "testnet";
  const explorerUrl = isTestnet 
    ? "https://explorer.testnet.rootstock.io/tx/" 
    : "https://explorer.rootstock.io/tx/";
    
  let text = `I just ${params.action}`;
  
  if (params.amount && params.token) {
    text += ` ${params.amount} ${params.token}`;
  } else if (params.amount) {
    text += ` ${params.amount}`;
  } else if (params.token) {
    text += ` some ${params.token}`;
  }
  
  text += ` on the Rootstock network! 🚀`;

  const tweetParams: TweetParams = {
    text,
    hashtags: params.hashtags || ["Rootstock", "Bitcoin", "DeFi"],
  };

  if (params.txHash) {
    tweetParams.url = `${explorerUrl}${params.txHash}`;
  }

  return generateTweetUrl(tweetParams);
}

/**
 * A helper function to immediately open a tweet intent URL in a new window.
 * Useful for triggering directly from an onClick event handler.
 * 
 * @param {string} url - The intent URL generated from the other helper functions
 */
export function openTweet(url: string): void {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
