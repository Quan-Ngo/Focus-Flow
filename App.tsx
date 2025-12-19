
import React, { useState, useEffect } from 'react';
import { useDateChangeDetection } from './hooks/useDateChangeDetection';
import { useTaskTracking } from './hooks/useTaskTracking';
import { useAchievements } from './hooks/useAchievements';
import { TaskDashboard } from './components/TaskDashboard';
import { UserProfileHeader } from './components/UserProfileHeader';
import { AchievementPanel } from './components/AchievementPanel';
import { AchievementUnlockToast } from './components/AchievementUnlockToast';

export default function App() {
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col w-full max-w-md mx-auto bg-slate-50 relative overflow-hidden shadow-2xl border-x border-slate-100">
      {/* Enhanced Offline Banner */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 text-center sticky top-0 z-[100] shadow-md">
          FocusFlow Offline Mode
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
    </div>
  );
}
