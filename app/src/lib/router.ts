import { useCallback, useEffect, useState } from 'react';

export type Network = 'mainnet' | 'testnet';

interface Route {
  isTestnet: boolean;
}

// Build-time default network (VITE_DEFAULT_NETWORK=testnet|mainnet). The
// Pages deploy ships testnet-first because the factory lives on testnet.
const DEFAULT_TESTNET = import.meta.env.VITE_DEFAULT_NETWORK === 'testnet';

function parseRoute(): Route {
  const params = new URLSearchParams(window.location.search);
  const explicit = params.get('testnet');
  return {
    isTestnet: explicit === null ? DEFAULT_TESTNET : explicit === 'true',
  };
}

// import.meta.env.BASE_URL is "/" locally and the repo subpath on GitHub Pages,
// so navigation stays inside the deployed base path instead of jumping to root.
const BASE = import.meta.env.BASE_URL;

function buildUrl(testnet: boolean) {
  const params = new URLSearchParams();
  // Only mark the URL when deviating from the build default
  if (testnet !== DEFAULT_TESTNET) params.set('testnet', String(testnet));
  const search = params.toString();
  return search ? `${BASE}?${search}` : BASE;
}

function push(url: string) {
  if (window.location.pathname + window.location.search !== url) {
    history.pushState(null, '', url);
    window.dispatchEvent(new Event('routechange'));
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseRoute);

  useEffect(() => {
    const update = () => setRoute(parseRoute());
    window.addEventListener('popstate', update);
    window.addEventListener('routechange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('routechange', update);
    };
  }, []);

  const setTestnet = useCallback((testnet: boolean) => {
    push(buildUrl(testnet));
  }, []);

  return {
    network: (route.isTestnet ? 'testnet' : 'mainnet') as Network,
    setTestnet,
  };
}
