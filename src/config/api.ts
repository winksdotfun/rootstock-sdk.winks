const DEFAULT_API_URL = 'https://winks-sdk-eoqbp.ondigitalocean.app';

type GlobalWithWinks = typeof globalThis & { __WINKS_API_URL__?: string };

const globalWithWinks = globalThis as GlobalWithWinks;

export function getApiBaseUrl(): string {
  if (typeof process !== 'undefined') {
    const envUrl =
      process.env.NEXT_PUBLIC_WINKS_API_URL ||
      process.env.WINKS_API_URL ||
      process.env.REACT_APP_WINKS_API_URL;

    if (envUrl && typeof envUrl === 'string') {
      return envUrl.trim();
    }
  }

  if (typeof window !== 'undefined') {
    const runtimeUrl = (window as GlobalWithWinks).__WINKS_API_URL__;
    if (runtimeUrl) {
      return runtimeUrl;
    }
  } else if (globalWithWinks.__WINKS_API_URL__) {
    return globalWithWinks.__WINKS_API_URL__;
  }

  return DEFAULT_API_URL;
}

export function setClientApiUrl(url: string) {
  if (!url) return;
  if (typeof window !== 'undefined') {
    (window as GlobalWithWinks).__WINKS_API_URL__ = url;
  } else {
    globalWithWinks.__WINKS_API_URL__ = url;
  }
}

export { DEFAULT_API_URL };
