import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CircleShape, TriangleShape, SquareShape } from '../components/GeometricShapes';
import { KeyRound, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginTeam } = useAuth();
  const navigate = useNavigate();

  const [teamCode, setTeamCode] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!teamCode.trim() || !pin.trim()) {
        throw new Error('Please enter both Team Code and PIN.');
      }
      await loginTeam(teamCode.trim().toUpperCase(), pin.trim());
      navigate('/game');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication rejected. Verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090c] text-gray-100 flex flex-col font-sans selection:bg-[#ff004f] selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative">
        {/* Subtle geometric background glow */}
        <div className="absolute w-[450px] h-[450px] bg-[#ff004f]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#12151c] rounded-2xl border border-gray-800 p-8 shadow-2xl relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <CircleShape size={20} color="#ff004f" />
              <TriangleShape size={20} color="#ff2e7e" />
              <SquareShape size={20} color="#00f0ff" />
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase">
              TEAM GATEWAY
            </h1>
            <p className="text-xs font-mono text-gray-400">
              Enter your squad code and PIN to access the tournament protocol terminal.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800 text-red-400 font-mono text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-gray-400 uppercase tracking-wider block">
                Team Code
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TEAM01"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090b0f] border border-gray-800 text-white font-mono text-sm uppercase placeholder-gray-600 focus:outline-none focus:border-[#ff004f] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 uppercase tracking-wider block">
                Security PIN
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090b0f] border border-gray-800 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff004f] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer bg-[#ff004f] text-white hover:bg-[#ff2e7e] shadow-[0_0_20px_rgba(255,0,79,0.4)]"
            >
              {isSubmitting ? (
                'AUTHENTICATING...'
              ) : (
                <>
                  <span>INITIALIZE SYSTEM ACCESS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] font-mono text-gray-500">
            Forgot your PIN? Contact an event administrator in the arena control room.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
