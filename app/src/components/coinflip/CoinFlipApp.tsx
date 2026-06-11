import { useMemo, useState } from 'react';
import { fromNano } from '@ton/core';
import { useQuery } from '@tanstack/react-query';
import { useTonAddress } from '@tonconnect/ui-react';

import { Button } from '@/components/ui/button';
import { factoryAddress, gameUrlParam } from '@/lib/config';
import { openFactory } from '@/lib/coinflip';
import { getTonClient } from '@/lib/ton';
import { cn } from '@/lib/utils';
import type { Network } from '@/lib/router';

import { CreateGameCard } from './CreateGameCard';
import { JoinGameCard } from './JoinGameCard';
import { Lobby } from './Lobby';
import { MyGames } from './MyGames';
import { VerifyCard } from './VerifyCard';

type Tab = 'lobby' | 'play' | 'mine' | 'verify';

export function CoinFlipApp({ network }: { network: Network }) {
  const walletAddress = useTonAddress();
  const factoryAddr = factoryAddress(network);
  const hasGameLink = useMemo(() => gameUrlParam() !== null, []);
  const [tab, setTab] = useState<Tab>(hasGameLink ? 'play' : 'lobby');
  const [refreshKey, setRefreshKey] = useState(0);
  const [joinTarget, setJoinTarget] = useState<string | null>(() =>
    gameUrlParam(),
  );

  const factoryQuery = useQuery({
    queryKey: ['factory', network, factoryAddr],
    enabled: factoryAddr !== null,
    staleTime: 60_000,
    queryFn: () =>
      openFactory(getTonClient(network), factoryAddr!).getFactoryData(),
  });
  const params = factoryQuery.data ?? null;

  const bumpAndShowMine = () => {
    setRefreshKey((k) => k + 1);
    setTab('mine');
  };

  const playGame = (address: string) => {
    setJoinTarget(address);
    setTab('play');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-2">
        {(
          [
            ['lobby', 'Лобі'],
            ['play', 'Грати'],
            ['mine', 'Мої ігри'],
            ['verify', 'Чесність'],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <Button
            key={value}
            variant={tab === value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {params && (
        <p className="text-center text-[12px] text-muted-foreground">
          Комісія платформи: {Number(params.feeBps) / 100}% · ставки від{' '}
          {fromNano(params.minStake)} до {fromNano(params.maxStake)} TON
          {params.paused ? ' · ⏸ платформа на паузі' : ''}
        </p>
      )}

      {tab === 'lobby' && (
        <Lobby
          network={network}
          walletConnected={walletAddress !== ''}
          onPlay={playGame}
        />
      )}

      {tab === 'play' && factoryAddr === null && (
        <div className="border rounded-2xl p-6 text-center text-[14px] text-muted-foreground max-w-xl mx-auto w-full">
          Фабрику ігор ще не задеплоєно в мережі{' '}
          <span className="font-semibold">{network}</span>. Задеплойте контракти
          (<code>acton run deploy-testnet</code>) і вкажіть адресу у{' '}
          <code>VITE_FACTORY_ADDRESS_{network.toUpperCase()}</code> в{' '}
          <code>.env</code> або через URL-параметр <code>?factory=…</code>.
        </div>
      )}

      {tab === 'play' && factoryAddr !== null && (
        <div
          className={cn(
            'grid gap-4 max-w-3xl mx-auto w-full',
            'grid-cols-1 md:grid-cols-2',
          )}
        >
          {hasGameLink ? (
            <>
              <JoinGameCard
                network={network}
                walletConnected={walletAddress !== ''}
                presetAddress={joinTarget}
                onJoined={bumpAndShowMine}
              />
              <CreateGameCard
                network={network}
                factoryAddr={factoryAddr}
                walletConnected={walletAddress !== ''}
                minStake={params ? params.minStake : null}
                maxStake={params ? params.maxStake : null}
                onCreated={bumpAndShowMine}
              />
            </>
          ) : (
            <>
              <CreateGameCard
                network={network}
                factoryAddr={factoryAddr}
                walletConnected={walletAddress !== ''}
                minStake={params ? params.minStake : null}
                maxStake={params ? params.maxStake : null}
                onCreated={bumpAndShowMine}
              />
              <JoinGameCard
                network={network}
                walletConnected={walletAddress !== ''}
                presetAddress={joinTarget}
                onJoined={bumpAndShowMine}
              />
            </>
          )}
        </div>
      )}

      {tab === 'mine' && (
        <div className="max-w-3xl mx-auto w-full">
          <MyGames
            network={network}
            factoryAddr={factoryAddr}
            refreshKey={refreshKey}
          />
        </div>
      )}

      {tab === 'verify' && <VerifyCard />}
    </div>
  );
}
