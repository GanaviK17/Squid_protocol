import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Sliders, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface TeamOption {
  id: string;
  teamCode: string;
  name: string;
  totalScore: number;
}

export const AdminScores: React.FC = () => {
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [pointsDelta, setPointsDelta] = useState<number>(50);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isError: boolean; message: string } | null>(null);

  const fetchTeams = async () => {
    try {
      const res = await apiRequest<{ success: boolean; teams: TeamOption[] }>('/admin/teams');
      setTeams(res.teams || []);
      if (res.teams?.length && !selectedTeamId) {
        setSelectedTeamId(res.teams[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !reason.trim() || isSubmitting) return;

    if (reason.trim().length < 5) {
      setFeedback({ isError: true, message: 'A mandatory reason (minimum 5 characters) is required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await apiRequest('/admin/score-adjustments', {
        method: 'POST',
        body: JSON.stringify({
          teamId: selectedTeamId,
          pointsDelta: Number(pointsDelta),
          reason: reason.trim()
        })
      });

      setFeedback({ isError: false, message: res.message || 'Score adjustment successfully applied and logged.' });
      setReason('');
      fetchTeams();
    } catch (err: any) {
      setFeedback({ isError: true, message: err.message || 'Failed to apply adjustment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-gray-800 pb-5">
        <span className="font-mono text-xs text-[#00e676] uppercase tracking-widest flex items-center gap-1.5">
          <Sliders className="w-4 h-4" />
          AUTHORITATIVE LEDGER RECONCILIATION
        </span>
        <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight mt-1">
          Manual Score Adjustments
        </h1>
        <p className="text-xs font-mono text-gray-400 mt-1">
          Apply audited bonuses or deductions with mandatory justification. All modifications are permanently recorded in the immutable audit trail.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2.5 font-mono text-xs sm:text-sm ${
            feedback.isError
              ? 'bg-red-950/30 border-red-800 text-red-400'
              : 'bg-[#00e676]/15 border-[#00e676]/40 text-[#00e676]'
          }`}
        >
          {feedback.isError ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-[#12151c] border border-gray-800 space-y-6 shadow-2xl font-mono text-xs">
        <div className="space-y-1.5">
          <label className="text-gray-400 uppercase tracking-wider block">Target Squad</label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#090b0f] border border-gray-800 text-white font-mono text-sm focus:border-[#00e676]"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.teamCode} — {t.name} (Current: {t.totalScore} pts)
              </option>
            ))}
          </select>
        </div>

        {selectedTeam && (
          <div className="p-4 rounded-xl bg-[#090b0f] border border-gray-800 flex items-center justify-between">
            <span className="text-gray-400">Current Standings Score:</span>
            <span className="text-[#00e676] font-display font-black text-xl">
              {selectedTeam.totalScore} PTS
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-gray-400 uppercase tracking-wider block">
            Points Delta (Positive for bonus, Negative for penalty)
          </label>
          <input
            type="number"
            value={pointsDelta}
            onChange={(e) => setPointsDelta(Number(e.target.value))}
            min={-1000}
            max={1000}
            className="w-full px-4 py-3 rounded-xl bg-[#090b0f] border border-gray-800 text-white font-mono text-sm focus:border-[#00e676]"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-gray-400 uppercase tracking-wider block">
            Mandatory Audited Justification (Min 5 chars)
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Adjudicator compensation for verified hall audio equipment glitch during Round 1 question #3."
            className="w-full px-4 py-3 rounded-xl bg-[#090b0f] border border-gray-800 text-white font-mono text-xs placeholder-gray-600 focus:border-[#00e676]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !reason.trim() || reason.trim().length < 5}
          className={`w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isSubmitting || reason.trim().length < 5
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-[#00e676] text-black hover:bg-[#00ff88] shadow-[0_0_20px_rgba(0,230,118,0.4)]'
          }`}
        >
          {isSubmitting ? (
            'COMMITTING LEDGER ENTRY...'
          ) : (
            <>
              <span>COMMIT AUDITED ADJUSTMENT</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
