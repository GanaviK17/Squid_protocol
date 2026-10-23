import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShieldCheck, BookOpen, AlertOctagon, HelpCircle } from 'lucide-react';

const RULES = [
  { id: 1, title: "Squad Authentication", desc: "Teams must authenticate solely with their organizer-issued Team Code and PIN. Do not share team credentials with other competitors." },
  { id: 2, title: "Single Team Submission Terminal", desc: "Each squad must designate one official terminal for submitting answers. Multi-terminal race conditions are resolved idempotently by the database." },
  { id: 3, title: "Server-Authoritative Clock", desc: "All challenge durations and deadlines are dictated strictly by the server. Browser time manipulation will have zero effect on submission validity." },
  { id: 4, title: "Signal Protocol & Scoring", desc: "During Round 1, GREEN LIGHT correct answers award +100 (+200 Double), and wrong answers deduct 50 (100 Double). Submitting during RED LIGHT incurs an immediate deduction of 50 (100 Double)." },
  { id: 5, title: "Admin-Controlled Double Points", desc: "Tournament officials decide when Double Points is active. When active, all rewards and penalties are doubled across all teams during that window." },
  { id: 6, title: "Strict Sequential Progression", desc: "Stages and questions cannot be skipped, bypassed, or accessed out of order. Server-side validation blocks any attempt to jump forward." },
  { id: 7, title: "Shape Sudoku Validation", desc: "In Round 2, Stage 2 (Broken Logic) unlocks exclusively after the server mathematically confirms a valid, conflict-free 6×6 Sudoku grid." },
  { id: 8, title: "Offline Venue Physical Challenges", desc: "In Round 3, the Cup-Transfer Challenge and Broken QR Reconstruction are conducted and judged physically offline by event organizers at the arena." },
  { id: 9, title: "Final Online Debugging Breach", desc: "The final online challenge on the system is the Core Debugging Challenge (+200 PTS). Redeeming a valid single-use QR code unlocks the challenge." },
  { id: 10, title: "Multi-Language Equivalence", desc: "The Round 3 Debugging Challenge provides Java, Python, and C firmware implementations. All three contain the exact same logic flaw and produce the same final breach key." },
  { id: 11, title: "Absolute Scoring Idempotency", desc: "Database-level unique constraints ensure no team can ever receive duplicate score awards for the same challenge or question." },
  { id: 12, title: "Integrity & Disqualification", desc: "Any attempt to reverse-engineer server daemons, attack network infrastructure, or exploit other teams will trigger immediate squad disqualification." },
  { id: 13, title: "Audited Score Adjustments", desc: "All manual score adjustments applied by administrators require a documented mandatory explanation and are permanently recorded in the immutable audit log." },
  { id: 14, title: "Confidential Leaderboard", desc: "Tournament standings are confidential and monitored exclusively by officials. Teams track their cumulative score on their personal squad console." },
  { id: 15, title: "Official Tie-Break Policy", desc: "If squads have identical cumulative scores, ties are broken by: 1) Higher Round 3 score; 2) Higher Round 2 score; 3) Earliest verified Final Breach completion timestamp." }
];

export const RulesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#08090c] text-gray-100 flex flex-col font-sans selection:bg-[#ff004f] selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-10">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-[#ff004f] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#ff2e7e]" />
            TOURNAMENT PROTOCOLS & GOVERNANCE
          </span>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tight">
            Official System Rulebook
          </h1>
          <p className="text-sm font-mono text-gray-400 max-w-2xl mx-auto">
            Review the 15 codified rules governing SQUID PROTOCOL. All rules are strictly enforced by backend verification routines.
          </p>
        </div>

        {/* 15 Codified Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RULES.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-2xl bg-[#12151c] border border-gray-800/80 hover:border-gray-700 transition-colors space-y-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-[#ff004f]/15 border border-[#ff004f]/40 text-[#ff004f] font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {rule.id}
                </span>
                <h3 className="font-display font-bold text-base text-white">
                  {rule.title}
                </h3>
              </div>
              <p className="text-xs font-mono text-gray-400 leading-relaxed pl-8">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Disqualification & Manual Fallback Notice */}
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/40 flex items-start gap-4">
          <AlertOctagon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-display font-bold text-sm text-red-400 uppercase tracking-wider">
              Emergency Fallback & Adjudication Protocol
            </h4>
            <p className="text-xs font-mono text-gray-400 leading-relaxed">
              In the event of an unforeseen hall network interruption or server outage, tournament adjudicators reserve the right to deploy offline backup question matrices and manually record verified scores in the database ledger.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
