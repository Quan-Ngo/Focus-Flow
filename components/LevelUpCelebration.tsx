
import React, { useEffect, useState } from 'react';
import { SparklesIcon } from './Icons';

interface LevelUpCelebrationProps {
  newLevel: number | null;
  onClose: () => void;
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({ newLevel, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newLevel !== null) {
      setIsVisible(true);
    }
  }, [newLevel]);

  if (newLevel === null || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[conic-gradient(from_0deg,transparent,#a855f7,transparent,#f472b6,transparent,#fbbf24,transparent)] animate-rotate-slow" />
      </div>

      <div className="relative z-10 bg-white border-4 border-purple-400 shadow-[0_0_80px_rgba(168,85,247,0.6)] rounded-[4rem] p-10 flex flex-col items-center text-center w-[90%] max-w-[340px] animate-in zoom-in-75 duration-500 ease-out">
        <div className="absolute -top-12 flex justify-center w-full">
           <div className="bg-gradient-to-tr from-purple-600 to-fuchsia-500 w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl animate-bounce">
              ⭐
           </div>
        </div>

        <div className="mt-8 mb-6">
          <h2 className="text-sm font-black text-purple-600 uppercase tracking-[0.3em] mb-2">Power Up!</h2>
          <h3 className="text-4xl font-black text-slate-800 leading-tight">Level Up</h3>
        </div>

        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse scale-150" />
          <div className="relative text-8xl font-black bg-gradient-to-br from-purple-700 to-indigo-600 bg-clip-text text-transparent drop-shadow-xl animate-in slide-in-from-bottom-4 duration-700">
            {newLevel}
          </div>
        </div>

        <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed">
          You're gaining momentum! Your discipline is paying off.
        </p>

        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <SparklesIcon className="w-5 h-5 text-amber-400" />
          Keep Growing
        </button>
      </div>

      {/* Confetti simulation overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full animate-float-up opacity-0"
            style={{ 
              bottom: '0%', 
              left: `${Math.random() * 100}%`, 
              width: `${Math.random() * 10 + 4}px`, 
              height: `${Math.random() * 10 + 4}px`, 
              backgroundColor: ['#a855f7', '#ec4899', '#f59e0b', '#3b82f6'][i % 4],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }} 
          />
        ))}
      </div>
    </div>
  );
};
