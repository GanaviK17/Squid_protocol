import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { History, ShieldCheck, RefreshCw } from 'lucide-react';

interface AuditItem {
  id: string;
  adminUsername: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: any;
  ipAddress?: string | null;
  createdAt: string;
}

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    try {
      const res = await apiRequest<{ success: boolean; logs: AuditItem[] }>('/admin/audit-logs');
      setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest flex items-center gap-1.5">
            <History className="w-4 h-4" />
            IMMUTABLE SECURITY LEDGER
          </span>
          <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight mt-1">
            Administrative Audit Trail
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Complete cryptographic audit trail of all organizer score adjustments, signal modifications, and stage clearances.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          aria-label="Refresh audit logs"
          className="p-2 rounded-lg bg-[#12151c] border border-gray-800 text-gray-400 hover:text-white transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff] cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-[#12151c] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-[#090b0f] text-gray-400">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Admin Account</th>
                <th className="py-3 px-3">Action Recorded</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/30">
                  <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    {log.adminUsername}
                  </td>
                  <td className="py-3 px-3 text-[#ff004f] font-semibold">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 text-cyan-300">
                    {log.targetType} {log.targetId ? `(#${log.targetId})` : ''}
                  </td>
                  <td className="py-3 px-3 max-w-sm truncate text-gray-400 text-[11px]">
                    {log.details ? JSON.stringify(log.details) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
