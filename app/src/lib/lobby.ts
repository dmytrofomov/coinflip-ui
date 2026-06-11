import { Cell } from '@ton/core';

import { EvGameCreated } from '@wrappers/CoinFlipFactory.gen';

import { GameStatus, openGame } from './coinflip';
import { factoryAddress, indexerUrl } from './config';
import type { Network } from './router';
import { getTonClient, toncenterApiKey, toncenterBaseUrl } from './ton';

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

// ─── Indexer-less fallback: scan the chain directly from the browser ───
//
// Same discovery the indexer does (factory EvGameCreated events via the
// toncenter v3 API, parsed with the generated wrappers), but client-side, so
// the lobby works on a fully static deployment. Slower and open-games-only;
// a hosted indexer (VITE_INDEXER_URL) upgrades it to instant + history.

interface V3Message {
  destination: string | null;
  message_content?: { body?: string | null } | null;
}
interface V3Tx {
  out_msgs?: V3Message[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchOpenGamesOnChain(
  network: Network,
): Promise<LobbyGame[]> {
  const factory = factoryAddress(network);
  if (!factory) return [];

  const url = new URL(`${toncenterBaseUrl(network)}/api/v3/transactions`);
  url.searchParams.set('account', factory);
  url.searchParams.set('limit', '60');
  url.searchParams.set('sort', 'desc');
  const apiKey = toncenterApiKey(network);
  const res = await fetch(url, {
    headers: apiKey ? { 'X-API-Key': apiKey } : undefined,
  });
  if (!res.ok) throw new Error(`toncenter ${res.status}`);
  const data = (await res.json()) as { transactions?: V3Tx[] };

  // Collect EvGameCreated events whose join window is still open
  const now = Math.floor(Date.now() / 1000);
  const seen = new Set<string>();
  const candidates: {
    address: string;
    gameId: number;
    joinDeadline: number;
  }[] = [];
  for (const tx of data.transactions ?? []) {
    for (const out of tx.out_msgs ?? []) {
      if (out.destination) continue; // events are external-out
      const body = out.message_content?.body;
      if (!body) continue;
      try {
        const slice = Cell.fromBase64(body).beginParse();
        if (
          slice.remainingBits < 32 ||
          slice.preloadUint(32) !== EvGameCreated.PREFIX
        ) {
          continue;
        }
        const ev = EvGameCreated.fromSlice(slice);
        const address = ev.game.toString({
          bounceable: true,
          testOnly: network === 'testnet',
        });
        if (seen.has(address) || Number(ev.joinDeadline) <= now) continue;
        seen.add(address);
        candidates.push({
          address,
          gameId: Number(ev.gameId),
          joinDeadline: Number(ev.joinDeadline),
        });
      } catch {
        continue;
      }
    }
  }
  candidates.sort((a, b) => b.gameId - a.gameId);

  // Confirm each candidate on-chain: a single getGameData call per game (a
  // settled game's account is destroyed, so the call simply fails → skip).
  // Paced at ~1 req/s with one retry, to live within the keyless toncenter
  // rate limit; a hosted indexer removes all of this.
  const client = getTonClient(network);
  const open: LobbyGame[] = [];
  for (const c of candidates.slice(0, 8)) {
    await sleep(1100);
    try {
      const game = openGame(client, c.address);
      const data = await game.getGameData().catch(async () => {
        await sleep(1300); // likely a 429 — give the limiter a beat and retry
        return game.getGameData();
      });
      if (Number(data.status) !== GameStatus.Created) continue;
      open.push({
        address: c.address,
        gameId: c.gameId,
        creator: data.creator.toString({
          bounceable: false,
          testOnly: network === 'testnet',
        }),
        stake: data.stake.toString(),
        aSideHeads: data.aSideHeads,
        feeBps: Number(data.feeBps),
        joinDeadline: Number(data.joinDeadline),
        status: 'open',
        opponent: null,
        revealDeadline: null,
        coinIsHeads: null,
        winner: null,
        payout: null,
        fee: null,
        refund: null,
        createdAt: 0,
        updatedAt: 0,
      });
    } catch {
      // destroyed account or persistent rate limit — skip this candidate
    }
  }
  return open;
}
