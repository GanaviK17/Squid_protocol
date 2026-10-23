import React, { useState, useEffect } from 'react';
import { Clock, PauseCircle, PlayCircle } from 'lucide-react';

interface CountdownTimerProps {
  endTime?: string | null;
  remainingSeconds?: number | null;
  status?: 'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'ENDED' | string;
  isPaused?: boolean;
  onExpire?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  remainingSeconds: initialRemainingSeconds,
  status = 'ACTIVE',
  isPaused = false,
  onExpire,
  className = '',
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (typeof initialRemainingSeconds === 'number') {
      return Math.max(0, initialRemainingSeconds);
    }
    if (endTime) {
      const diff = new Date(endTime).getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / 1000));
    }
    return 0;
  });

  const isRoundPaused = isPaused || status === 'PAUSED';
  const isUpcoming = status === 'UPCOMING';
  const isEnded = status === 'ENDED';

  useEffect(() => {
    // If paused, keep frozen at initialRemainingSeconds
    if (isRoundPaused) {
      if (typeof initialRemainingSeconds === 'number') {
        setSecondsLeft(Math.max(0, initialRemainingSeconds));
      }
      return;
    }

    if (isUpcoming) {
      if (typeof initialRemainingSeconds === 'number') {
        setSecondsLeft(initialRemainingSeconds);
      }
      return;
    }

    if (isEnded) {
      setSecondsLeft(0);
      return;
    }

    if (!endTime) {
      if (typeof initialRemainingSeconds === 'number') {
        setSecondsLeft(Math.max(0, initialRemainingSeconds));
      }
      return;
    }

    const calculate = () => {
      const target = new Date(endTime).getTime();
      const now = Date.now();
      const diffSec = Math.ceil((target - now) / 1000);

      if (diffSec <= 0) {
        setSecondsLeft(0);
        onExpire?.();
        return;
      }

      setSecondsLeft(diffSec);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endTime, initialRemainingSeconds, isRoundPaused, isUpcoming, isEnded, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isExpired = secondsLeft <= 0 && !isUpcoming;
  const isLowTime = minutes < 2 && !isExpired && !isRoundPaused && !isUpcoming;

  if (isUpcoming) {
    return (
      <div className={`flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg border bg-[#12151c] border-gray-800 text-gray-400 ${className}`}>
        <Clock className="w-4 h-4 text-cyan-400" />
        <span className="text-xs uppercase tracking-wider text-gray-500">TIMER:</span>
        <span className="font-bold text-sm tracking-widest text-cyan-400">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 px-1.5 py-0.5 rounded uppercase font-semibold">
          STANDBY
        </span>
      </div>
    );
  }

  if (isRoundPaused) {
    return (
      <div className={`flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg border bg-amber-950/30 border-amber-500/50 text-amber-300 ${className}`}>
        <PauseCircle className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-xs uppercase tracking-wider text-amber-400/80">FROZEN:</span>
        <span className="font-bold text-sm tracking-widest">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
          PAUSED
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg border transition-colors ${
        isExpired
          ? 'bg-red-950/30 border-red-800 text-red-500'
          : isLowTime
          ? 'bg-amber-950/30 border-amber-500/50 text-amber-400 animate-pulse'
          : 'bg-black/40 border-gray-800 text-gray-200'
      } ${className}`}
    >
      <Clock className={`w-4 h-4 ${isLowTime ? 'text-amber-400' : 'text-[#ff004f]'}`} />
      <span className="text-xs uppercase tracking-wider text-gray-400">ROUND CLOCK:</span>
      <span className="font-bold text-sm tracking-widest">
        {isExpired ? 'EXPIRED' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
      </span>
      {!isExpired && (
        <span className="text-[10px] bg-[#00e676]/10 border border-[#00e676]/30 text-[#00e676] px-1 py-0.2 rounded font-mono">
          LIVE
        </span>
      )}
    </div>
  );
};
