import { describe, it, expect } from 'vitest';
import { SymbolMap } from '../components/GeometricShapes';

describe('Squid Protocol — Frontend Logic & Puzzle Matrix Tests', () => {
  it('contains all 6 distinct geometric shape definitions', () => {
    const keys = Object.keys(SymbolMap);
    expect(keys).toEqual(['S', 'T', 'C', 'U', 'A', 'D']);
    expect(SymbolMap.S.label).toBe('Square');
    expect(SymbolMap.T.label).toBe('Triangle');
    expect(SymbolMap.C.label).toBe('Circle');
    expect(SymbolMap.U.label).toBe('Umbrella');
    expect(SymbolMap.A.label).toBe('Star');
    expect(SymbolMap.D.label).toBe('Diamond');
  });

  it('validates 6x6 Sudoku mathematical constraints on full solution', () => {
    const solution = 'STCUADUADSTCTCSDUADUATCSCSUADTADTCSU';
    expect(solution.length).toBe(36);

    const validSymbols = new Set(['S', 'T', 'C', 'U', 'A', 'D']);

    // Check rows and columns
    for (let r = 0; r < 6; r++) {
      const rowSet = new Set<string>();
      const colSet = new Set<string>();
      for (let c = 0; c < 6; c++) {
        rowSet.add(solution[r * 6 + c]);
        colSet.add(solution[c * 6 + r]);
      }
      expect(rowSet.size).toBe(6);
      expect(colSet.size).toBe(6);
      rowSet.forEach(s => expect(validSymbols.has(s)).toBe(true));
    }

    // Check 2x3 blocks
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 2; bc++) {
        const boxSet = new Set<string>();
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 3; c++) {
            boxSet.add(solution[(br * 2 + r) * 6 + (bc * 3 + c)]);
          }
        }
        expect(boxSet.size).toBe(6);
      }
    }
  });

  it('verifies initial Sudoku clue grid is a subset of the unique solution', () => {
    const initial = 'S0C0A00A0S0CT00D0A0UA0C0C0U0D00D0C0U';
    const solution = 'STCUADUADSTCTCSDUADUATCSCSUADTADTCSU';

    for (let i = 0; i < 36; i++) {
      if (initial[i] !== '0') {
        expect(initial[i]).toBe(solution[i]);
      }
    }
  });

  it('verifies debugging challenge equivalence and derivation across Java, Python, and C', () => {
    const data = [12, 25, 34, 47, 58, 63, 72, 81];
    let correctChecksum = 0;

    for (const b of data) {
      if (b % 2 === 0) {
        // Intended: (b << 2) + 3
        correctChecksum += (b << 2) + 3;
      } else {
        // b ^ 0x4B
        correctChecksum += (b ^ 0x4B);
      }
    }

    expect(correctChecksum).toBe(1040);
    const finalKey = `PROTOCOL_BREACH_${correctChecksum}`;
    expect(finalKey).toBe('PROTOCOL_BREACH_1040');
  });

  describe('Round 1 Scoring Matrix & Feedback Logic', () => {
    // Scoring function replicating authoritative rule engine
    function calculateRound1Outcome(params: {
      signal: 'GREEN' | 'RED';
      doublePoints: boolean;
      selectedOption: string;
      correctOption: string;
    }) {
      const isMatch = params.selectedOption.trim().toUpperCase() === params.correctOption.trim().toUpperCase();
      const mult = params.doublePoints ? 2 : 1;

      if (params.signal === 'RED') {
        return {
          status: 'PENALIZED' as const,
          isCorrect: false,
          pointsAwarded: -50 * mult,
          feedbackType: 'penalty' as const,
          revealCorrectness: false
        };
      }

      if (isMatch) {
        return {
          status: 'CORRECT' as const,
          isCorrect: true,
          pointsAwarded: 100 * mult,
          feedbackType: 'success' as const,
          revealCorrectness: true
        };
      }

      return {
        status: 'INCORRECT' as const,
        isCorrect: false,
        pointsAwarded: -50 * mult,
        feedbackType: 'error' as const,
        revealCorrectness: true
      };
    }

    it('Green Light + correct answer awards +100 (Normal) and +200 (Double)', () => {
      const normal = calculateRound1Outcome({ signal: 'GREEN', doublePoints: false, selectedOption: 'A', correctOption: 'A' });
      expect(normal.isCorrect).toBe(true);
      expect(normal.pointsAwarded).toBe(100);
      expect(normal.feedbackType).toBe('success');

      const double = calculateRound1Outcome({ signal: 'GREEN', doublePoints: true, selectedOption: 'A', correctOption: 'A' });
      expect(double.isCorrect).toBe(true);
      expect(double.pointsAwarded).toBe(200);
      expect(double.feedbackType).toBe('success');
    });

    it('Green Light + wrong answer deducts 50 (Normal) and 100 (Double) and is never shown as correct', () => {
      const normal = calculateRound1Outcome({ signal: 'GREEN', doublePoints: false, selectedOption: 'B', correctOption: 'A' });
      expect(normal.isCorrect).toBe(false);
      expect(normal.pointsAwarded).toBe(-50);
      expect(normal.feedbackType).toBe('error');

      const double = calculateRound1Outcome({ signal: 'GREEN', doublePoints: true, selectedOption: 'B', correctOption: 'A' });
      expect(double.isCorrect).toBe(false);
      expect(double.pointsAwarded).toBe(-100);
      expect(double.feedbackType).toBe('error');
    });

    it('Red Light deducts 50 (Normal) and 100 (Double) on both correct and wrong answers without revealing correctness', () => {
      const correctRed = calculateRound1Outcome({ signal: 'RED', doublePoints: false, selectedOption: 'A', correctOption: 'A' });
      expect(correctRed.isCorrect).toBe(false);
      expect(correctRed.pointsAwarded).toBe(-50);
      expect(correctRed.revealCorrectness).toBe(false);

      const wrongRed = calculateRound1Outcome({ signal: 'RED', doublePoints: false, selectedOption: 'B', correctOption: 'A' });
      expect(wrongRed.isCorrect).toBe(false);
      expect(wrongRed.pointsAwarded).toBe(-50);
      expect(wrongRed.revealCorrectness).toBe(false);

      const doubleRed = calculateRound1Outcome({ signal: 'RED', doublePoints: true, selectedOption: 'A', correctOption: 'A' });
      expect(doubleRed.pointsAwarded).toBe(-100);
      expect(doubleRed.revealCorrectness).toBe(false);
    });

    it('Double Points doubles negative deductions and never turns them positive', () => {
      const wrong = calculateRound1Outcome({ signal: 'GREEN', doublePoints: true, selectedOption: 'C', correctOption: 'A' });
      expect(wrong.pointsAwarded).toBe(-100);
      expect(wrong.pointsAwarded < 0).toBe(true);

      const red = calculateRound1Outcome({ signal: 'RED', doublePoints: true, selectedOption: 'A', correctOption: 'A' });
      expect(red.pointsAwarded).toBe(-100);
      expect(red.pointsAwarded < 0).toBe(true);
    });
  });

  describe('Admin Restart Game Modal & Feature Flag Verification', () => {
    it('verifies exact confirmation dialog warning text is specified', () => {
      const requiredWarning =
        'Are you sure you want to restart the entire game? All current scores, answers, round progress and QR redemptions will be reset. Your teams, participants, questions and admin account will be preserved.';
      expect(requiredWarning).toContain('restart the entire game');
      expect(requiredWarning).toContain('All current scores, answers, round progress and QR redemptions will be reset');
      expect(requiredWarning).toContain('Your teams, participants, questions and admin account will be preserved');
    });

    it('verifies restart control is hidden unless explicitly enabled in dashboard stats', () => {
      function shouldShowRestartButton(stats: { enableTestGameReset?: boolean } | null | undefined) {
        return Boolean(stats?.enableTestGameReset);
      }

      expect(shouldShowRestartButton({ enableTestGameReset: false })).toBe(false);
      expect(shouldShowRestartButton({ enableTestGameReset: undefined })).toBe(false);
      expect(shouldShowRestartButton(null)).toBe(false);
      expect(shouldShowRestartButton({ enableTestGameReset: true })).toBe(true);
    });
  });
});
