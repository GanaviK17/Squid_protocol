import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Round1View } from '../features/round1/Round1View';
import { ShapeSudoku } from '../features/round2/ShapeSudoku';
import { BrokenLogicView } from '../features/round2/BrokenLogicView';
import { Round3View } from '../features/round3/Round3View';
import { CountdownTimer } from '../components/CountdownTimer';
import { RoundControl, Question, SudokuData, BrokenLogicData } from '../types/game';
import { Users, Lock } from 'lucide-react';

export const GameDashboard: React.FC = () => {
  const { user, team, isLoading: authLoading, refreshMe } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<number>(1);

  const [round1Data, setRound1Data] = useState<{
    round: RoundControl | null;
    timer?: any;
    currentQuestion: Question | null;
    questionNumber: number;
    totalQuestions: number;
    isCompleted: boolean;
  }>({
    round: null,
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 10,
    isCompleted: false,
  });

  const [round2Data, setRound2Data] = useState<{
    round: RoundControl | null;
    timer?: any;
    isUnlocked: boolean;
    currentStage: number;
    sudoku: SudokuData | null;
    brokenLogic: BrokenLogicData | null;
  }>({
    round: null,
    isUnlocked: false,
    currentStage: 1,
    sudoku: null,
    brokenLogic: null,
  });

  const [round3Data, setRound3Data] = useState<{
    round: RoundControl | null;
    timer?: any;
    isUnlocked: boolean;
    isQrRedeemed: boolean;
    isCompleted: boolean;
    completedAt?: string | null;
    challenge: any;
  }>({
    round: null,
    isUnlocked: false,
    isQrRedeemed: false,
    isCompleted: false,
    challenge: null,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'TEAM')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch Round 1 Data
  const fetchRound1 = useCallback(async () => {
    try {
      const res = await apiRequest<any>('/round1/questions');
      setRound1Data({
        round: res.round,
        timer: res.timer,
        currentQuestion: res.currentQuestion,
        questionNumber: res.questionNumber || 0,
        totalQuestions: res.totalQuestions || 10,
        isCompleted: Boolean(res.isCompleted),
      });
    } catch (err) {
      console.error('Failed to fetch Round 1 data', err);
    }
  }, []);

  // Fetch Round 2 Data
  const fetchRound2 = useCallback(async () => {
    try {
      const res = await apiRequest<any>('/round2/data');
      setRound2Data({
        round: res.round,
        timer: res.timer,
        isUnlocked: Boolean(res.isUnlocked),
        currentStage: res.currentStage || 1,
        sudoku: res.sudoku,
        brokenLogic: res.brokenLogic,
      });
    } catch (err) {
      console.error('Failed to fetch Round 2 data', err);
    }
  }, []);

  // Fetch Round 3 Data
  const fetchRound3 = useCallback(async () => {
    try {
      const res = await apiRequest<any>('/round3/data');
      setRound3Data({
        round: res.round,
        timer: res.timer,
        isUnlocked: Boolean(res.isUnlocked),
        isQrRedeemed: Boolean(res.isQrRedeemed),
        isCompleted: Boolean(res.isCompleted),
        completedAt: res.completedAt,
        challenge: res.challenge,
      });
    } catch (err) {
      console.error('Failed to fetch Round 3 data', err);
    }
  }, []);

  // Load all rounds data
  const loadAll = useCallback(async () => {
    await Promise.all([fetchRound1(), fetchRound2(), fetchRound3()]);
    setIsLoading(false);
  }, [fetchRound1, fetchRound2, fetchRound3]);

  useEffect(() => {
    if (user?.role === 'TEAM') {
      loadAll();
    }
  }, [user, loadAll]);

  // Real-time updates via Server-Sent Events (SSE)
  useEffect(() => {
    const streamUrl = import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/live/stream`
      : '/api/v1/live/stream';

    let eventSource: EventSource | null = null;
    let pollInterval: any = null;

    try {
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener('signal_change', (e: MessageEvent) => {
        const payload = JSON.parse(e.data);
        setRound1Data(prev => ({
          ...prev,
          round: prev.round ? {
            ...prev.round,
            signalState: payload.signalState,
            redLightPenaltyMode: payload.redLightPenaltyMode,
            doublePointsEnabled: payload.doublePointsEnabled
          } : null
        }));
      });

      eventSource.addEventListener('score_update', () => {
        refreshMe();
      });

      eventSource.addEventListener('round_state_change', () => {
        loadAll();
      });

      eventSource.addEventListener('game_reset', () => {
        loadAll();
        refreshMe();
      });
    } catch {
      pollInterval = setInterval(loadAll, 5000);
    }

    return () => {
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [loadAll, refreshMe]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#08090c] text-white flex items-center justify-center font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#ff004f] border-t-transparent rounded-full animate-spin" />
          <span>ESTABLISHING SECURE SQUAD LINK...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090c] text-gray-100 flex flex-col font-sans selection:bg-[#ff004f] selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 w-full">
        {/* Squad Status Header (No other teams' scores or leaderboard shown) */}
        <div className="p-6 rounded-2xl bg-[#12151c] border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#ff004f]/10 to-transparent pointer-events-none" />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#ff004f]/20 border border-[#ff004f]/40 text-[#ff004f] font-bold">
                {team?.teamCode}
              </span>
              <h2 className="font-display font-black text-2xl text-white tracking-wide">
                {team?.name}
              </h2>
            </div>
            <p className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span>Operatives: {team?.members || 'Squad Active'}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-800">
            <div className="text-right">
              <span className="block text-[11px] font-mono text-gray-400 uppercase">MY TEAM SCORE</span>
              <span className="font-display font-black text-3xl text-[#00e676] drop-shadow-[0_0_15px_rgba(0,230,118,0.3)]">
                {team?.totalScore} <span className="text-xs text-gray-400">PTS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Round Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#12151c] border border-gray-800">
          {[
            { id: 1, title: 'ROUND 1', subtitle: 'The Signal Protocol', status: round1Data.round?.status || 'UPCOMING' },
            { id: 2, title: 'ROUND 2', subtitle: 'The Logic Protocol', status: round2Data.round?.status || 'UPCOMING' },
            { id: 3, title: 'ROUND 3', subtitle: 'The Final Breach', status: round3Data.round?.status || 'UPCOMING' },
          ].map((r) => {
            const isCurrent = activeTab === r.id;
            const isUnlocked = r.status !== 'UPCOMING';

            return (
              <button
                key={r.id}
                onClick={() => setActiveTab(r.id)}
                className={`py-3 px-3 rounded-xl transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  isCurrent
                    ? 'bg-[#ff004f] text-white shadow-[0_0_15px_rgba(255,0,79,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {!isUnlocked && <Lock className="w-3 h-3 text-gray-500" />}
                  <span className="font-display font-black text-xs sm:text-sm tracking-wider">
                    {r.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono opacity-80 hidden sm:inline">
                  {r.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Round Content */}
        {activeTab === 1 && (
          <Round1View
            round={round1Data.round}
            timer={round1Data.timer}
            currentQuestion={round1Data.currentQuestion}
            questionNumber={round1Data.questionNumber}
            totalQuestions={round1Data.totalQuestions}
            isCompleted={round1Data.isCompleted}
            onRefresh={loadAll}
          />
        )}

        {activeTab === 2 && (
          <div className="space-y-8">
            {!round2Data.isUnlocked ? (
              <div className="bg-[#12151c] rounded-2xl border border-gray-800 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-bold text-white tracking-wide">
                    Round 2 — The Logic Protocol
                  </h2>
                  <p className="text-sm font-mono text-gray-400">
                    Status: <span className="text-cyan-400 font-bold uppercase">Locked</span>
                  </p>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed max-w-lg mx-auto">
                  Round 2 is currently locked by tournament officials. Once Round 1 concludes, officials will activate Stage 1: Shape Sudoku.
                </p>
              </div>
            ) : (
              <>
                {/* Round 2 Live Timer */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#12151c] border border-gray-800">
                  <div className="font-mono text-xs text-gray-400">
                    <span className="text-white font-bold block sm:inline">STAGE {round2Data.currentStage}: </span>
                    <span>{round2Data.currentStage === 1 ? 'Shape Sudoku (+100 PTS)' : 'Broken Logic Firmware Checksum (+200 PTS)'}</span>
                  </div>
                  <CountdownTimer
                    endTime={round2Data.timer?.endTime ?? round2Data.round?.endTime}
                    remainingSeconds={round2Data.timer?.remainingSeconds ?? round2Data.round?.remainingSeconds}
                    status={round2Data.timer?.status || round2Data.round?.status}
                    isPaused={round2Data.timer?.isPaused}
                    onExpire={loadAll}
                  />
                </div>

                {round2Data.sudoku && (
                  <ShapeSudoku
                    data={round2Data.sudoku}
                    onSuccess={loadAll}
                  />
                )}

                {round2Data.brokenLogic?.isUnlocked && round2Data.brokenLogic.puzzle && (
                  <BrokenLogicView
                    data={round2Data.brokenLogic}
                    onSuccess={loadAll}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <Round3View
            round={round3Data.round}
            timer={round3Data.timer}
            isUnlocked={round3Data.isUnlocked}
            isQrRedeemed={round3Data.isQrRedeemed}
            isCompleted={round3Data.isCompleted}
            completedAt={round3Data.completedAt}
            challenge={round3Data.challenge}
            onRefresh={loadAll}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
