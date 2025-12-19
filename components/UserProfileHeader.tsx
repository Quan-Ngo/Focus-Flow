
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { UserIcon, LightBulbIcon, TrophyIcon, DownloadIcon, UploadIcon } from './Icons';

const STORAGE_KEY_USER = 'focusflow_user';

const MOTIVATIONAL_QUOTES = [
  "Small steps lead to big results.",
  "Focus on being productive, not busy.",
  "Your only limit is your mind.",
  "Quality is not an act, it is a habit.",
  "Energy and persistence conquer all.",
  "The secret is getting started.",
  "Do something today for your future self.",
  "Focus on the step in front of you.",
  "Progress, not perfection.",
  "Make today count."
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
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ 
  completedCount, 
  totalCount, 
  progressPercentage,
  earnedCount,
  onOpenAchievements,
  onExportData,
  onImportData
}) => {
  const [user, setUser] = useState<UserProfile>({ name: 'Explorer', icon: 'F' });
  const [isEditingName, setIsEditingName] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState('');
  const [motivation, setMotivation] = useState<string>(MOTIVATIONAL_QUOTES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          name: userData.name || 'Explorer',
          icon: userData.icon || 'F'
        });
        setNewName(userData.name);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
    setMotivation(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  const handleUpdateName = () => {
    if (newName.trim()) {
      setUser(prev => ({ ...prev, name: newName.trim() }));
      setIsEditingName(false);
    }
  };

  const refreshMotivation = () => {
    const nextIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setMotivation(MOTIVATIONAL_QUOTES[nextIndex]);
  };

  return (
    <>
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-100 transition-all duration-500 hover:rotate-12">
            {user.icon || 'F'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-none">FocusFlow</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Agenda</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Achievement Toggle */}
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

          {isEditingName ? (
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-20 text-xs focus:outline-none font-medium bg-transparent"
                autoFocus
                onBlur={handleUpdateName}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
              />
            </div>
          ) : (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm active:scale-95 transition-transform ${showSettings ? 'ring-2 ring-purple-100' : ''}`}
              title="Settings"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Settings Dropdown Overlay */}
      {showSettings && (
        <div className="mx-5 mb-4 p-5 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settings & Data</h4>
             <button onClick={() => setIsEditingName(true)} className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Edit Name</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={onExportData}
               className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group"
             >
                <DownloadIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                <span className="text-xs font-bold text-slate-600">Export</span>
             </button>
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group"
             >
                <UploadIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-xs font-bold text-slate-600">Restore</span>
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json"
                onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) onImportData(file);
                }}
             />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="px-5 pt-2">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 rounded-[2.5rem] p-6 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden animate-glow">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 left-[-100%] w-[60%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine pointer-events-none"></div>
          
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center justify-between relative z-10 w-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-extrabold leading-tight truncate">Hi, {user.name}</h2>
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                <p className="text-purple-100 text-sm font-medium">
                  {totalCount === 0 ? "Ready to focus?" : `${completedCount}/${totalCount} tasks done`}
                </p>
              </div>
              
              <div onClick={refreshMotivation} className="mt-4 flex items-start gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 active:scale-[0.98] transition-all cursor-pointer">
                <LightBulbIcon className="w-4 h-4 text-purple-200 shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-tight text-white">{motivation}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 ml-4 shrink-0">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-white/20 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                  <circle 
                    className="text-white stroke-current transition-all duration-1000 ease-out" 
                    strokeWidth="10" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercentage / 100)}
                    strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progressPercentage}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
