
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';
import { UserIcon, LightBulbIcon, TrophyIcon, DownloadIcon, UploadIcon, FireIcon, SparklesIcon } from './Icons';
import { getXPToNextLevel } from '../services/levelService';

const STORAGE_KEY_USER = 'focusflow_user';

// --- DEBUG TOGGLE ---
// Set to false to visually hide debug buttons in the settings panel
const SHOW_DEBUG_CONTROLS = false; 
// -------------------

const LOCAL_QUOTES = [
  "Small steps lead to big results.",
  "Focus on being productive, not busy.",
  "Your only limit is your mind.",
  "Quality is not an act, it is a habit.",
  "Energy and persistence conquer all.",
  "The secret of getting ahead is getting started.",
  "Do something today for your future self.",
  "Focus on the step in front of you.",
  "Progress, not perfection.",
  "Make today count.",
  "Discipline is choosing between what you want now and what you want most.",
  "Don't stop until you're proud.",
  "Action is the foundational key to all success.",
  "Your time is limited, don't waste it.",
  "The best way to predict the future is to create it."
];

interface UserProfileHeaderProps {
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  earnedCount: number;
  totalSecondsSpent: number;
  onOpenAchievements: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onDebugResetDay?: () => void;
  onDebugUnlockAchievement?: () => void;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = (props) => {
  const { 
    completedCount, 
    totalCount, 
    progressPercentage,
    earnedCount,
    onOpenAchievements,
    onExportData,
    onImportData,
    onDebugResetDay,
    onDebugUnlockAchievement
  } = props;

  const [user, setUser] = useState<UserProfile>({ name: 'Explorer', icon: 'F', level: 1, xp: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showXpDetails, setShowXpDetails] = useState(false);
  const [newName, setNewName] = useState('');
  const [motivation, setMotivation] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getRandomQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * LOCAL_QUOTES.length);
    return LOCAL_QUOTES[randomIndex];
  }, []);

  const syncUserFromStorage = useCallback(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          name: userData.name || 'Explorer',
          icon: userData.icon || 'F',
          level: Number(userData.level) || 1,
          xp: Number(userData.xp) || 0
        });
        setNewName(userData.name || 'Explorer');
      } catch (e) {
      }
    }
  }, []);

  useEffect(() => {
    syncUserFromStorage();
    setMotivation(getRandomQuote());
    const handleProfileUpdate = (e: any) => { 
      if (e.detail) {
        // Sanitize incoming payload to ensure it matches UserProfile exactly
        const updated = e.detail.user || e.detail;
        setUser(prev => ({
          ...prev,
          name: updated.name || prev.name,
          level: Number(updated.level) || prev.level,
          xp: Number(updated.xp) || prev.xp,
          icon: updated.icon || prev.icon
        }));
      }
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('user-profile-updated', handleProfileUpdate);
  }, [getRandomQuote, syncUserFromStorage]);

  const handleUpdateName = () => {
    if (newName.trim()) {
      const updatedUser = { ...user, name: newName.trim() };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      setIsEditingName(false);
    }
  };

  const refreshMotivation = () => setMotivation(getRandomQuote());
  
  // Defensive XP Math
  const xpToNext = getXPToNextLevel(user.level);
  const rawXpPercentage = (user.xp / xpToNext) * 100;
  const xpPercentage = isFinite(rawXpPercentage) ? Math.round(rawXpPercentage) : 0;
  console.log("curr exp: " + user.xp);
  console.log("exp to next: " + xpToNext);
  return (
    <>
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-100 transition-all duration-500 group-hover:rotate-12">
              {user.icon || 'F'}
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-none">FocusFlow</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Agenda</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenAchievements}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-amber-500 shadow-sm active:scale-95 transition-transform relative"
            title="Achievements"
          >
            <TrophyIcon className="w-5 h-5" />
            {earnedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {earnedCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm active:scale-95 transition-transform ${showSettings ? 'ring-2 ring-purple-100' : ''}`}
            title="Settings"
          >
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="mx-5 mb-4 p-5 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 z-[100] relative">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settings & Data</h4>
             <button onClick={() => setIsEditingName(!isEditingName)} className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                {isEditingName ? 'Save' : 'Edit Name'}
              </button>
          </div>

          {isEditingName && (
            <div className="mb-4 flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-grow text-sm font-bold focus:outline-none bg-transparent" autoFocus onBlur={handleUpdateName} onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
             <button onClick={onExportData} className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group">
                <DownloadIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-500" />
                <span className="text-xs font-bold text-slate-600">Backup</span>
             </button>
             <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group">
                <UploadIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                <span className="text-xs font-bold text-slate-600">Restore</span>
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => { const file = e.target.files?.[0]; if (file) onImportData(file); }} />
          </div>

          {SHOW_DEBUG_CONTROLS && (
            <div className="space-y-2 pt-2 border-t border-slate-50">
              <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Debug Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    if (onDebugResetDay) {
                      onDebugResetDay();
                      setShowSettings(false);
                    }
                  }} 
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-2xl transition-colors group"
                >
                  <FireIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Reset Day</span>
                </button>
                <button 
                  onClick={() => {
                    if (onDebugUnlockAchievement) {
                      onDebugUnlockAchievement();
                      setShowSettings(false);
                    }
                  }} 
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-2xl transition-colors group"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Unlock Ach</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-5 pt-2">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 rounded-[2.5rem] p-6 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden animate-glow">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 left-[-100%] w-[60%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine pointer-events-none"></div>
          
          <div className="flex items-center justify-between relative z-10 w-full mb-6">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-extrabold leading-tight truncate">Hi, {user.name}</h2>
              </div>
              <div onClick={() => setShowXpDetails(!showXpDetails)} className="flex flex-col cursor-pointer group active:scale-95 transition-transform w-full overflow-hidden">
                <div className="flex items-baseline overflow-hidden">
                  <span className="text-3xl sm:text-4xl font-black drop-shadow-sm whitespace-nowrap overflow-hidden text-ellipsis leading-tight">Level {user.level}</span>
                </div>
                {!showXpDetails && <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] mt-1 animate-pulse whitespace-nowrap">Tap for progress</p>}
              </div>
            </div>

            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-white/20 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-white stroke-current transition-all duration-1000 ease-out" strokeWidth="10" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercentage / 100)} strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progressPercentage}%</div>
            </div>
          </div>

          {showXpDetails && (
            <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 mb-4 animate-in slide-in-from-top-2 duration-300">
               <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Goal</span>
                  <span className="text-[10px] font-black text-white">{xpPercentage}% to Level {user.level + 1}</span>
               </div>
               <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700" style={{ width: `${xpPercentage}%` }}></div>
               </div>
            </div>
          )}

          <div onClick={refreshMotivation} className="relative z-10 flex items-start gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 active:scale-[0.98] transition-all cursor-pointer">
            <LightBulbIcon className="w-4 h-4 text-purple-200 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-tight text-white">{motivation}</p>
          </div>
        </div>
      </div>
    </>
  );
};
