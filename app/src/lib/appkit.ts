import { AppKit, Network, createTonConnectConnector } from '@ton/appkit';

import type { Network as AppNetwork } from './router';

// The TON Connect manifest is served from our own static deployment; the
// runtime origin + BASE_URL works both locally and on GitHub Pages.
const manifestUrl = `${window.location.origin}${import.meta.env.BASE_URL}tonconnect-manifest.json`;

function apiClient(network: AppNetwork) {
  const key =
    network === 'testnet'
      ? (import.meta.env.TONCENTER_TESTNET_API_KEY as string | undefined)
      : (import.meta.env.TONCENTER_MAINNET_API_KEY as string | undefined);
  return {
    url:
      network === 'testnet'
        ? 'https://testnet.toncenter.com'
        : 'https://toncenter.com',
    ...(key ? { key } : {}),
  };
}

// Single AppKit instance per app runtime (per the AppKit docs).
export const appKit = new AppKit({
  networks: {
    [Network.mainnet().chainId]: { apiClient: apiClient('mainnet') },
    [Network.testnet().chainId]: { apiClient: apiClient('testnet') },
  },
  defaultNetwork:
    import.meta.env.VITE_DEFAULT_NETWORK === 'testnet'
      ? Network.testnet()
      : Network.mainnet(),
  connectors: [
    createTonConnectConnector({
      tonConnectOptions: { manifestUrl },
    }),
  ],
});

// Our URL-driven network ('mainnet' | 'testnet') → AppKit Network object.
// Passed with every transaction so a wallet connected to the wrong chain
// can never sign a transfer meant for the other one.
export function toTonNetwork(network: AppNetwork): Network {
  return network === 'testnet' ? Network.testnet() : Network.mainnet();
}
