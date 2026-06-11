import { indexerUrl } from './config';

// Mirrors GameRecord served by indexer/src/store.ts
export interface LobbyGame {
  address: string;
  gameId: number;
  creator: string;
  stake: string;
  aSideHeads: boolean;
  feeBps: number;
  joinDeadline: number;
  status: 'open' | 'joined' | 'settled' | 'timedout' | 'cancelled';
  opponent: string | null;
  revealDeadline: number | null;
  coinIsHeads: boolean | null;
  winner: string | null;
  payout: string | null;
  fee: string | null;
  refund: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface LobbyHealth {
  ok: boolean;
  network: string;
  factory: string;
}

async function getJson<T>(path: string): Promise<T> {
  const base = indexerUrl();
  if (!base) throw new Error('no-indexer');
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`indexer ${res.status}`);
  return (await res.json()) as T;
}

export function lobbyAvailable(): boolean {
  return indexerUrl() !== null;
}

export async function fetchLobbyHealth(): Promise<LobbyHealth> {
  return getJson<LobbyHealth>('/health');
}

export async function fetchOpenGames(): Promise<LobbyGame[]> {
  const data = await getJson<{ games: LobbyGame[] }>('/api/games/open');
  return data.games;
}

export async function fetchRecentGames(limit = 12): Promise<LobbyGame[]> {
  const data = await getJson<{ games: LobbyGame[] }>(
    `/api/games/recent?limit=${limit}`,
  );
  return data.games;
}
