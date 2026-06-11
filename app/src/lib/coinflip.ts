import { Address, Cell, toNano } from '@ton/core';
import { sha256 } from '@ton/crypto';
import type { TonClient } from '@ton/ton';

import { CoinFlipFactory, CreateGame } from '@wrappers/CoinFlipFactory.gen';
import {
  CoinFlipGame,
  EvGameCancelled,
  EvGameSettled,
  EvGameTimedOut,
  JoinGame,
  Reveal,
  ClaimTimeout,
  CancelGame,
  type GameData,
} from '@wrappers/CoinFlipGame.gen';

import type { Network } from './router';
import { toncenterApiKey, toncenterBaseUrl } from './ton';

// ─── Protocol constants (mirror contracts/src/types.tolk) ───

export const GameStatus = {
  Created: 0,
  Joined: 1,
  Settled: 2,
  TimedOut: 3,
  Cancelled: 4,
} as const;

// Attached on top of the stake; unspent gas is refunded or swept to the winner
export const CREATE_EXTRA = toNano('0.15');
export const JOIN_EXTRA = toNano('0.06');
export const ACTION_VALUE = toNano('0.05');

// ─── Entropy & provable fairness ───

export function randomU256(): bigint {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToU256(bytes);
}

export function bytesToU256(bytes: Uint8Array): bigint {
  let v = 0n;
  for (const b of bytes) v = (v << 8n) | BigInt(b);
  return v;
}

export function u256ToBytes(v: bigint): Buffer {
  const out = Buffer.alloc(32);
  let rest = v;
  for (let i = 31; i >= 0; i--) {
    out[i] = Number(rest & 0xffn);
    rest >>= 8n;
  }
  return out;
}

export function u256ToHex(v: bigint): string {
  return v.toString(16).padStart(64, '0');
}

export function hexToU256(hex: string): bigint | null {
  const clean = hex.trim().toLowerCase().replace(/^0x/, '');
  if (!/^[0-9a-f]{1,64}$/.test(clean)) return null;
  return BigInt(`0x${clean}`);
}

// commitment = SHA256(secretA as a 32-byte big-endian value) — must match
// calcCommitment in contracts/src/types.tolk (slice.bitsHash over 256 bits)
export async function commitmentOf(secret: bigint): Promise<bigint> {
  const digest = await sha256(u256ToBytes(secret));
  return bytesToU256(digest);
}

// coin = LSB(secretA XOR seedB); true = heads (орел)
export function coinIsHeads(secretA: bigint, seedB: bigint): boolean {
  return ((secretA ^ seedB) & 1n) === 1n;
}

// ─── Message payloads for TON Connect (base64 BoC) ───

function cellToBase64(cell: Cell): string {
  return cell.toBoc().toString('base64');
}

export function createGamePayload(
  stake: bigint,
  commitment: bigint,
  aSideHeads: boolean,
): string {
  return cellToBase64(
    CreateGame.toCell(CreateGame.create({ stake, commitment, aSideHeads })),
  );
}

export function joinGamePayload(seedB: bigint): string {
  return cellToBase64(JoinGame.toCell(JoinGame.create({ seedB })));
}

export function revealPayload(secretA: bigint): string {
  return cellToBase64(Reveal.toCell(Reveal.create({ secretA })));
}

export function claimTimeoutPayload(): string {
  return cellToBase64(ClaimTimeout.toCell(ClaimTimeout.create()));
}

export function cancelGamePayload(): string {
  return cellToBase64(CancelGame.toCell(CancelGame.create()));
}

// ─── Local registry of my games (incl. creator secrets) ───

export interface StoredGame {
  network: Network;
  role: 'creator' | 'joiner';
  /** Game contract address; for creators it is discovered after the create tx lands */
  address: string | null;
  /** hex64; unique key of a creator game before the address is known */
  commitment: string;
  /** hex64 — creator only. Losing it before reveal forfeits the game! */
  secret?: string;
  /** hex64 — joiner entropy, public after join */
  seedB?: string;
  stakeNano: string;
  aSideHeads: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'coinflip:games:v1';

export function listGames(network: Network): StoredGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as StoredGame[]) : [];
    return all
      .filter((g) => g.network === network)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

function writeAll(games: StoredGame[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function gameKey(
  g: Pick<StoredGame, 'network' | 'commitment' | 'role'>,
): string {
  return `${g.network}:${g.role}:${g.commitment}`;
}

export function upsertGame(game: StoredGame) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as StoredGame[]) : [];
    const idx = all.findIndex((g) => gameKey(g) === gameKey(game));
    if (idx >= 0) all[idx] = { ...all[idx], ...game };
    else all.push(game);
    writeAll(all);
  } catch {
    // localStorage unavailable — the game still works, only history is lost
  }
}

export function removeGame(game: StoredGame) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as StoredGame[]) : [];
    writeAll(all.filter((g) => gameKey(g) !== gameKey(game)));
  } catch {
    // ignore
  }
}

export function backupText(game: StoredGame): string {
  return [
    'TON Coin Flip — резервна копія секрету',
    `Мережа: ${game.network}`,
    `Гра: ${game.address ?? '(адреса ще не відома)'}`,
    `Ставка (nanoTON): ${game.stakeNano}`,
    `Моя сторона: ${game.aSideHeads ? 'орел (heads)' : 'решка (tails)'}`,
    `commitment: ${game.commitment}`,
    `secretA: ${game.secret ?? ''}`,
    '',
    'УВАГА: без secretA неможливо зробити reveal — гра буде програна по таймауту.',
  ].join('\n');
}

// ─── Chain reads ───

export function openGame(client: TonClient, address: string) {
  return client.open(CoinFlipGame.fromAddress(Address.parse(address)));
}

export function openFactory(client: TonClient, address: string) {
  return client.open(CoinFlipFactory.fromAddress(Address.parse(address)));
}

/**
 * Finds the freshly created game address by scanning recent factory
 * transactions for our CreateGame message (matched by commitment) and taking
 * the destination of the deploy message it produced.
 */
export async function findGameAddress(
  client: TonClient,
  factoryAddr: string,
  commitment: bigint,
): Promise<string | null> {
  const txs = await client.getTransactions(Address.parse(factoryAddr), {
    limit: 40,
  });
  for (const tx of txs) {
    const body = tx.inMessage?.body;
    if (!body) continue;
    try {
      const slice = body.beginParse();
      if (
        slice.remainingBits < 32 ||
        slice.preloadUint(32) !== CreateGame.PREFIX
      ) {
        continue;
      }
      const msg = CreateGame.fromSlice(slice);
      if (msg.commitment !== commitment) continue;
      for (const out of tx.outMessages.values()) {
        if (out.info.type === 'internal') {
          return out.info.dest.toString();
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

export interface GameOutcome {
  kind: 'settled' | 'timedout' | 'cancelled';
  coinIsHeads?: boolean;
  winner?: string;
  payout?: bigint;
  fee?: bigint;
  refund?: bigint;
}

function parseOutcomeBody(bodyBase64: string): GameOutcome | null {
  try {
    const slice = Cell.fromBase64(bodyBase64).beginParse();
    if (slice.remainingBits < 32) return null;
    const prefix = slice.preloadUint(32);
    if (prefix === EvGameSettled.PREFIX) {
      const ev = EvGameSettled.fromSlice(slice);
      return {
        kind: 'settled',
        coinIsHeads: ev.coinIsHeads,
        winner: ev.winner.toString(),
        payout: ev.payout,
        fee: ev.fee,
      };
    }
    if (prefix === EvGameTimedOut.PREFIX) {
      const ev = EvGameTimedOut.fromSlice(slice);
      return {
        kind: 'timedout',
        winner: ev.winner.toString(),
        payout: ev.payout,
        fee: ev.fee,
      };
    }
    if (prefix === EvGameCancelled.PREFIX) {
      const ev = EvGameCancelled.fromSlice(slice);
      return { kind: 'cancelled', refund: ev.refund };
    }
  } catch {
    return null;
  }
  return null;
}

interface ToncenterV3Message {
  destination: string | null;
  message_content?: { body?: string | null } | null;
}

interface ToncenterV3Transaction {
  out_msgs?: ToncenterV3Message[];
}

/**
 * A settled game account is DELETED from the chain state, so toncenter v2
 * (which paginates from the live account's last_transaction_id) returns
 * nothing for it. The v3 indexer still serves the full history — scan it for
 * the terminal ext-out event log.
 */
export async function fetchOutcome(
  network: Network,
  gameAddr: string,
): Promise<GameOutcome | null> {
  const url = new URL(`${toncenterBaseUrl(network)}/api/v3/transactions`);
  url.searchParams.set('account', gameAddr);
  url.searchParams.set('limit', '20');
  const apiKey = toncenterApiKey(network);
  const res = await fetch(url, {
    headers: apiKey ? { 'X-API-Key': apiKey } : undefined,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    transactions?: ToncenterV3Transaction[];
  };
  for (const tx of data.transactions ?? []) {
    for (const out of tx.out_msgs ?? []) {
      // External-out (event) messages have no destination
      if (out.destination) continue;
      const body = out.message_content?.body;
      if (!body) continue;
      const outcome = parseOutcomeBody(body);
      if (outcome) return outcome;
    }
  }
  return null;
}

export type GameSnapshot =
  | { state: 'active'; data: GameData }
  | { state: 'finished'; outcome: GameOutcome | null }
  | { state: 'missing' };

export async function getGameSnapshot(
  client: TonClient,
  network: Network,
  gameAddr: string,
): Promise<GameSnapshot> {
  const account = await client.getContractState(Address.parse(gameAddr));
  if (account.state === 'active') {
    const data = await openGame(client, gameAddr).getGameData();
    return { state: 'active', data };
  }
  const outcome = await fetchOutcome(network, gameAddr).catch(() => null);
  if (outcome) return { state: 'finished', outcome };
  if (account.lastTransaction) return { state: 'finished', outcome: null };
  return { state: 'missing' };
}
