import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../services/api';
import { SubmissionItem } from '../../types/game';
import { ListOrdered, Filter, RefreshCw } from 'lucide-react';

export const AdminSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [roundFilter, setRoundFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      const q = roundFilter ? `?round=${roundFilter}` : '';
      const res = await apiRequest<{ success: boolean; submissions: SubmissionItem[] }>(`/admin/submissions${q}`);
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [roundFilter]);

  useEffect(() => {
    fetchSubmissions();
    const timer = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(timer);
  }, [fetchSubmissions]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <span className="font-mono text-xs text-[#ff004f] uppercase tracking-widest flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4" />
            PARTICIPANT TRANSMISSION STREAM
          </span>
          <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight mt-1">
            Live Submissions Log
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
            <label htmlFor="round-filter" className="sr-only">Filter submissions by protocol</label>
            <select
              id="round-filter"
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#12151c] border border-gray-800 text-white font-mono text-xs focus:outline-none focus:border-[#ff004f] focus-visible:ring-2 focus-visible:ring-[#ff004f]"
            >
              <option value="">All Protocols</option>
              <option value="1">Round 1 (Signals)</option>
              <option value="2">Round 2 (Logic)</option>
              <option value="3">Round 3 (Breach)</option>
            </select>
          </div>

          <button
            onClick={fetchSubmissions}
            aria-label="Refresh submissions"
            className="p-2 rounded-lg bg-[#12151c] border border-gray-800 text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff004f] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#12151c] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-[#090b0f] text-gray-400">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Squad</th>
                <th className="py-3 px-3">Round/Stage</th>
                <th className="py-3 px-3">Submitted Answer</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Points</th>
                <th className="py-3 px-3">Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-gray-500 font-mono text-xs">
                    Loading submissions stream...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-gray-500 font-mono text-xs">
                    No submissions recorded yet{roundFilter ? ` for Protocol ${roundFilter}` : ''}.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800/30">
                    <td className="py-3 px-3 text-gray-500">{new Date(s.createdAt).toLocaleTimeString()}</td>
                    <td className="py-3 px-3 font-bold text-white">
                      {s.team?.teamCode} ({s.team?.name})
                    </td>
                    <td className="py-3 px-3 text-[#00f0ff]">
                      R{s.round}.S{s.stage} {s.question ? `(Q${s.question.orderIndex})` : ''}
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-200 max-w-xs truncate">
                      {s.submittedValue}
                      {s.doublePointsSelected && (
                        <span className="ml-1 text-amber-400 text-[10px] font-bold">[2X]</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'CORRECT' ? 'bg-[#00e676]/20 text-[#00e676]' :
                        s.status === 'PENALIZED' ? 'bg-[#ff004f]/20 text-[#ff004f]' :
                        s.status === 'REJECTED' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#00e676]">
                      {s.pointsAwarded > 0 ? `+${s.pointsAwarded}` : s.pointsAwarded}
                    </td>
                    <td className="py-3 px-3 text-xs">{s.signalAtSubmission}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminSubmissions;
