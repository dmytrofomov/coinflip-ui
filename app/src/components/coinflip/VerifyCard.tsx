import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Coin3D } from './Coin3D';
import {
  coinIsHeads,
  commitmentOf,
  hexToU256,
  u256ToHex,
} from '@/lib/coinflip';
import { cn } from '@/lib/utils';

interface VerifyResult {
  commitmentHex: string;
  commitmentMatches: boolean | null;
  isHeads: boolean;
}

// Public provably-fair verifier (constitution I, V): anyone can recompute the
// outcome from the on-chain values without trusting the platform.
export function VerifyCard() {
  const [secretInput, setSecretInput] = useState('');
  const [seedInput, setSeedInput] = useState('');
  const [commitmentInput, setCommitmentInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  // Remount key so the coin replays its landing on every new check
  const [spinNonce, setSpinNonce] = useState(0);

  async function handleVerify() {
    setError(null);
    setResult(null);
    const secret = hexToU256(secretInput);
    const seed = hexToU256(seedInput);
    if (secret === null || seed === null) {
      setError('secretA і seedB мають бути hex-числами (до 64 символів)');
      return;
    }
    const commitment = await commitmentOf(secret);
    let commitmentMatches: boolean | null = null;
    if (commitmentInput.trim() !== '') {
      const expected = hexToU256(commitmentInput);
      if (expected === null) {
        setError('commitment має бути hex-числом');
        return;
      }
      commitmentMatches = commitment === expected;
    }
    setResult({
      commitmentHex: u256ToHex(commitment),
      commitmentMatches,
      isHeads: coinIsHeads(secret, seed),
    });
    setSpinNonce((n) => n + 1);
  }

  const inputClass =
    'h-10 rounded-lg border bg-background px-3 text-[13px] font-mono text-foreground outline-none focus:border-[#0098EA]';

  return (
    <div className="border rounded-2xl p-6 flex flex-col gap-4 max-w-xl mx-auto w-full">
      <div className="flex items-center gap-2 text-[15px] font-semibold">
        <ShieldCheck className="size-4 text-[#0098EA]" />
        Перевірка чесності
      </div>
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        Результат гри обчислюється як <code>LSB(secretA XOR seedB)</code>, де{' '}
        <code>commitment = SHA256(secretA)</code> фіксується до приєднання
        опонента. Введіть значення з ланцюга і переконайтесь самі:
      </p>

      <label className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
        secretA (hex)
        <input
          className={inputClass}
          value={secretInput}
          onChange={(e) => setSecretInput(e.target.value)}
          placeholder="a11ce…"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
        seedB (hex)
        <input
          className={inputClass}
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value)}
          placeholder="b0b…"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
        commitment з гри (hex, опційно)
        <input
          className={inputClass}
          value={commitmentInput}
          onChange={(e) => setCommitmentInput(e.target.value)}
          placeholder="якщо вказати — звіримо з SHA256(secretA)"
        />
      </label>

      <Button onClick={() => void handleVerify()}>Перевірити</Button>

      {error && <p className="text-[13px] text-destructive">{error}</p>}

      {result && (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary p-3 text-[13px]">
          <div className="flex justify-center py-3">
            <Coin3D
              key={spinNonce}
              size={104}
              result={result.isHeads ? 'ton' : 'gram'}
            />
          </div>
          <div className="text-center">
            Випадає:{' '}
            <span className="font-semibold">
              {result.isHeads ? '🦅 орел — TON' : '🪙 решка — GRAM'}
            </span>
          </div>
          <div className="break-all">
            SHA256(secretA) ={' '}
            <code className="text-[12px]">{result.commitmentHex}</code>
          </div>
          {result.commitmentMatches !== null && (
            <div
              className={cn(
                'font-semibold',
                result.commitmentMatches ? 'text-success' : 'text-destructive',
              )}
            >
              {result.commitmentMatches
                ? '✓ Commitment збігається — секрет справжній'
                : '✗ Commitment НЕ збігається'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
