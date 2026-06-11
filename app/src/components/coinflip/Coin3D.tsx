import { useEffect, useState } from 'react';

import { IconTonDiamond } from '../TonDiamond';
import { cn } from '@/lib/utils';

import './coin3d.css';

export type CoinSide = 'ton' | 'gram';

interface Props {
  /**
   * Which face the coin lands on. With no result the coin spins forever
   * (idle mode). To replay the landing animation with the same result,
   * remount the component (e.g. pass a changing `key`).
   */
  result?: CoinSide | null;
  /** Diameter in px */
  size?: number;
  className?: string;
}

const TURNS = 5; // full revolutions before settling on the result

export function Coin3D({ result = null, size = 120, className }: Props) {
  const [angle, setAngle] = useState<number | null>(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!result) {
      setAngle(null);
      setSettled(false);
      return;
    }
    // Two-step start so the browser registers the 0° state without a
    // transition first, then animates to the target in one long ease-out.
    setSettled(false);
    setAngle(0);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setAngle(TURNS * 360 + (result === 'gram' ? 180 : 0)),
      ),
    );
    return () => cancelAnimationFrame(raf);
  }, [result]);

  const depth = Math.max(5, Math.round(size * 0.06));
  // Filler discs between the two faces fake the coin's metal edge
  const coreSteps = [-0.6, -0.2, 0.2, 0.6].map((k) => k * depth);

  const revealing = result !== null && angle !== null;

  return (
    <div
      className={cn('coin3d-scene', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        result === 'ton'
          ? 'Монета: випав TON (орел)'
          : result === 'gram'
            ? 'Монета: випав GRAM (решка)'
            : 'Монета обертається'
      }
    >
      <div
        className={cn('coin3d', !revealing && 'coin3d--idle')}
        style={
          revealing
            ? {
                transform: `rotateX(-12deg) rotateY(${angle}deg)`,
                transition:
                  angle === 0
                    ? 'none'
                    : `transform 2.6s cubic-bezier(0.12, 0.82, 0.22, 1)`,
              }
            : undefined
        }
        onTransitionEnd={() => setSettled(true)}
      >
        {coreSteps.map((z) => (
          <div
            key={z}
            className="coin3d__core"
            style={{ transform: `translateZ(${z}px)` }}
          />
        ))}
        <div
          className="coin3d__face coin3d__face--ton"
          style={{ transform: `translateZ(${depth}px)` }}
        >
          <IconTonDiamond size={Math.round(size * 0.46)} />
        </div>
        <div
          className="coin3d__face coin3d__face--gram"
          style={{ transform: `rotateY(180deg) translateZ(${depth}px)` }}
        >
          <span className="coin3d__gram" style={{ fontSize: size * 0.21 }}>
            GRAM
          </span>
        </div>
      </div>
      <div
        className="coin3d__shadow"
        style={{ opacity: settled || !revealing ? 1 : 0.6 }}
      />
    </div>
  );
}
