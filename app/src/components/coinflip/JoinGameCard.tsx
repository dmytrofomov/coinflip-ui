import { useEffect, useState } from 'react';
import { Address, fromNano } from '@ton/core';
import { useAddress, useSendTransaction } from '@ton/appkit-react';
import { Loader2, Search, Swords } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { gameUrlParam } from '@/lib/config';
import {
  GameStatus,
  JOIN_EXTRA,
  joinGamePayload,
  getGameSnapshot,
  randomU256,
  u256ToHex,
  upsertGame,
} from '@/lib/coinflip';
import { toTonNetwork } from '@/lib/appkit';
import { getTonClient } from '@/lib/ton';
import type { Network } from '@/lib/router';
import type { GameData } from '@wrappers/CoinFlipGame.gen';

interface Props {
  network: Network;
  walletConnected: boolean;
  presetAddress?: string | null;
  onJoined: () => void;
}

export function JoinGameCard({
  network,
  walletConnected,
  presetAddress,
  onJoined,
}: Props) {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const myAddress = useAddress();
  const [addrInput, setAddrInput] = useState(() => gameUrlParam() ?? '');
  const [game, setGame] = useState<GameData | null>(null);
  const [gameAddr, setGameAddr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  async function handleLoad(addrArg?: string) {
    setError(null);
    setGame(null);
    setJoined(false);
    const raw = (addrArg ?? addrInput).trim();
    let parsed: Address;
    try {
      parsed = Address.parse(raw);
    } catch {
      setError('Некоректна адреса гри');
      return;
    }
    if (addrArg !== undefined) setAddrInput(raw);
    setBusy('Завантажую гру…');
    try {
      const snapshot = await getGameSnapshot(
        getTonClient(network),
        network,
        parsed.toString(),
      );
      if (snapshot.state === 'active') {
        setGame(snapshot.data);
        setGameAddr(parsed.toString());
      } else if (snapshot.state === 'finished') {
        setError('Цю гру вже завершено');
      } else {
        setError('Гру не знайдено в цій мережі');
      }
    } catch {
      setError('Не вдалося завантажити гру (RPC)');
    } finally {
      setBusy(null);
    }
  }

  async function handleJoin() {
    if (!game || !gameAddr) return;
    setError(null);

    const seedB = randomU256();
    upsertGame({
      network,
      role: 'joiner',
      address: gameAddr,
      commitment: u256ToHex(game.commitment),
      seedB: u256ToHex(seedB),
      stakeNano: game.stake.toString(),
      aSideHeads: game.aSideHeads,
      createdAt: Date.now(),
    });

    try {
      setBusy('Підтвердіть транзакцію в гаманці…');
      await sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: toTonNetwork(network),
        messages: [
          {
            address: gameAddr,
            amount: (game.stake + JOIN_EXTRA).toString(),
            payload: joinGamePayload(seedB),
          },
        ],
      });
      setJoined(true);
      onJoined();
    } catch {
      setError('Транзакцію скасовано');
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    if (presetAddress) void handleLoad(presetAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetAddress]);

  const status = game ? Number(game.status) : null;
  const joinDeadlinePassed =
    game !== null && Date.now() / 1000 > Number(game.joinDeadline);
  const isOwnGame =
    game !== null &&
    myAddress != null &&
    Address.parse(myAddress).equals(game.creator);
  const joinable =
    game !== null &&
    status === GameStatus.Created &&
    !joinDeadlinePassed &&
    !isOwnGame;

  return (
    <div className="border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[15px] font-semibold">
        <Swords className="size-4 text-[#0098EA]" />
        Приєднатись до гри
      </div>

      <div className="flex gap-2">
        <input
          value={addrInput}
          onChange={(e) => setAddrInput(e.target.value)}
          placeholder="Адреса гри (EQ…)"
          className="h-10 flex-1 rounded-lg border bg-background px-3 text-[13px] font-mono text-foreground outline-none focus:border-[#0098EA]"
        />
        <Button
          variant="secondary"
          disabled={busy !== null || addrInput.trim() === ''}
          onClick={() => void handleLoad()}
        >
          <Search className="size-4" />
        </Button>
      </div>

      {busy && (
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {busy}
        </p>
      )}
      {error && <p className="text-[13px] text-destructive">{error}</p>}

      {game && (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary p-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ставка</span>
            <span className="font-semibold">{fromNano(game.stake)} TON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Опонент ставить на</span>
            <span>{game.aSideHeads ? '🦅 Орел' : '🪙 Решка'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ваша сторона</span>
            <span>{game.aSideHeads ? '🪙 Решка' : '🦅 Орел'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Комісія платформи</span>
            <span>{Number(game.feeBps) / 100}%</span>
          </div>
          {isOwnGame && (
            <p className="text-warning">Це ваша гра — приєднатись не можна.</p>
          )}
          {joinDeadlinePassed && (
            <p className="text-warning">Дедлайн приєднання минув.</p>
          )}
          {status !== null && status !== GameStatus.Created && (
            <p className="text-warning">Гра вже не очікує опонента.</p>
          )}
        </div>
      )}

      {game && !joined && (
        <Button
          disabled={!walletConnected || !joinable || busy !== null}
          onClick={() => void handleJoin()}
        >
          {walletConnected
            ? `Приєднатись за ${fromNano(game.stake)} TON`
            : 'Підключіть гаманець'}
        </Button>
      )}

      {joined && (
        <p className="text-[13px] text-success">
          Ви в грі! Слідкуйте за нею у вкладці «Мої ігри»: щойно опонент зробить
          reveal — переможець отримає виплату автоматично. Якщо він не розкриє
          секрет вчасно, ви зможете забрати банк.
        </p>
      )}
    </div>
  );
}
