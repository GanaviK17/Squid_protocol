import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CircleShape, TriangleShape, SquareShape, UmbrellaShape, StarShape, DiamondShape } from '../components/GeometricShapes';
import { ArrowRight, Trophy, Zap, ShieldAlert, Cpu, QrCode, Terminal, ChevronRight, Award } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#08090c] text-gray-100 flex flex-col font-sans selection:bg-[#ff004f] selection:text-white">
      <Navbar />

      {/* Cinematic Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-gray-800">
        {/* Background Image with Dark Vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('/assets/hero-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/70 to-[#08090c]/40" />

        {/* Ambient Red Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ff004f]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
          {/* Animated Geometric Symbol Bar */}
          <div className="inline-flex items-center gap-3 p-2 px-5 rounded-full bg-[#12151c]/90 border border-gray-700 shadow-2xl backdrop-blur-md">
            <CircleShape size={20} color="#ff004f" className="animate-pulse" />
            <TriangleShape size={20} color="#ff2e7e" />
            <SquareShape size={20} color="#00f0ff" />
            <UmbrellaShape size={20} color="#ffd166" />
            <StarShape size={20} color="#a855f7" />
            <DiamondShape size={20} color="#00e676" />
            <span className="text-xs font-mono font-semibold tracking-widest text-gray-300 ml-2 uppercase">
              INTER-COLLEGE SYSTEM INVASION
            </span>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-4">
            <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(255,0,79,0.3)]">
              SQUID <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff004f] via-[#ff2e7e] to-[#ff004f]">PROTOCOL</span>
            </h1>
            <p className="font-mono text-xl sm:text-2xl tracking-[0.25em] text-gray-300 uppercase font-bold">
              SURVIVE THE SYSTEM
            </p>
          </div>

          {/* Short event description */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 font-mono leading-relaxed">
            60 elite engineers. 20 squads. 3 unforgiving elimination protocols. Timed algorithms, shape logic, physical dexterity, and kernel debugging. Only the resilient breach the core.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-bold text-base tracking-wider bg-[#ff004f] text-white hover:bg-[#ff2e7e] transition-all shadow-[0_0_25px_rgba(255,0,79,0.5)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>ENTER THE GAME</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/rules"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-semibold text-base tracking-wider bg-[#12151c] text-gray-200 border border-gray-700 hover:border-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>HOW TO PLAY</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>

          {/* Key Event Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 border-t border-gray-800/80">
            <div className="p-3 rounded-xl bg-[#12151c]/60 border border-gray-800">
              <span className="block font-display font-black text-2xl text-white">60</span>
              <span className="text-[11px] font-mono text-gray-400 uppercase">Participants</span>
            </div>
            <div className="p-3 rounded-xl bg-[#12151c]/60 border border-gray-800">
              <span className="block font-display font-black text-2xl text-[#ff004f]">20</span>
              <span className="text-[11px] font-mono text-gray-400 uppercase">Teams</span>
            </div>
            <div className="p-3 rounded-xl bg-[#12151c]/60 border border-gray-800">
              <span className="block font-display font-black text-2xl text-[#00f0ff]">3</span>
              <span className="text-[11px] font-mono text-gray-400 uppercase">Rounds</span>
            </div>
            <div className="p-3 rounded-xl bg-[#12151c]/60 border border-gray-800">
              <span className="block font-display font-black text-2xl text-[#00e676]">2,600</span>
              <span className="text-[11px] font-mono text-gray-400 uppercase">Max Points</span>
            </div>
          </div>
        </div>
      </section>

      {/* Three Round Preview Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <span className="font-mono text-xs text-[#ff004f] uppercase tracking-widest">
            THREE SURVIVAL PROTOCOLS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
            The Progressive Challenge Architecture
          </h2>
          <p className="text-sm font-mono text-gray-400 max-w-2xl mx-auto">
            Progression is server-validated. Each round forces teams to adapt under extreme time constraints and harsh penalty mechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Round 1 Card */}
          <div className="p-6 rounded-2xl bg-[#12151c] border border-gray-800 hover:border-[#ff004f]/60 transition-all duration-300 space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#ff004f]/15 border border-[#ff004f]/30 text-[#ff004f] font-bold">
                  ROUND 1 • 15 MIN
                </span>
                <ShieldAlert className="w-5 h-5 text-[#ff004f]" />
              </div>
              <h3 className="font-display font-bold text-xl text-white group-hover:text-[#ff004f] transition-colors">
                The Signal Protocol
              </h3>
              <p className="text-xs font-mono text-gray-400 leading-relaxed">
                10 rapid technical challenges governed by a live Red Light / Green Light daemon. Double Points gamble available before submission. Submitting during Red Light invokes instant deduction.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between font-mono text-xs text-gray-300">
              <span>Points: Up to +2,000</span>
              <span className="text-[#00e676]">Green Light Accept</span>
            </div>
          </div>

          {/* Round 2 Card */}
          <div className="p-6 rounded-2xl bg-[#12151c] border border-gray-800 hover:border-[#00f0ff]/60 transition-all duration-300 space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#00f0ff]/15 border border-[#00f0ff]/30 text-[#00f0ff] font-bold">
                  ROUND 2 • 20 MIN
                </span>
                <Cpu className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <h3 className="font-display font-bold text-xl text-white group-hover:text-[#00f0ff] transition-colors">
                The Logic Protocol
              </h3>
              <p className="text-xs font-mono text-gray-400 leading-relaxed">
                Stage 1: Solve an interactive 6×6 Shape Sudoku with unique mathematical solution.
                Stage 2: Unlock the Broken Logic challenge to trace firmware operator-precedence flaws.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between font-mono text-xs text-gray-300">
              <span>Points: +300 PTS</span>
              <span className="text-[#00f0ff]">2 Sequential Stages</span>
            </div>
          </div>

          {/* Round 3 Card */}
          <div className="p-6 rounded-2xl bg-[#12151c] border border-gray-800 hover:border-[#00e676]/60 transition-all duration-300 space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#00e676]/15 border border-[#00e676]/30 text-[#00e676] font-bold">
                  ROUND 3 • 25–30 MIN
                </span>
                <Terminal className="w-5 h-5 text-[#00e676]" />
              </div>
              <h3 className="font-display font-bold text-xl text-white group-hover:text-[#00e676] transition-colors">
                The Final Breach
              </h3>
              <p className="text-xs font-mono text-gray-400 leading-relaxed">
                Activity 1: Physical cup-transfer challenge judged on-site by organizers.
                Activity 2: Reconstruct broken QR code fragments in the arena.
                Final Online Challenge: Advanced debugging challenge in Java, Python, or C to crack the Final Key.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between font-mono text-xs text-gray-300">
              <span>Points: +200 PTS</span>
              <span className="text-[#ffd166]">Champion Race</span>
            </div>
          </div>
        </div>
      </section>

      {/* Official Scoring Matrix */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="p-8 rounded-2xl bg-[#090b0f] border border-gray-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-800 pb-4">
            <div>
              <span className="font-mono text-xs text-amber-400 uppercase tracking-widest">
                OFFICIAL SCORING LEDGER
              </span>
              <h3 className="font-display font-bold text-2xl text-white mt-1">
                Point Distribution & Maximum Yield
              </h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
              <Award className="w-4 h-4 text-[#ffd166]" />
              <span>Overall Cap: 2,600 PTS</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-3 px-4">Protocol Phase</th>
                  <th className="py-3 px-4">Challenge Description</th>
                  <th className="py-3 px-4 text-right">Max Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-200">
                <tr>
                  <td className="py-3 px-4 text-[#ff004f] font-semibold">Round 1</td>
                  <td className="py-3 px-4">10 Technical MCQs (Normal Answers)</td>
                  <td className="py-3 px-4 text-right">1,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-[#ff004f] font-semibold">Round 1 Bonus</td>
                  <td className="py-3 px-4">Double Points Multiplier (+100 extra per question)</td>
                  <td className="py-3 px-4 text-right">+1,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-[#00f0ff] font-semibold">Round 2 • S1</td>
                  <td className="py-3 px-4">6×6 Shape Sudoku (Unique Valid Grid)</td>
                  <td className="py-3 px-4 text-right">100</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-[#00f0ff] font-semibold">Round 2 • S2</td>
                  <td className="py-3 px-4">Broken Logic Technical Reasoning Output</td>
                  <td className="py-3 px-4 text-right">200</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-[#00e676] font-semibold">Round 3 • Final</td>
                  <td className="py-3 px-4">Final System Breach Debugging Key (Java/Python/C)</td>
                  <td className="py-3 px-4 text-right">200</td>
                </tr>
                <tr className="bg-[#12151c] font-bold text-white">
                  <td className="py-3.5 px-4" colSpan={2}>THEORETICAL MAXIMUM PERFECT RUN</td>
                  <td className="py-3.5 px-4 text-right text-[#00e676]">2,500 PTS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
