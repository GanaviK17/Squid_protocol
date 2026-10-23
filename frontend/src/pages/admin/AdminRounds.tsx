import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { RoundControl } from '../../types/game';
import { CountdownTimer } from '../../components/CountdownTimer';
import { Clock, Play, Pause, Square, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminRounds: React.FC = () => {
  const [rounds, setRounds] = useState<RoundControl[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRounds = async () => {
    try {
      const res = await apiRequest('/admin/dashboard');
      setRounds(res.rounds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  const handleUpdateStatus = async (roundId: number, status: string, startTimer = false) => {
    setFeedback(null);
    try {
      await apiRequest(`/admin/rounds/${roundId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, startTimer })
      });
      setFeedback(`Round ${roundId} status updated to ${status}.`);
      fetchRounds();
    } catch (err: any) {
      setFeedback(`Failed: ${err.message}`);
    }
  };

  const handleSetDuration = async (roundId: number, durationMinutes: number) => {
    try {
      await apiRequest(`/admin/rounds/${roundId}`, {
        method: 'PATCH',
        body: JSON.stringify({ durationMinutes })
      });
      fetchRounds();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleClearTimer = async (roundId: number) => {
    try {
      await apiRequest(`/admin/rounds/${roundId}`, {
        method: 'PATCH',
        body: JSON.stringify({ clearTimer: true })
      });
      fetchRounds();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return <div className="font-mono text-sm text-gray-400">LOADING ROUND MATRICES...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-gray-800 pb-5">
        <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          SYSTEM SCHEDULE & PROTOCOL TIMERS
        </span>
        <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight mt-1">
          Round Control Central
        </h1>
        <p className="text-xs font-mono text-gray-400 mt-1">
          Configure start times, duration windows, active states, and synchronized timers for all three survival rounds.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 text-cyan-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="space-y-6">
        {rounds.map((round) => (
          <div
            key={round.id}
            className="p-6 rounded-2xl bg-[#12151c] border border-gray-800 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <span className="font-mono text-xs text-gray-400 uppercase">ROUND {round.id}</span>
                <h3 className="font-display font-bold text-xl text-white">{round.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold ${
                  round.status === 'ACTIVE'
                    ? 'bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676] animate-pulse'
                    : round.status === 'PAUSED'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : round.status === 'ENDED'
                    ? 'bg-red-950/40 border border-red-900/40 text-red-400'
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {round.status}
                </span>

                <CountdownTimer endTime={round.endTime} onExpire={fetchRounds} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-mono text-xs uppercase block">
                  Configured Duration (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    defaultValue={round.durationMinutes}
                    onBlur={(e) => handleSetDuration(round.id, parseInt(e.target.value, 10))}
                    className="w-28 px-3 py-2 rounded-lg bg-[#090b0f] border border-gray-800 text-white font-mono text-sm focus:outline-none focus:border-[#ff004f]"
                  />
                  <span className="font-mono text-xs text-gray-500">min</span>
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                <button
                  onClick={() => handleUpdateStatus(round.id, 'ACTIVE', true)}
                  className="px-4 py-2 rounded-lg bg-[#00e676]/20 hover:bg-[#00e676]/30 border border-[#00e676]/40 text-[#00e676] font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start with Timer</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(round.id, 'PAUSED')}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(round.id, 'ENDED')}
                  className="px-4 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-900/40 text-red-400 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>End Round</span>
                </button>

                <button
                  onClick={() => handleClearTimer(round.id)}
                  title="Clear Timer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
