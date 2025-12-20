
import React, { useState, useEffect } from 'react';
import { useDateChangeDetection } from './hooks/useDateChangeDetection';
import { useTaskTracking } from './hooks/useTaskTracking';
import { useAchievements } from './hooks/useAchievements';
import { TaskDashboard } from './components/TaskDashboard';
import { UserProfileHeader } from './components/UserProfileHeader';
import { AchievementPanel } from './components/AchievementPanel';
import { AchievementUnlockToast } from './components/AchievementUnlockToast';
import { SparklesIcon } from './components/Icons';

const APP_VERSION = '1.2.0'; // Current client version

export default function App() {
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Version Check on Boot
  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Fetch version.json with a cache-buster
        const response = await fetch(`/version.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.version !== APP_VERSION) {
            console.log(`[FocusFlow] New version found: ${data.version}. Current: ${APP_VERSION}`);
            setUpdateAvailable(true);
          }
        }
      } catch (e) {
        console.log('[FocusFlow] Version check skipped (offline or server error)');
      }
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
    clearNewlyUnlocked 
  } = useAchievements(tasks, totalSecondsSpent, lifetimeTasksCompleted, dailyTasksCompleted);

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
      {/* Absolute Top Offline Banner */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center sticky top-0 z-[200] shadow-lg border-b border-amber-400">
          FocusFlow Offline Mode • Data is Private
        </div>
      )}

      {/* Update Toast */}
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

      {/* Achievement Toast */}
      <AchievementUnlockToast 
        achievement={newlyUnlocked} 
        onClose={clearNewlyUnlocked} 
        totalEarned={earnedCount}
      />

      {/* Header UI */}
      <UserProfileHeader 
        completedCount={completedCount} 
        totalCount={totalCount} 
        progressPercentage={progressPercentage}
        earnedCount={earnedCount}
        totalSecondsSpent={totalSecondsSpent}
        onOpenAchievements={() => setIsAchievementPanelOpen(true)}
        onExportData={exportData}
        onImportData={importData}
      />

      {/* Main Content */}
      <TaskDashboard 
        tasks={tasks} 
        setTasks={setTasks}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onToggleTimer={toggleTimer}
        onDeleteTask={deleteTask}
      />

      {/* Achievements Overlay */}
      <AchievementPanel 
        isOpen={isAchievementPanelOpen} 
        onClose={() => setIsAchievementPanelOpen(false)} 
        achievements={achievements}
      />

      {/* Version Footer Label */}
      <div className="absolute bottom-1 right-3 opacity-20 pointer-events-none">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">v{APP_VERSION}</span>
      </div>
    </div>
  );
}
