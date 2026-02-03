import React, { useState, useEffect, useCallback } from 'react';
import { useDateChangeDetection } from './hooks/useDateChangeDetection';
import { useTaskTracking } from './hooks/useTaskTracking';
import { useAchievements } from './hooks/useAchievements';
import { TaskDashboard } from './components/TaskDashboard';
import { UserProfileHeader } from './components/UserProfileHeader';
import { AchievementPanel } from './components/AchievementPanel';
import { AchievementUnlockToast } from './components/AchievementUnlockToast';
import { LevelUpCelebration } from './components/LevelUpCelebration';
import { XPCompletionToast } from './components/XPCompletionToast';
import { NotificationPermissionRequest } from './components/NotificationPermissionRequest';
import { SparklesIcon } from './components/Icons';

const APP_VERSION = '1.2.0'; 

export default function App() {
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [celebratingLevel, setCelebratingLevel] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [lastXPUpdate, setLastXPUpdate] = useState<{ xpGained: number; streak: number } | null>(null);

  const handleXPToastClose = useCallback(() => {
    setLastXPUpdate(null);
  }, []);

  useEffect(() => {
    // Initial load of current level
    const savedUser = localStorage.getItem('focusflow_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.level) setCurrentLevel(user.level);
      } catch (e) {}
    }

    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        if (e.detail.level) setCurrentLevel(e.detail.level);
        if (e.detail.xpGained) {
          setLastXPUpdate({ 
            xpGained: e.detail.xpGained, 
            streak: e.detail.streak || 0 
          });
        }
        if (e.detail.leveledUp) {
          // Delay level up celebration slightly to let XP toast breathe
          setTimeout(() => {
            setCelebratingLevel(e.detail.level);
          }, 1500);
        }
      }
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('user-profile-updated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.version !== APP_VERSION) {
            setUpdateAvailable(true);
          }
        }
      } catch (e) {}
    };
    checkVersion();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { 
    tasks, 
    setTasks,
    addTask, 
    toggleTask, 
    toggleTimer, 
    deleteTask, 
    processNewDay, 
    totalSecondsSpent,
    lifetimeTasksCompleted,
    dailyTasksCompleted,
    exportData,
    importData
  } = useTaskTracking();

  const { 
    achievements, 
    earnedCount, 
    newlyUnlocked, 
    clearNewlyUnlocked,
    debugUnlockNext 
  } = useAchievements(tasks, totalSecondsSpent, lifetimeTasksCompleted, dailyTasksCompleted, currentLevel);

  useDateChangeDetection((oldDate, newDate) => {
    const d1 = new Date(oldDate);
    const d2 = new Date(newDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    processNewDay(daysPassed);
  });

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  };

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col w-full max-w-md mx-auto bg-slate-50 relative overflow-hidden shadow-2xl border-x border-slate-100">
      <NotificationPermissionRequest />

      {isOffline && (
        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center sticky top-0 z-[200] shadow-lg border-b border-amber-400">
          FocusFlow Offline Mode • Data is Private
        </div>
      )}

      {updateAvailable && (
        <div className="fixed top-12 left-0 right-0 z-[250] px-6 flex justify-center pointer-events-none animate-in slide-in-from-top-full duration-500">
          <button 
            onClick={handleUpdate}
            className="bg-slate-900 text-white shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 pointer-events-auto active:scale-95 transition-transform border border-white/10"
          >
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-300 leading-none mb-1">Update Ready</p>
              <p className="text-xs font-bold">New features available. Tap to refresh.</p>
            </div>
          </button>
        </div>
      )}

      {/* XP Toast appears first and briefly at the bottom */}
      <XPCompletionToast 
        xpGained={lastXPUpdate?.xpGained || 0} 
        streak={lastXPUpdate?.streak || 0}
        onClose={handleXPToastClose}
      />

      {/* Achievement Toast is more central/prominent, handled with built-in logic */}
      <AchievementUnlockToast 
        achievement={newlyUnlocked} 
        onClose={clearNewlyUnlocked} 
        totalEarned={earnedCount}
      />

      <LevelUpCelebration 
        newLevel={celebratingLevel} 
        onClose={() => setCelebratingLevel(null)} 
      />

      <UserProfileHeader 
        completedCount={completedCount} 
        totalCount={totalCount} 
        progressPercentage={progressPercentage}
        earnedCount={earnedCount}
        totalSecondsSpent={totalSecondsSpent}
        onOpenAchievements={() => setIsAchievementPanelOpen(true)}
        onExportData={exportData}
        onImportData={importData}
        onDebugResetDay={() => {
          processNewDay(1);
        }}
        onDebugUnlockAchievement={debugUnlockNext}
      />

      <TaskDashboard 
        tasks={tasks} 
        setTasks={setTasks}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onToggleTimer={toggleTimer}
        onDeleteTask={deleteTask}
      />

      <AchievementPanel 
        isOpen={isAchievementPanelOpen} 
        onClose={() => setIsAchievementPanelOpen(false)} 
        achievements={achievements}
      />

      <div className="absolute bottom-1 right-3 opacity-20 pointer-events-none">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">v{APP_VERSION}</span>
      </div>
    </div>
  );
}