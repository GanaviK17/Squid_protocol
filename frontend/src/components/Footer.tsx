import React from 'react';
import { Link } from 'react-router-dom';
import { CircleShape, TriangleShape, SquareShape, UmbrellaShape, StarShape, DiamondShape } from './GeometricShapes';
import { ShieldCheck, Terminal, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800/80 bg-[#06070a] text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <CircleShape size={16} color="#ff004f" />
              <TriangleShape size={16} color="#ff2e7e" />
              <SquareShape size={16} color="#00f0ff" />
              <UmbrellaShape size={16} color="#ffd166" />
              <StarShape size={16} color="#a855f7" />
              <DiamondShape size={16} color="#00e676" />
              <span className="font-display font-black tracking-widest text-sm text-gray-200 ml-2">
                SQUID PROTOCOL
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono text-center md:text-left">
              Competitive Survival Technology Tournament • 60 Operatives • 20 Squads • 3 Eliminatory Protocols
            </p>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-6 text-xs font-mono">
            <Link to="/rules" className="hover:text-white transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#ff2e7e]" />
              <span>Official Rules</span>
            </Link>
            <Link to="/leaderboard" className="hover:text-white transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00e676]" />
              <span>Live Standings</span>
            </Link>
            <span className="text-gray-600">|</span>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>ENGINE V1.0-STABLE</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-900 text-center text-[11px] font-mono text-gray-600">
          © {new Date().getFullYear()} SQUID PROTOCOL — SURVIVE THE SYSTEM. Built with cryptographic precision. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
