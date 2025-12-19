
import React, { useState } from 'react';
import { useDateChangeDetection } from './hooks/useDateChangeDetection';
import { useTaskTracking } from './hooks/useTaskTracking';
import { useAchievements } from './hooks/useAchievements';
import { TaskDashboard } from './components/TaskDashboard';
import { UserProfileHeader } from './components/UserProfileHeader';
import { AchievementPanel } from './components/AchievementPanel';
import { AchievementUnlockToast } from './components/AchievementUnlockToast';

export default function App() {
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);

  // 1. Core Logic: Manage task state and timer logic
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

  // 2. Achievement Logic: Monitor progress and unlock awards
  const { 
    achievements, 
    earnedCount, 
    newlyUnlocked, 
    clearNewlyUnlocked 
  } = useAchievements(tasks, totalSecondsSpent, lifetimeTasksCompleted, dailyTasksCompleted);

  // 3. Date Monitor: Trigger events when the calendar day changes
  useDateChangeDetection((oldDate, newDate) => {
    const d1 = new Date(oldDate);
    const d2 = new Date(newDate);
    
    // Calculate difference in days
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log(`[FocusFlow] Date change detected: ${oldDate} -> ${newDate} (${daysPassed} days passed)`);
    processNewDay(daysPassed);
  });

  // 4. Derived State: Calculate progress stats for the UI
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col w-full max-w-md mx-auto bg-slate-50 relative overflow-hidden shadow-2xl">
      {/* Celebration Notification Overlay */}
      <AchievementUnlockToast 
        achievement={newlyUnlocked} 
        onClose={clearNewlyUnlocked} 
        totalEarned={earnedCount}
      />

      {/* Identity & Motivation UI */}
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

      {/* Main Task List & Creation UI */}
      <TaskDashboard 
        tasks={tasks} 
        setTasks={setTasks}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onToggleTimer={toggleTimer}
        onDeleteTask={deleteTask}
      />

      {/* Achievements Slide-up Overlay */}
      <AchievementPanel 
        isOpen={isAchievementPanelOpen} 
        onClose={() => setIsAchievementPanelOpen(false)} 
        achievements={achievements}
      />
    </div>
  );
}
