# Winks SDK (Rootstock)

A React/Next.js SDK that automatically populates SEO meta tags from a secure API and provides Rootstock-ready wallet integration, token/NFT utilities, signature management, and RPC failover.

## Features

- 🚀 Easy Integration: drop-in `Winks` wrapper for Next.js
- 🔑 API-keyed metadata management (server included)
- 📱 Social meta: Open Graph, Twitter Cards
- 🎯 Full SEO meta coverage
- 💰 Token utilities: ERC-20 transfer/approve/balance/allowance
- 🎨 NFT utilities: ERC-721 owner, ERC-721/1155 transfers, ERC-1155 balance
- 🔗 Rootstock ready (Testnet 31) — SDK defaults to Testnet in the example app
- 🌐 Wallet integration via RainbowKit + WalletConnect (styles auto-injected)
- ✍️ Signature management (tx/message/personal/typed data)
- 🔄 Network switching helpers
- 🧭 RPC Management with health checks and latency-based selection
- 🧩 EIP-1193 Provider adapter (MetaMask et al.)
- 🧯 Signature queueing to avoid overlapping prompts
- 🛠️ Dual builds (Rollup + Vite) outputting CJS + ESM
- ✅ Testing setup (Jest unit, Playwright E2E)

## Installation

```bash
npm install rootstockwinks
```

## Quick Start (Next.js)

```jsx
// pages/_app.js or app/layout.js
import { Winks } from 'rootstockwinks';

export default function App({ Component, pageProps }) {
  return (
    <Winks apikey="YOUR_API_KEY">
      <Component {...pageProps} />
    </Winks>
  );
}
```

Start the local metadata server and create an API key:

```bash
cd server
npm install
npm run build
npm start

# Create API Key
curl -X POST http://localhost:3001/api/keys \
  -H "Content-Type: application/json" \
  -d '{"name": "My Website"}'

# Set metadata
curl -X POST http://localhost:3001/api/meta/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "title": "My Awesome Website",
    "description": "The best website ever created",
    "ogTitle": "My Awesome Website",
    "ogDescription": "The best website ever created",
    "ogImage": "https://example.com/og-image.jpg",
    "ogUrl": "https://example.com",
    "twitterCard": "summary_large_image",
    "twitterTitle": "My Awesome Website",
    "twitterDescription": "The best website ever created",
    "twitterImage": "https://example.com/twitter-image.jpg",
    "canonical": "https://example.com",
    "robots": "index, follow",
    "viewport": "width=device-width, initial-scale=1",
    "charset": "utf-8",
    "author": "Your Name"
  }'
```

### WalletConnect project ID (RainbowKit)

RainbowKit requires a WalletConnect project ID. Set it in your app (for the example app, create `example/.env.local`):

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

### Winks Component

Props:
- `apikey: string` required
- `children: ReactNode` required
- `fallback?: MetaData` (used if server fetch fails)

`MetaData` shape:
```ts
interface MetaData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
  author?: string;
}
```

### RPC Manager

```ts
import { RpcManager } from 'rootstockwinks';

const rpc = new RpcManager();
const provider = rpc.createProvider('mainnet'); // or 'testnet'
const bestUrl = rpc.getBestRpcUrl('mainnet');
// Health snapshot
const health = rpc.getHealth('mainnet');
```
- Periodic health checks (eth_blockNumber) with timeouts
- Chooses lowest-latency healthy endpoint; fails over automatically

### EIP-1193 Provider Adapter

```ts
import { Eip1193Provider } from 'rootstockwinks';

const eip = new Eip1193Provider(window.ethereum);
await eip.request({ method: 'eth_requestAccounts' });
```

### Signature Manager (Queued)

```ts
import { SignatureManager, Eip1193Provider } from 'rootstockwinks';

const sm = new SignatureManager(new Eip1193Provider(window.ethereum));
// Requests are queued to avoid multiple wallet prompts
await sm.requestTransactionSignature({ to: '0x...', value: 0n });
await sm.requestMessageSignature('Hello Rootstock');
await sm.requestPersonalSignature('Personal message');
await sm.requestTypedDataSignature({ domain, types, value });
```

### Wallet Integration (RainbowKit + wagmi)

Wrap your app:
```jsx
import { WalletProvider } from 'rootstockwinks';

export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
```

Use the connection UI:
```jsx
import { WalletConnection } from 'rootstockwinks';

function MyComponent() {
  return <WalletConnection showBalance showNetwork />;
}
```

Advanced hook:
```jsx
import { useWalletIntegration } from 'rootstockwinks';

const {
  walletState,
  connectWallet,
  disconnectWallet,
  switchToRootstockMainnet,
  switchToRootstockTestnet,
  requestTransactionSignature,
  requestMessageSignature,
  requestPersonalSignature,
  requestTypedDataSignature,
  sendTransaction,
} = useWalletIntegration();
```

- `sendTransaction(to, value)` now powers the example app’s “Send tRBTC” flow and sends native tRBTC on Rootstock Testnet.

Send native tRBTC:

```ts
const result = await sendTransaction('0xRecipient', '0.05');
if (result.success) {
  console.log('tx hash', result.txHash);
} else {
  console.error(result.error);
}
```

### Enhanced Token Transfer Hook

```tsx
import { useEnhancedTokenTransfer } from 'rootstockwinks';

const {
  transferERC20,
  transferNFT,
  approveToken,
  getTokenBalance,
  getNFTOwner,
  getTokenAllowance,
  ensureRootstockNetwork,
  address,
  isConnected,
} = useEnhancedTokenTransfer();
```
- Use this hook for ERC-20/ERC-721/ERC-1155 contracts. For native tRBTC, prefer `useWalletIntegration().sendTransaction`.

### Simple Token/NFT Functions

```ts
import {
  transferERC20,
  approveToken,
  getTokenBalance,
  getTokenAllowance,
  getNFTOwner,
  transferNFT,
} from 'rootstockwinks';
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

await transferERC20('0xToken', '0xRecipient', '1.0', signer);
await approveToken('0xToken', '0xSpender', '100.0', signer);
const bal = await getTokenBalance('0xToken', '0xAccount', provider);
const allowance = await getTokenAllowance('0xToken', '0xOwner', '0xSpender', provider);
const owner = await getNFTOwner('0xNft', '123', provider);
await transferNFT('0xNft', '0xFrom', '0xTo', '123', signer);
```

### Network Configuration

- Rootstock Mainnet: Chain ID 30, RPC `https://public-node.rsk.co`, Explorer `https://explorer.rootstock.io`, Currency RBTC
- Rootstock Testnet: Chain ID 31, RPC `https://public-node.testnet.rsk.co`, Explorer `https://explorer.testnet.rootstock.io`, Currency tRBTC

## Server API (local metadata server)

- `GET /health`
- `POST /api/keys` → `{ id, key, name, createdAt, isActive }`
- `GET /api/keys` (auth)
- `DELETE /api/keys/:key` (auth)
- `GET /api/meta/:apiKey` → returns `MetaData`
- `POST /api/meta/:apiKey` (auth) `{ metadata: MetaData }`
- `PUT /api/meta/:apiKey` (auth) `{ metadata: MetaData }`
- `DELETE /api/meta/:apiKey` (auth)

Auth header: `X-API-Key: {apiKey}`

## Development

### Build
```bash
npm run build           # TypeScript + Rollup (CJS + ESM)
npm run build:vite      # Vite library build (optional)
```

### Testing
```bash
npm test                # Jest unit tests
npx playwright install chromium
npm run test:e2e        # Playwright (ensure example app is running or use a prod build)
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request
