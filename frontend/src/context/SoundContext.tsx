import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundService } from '../services/soundService';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playGreenLight: () => void;
  playRedLight: () => void;
  playSuccess: () => void;
  playError: () => void;
  playVictory: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  useEffect(() => {
    soundService.setMuted(isMuted);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playGreenLight: () => soundService.playGreenLight(),
        playRedLight: () => soundService.playRedLight(),
        playSuccess: () => soundService.playSuccess(),
        playError: () => soundService.playError(),
        playVictory: () => soundService.playVictory(),
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
};
