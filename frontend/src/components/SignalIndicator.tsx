import React, { useEffect, useRef } from 'react';
import { SignalState } from '../types/game';
import { useSound } from '../context/SoundContext';
import { AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SignalIndicatorProps {
  signal: SignalState;
  penaltyMode?: boolean;
  className?: string;
}

export const SignalIndicator: React.FC<SignalIndicatorProps> = ({
  signal,
  className = '',
}) => {
  const { playGreenLight, playRedLight } = useSound();
  const prevSignal = useRef<SignalState>(signal);

  useEffect(() => {
    if (prevSignal.current !== signal) {
      if (signal === 'GREEN') {
        playGreenLight();
      } else {
        playRedLight();
      }
      prevSignal.current = signal;
    }
  }, [signal, playGreenLight, playRedLight]);

  const isGreen = signal === 'GREEN';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        isGreen
          ? 'border-[#00e676]/50 bg-[#00e676]/10 text-[#00e676] shadow-[0_0_20px_rgba(0,230,118,0.25)]'
          : 'border-[#ff004f]/60 bg-[#ff004f]/15 text-[#ff004f] shadow-[0_0_25px_rgba(255,0,79,0.4)]'
      } ${className}`}
      role="region"
      aria-label={`System Signal: ${isGreen ? 'Green Light' : 'Red Light'}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-6 w-6 items-center justify-center">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                isGreen ? 'bg-[#00e676]' : 'bg-[#ff004f]'
              }`}
            />
            <span
              className={`relative inline-flex h-4 w-4 rounded-full ${
                isGreen ? 'bg-[#00e676]' : 'bg-[#ff004f]'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-wider uppercase opacity-80">SIGNAL STATE:</span>
              <span className="font-display font-black tracking-widest text-lg sm:text-xl uppercase flex items-center gap-1.5">
                {isGreen ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#00e676]" />
                    <span>GREEN LIGHT</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-[#ff004f]" />
                    <span>RED LIGHT</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs font-mono opacity-90 mt-0.5">
              {isGreen ? (
                'Submissions accepted safely: Correct answers award +100 (+200 Double). Wrong answers deduct 50 (100 Double).'
              ) : (
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 inline" />
                  RED LIGHT ACTIVE: Submitting now incurs an immediate point deduction (-50 or -100 PTS)!
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {isGreen ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00e676]/20 border border-[#00e676]/30 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>SAFE PROTOCOL</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#ff004f]/20 border border-[#ff004f]/40 text-xs font-mono font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>PENALTY ENFORCED</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
