import { useEffect, useMemo, useState } from 'react';
import { Address, fromNano } from '@ton/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAddress, useSendTransaction } from '@ton/appkit-react';
import { Copy, Loader2, RefreshCw, Trash2 } from 'lucide-react';

import { Coin3D, type CoinSide } from './Coin3D';

import { Button } from '@/components/ui/button';
import { buildGameShareUrl } from '@/lib/config';
import {
  ACTION_VALUE,
  GameStatus,
  cancelGamePayload,
  claimTimeoutPayload,
  coinIsHeads,
  findGameAddress,
  getGameSnapshot,
  hexToU256,
  listGames,
  removeGame,
  revealPayload,
  upsertGame,
  type GameSnapshot,
  type StoredGame,
} from '@/lib/coinflip';
import { toTonNetwork } from '@/lib/appkit';
import { getTonClient, tonviewerUrl } from '@/lib/ton';
import { cn } from '@/lib/utils';
import type { Network } from '@/lib/router';

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatCountdown(deadlineSec: number, nowMs: number): string {
  const left = Math.max(0, Math.floor(deadlineSec - nowMs / 1000));
  const m = Math.floor(left / 60);
  const s = left % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Row {
  game: StoredGame;
  snapshot: GameSnapshot | null;
}

interface Props {
  network: Network;
  factoryAddr: string | null;
  refreshKey: number;
}

export function MyGames({ network, factoryAddr, refreshKey }: Props) {
  const { mutateAsync: sendTx } = useSendTransaction();
  const myAddress = useAddress();
  const queryClient = useQueryClient();
  const now = useNow(1000);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const stored = useMemo(
    () => listGames(network),
    // refreshKey forces a re-read of localStorage after create/join
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network, refreshKey],
  );

  const rowsQuery = useQuery({
    queryKey: ['my-games', network, refreshKey, stored.length],
    refetchInterval: 8000,
    queryFn: async (): Promise<Row[]> => {
      const client = getTonClient(network);
      const rows: Row[] = [];
      for (const game of stored) {
        let g = game;
        // A creator record may not know its game address yet — try to resolve
        if (!g.address && g.role === 'creator' && factoryAddr) {
          const commitment = hexToU256(g.commitment);
          if (commitment !== null) {
            try {
              const addr = await findGameAddress(
                client,
                factoryAddr,
                commitment,
              );
              if (addr) {
                g = { ...g, address: addr };
                upsertGame(g);
              }
            } catch {
              // keep waiting
            }
          }
        }
        if (!g.address) {
          rows.push({ game: g, snapshot: null });
          continue;
        }
        try {
          const snapshot = await getGameSnapshot(client, network, g.address);
          // Capture the joiner's seed while the game is live so the creator
          // can verify the outcome locally after the account is destroyed
          if (
            snapshot.state === 'active' &&
            Number(snapshot.data.status) === GameStatus.Joined &&
            g.role === 'creator' &&
            !g.seedB
          ) {
            g = {
              ...g,
              seedB: snapshot.data.seedB.toString(16).padStart(64, '0'),
            };
            upsertGame(g);
          }
          rows.push({ game: g, snapshot });
        } catch {
          rows.push({ game: g, snapshot: null });
        }
      }
      return rows;
    },
  });

  async function sendAction(
    key: string,
    gameAddr: string,
    payload: string,
  ): Promise<void> {
    setBusyKey(key);
    try {
      await sendTx({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: toTonNetwork(network),
        messages: [
          { address: gameAddr, amount: ACTION_VALUE.toString(), payload },
        ],
      });
      await queryClient.invalidateQueries({ queryKey: ['my-games'] });
    } catch {
      // user cancelled — nothing to do
    } finally {
      setBusyKey(null);
    }
  }

  if (stored.length === 0) {
    return (
      <p className="text-[14px] text-muted-foreground text-center py-10">
        Тут зʼявляться ігри, які ви створили або до яких приєднались.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void rowsQuery.refetch()}
          disabled={rowsQuery.isFetching}
        >
          <RefreshCw
            className={cn('size-4', rowsQuery.isFetching && 'animate-spin')}
          />
          Оновити
        </Button>
      </div>

      {(rowsQuery.data ?? stored.map((game) => ({ game, snapshot: null }))).map(
        ({ game, snapshot }) => {
          const key = `${game.role}:${game.commitment}`;
          const status =
            snapshot?.state === 'active' ? Number(snapshot.data.status) : null;
          const revealDeadline =
            snapshot?.state === 'active'
              ? Number(snapshot.data.revealDeadline)
              : 0;
          const joinDeadline =
            snapshot?.state === 'active'
              ? Number(snapshot.data.joinDeadline)
              : 0;
          const revealExpired =
            status === GameStatus.Joined && now / 1000 > revealDeadline;

          const mySideHeads =
            game.role === 'creator' ? game.aSideHeads : !game.aSideHeads;

          let outcomeText: string | null = null;
          let won: boolean | null = null;
          let coinSide: CoinSide | null = null;
          if (snapshot?.state === 'finished') {
            const o = snapshot.outcome;
            if (!o) outcomeText = 'Завершено (подію не знайдено)';
            else if (o.kind === 'cancelled')
              outcomeText = 'Скасовано, ставку повернено';
            else {
              const winnerIsMe =
                myAddress != null &&
                o.winner !== undefined &&
                Address.parse(myAddress).equals(Address.parse(o.winner));
              won = winnerIsMe;
              const coin =
                o.coinIsHeads === undefined
                  ? null
                  : o.coinIsHeads
                    ? '🦅 орел'
                    : '🪙 решка';
              if (o.coinIsHeads !== undefined) {
                coinSide = o.coinIsHeads ? 'ton' : 'gram';
              }
              outcomeText =
                o.kind === 'timedout'
                  ? winnerIsMe
                    ? 'Опонент не розкрив секрет — банк ваш!'
                    : 'Форфейт: секрет не розкрито вчасно'
                  : `Випало ${coin ?? '—'} · ${winnerIsMe ? `ви виграли ${o.payout ? fromNano(o.payout) : '—'} TON 🎉` : 'ви програли'}`;

              // Local provably-fair check when we hold both entropy parts
              const secret = game.secret ? hexToU256(game.secret) : null;
              const seed = game.seedB ? hexToU256(game.seedB) : null;
              if (
                o.kind === 'settled' &&
                o.coinIsHeads !== undefined &&
                secret !== null &&
                seed !== null
              ) {
                outcomeText +=
                  coinIsHeads(secret, seed) === o.coinIsHeads
                    ? ' · чесність підтверджено ✓'
                    : ' · ПЕРЕВІРКА НЕ ЗІЙШЛАСЬ!';
              }
            }
          }

          return (
            <div
              key={key}
              className="border rounded-2xl p-4 flex flex-col gap-2 text-[13px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-[14px]">
                  {game.role === 'creator' ? 'Моя гра' : 'Я приєднався'}
                  <span className="text-muted-foreground font-normal">
                    · {fromNano(BigInt(game.stakeNano))} TON ·{' '}
                    {mySideHeads ? '🦅 орел' : '🪙 решка'}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[12px] px-2 py-0.5 rounded-full bg-secondary',
                    status === GameStatus.Joined && 'text-warning',
                    won === true && 'text-success',
                    won === false && 'text-destructive',
                  )}
                >
                  {snapshot === null
                    ? 'Очікую підтвердження…'
                    : snapshot.state === 'missing'
                      ? 'Не знайдено'
                      : snapshot.state === 'finished'
                        ? 'Завершено'
                        : status === GameStatus.Created
                          ? 'Чекає опонента'
                          : status === GameStatus.Joined
                            ? 'Чекає reveal'
                            : '…'}
                </span>
              </div>

              {game.address && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <a
                    className="font-mono text-[12px] break-all hover:underline"
                    href={`${tonviewerUrl(network)}/${game.address}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {game.address}
                  </a>
                  {status === GameStatus.Created && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      title="Скопіювати посилання для опонента"
                      onClick={() =>
                        void navigator.clipboard.writeText(
                          buildGameShareUrl(game.address!, network),
                        )
                      }
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  )}
                </div>
              )}

              {status === GameStatus.Created && (
                <p className="text-muted-foreground">
                  Дедлайн приєднання: {formatCountdown(joinDeadline, now)}
                </p>
              )}

              {status === GameStatus.Joined && !revealExpired && (
                <p
                  className={cn(
                    game.role === 'creator' && 'text-warning font-semibold',
                  )}
                >
                  {game.role === 'creator'
                    ? `⚠️ Розкрийте секрет, інакше програєте: ${formatCountdown(revealDeadline, now)}`
                    : `Опонент має зробити reveal протягом ${formatCountdown(revealDeadline, now)}`}
                </p>
              )}

              {outcomeText && (
                <div className="flex items-center gap-3">
                  {coinSide && (
                    <Coin3D size={48} result={coinSide} className="shrink-0" />
                  )}
                  <p
                    className={cn(
                      won === true && 'text-success',
                      won === false && 'text-muted-foreground',
                    )}
                  >
                    {outcomeText}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                {game.role === 'creator' &&
                  status === GameStatus.Joined &&
                  !revealExpired &&
                  game.secret && (
                    <Button
                      size="sm"
                      disabled={busyKey !== null}
                      onClick={() =>
                        void sendAction(
                          key,
                          game.address!,
                          revealPayload(hexToU256(game.secret!)!),
                        )
                      }
                    >
                      {busyKey === key ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Reveal — завершити гру
                    </Button>
                  )}

                {game.role === 'creator' && status === GameStatus.Created && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busyKey !== null}
                    onClick={() =>
                      void sendAction(key, game.address!, cancelGamePayload())
                    }
                  >
                    Скасувати і повернути ставку
                  </Button>
                )}

                {status === GameStatus.Joined && revealExpired && (
                  <Button
                    size="sm"
                    disabled={busyKey !== null}
                    onClick={() =>
                      void sendAction(key, game.address!, claimTimeoutPayload())
                    }
                  >
                    {game.role === 'joiner'
                      ? 'Забрати банк (форфейт опонента)'
                      : 'Завершити по таймауту'}
                  </Button>
                )}

                {(snapshot?.state === 'finished' ||
                  snapshot?.state === 'missing') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Прибрати з історії"
                    onClick={() => {
                      removeGame(game);
                      void queryClient.invalidateQueries({
                        queryKey: ['my-games'],
                      });
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}
