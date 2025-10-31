import React from 'react';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Chain } from 'wagmi/chains';

// Rootstock Mainnet Chain Configuration
// export const rootstockMainnet: Chain = {
//   id: 30,
//   name: 'Rootstock Mainnet',
//   network: 'rootstock',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Rootstock Bitcoin',
//     symbol: 'RBTC',
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://public-node.rsk.co'],
//     },
//     public: {
//       http: ['https://public-node.rsk.co'],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: 'Rootstock Explorer',
//       url: 'https://explorer.rootstock.io',
//     },
//   },
//   testnet: false,
// };

// Rootstock Testnet Chain Configuration
export const rootstockTestnet: Chain = {
  id: 31,
  name: 'Rootstock Testnet',
  network: 'rootstock-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Rootstock Bitcoin',
    symbol: 'tRBTC',
  },
  rpcUrls: {
    default: {
      http: ['https://public-node.testnet.rsk.co'],
    },
    public: {
      http: ['https://public-node.testnet.rsk.co'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Rootstock Testnet Explorer',
      url: 'https://explorer.testnet.rootstock.io',
    },
  },
  testnet: true,
};

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [rootstockTestnet],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: 'https://public-node.testnet.rsk.co',
      }),
    }),
    publicProvider(),
  ]
);

// Configure wallet connectors
const { wallets } = getDefaultWallets({
  appName: 'Rootstock Winks SDK',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '862ca94b48c598cea2b38a9325c54745',
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
]);

// Create wagmi client
const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider chains={chains} initialChain={rootstockTestnet}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WalletProvider;

