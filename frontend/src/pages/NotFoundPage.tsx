import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#08090c] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#12151c] border border-gray-800 text-center space-y-4">
          <AlertOctagon className="w-14 h-14 text-[#ff004f] mx-auto animate-bounce" />
          <h1 className="font-display font-black text-6xl text-white">404</h1>
          <h2 className="font-display font-bold text-lg text-gray-300 uppercase tracking-widest">
            SECTOR NOT FOUND
          </h2>
          <p className="text-xs font-mono text-gray-500">
            The requested protocol sector or memory address does not exist within the system matrix.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO PUBLIC TERMINAL</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
