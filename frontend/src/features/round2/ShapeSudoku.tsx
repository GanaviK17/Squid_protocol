import React, { useState, useEffect, useCallback } from 'react';
import { SudokuData } from '../../types/game';
import { SymbolMap } from '../../components/GeometricShapes';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { CheckCircle2, RotateCcw, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ShapeSudokuProps {
  data: SudokuData;
  onSuccess: () => void;
}

const SYMBOL_KEYS = ['S', 'T', 'C', 'U', 'A', 'D'];

export const ShapeSudoku: React.FC<ShapeSudokuProps> = ({ data, onSuccess }) => {
  const { refreshMe } = useAuth();
  const { playSuccess, playError } = useSound();

  const [grid, setGrid] = useState<string[]>([]);
  const [fixedCells, setFixedCells] = useState<boolean[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [useHint, setUseHint] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize and load saved local progress
  useEffect(() => {
    if (!data.initialGrid) return;

    const initialChars = data.initialGrid.split('');
    const fixed = initialChars.map(c => c !== '0');
    setFixedCells(fixed);

    const saved = localStorage.getItem(`squid_sudoku_${data.id}`);
    if (saved && saved.length === 36) {
      setGrid(saved.split(''));
    } else {
      setGrid(initialChars);
    }
  }, [data.id, data.initialGrid]);

  // Persist grid changes locally
  const updateGrid = useCallback((newGrid: string[]) => {
    setGrid(newGrid);
    localStorage.setItem(`squid_sudoku_${data.id}`, newGrid.join(''));
  }, [data.id]);

  // Select a symbol for the active cell
  const handleSetSymbol = useCallback((symbol: string) => {
    if (selectedCell === null || fixedCells[selectedCell] || data.isCompleted) return;

    const updated = [...grid];
    updated[selectedCell] = symbol;
    updateGrid(updated);
    setErrorMessage(null);
  }, [selectedCell, fixedCells, data.isCompleted, grid, updateGrid]);

  // Clear active cell
  const handleClearCell = useCallback(() => {
    if (selectedCell === null || fixedCells[selectedCell] || data.isCompleted) return;

    const updated = [...grid];
    updated[selectedCell] = '0';
    updateGrid(updated);
  }, [selectedCell, fixedCells, data.isCompleted, grid, updateGrid]);

  // Reset grid to initial state
  const handleResetToInitial = () => {
    if (data.isCompleted) return;
    const initial = data.initialGrid.split('');
    updateGrid(initial);
    setErrorMessage(null);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCell === null || fixedCells[selectedCell] || data.isCompleted) return;

      const key = e.key.toUpperCase();
      if (SYMBOL_KEYS.includes(key)) {
        handleSetSymbol(key);
      } else if (key === 'BACKSPACE' || key === 'DELETE' || key === '0') {
        handleClearCell();
      } else if (key === 'ARROWUP' && selectedCell >= 6) {
        setSelectedCell(selectedCell - 6);
      } else if (key === 'ARROWDOWN' && selectedCell < 30) {
        setSelectedCell(selectedCell + 6);
      } else if (key === 'ARROWLEFT' && selectedCell % 6 !== 0) {
        setSelectedCell(selectedCell - 1);
      } else if (key === 'ARROWRIGHT' && selectedCell % 6 !== 5) {
        setSelectedCell(selectedCell + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, fixedCells, data.isCompleted, handleSetSymbol, handleClearCell]);

  // Check conflicts in the grid for user highlighting
  const getConflicts = () => {
    const conflicts = new Set<number>();

    for (let i = 0; i < 36; i++) {
      const val = grid[i];
      if (!val || val === '0') continue;

      const r = Math.floor(i / 6);
      const c = i % 6;

      // Row check
      for (let col = 0; col < 6; col++) {
        const otherIdx = r * 6 + col;
        if (otherIdx !== i && grid[otherIdx] === val) {
          conflicts.add(i);
          conflicts.add(otherIdx);
        }
      }

      // Column check
      for (let row = 0; row < 6; row++) {
        const otherIdx = row * 6 + c;
        if (otherIdx !== i && grid[otherIdx] === val) {
          conflicts.add(i);
          conflicts.add(otherIdx);
        }
      }

      // 2x3 block check
      const br = Math.floor(r / 2) * 2;
      const bc = Math.floor(c / 3) * 3;
      for (let ro = 0; ro < 2; ro++) {
        for (let co = 0; co < 3; co++) {
          const otherIdx = (br + ro) * 6 + (bc + co);
          if (otherIdx !== i && grid[otherIdx] === val) {
            conflicts.add(i);
            conflicts.add(otherIdx);
          }
        }
      }
    }
    return conflicts;
  };

  const conflicts = getConflicts();
  const isFilled = grid.length === 36 && !grid.includes('0');

  const handleSubmit = async () => {
    if (!isFilled || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiRequest('/round2/sudoku/submit', {
        method: 'POST',
        body: JSON.stringify({
          submittedGrid: grid.join(''),
          usedHint: useHint
        })
      });

      playSuccess();
      await refreshMe();
      onSuccess();
    } catch (err: any) {
      playError();
      setErrorMessage(err.message || 'Grid solution contains errors. Verify all rows, columns, and 2x3 boxes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#12151c] rounded-2xl border border-gray-800 p-6 sm:p-8 space-y-6">
      {/* Title & Stage Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-wider">
            ROUND 2 — STAGE 1
          </span>
          <h3 className="font-display font-black text-xl sm:text-2xl text-white mt-1">
            6×6 Shape Sudoku
          </h3>
        </div>

        {data.isCompleted ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676] font-mono text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>SOLVED & VERIFIED (+100 PTS)</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 font-mono text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={useHint}
                onChange={(e) => setUseHint(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-black border-gray-700 text-[#00f0ff] focus:ring-0"
              />
              <span>Use Hint (-25% pts)</span>
            </label>
            <button
              onClick={handleResetToInitial}
              title="Reset to puzzle starting state"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-300 leading-relaxed font-mono">
        Fill the 6×6 grid using the 6 geometric symbols. Every <strong>row</strong>, <strong>column</strong>, and <strong>2×3 block</strong> must contain each symbol exactly once.
      </p>

      {/* Sudoku Grid & Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* The 6x6 Sudoku Grid */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl bg-[#090b0f] border-2 border-gray-700 shadow-2xl">
            {grid.map((cellVal, idx) => {
              const isFixed = fixedCells[idx];
              const isSelected = selectedCell === idx;
              const hasConflict = conflicts.has(idx);
              const symbolObj = cellVal !== '0' ? SymbolMap[cellVal] : null;
              const Icon = symbolObj ? symbolObj.component : null;

              // 2x3 block border styling:
              const r = Math.floor(idx / 6);
              const c = idx % 6;
              const isBottomBlockEdge = r === 1 || r === 3;
              const isRightBlockEdge = c === 2;

              return (
                <button
                  key={idx}
                  disabled={data.isCompleted}
                  onClick={() => setSelectedCell(idx)}
                  className={`w-11 h-11 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-[#00f0ff] bg-[#00f0ff]/15 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : hasConflict
                      ? 'bg-red-950/40 border border-red-500/70 animate-pulse'
                      : isFixed
                      ? 'bg-[#181c26] border border-gray-700/60 opacity-90'
                      : 'bg-[#12151c] border border-gray-800/80 hover:border-gray-600 hover:bg-[#1a202c]'
                  } ${isBottomBlockEdge ? 'mb-1 sm:mb-2' : ''} ${isRightBlockEdge ? 'mr-1 sm:mr-2' : ''}`}
                >
                  {Icon && (
                    <Icon
                      size={28}
                      color={hasConflict ? '#ff004f' : isFixed ? '#e2e8f0' : symbolObj?.color}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Symbol Palette & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-[#090b0f] border border-gray-800 space-y-4">
            <h4 className="font-mono text-xs text-gray-400 uppercase tracking-wider">
              Symbol Selector
            </h4>

            <div className="grid grid-cols-3 gap-2.5">
              {SYMBOL_KEYS.map((symKey) => {
                const sObj = SymbolMap[symKey];
                const Icon = sObj.component;

                return (
                  <button
                    key={symKey}
                    disabled={data.isCompleted || selectedCell === null || fixedCells[selectedCell]}
                    onClick={() => handleSetSymbol(symKey)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#12151c] border border-gray-800 hover:border-[#ff004f]/60 hover:bg-[#181c26] transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <Icon size={26} color={sObj.color} />
                    <span className="font-mono text-[10px] text-gray-400 group-hover:text-white uppercase">
                      {sObj.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                disabled={data.isCompleted || selectedCell === null || fixedCells[selectedCell]}
                onClick={handleClearCell}
                className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs transition-colors disabled:opacity-40"
              >
                Clear Cell (Del)
              </button>
            </div>
          </div>

          {/* Submission Feedback */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          {/* Submit Grid */}
          {!data.isCompleted && (
            <button
              disabled={!isFilled || isSubmitting}
              onClick={handleSubmit}
              className={`w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all ${
                !isFilled
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-[#ff004f] text-white hover:bg-[#ff2e7e] shadow-[0_0_20px_rgba(255,0,79,0.4)] cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                'CHECKING WITH CENTRAL DAEMON...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>TRANSMIT SUDOKU SOLUTION</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
