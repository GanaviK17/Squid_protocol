import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { CircleShape, TriangleShape, SquareShape } from '../../components/GeometricShapes';
import { Lock, User, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminIndex: React.FC = () => {
  const { user, loginAdmin, isLoading } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06070a] text-white flex items-center justify-center font-mono text-xs">
        AUTHENTICATING ADMIN CONSOLE...
      </div>
    );
  }

  // If already logged in as ADMIN, show dashboard
  if (user?.role === 'ADMIN') {
    return (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    );
  }

  // If logged in as TEAM, deny access
  if (user && user.role === 'TEAM') {
    return (
      <div className="min-h-screen bg-[#06070a] text-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#12151c] border border-red-900/60 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-[#ff004f] mx-auto" />
          <h2 className="font-display font-black text-2xl text-white">ACCESS FORBIDDEN</h2>
          <p className="text-xs font-mono text-gray-400">
            Your squad credentials lack Administrative Level-4 clearance. Return to the Arena terminal.
          </p>
          <div className="pt-2">
            <Link
              to="/game"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff004f] text-white font-mono text-xs font-bold"
            >
              <span>RETURN TO SQUAD ARENA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render Admin Login Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error('Please enter username and password.');
      }
      await loginAdmin(username.trim(), password.trim());
    } catch (err: any) {
      setErrorMessage(err.message || 'Access Denied. Invalid administrative credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-gray-100 flex items-center justify-center p-4 relative font-sans">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0e1117] border border-gray-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <CircleShape size={20} color="#ff004f" />
            <TriangleShape size={20} color="#ff2e7e" />
            <SquareShape size={20} color="#00f0ff" />
          </div>
          <span className="font-mono text-[10px] text-[#ff004f] tracking-widest uppercase">
            RESTRICTED ACCESS PORTAL
          </span>
          <h1 className="font-display font-black text-2xl text-white tracking-wide uppercase">
            SYSTEM CONTROL ROOM
          </h1>
          <p className="text-xs font-mono text-gray-400">
            Authorized tournament directors and engineers only.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800 text-red-400 font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-gray-400 uppercase tracking-wider block">Admin Identity</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#06070a] border border-gray-800 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff004f]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 uppercase tracking-wider block">Access Keyphrase</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#06070a] border border-gray-800 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff004f]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-display font-black text-sm tracking-widest bg-[#ff004f] text-white hover:bg-[#ff2e7e] transition-all shadow-[0_0_20px_rgba(255,0,79,0.4)] flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isSubmitting ? 'AUTHENTICATING...' : (
              <>
                <span>ENTER COMMAND CONSOLE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs font-mono text-gray-500 hover:text-gray-300">
            ← Return to Public Terminal
          </Link>
        </div>
      </div>
    </div>
  );
};
