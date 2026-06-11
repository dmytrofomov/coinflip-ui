import { useState } from 'react';
import { toNano, fromNano } from '@ton/core';
import { useSendTransaction } from '@ton/appkit-react';
import { Coins, Copy, Download, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { buildGameShareUrl } from '@/lib/config';
import {
  CREATE_EXTRA,
  commitmentOf,
  createGamePayload,
  findGameAddress,
  randomU256,
  u256ToHex,
  upsertGame,
  backupText,
  type StoredGame,
} from '@/lib/coinflip';
import { toTonNetwork } from '@/lib/appkit';
import { getTonClient } from '@/lib/ton';
import type { Network } from '@/lib/router';

function downloadBackup(game: StoredGame) {
  const blob = new Blob([backupText(game)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `coinflip-secret-${game.commitment.slice(0, 8)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  network: Network;
  factoryAddr: string;
  walletConnected: boolean;
  minStake: bigint | null;
  maxStake: bigint | null;
  onCreated: () => void;
}

export function CreateGameCard({
  network,
  factoryAddr,
  walletConnected,
  minStake,
  maxStake,
  onCreated,
}: Props) {
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const [stakeInput, setStakeInput] = useState('1');
  const [side, setSide] = useState<'heads' | 'tails'>('heads');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    setShareUrl(null);

    let stake: bigint;
    try {
      stake = toNano(stakeInput.replace(',', '.'));
    } catch {
      setError('Некоректна ставка');
      return;
    }
    if (minStake !== null && stake < minStake) {
      setError(`Мінімальна ставка: ${fromNano(minStake)} TON`);
      return;
    }
    if (maxStake !== null && stake > maxStake) {
      setError(`Максимальна ставка: ${fromNano(maxStake)} TON`);
      return;
    }

    const secret = randomU256();
    const commitment = await commitmentOf(secret);
    const record: StoredGame = {
      network,
      role: 'creator',
      address: null,
      commitment: u256ToHex(commitment),
      secret: u256ToHex(secret),
      stakeNano: stake.toString(),
      aSideHeads: side === 'heads',
      createdAt: Date.now(),
    };
    // The secret is persisted and backed up BEFORE any money moves:
    // losing it after join means forfeiting the game (constitution X)
    upsertGame(record);
    downloadBackup(record);

    try {
      setBusy('Підтвердіть транзакцію в гаманці…');
      await sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        network: toTonNetwork(network),
        messages: [
          {
            address: factoryAddr,
            amount: (stake + CREATE_EXTRA).toString(),
            payload: createGamePayload(stake, commitment, side === 'heads'),
          },
        ],
      });
    } catch {
      setBusy(null);
      setError('Транзакцію скасовано');
      return;
    }

    setBusy('Чекаю на створення гри в мережі…');
    const client = getTonClient(network);
    for (let attempt = 0; attempt < 25; attempt++) {
      await new Promise((r) => setTimeout(r, 4000));
      try {
        const addr = await findGameAddress(client, factoryAddr, commitment);
        if (addr) {
          upsertGame({ ...record, address: addr });
          setShareUrl(buildGameShareUrl(addr, network));
          setBusy(null);
          onCreated();
          return;
        }
      } catch {
        // transient RPC error — keep polling
      }
    }
    setBusy(null);
    setError(
      'Не дочекався підтвердження. Гра може зʼявитись у «Мої ігри» трохи пізніше.',
    );
  }

  return (
    <div className="border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[15px] font-semibold">
        <Coins className="size-4 text-[#0098EA]" />
        Створити гру
      </div>

      <label className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
        Ставка, TON
        <input
          value={stakeInput}
          onChange={(e) => setStakeInput(e.target.value)}
          inputMode="decimal"
          className="h-10 rounded-lg border bg-background px-3 text-[14px] text-foreground outline-none focus:border-[#0098EA]"
          placeholder="1"
        />
      </label>

      <div className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
        Моя сторона
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={side === 'heads' ? 'default' : 'secondary'}
            onClick={() => setSide('heads')}
          >
            🦅 Орел
          </Button>
          <Button
            type="button"
            variant={side === 'tails' ? 'default' : 'secondary'}
            onClick={() => setSide('tails')}
          >
            🪙 Решка
          </Button>
        </div>
      </div>

      <Button
        disabled={!walletConnected || busy !== null}
        onClick={() => void handleCreate()}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        {busy ?? (walletConnected ? 'Створити' : 'Підключіть гаманець')}
      </Button>

      <p className="text-[12px] text-muted-foreground leading-relaxed">
        Секрет генерується локально (CSPRNG) і зберігається у вашому браузері;
        резервна копія завантажиться автоматично{' '}
        <Download className="inline size-3" />. Після приєднання опонента у вас
        буде обмежений час на reveal — інакше форфейт.
      </p>

      {error && <p className="text-[13px] text-destructive">{error}</p>}

      {shareUrl && (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary p-3">
          <span className="text-[12px] text-muted-foreground">
            Гру створено! Надішліть опоненту посилання:
          </span>
          <div className="flex items-center gap-2">
            <code className="text-[12px] break-all flex-1">{shareUrl}</code>
            <Button
              variant="ghost"
              size="icon"
              title="Скопіювати"
              onClick={() => void navigator.clipboard.writeText(shareUrl)}
            >
              <Copy className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
