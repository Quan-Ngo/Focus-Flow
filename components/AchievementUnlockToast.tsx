
import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { SparklesIcon, TrophyIcon } from './Icons';

interface AchievementUnlockToastProps {
  achievement: Achievement | null;
  onClose: () => void;
  totalEarned: number;
}

export const AchievementUnlockToast: React.FC<AchievementUnlockToastProps> = ({ 
  achievement, 
  onClose, 
  totalEarned 
}) => {
  const [visible, setVisible] = useState(false);

  // Handle auto-closing and visibility state
  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 7000); // Plenty of time to see the glory
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleDismiss = () => {
    setVisible(false);
    // Short delay to allow exit animations before clearing the global state
    setTimeout(onClose, 500);
  };

  if (!achievement || !visible) return null;

  // Tier 1: 1-3 Achievements (Subtle & Elegant Slide-down)
  if (totalEarned <= 3) {
    return (
      <div className="fixed top-6 left-0 right-0 z-[100] px-6 flex justify-center pointer-events-none">
        <div 
          className="bg-white border border-purple-100 shadow-xl rounded-[2rem] p-4 flex items-center gap-4 w-full max-w-[320px] animate-in slide-in-from-top-full duration-500 ease-out pointer-events-auto cursor-pointer active:scale-95 transition-transform"
          onClick={handleDismiss}
        >
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
            {achievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest leading-none mb-1">New Trophy!</h4>
            <p className="text-sm font-bold text-slate-800 truncate">{achievement.title}</p>
          </div>
        </div>
      </div>
    );
  }

  // Tier 2: 4-7 Achievements (Energetic & Fun Center Card)
  if (totalEarned <= 7) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] pointer-events-none">
        <div className="bg-white border-2 border-amber-200 shadow-2xl rounded-[2.5rem] p-8 flex flex-col items-center text-center w-[85%] max-w-[300px] animate-in zoom-in-75 duration-300 ease-out pointer-events-auto relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <SparklesIcon key={i} className="absolute w-12 h-12 text-amber-500 animate-pulse" style={{ 
                top: `${Math.random() * 80}%`, 
                left: `${Math.random() * 80}%`,
                animationDelay: `${i * 0.2}s`
              }} />
            ))}
          </div>
          <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center text-6xl mb-4 shadow-inner transform rotate-12 animate-bounce">
            {achievement.icon}
          </div>
          <h4 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Great Work!</h4>
          <h3 className="text-xl font-extrabold text-slate-800 mb-2 leading-tight">{achievement.title}</h3>
          <p className="text-xs text-slate-400 font-bold px-4 mb-6">{achievement.description}</p>
          <button 
            onClick={handleDismiss} 
            className="w-full py-4 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-100 active:scale-95 transition-all"
          >
            Incredible!
          </button>
        </div>
      </div>
    );
  }

  // Tier 3: 8-15 Achievements (High Stakes Screen-Shaking Sunburst)
  if (totalEarned <= 15) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-purple-950/50 backdrop-blur-md pointer-events-none overflow-hidden">
        <div className="bg-white border-4 border-purple-400 shadow-[0_0_100px_rgba(168,85,247,0.5)] rounded-[3.5rem] p-10 flex flex-col items-center text-center w-[90%] max-w-[340px] animate-shake pointer-events-auto relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none flex items-center justify-center">
            <div className="w-[800px] h-[800px] bg-[conic-gradient(from_0deg,#a855f7,#fbbf24,#a855f7)] animate-rotate-slow rounded-full" />
          </div>
          <div className="relative z-10">
            <div className="w-32 h-32 bg-purple-50 rounded-[2.5rem] flex items-center justify-center text-7xl mb-6 shadow-2xl animate-bounce">
              {achievement.icon}
            </div>
            <h4 className="text-sm font-black text-purple-600 uppercase tracking-[0.3em] mb-3">Elite Achievement</h4>
            <h3 className="text-3xl font-black text-slate-800 leading-tight mb-3">{achievement.title}</h3>
            <p className="text-sm text-slate-500 font-bold mb-8">{achievement.description}</p>
            <button 
              onClick={handleDismiss} 
              className="w-full py-4 bg-purple-600 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
            >
              I am unstoppable
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tier 4: 15+ Achievements (The Ultimate Rainbow Ascendance)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 pointer-events-none overflow-hidden animate-in zoom-in-150 duration-700">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="confetti rounded-full" 
            style={{ 
              top: '100%',
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 15 + 5}px`,
              height: `${Math.random() * 15 + 5}px`,
              backgroundColor: ['#a855f7', '#fbbf24', '#f472b6', '#38bdf8', '#8b5cf6'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`
            }} 
          />
        ))}
      </div>
      <div className="relative bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-amber-500 rounded-[4rem] p-12 flex flex-col items-center text-center w-[92%] max-w-[360px] pointer-events-auto border-[6px] border-white/40 shadow-[0_0_150px_rgba(255,255,255,0.4)] animate-shake">
        <div className="absolute inset-0 bg-black/20 animate-pulse rounded-[3.8rem]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-white/40 rounded-full blur-3xl animate-ping scale-150" />
            <div className="w-36 h-36 bg-white rounded-[3rem] flex items-center justify-center text-8xl shadow-2xl transform -rotate-6">
              {achievement.icon}
            </div>
          </div>
          <h4 className="text-base font-black text-white uppercase tracking-[0.4em] mb-4 animate-rainbow drop-shadow-lg">Completionist</h4>
          <h3 className="text-4xl font-black text-white leading-none mb-6 drop-shadow-2xl">{achievement.title}</h3>
          <div className="bg-white/10 backdrop-blur-md px-6 py-5 rounded-[2rem] border border-white/20 mb-10">
            <p className="text-sm text-white font-black leading-relaxed italic">You are among the focus elite. Your discipline is legendary.</p>
          </div>
          <button 
            onClick={handleDismiss} 
            className="w-full py-5 bg-white text-slate-900 rounded-[2rem] text-base font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
          >
            I Have Ascended
          </button>
          <div className="mt-8 flex items-center gap-3">
             <TrophyIcon className="w-6 h-6 text-amber-300 animate-bounce" />
             <span className="text-xs font-black text-white uppercase tracking-widest">Master Collection: {totalEarned}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
