import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { Volume2, VolumeX, LogIn, LogOut, Trophy, BookOpen, Shield, Gamepad2 } from 'lucide-react';
import { CircleShape, TriangleShape, SquareShape } from './GeometricShapes';

export const Navbar: React.FC = () => {
  const { user, team, logout } = useAuth();
  const { isMuted, toggleMute } = useSound();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/80 bg-[#08090c]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#12151c] border border-gray-800 group-hover:border-[#ff004f]/50 transition-colors">
              <CircleShape size={18} color="#ff004f" />
              <TriangleShape size={18} color="#ff2e7e" />
              <SquareShape size={18} color="#00f0ff" />
            </div>
            <div>
              <span className="font-display font-black tracking-widest text-lg text-white group-hover:text-[#ff004f] transition-colors">
                SQUID<span className="text-[#ff004f]"> PROTOCOL</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                SURVIVE THE SYSTEM
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/rules"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                isActive('/rules')
                  ? 'bg-gray-800 text-white border border-gray-700'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#ff2e7e]" />
              <span className="hidden sm:inline">Rules</span>
            </Link>

            {user?.role === 'ADMIN' && (
              <Link
                to="/leaderboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/leaderboard')
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <Trophy className="w-4 h-4 text-[#ffd166]" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/admin/dashboard')
                    ? 'bg-[#ff004f]/20 text-white border border-[#ff004f]/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <Shield className="w-4 h-4 text-[#ff004f]" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}

            {user?.role === 'TEAM' && (
              <Link
                to="/game"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/game')
                    ? 'bg-[#ff004f]/20 text-white border border-[#ff004f]/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <Gamepad2 className="w-4 h-4 text-[#ff004f]" />
                <span>Arena</span>
              </Link>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Game SFX' : 'Mute Game SFX'}
              className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-[#00e676]" />}
            </button>

            {/* Team Score Badge / Login State */}
            {team ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end px-3 py-1 rounded bg-[#12151c] border border-gray-800 text-xs">
                  <span className="font-mono text-gray-400">{team.teamCode}</span>
                  <span className="font-bold text-[#00e676]">{team.totalScore} PTS</span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">EXIT</span>
                </button>
              </div>
            ) : user ? (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold bg-[#ff004f] text-white hover:bg-[#ff2e7e] transition-colors shadow-[0_0_15px_rgba(255,0,79,0.35)]"
              >
                <LogIn className="w-4 h-4" />
                <span>TEAM LOGIN</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
