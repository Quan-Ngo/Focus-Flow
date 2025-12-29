import React, { useEffect, useState } from 'react';
import { SparklesIcon, FireIcon } from './Icons';

interface XPCompletionToastProps {
  xpGained: number;
  streak: number;
  onClose: () => void;
}

export const XPCompletionToast: React.FC<XPCompletionToastProps> = ({ 
  xpGained, 
  streak, 
  onClose 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (xpGained > 0) {
      // Small delay to ensure the sliding animation triggers visually after mount
      const showTimer = setTimeout(() => setVisible(true), 10);
      
      // Notification stays for 1.5 seconds (requested extra half second over the previous 1s)
      const hideTimer = setTimeout(() => {
        setVisible(false);
        // Wait for exit transition to finish before unmounting/clearing state
        setTimeout(onClose, 600);
      }, 1500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [xpGained, onClose]);

  // If we aren't supposed to be visible and have no pending XP, render nothing
  if (!visible && xpGained === 0) return null;

  return (
    <div className={`fixed bottom-24 left-0 right-0 z-[150] px-6 flex justify-center pointer-events-none transition-all duration-500 ease-in-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
      <div className="bg-slate-900 text-white shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 border border-white/10 pointer-events-auto">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex flex-col">
          <p className="text-sm font-black tracking-tight leading-none">
            +{xpGained} XP Earned!
          </p>
          {streak > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <FireIcon className="w-3 h-3 text-orange-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {streak} {streak === 1 ? 'day' : 'days'} streak exp bonus!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};