import React from 'react';
import { AlertTriangle, RotateCcw, X, ShieldAlert } from 'lucide-react';

interface RestartGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

/**
 * RESTART GAME (TESTING) Modal
 * Isolated development-only confirmation dialog for resetting game progress.
 */
export const RestartGameModal: React.FC<RestartGameModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#12151c] border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
        {/* Header with warning icon */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <RotateCcw className="w-6 h-6 animate-spin-reverse" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest block font-bold">
                DEVELOPMENT / TESTING SAFEGUARD
              </span>
              <h3 className="font-display font-black text-xl text-white tracking-wide">
                Restart Entire Game Engine?
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explicit confirmation message required by tournament rules */}
        <div className="p-4 rounded-xl bg-black/40 border border-gray-800 text-gray-300 font-mono text-xs leading-relaxed space-y-3">
          <p className="font-medium text-white">
            Are you sure you want to restart the entire game? All current scores, answers, round progress and QR redemptions will be reset. Your teams, participants, questions and admin account will be preserved.
          </p>
          <div className="space-y-1.5 text-gray-400 text-[11px] pt-1 border-t border-gray-800">
            <p className="flex items-center gap-1.5 text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
              <span>All 3 rounds will be locked in WAITING (UPCOMING) status.</span>
            </p>
            <p className="flex items-center gap-1.5 text-gray-400">
              <span>• Timers, paused clocks, and Double Points will return to default.</span>
            </p>
            <p className="flex items-center gap-1.5 text-gray-400">
              <span>• Teams will start fresh from Question #1 upon official round start.</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-mono text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Restarting Game Engine...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Confirm Restart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
