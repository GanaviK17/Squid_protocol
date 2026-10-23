import React, { useState } from 'react';
import { apiRequest } from '../../services/api';
import { Settings, Download, Eye, EyeOff, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [confirmText, setConfirmText] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTogglePublish = async (publish: boolean) => {
    try {
      await apiRequest('/admin/leaderboard/publish', {
        method: 'POST',
        body: JSON.stringify({ publish })
      });
      setIsPublished(publish);
      setFeedback(`Leaderboard publication set to ${publish ? 'PUBLIC' : 'HIDDEN'}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = await apiRequest<string>('/admin/export/csv');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `squid_protocol_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTestReset = async () => {
    if (confirmText !== 'RESET-TEST-DATABASE') {
      alert("You must type exactly 'RESET-TEST-DATABASE' to execute this test safeguard.");
      return;
    }

    setIsResetting(true);
    setFeedback(null);

    try {
      const res = await apiRequest('/admin/test-reset', { method: 'POST' });
      setFeedback(res.message || 'Test database reset completed.');
      setConfirmText('');
    } catch (err: any) {
      setFeedback(`Reset Rejected: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-gray-800 pb-5">
        <span className="font-mono text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <Settings className="w-4 h-4" />
          SYSTEM CONFIGURATION & RECOVERY
        </span>
        <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight mt-1">
          Event Settings & Safeguards
        </h1>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 text-cyan-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Leaderboard Visibility Control */}
      <div className="p-6 rounded-2xl bg-[#12151c] border border-gray-800 space-y-4">
        <h3 className="font-display font-bold text-lg text-white">Leaderboard Visibility</h3>
        <p className="text-xs font-mono text-gray-400 leading-relaxed">
          Toggle public accessibility for the live leaderboard at <code>/leaderboard</code>. You can black out the standings before the final breach to build tension for the awards ceremony.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleTogglePublish(true)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isPublished
                ? 'bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676]'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>PUBLISH LIVE STANDINGS</span>
          </button>

          <button
            onClick={() => handleTogglePublish(false)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              !isPublished
                ? 'bg-[#ff004f]/20 border border-[#ff004f]/40 text-[#ff004f]'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span>BLACKOUT STANDINGS</span>
          </button>
        </div>
      </div>

      {/* Export Ledger Data to CSV */}
      <div className="p-6 rounded-2xl bg-[#12151c] border border-gray-800 space-y-4">
        <h3 className="font-display font-bold text-lg text-white">Export Results (CSV)</h3>
        <p className="text-xs font-mono text-gray-400 leading-relaxed">
          Download the official tournament standings, including cumulative scores, round-by-round points, squad rosters, and final breach timestamps.
        </p>

        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs font-bold flex items-center gap-2 border border-gray-700 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>DOWNLOAD LEADERBOARD CSV</span>
        </button>
      </div>

      {/* Guarded Test Database Reset */}
      <div className="p-6 rounded-2xl bg-red-950/20 border-2 border-red-900/50 space-y-4">
        <div className="flex items-center gap-2 text-red-400">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-display font-bold text-lg uppercase tracking-wide">
            Test Environment Reset (Guarded)
          </h3>
        </div>

        <p className="text-xs font-mono text-gray-400 leading-relaxed">
          <strong>CRITICAL SAFETY NOTICE:</strong> This action strictly refuses to execute if <code>NODE_ENV=production</code> or if <code>TEST_RESET_ENABLED</code> is not explicitly set to <code>true</code>. It only resets test database tables and restores seeded teams to Round 1 Stage 1 with 0 points.
        </p>

        <div className="space-y-3 pt-2 font-mono text-xs">
          <label className="text-gray-400 block">
            Type <strong>RESET-TEST-DATABASE</strong> below to unlock execution:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESET-TEST-DATABASE"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090b0f] border border-red-900/50 text-white font-mono text-sm focus:outline-none focus:border-red-500"
            />
            <button
              onClick={handleTestReset}
              disabled={confirmText !== 'RESET-TEST-DATABASE' || isResetting}
              className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider transition-all cursor-pointer ${
                confirmText === 'RESET-TEST-DATABASE' && !isResetting
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isResetting ? 'EXECUTING RESET...' : 'TRIGGER SAFE TEST RESET'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
