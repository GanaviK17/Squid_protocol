import React, { useState, useEffect, useRef } from 'react';
import { Clock, PauseCircle } from 'lucide-react';

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

  const [thresholdAnnouncement, setThresholdAnnouncement] = useState<string>('');
  const announcedThresholds = useRef<Set<string>>(new Set());

  const isRoundPaused = isPaused || status === 'PAUSED';
  const isUpcoming = status === 'UPCOMING';
  const isEnded = status === 'ENDED';

  // Timer countdown engine
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

  // Screen reader threshold announcements: fired ONLY at key boundaries, NEVER per-tick
  useEffect(() => {
    if (isRoundPaused) {
      if (!announcedThresholds.current.has('paused')) {
        setThresholdAnnouncement('Round timer paused by tournament officials.');
        announcedThresholds.current.add('paused');
      }
      return;
    } else {
      announcedThresholds.current.delete('paused');
    }

    if (isEnded || (secondsLeft <= 0 && !isUpcoming)) {
      if (!announcedThresholds.current.has('expired')) {
        setThresholdAnnouncement('Round time limit has expired.');
        announcedThresholds.current.add('expired');
      }
      return;
    }

    if (isUpcoming) {
      announcedThresholds.current.clear();
      return;
    }

    // Threshold: Entering low-time (120s)
    if (secondsLeft <= 120 && secondsLeft > 60) {
      if (!announcedThresholds.current.has('low-time-120')) {
        setThresholdAnnouncement('Notice: Two minutes remaining in round.');
        announcedThresholds.current.add('low-time-120');
      }
    }
    // Threshold: 60s
    else if (secondsLeft <= 60 && secondsLeft > 10) {
      if (!announcedThresholds.current.has('low-time-60')) {
        setThresholdAnnouncement('Notice: One minute remaining in round.');
        announcedThresholds.current.add('low-time-60');
      }
    }
    // Threshold: 10s
    else if (secondsLeft <= 10 && secondsLeft > 0) {
      if (!announcedThresholds.current.has('low-time-10')) {
        setThresholdAnnouncement('Warning: Ten seconds remaining.');
        announcedThresholds.current.add('low-time-10');
      }
    }
  }, [secondsLeft, isRoundPaused, isEnded, isUpcoming]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isExpired = (secondsLeft <= 0 || isEnded) && !isUpcoming;
  const isLowTime = minutes < 2 && !isExpired && !isRoundPaused && !isUpcoming;

  const accessibleLabel = isUpcoming
    ? `Round standby: Scheduled duration ${minutes} minutes`
    : isRoundPaused
    ? `Round clock paused: ${minutes} minutes ${seconds} seconds remaining`
    : isExpired
    ? 'Round time limit expired'
    : `Round timer: ${minutes} minutes ${seconds} seconds remaining${isLowTime ? ' - Warning: Low time remaining' : ''}`;

  return (
    <>
      {/* Separate visually-hidden polite region for threshold-only announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {thresholdAnnouncement}
      </div>

      {isUpcoming && (
        <div
          role="timer"
          aria-label={accessibleLabel}
          className={`flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg border bg-[#12151c] border-gray-800 text-gray-400 select-none ${className}`}
        >
          <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" aria-hidden="true" />
          <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">TIMER:</span>
          <span className="font-bold text-sm tracking-widest text-cyan-400 tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 px-1.5 py-0.5 rounded uppercase font-semibold">
            STANDBY
          </span>
        </div>
      )}

      {isRoundPaused && (
        <div
          role="timer"
          aria-label={accessibleLabel}
          className={`flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg border bg-amber-950/30 border-amber-500/50 text-amber-300 select-none ${className}`}
        >
          <PauseCircle className="w-4 h-4 text-amber-400 animate-pulse motion-reduce:animate-none flex-shrink-0" aria-hidden="true" />
          <span className="text-xs uppercase tracking-wider text-amber-400/80 font-semibold">FROZEN:</span>
          <span className="font-bold text-sm tracking-widest tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
            PAUSED
          </span>
        </div>
      )}

      {!isUpcoming && !isRoundPaused && (
        <div
          role="timer"
          aria-label={accessibleLabel}
          className={`flex items-center gap-2 font-mono px-3 py-1.5 rounded-lg border transition-colors select-none ${
            isExpired
              ? 'bg-red-950/30 border-red-800 text-red-500'
              : isLowTime
              ? 'bg-amber-950/30 border-amber-500/50 text-amber-400 animate-pulse motion-reduce:animate-none'
              : 'bg-black/40 border-gray-800 text-gray-200'
          } ${className}`}
        >
          <Clock
            className={`w-4 h-4 flex-shrink-0 ${isLowTime ? 'text-amber-400' : 'text-[#ff004f]'}`}
            aria-hidden="true"
          />
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">ROUND CLOCK:</span>
          <span className="font-bold text-sm tracking-widest tabular-nums">
            {isExpired ? 'EXPIRED' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
          </span>
          {!isExpired && (
            <span className="text-[10px] bg-[#00e676]/10 border border-[#00e676]/30 text-[#00e676] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">
              LIVE
            </span>
          )}
        </div>
      )}
    </>
  );
};
