import { fromNano } from '@ton/core';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw, Radio } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  fetchOpenGames,
  fetchRecentGames,
  lobbyAvailable,
  type LobbyGame,
} from '@/lib/lobby';
import { cn } from '@/lib/utils';

function timeLeft(deadline: number): string {
  const left = Math.max(0, deadline - Math.floor(Date.now() / 1000));
  const m = Math.floor(left / 60);
  if (m >= 60) return `${Math.floor(m / 60)} год`;
  return `${m} хв`;
}

function shortAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function outcomeLabel(g: LobbyGame): string {
  if (g.status === 'cancelled') return 'скасовано';
  if (g.status === 'timedout') return 'форфейт (таймаут)';
  const coin = g.coinIsHeads ? '🦅 орел' : '🪙 решка';
  return `випало ${coin}`;
}

interface Props {
  walletConnected: boolean;
  onPlay: (address: string) => void;
}

export function Lobby({ walletConnected, onPlay }: Props) {
  const available = lobbyAvailable();

  const openQuery = useQuery({
    queryKey: ['lobby', 'open'],
    queryFn: fetchOpenGames,
    enabled: available,
    refetchInterval: 5000,
  });
  const recentQuery = useQuery({
    queryKey: ['lobby', 'recent'],
    queryFn: () => fetchRecentGames(12),
    enabled: available,
    refetchInterval: 10000,
  });

  if (!available) {
    return (
      <div className="border rounded-2xl p-6 text-center text-[14px] text-muted-foreground max-w-xl mx-auto w-full">
        Лобі недоступне: індексер не налаштовано. Запусти{' '}
        <code>npm run indexer</code> локально або вкажи{' '}
        <code>VITE_INDEXER_URL</code> у <code>.env</code>. Поки що грай за
        прямим посиланням на гру.
      </div>
    );
  }

  const offline = openQuery.isError && recentQuery.isError;
  const openGames = openQuery.data ?? [];
  const recentGames = recentQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {offline && (
        <p className="text-[13px] text-warning text-center">
          Не вдається зʼєднатися з індексером. Він запущений?
        </p>
      )}

      {/* Open games */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[15px] font-semibold">
            <Radio className="size-4 text-success" />
            Відкриті ігри
            {openGames.length > 0 && (
              <span className="text-muted-foreground font-normal">
                · {openGames.length}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void openQuery.refetch()}
            disabled={openQuery.isFetching}
          >
            <RefreshCw
              className={cn('size-4', openQuery.isFetching && 'animate-spin')}
            />
          </Button>
        </div>

        {openQuery.isLoading ? (
          <p className="flex items-center gap-2 text-[13px] text-muted-foreground py-6 justify-center">
            <Loader2 className="size-4 animate-spin" /> Завантаження…
          </p>
        ) : openGames.length === 0 ? (
          <p className="text-[14px] text-muted-foreground text-center py-8">
            Зараз немає відкритих ігор. Створи свою у вкладці «Грати» — вона
            одразу зʼявиться тут.
          </p>
        ) : (
          openGames.map((g) => (
            <div
              key={g.address}
              className="border rounded-xl p-4 flex items-center justify-between gap-3"
            >
              <div className="flex flex-col gap-0.5 text-[13px]">
                <span className="font-semibold text-[15px]">
                  {fromNano(g.stake)} TON
                </span>
                <span className="text-muted-foreground">
                  створив {shortAddr(g.creator)} · ставить на{' '}
                  {g.aSideHeads ? '🦅 орла' : '🪙 решку'}
                </span>
                <span className="text-muted-foreground">
                  комісія {g.feeBps / 100}% · до закриття ~
                  {timeLeft(g.joinDeadline)}
                </span>
              </div>
              <Button
                size="sm"
                disabled={!walletConnected}
                onClick={() => onPlay(g.address)}
                title={walletConnected ? '' : 'Підключіть гаманець'}
              >
                Грати за {fromNano(g.stake)} TON
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Recent results */}
      {recentGames.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[15px] font-semibold">Останні результати</div>
          {recentGames.map((g) => (
            <div
              key={g.address}
              className="flex items-center justify-between gap-3 text-[13px] border-b py-2 last:border-b-0"
            >
              <span className="text-muted-foreground">
                {fromNano(g.stake)} TON · {outcomeLabel(g)}
              </span>
              <span
                className={cn(
                  'font-mono text-[12px]',
                  g.status === 'settled'
                    ? 'text-success'
                    : 'text-muted-foreground',
                )}
              >
                {g.winner ? `→ ${shortAddr(g.winner)}` : '↩ повернено'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
