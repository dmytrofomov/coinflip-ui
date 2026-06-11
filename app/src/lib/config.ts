import type { Network } from './router';

// CoinFlipFactory addresses. Resolution order:
//   1. ?factory=<address> URL param (handy right after a fresh deploy)
//   2. VITE_FACTORY_ADDRESS_TESTNET / VITE_FACTORY_ADDRESS_MAINNET from .env
// Returns null when the factory is not deployed for the selected network yet.
export function factoryAddress(network: Network): string | null {
  const fromUrl = new URLSearchParams(window.location.search).get('factory');
  if (fromUrl) return fromUrl;
  const fromEnv =
    network === 'testnet'
      ? import.meta.env.VITE_FACTORY_ADDRESS_TESTNET
      : import.meta.env.VITE_FACTORY_ADDRESS_MAINNET;
  return typeof fromEnv === 'string' && fromEnv.length > 0 ? fromEnv : null;
}

export function gameUrlParam(): string | null {
  return new URLSearchParams(window.location.search).get('game');
}

// Lobby indexer base URL. Explicit VITE_INDEXER_URL wins; in dev we default to
// the local indexer (npm run indexer). Returns null when no lobby is available.
export function indexerUrl(): string | null {
  const explicit = import.meta.env.VITE_INDEXER_URL as string | undefined;
  if (explicit && explicit.length > 0) return explicit.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:8787';
  return null;
}

export function buildGameShareUrl(
  gameAddress: string,
  network: Network,
): string {
  const params = new URLSearchParams();
  params.set('game', gameAddress);
  // Always explicit so the link opens on the right network regardless of the
  // receiver's build default.
  params.set('testnet', String(network === 'testnet'));
  // BASE_URL keeps the share link inside the deployed subpath on GitHub Pages.
  return `${window.location.origin}${import.meta.env.BASE_URL}?${params.toString()}`;
}
