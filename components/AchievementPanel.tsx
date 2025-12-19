
import React from 'react';
import { Achievement } from '../types';
import { SparklesIcon } from './Icons';

interface AchievementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({ isOpen, onClose, achievements }) => {
  if (!isOpen) return null;

  const earnedAchievements = achievements.filter(a => a.earnedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-white rounded-t-[3rem] shadow-2xl p-6 pb-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full mb-6 cursor-pointer" onClick={onClose} />
          
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-extrabold text-slate-800">Your Trophies</h2>
          </div>
          <p className="text-sm text-slate-400 font-medium mb-8">
            {earnedAchievements.length > 0 ? "You've earned these rewards for your focus!" : "Keep pushing to unlock rewards!"}
          </p>

          <div className="grid grid-cols-1 gap-4 w-full">
            {earnedAchievements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-sm text-center">You have not unlocked any achievements.</p>
              </div>
            ) : (
              earnedAchievements.map((a) => (
                <div 
                  key={a.id} 
                  className="relative flex items-center gap-4 p-4 rounded-3xl border transition-all bg-purple-50/50 border-purple-100 shadow-sm"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-white border border-purple-50">
                    {a.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-800">
                      {a.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {a.description}
                    </p>
                    {a.earnedAt && (
                      <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-1 block">
                        Unlocked {new Date(a.earnedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={onClose}
            className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all"
          >
            {earnedAchievements.length > 0 ? "Great, keep it up!" : "I'm on it!"}
          </button>
        </div>
      </div>
      
      {/* Tap outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
