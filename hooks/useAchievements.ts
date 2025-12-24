
import { useState, useEffect, useCallback } from 'react';
import { Achievement, Task } from '../types';

const STORAGE_KEY_ACHIEVEMENTS = 'focusflow_achievements';

const MASTER_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'First Step', description: 'Complete your first ever task.', icon: '👣', condition: 'task_completed_1' },
  { id: 'completed_5', title: 'High Five', description: 'Complete a total of 5 tasks.', icon: '✋', condition: 'total_completed_5' },
  { id: 'marathon', title: 'Marathoner', description: 'Complete a total of 10 tasks.', icon: '🏃', condition: 'total_completed_10' },
  { id: 'completed_20', title: 'Elite Doer', description: 'Complete a total of 20 tasks.', icon: '🏅', condition: 'total_completed_20' },
  { id: 'completed_50', title: 'Task Master', description: 'Complete a total of 50 tasks.', icon: '💎', condition: 'total_completed_50' },
  
  // Level Milestones
  { id: 'level_3', title: 'Novice Focused', description: 'Reach level 3.', icon: '🌱', condition: 'level_3' },
  { id: 'level_10', title: 'Apprentice Planner', description: 'Reach level 10.', icon: '📂', condition: 'level_10' },
  { id: 'level_15', title: 'Habit Builder', description: 'Reach level 15.', icon: '🧱', condition: 'level_15' },
  { id: 'level_20', title: 'Discipline Master', description: 'Reach level 20.', icon: '⚔️', condition: 'level_20' },
  { id: 'level_30', title: 'Productivity Legend', description: 'Reach level 30.', icon: '📜', condition: 'level_30' },
  { id: 'level_40', title: 'Time Architect', description: 'Reach level 40.', icon: '🏛️', condition: 'level_40' },
  { id: 'level_100', title: 'Absolute Flow', description: 'Reach level 100.', icon: '🌌', condition: 'level_100' },

  // Daily Milestones
  { id: 'daily_3', title: 'Productive Day', description: 'Finish 3 tasks in a single day.', icon: '⚡', condition: 'daily_3' },
  { id: 'daily_5', title: 'Velocity', description: 'Finish 5 tasks in a single day.', icon: '🚀', condition: 'daily_5' },
  { id: 'daily_10', title: 'Unstoppable', description: 'Finish 10 tasks in a single day.', icon: '☄️', condition: 'daily_10' },
  { id: 'daily_20', title: 'God Mode', description: 'Finish 20 tasks in a single day.', icon: '😇', condition: 'daily_20' },

  { id: 'on_fire', title: 'On Fire', description: 'Reach a 3-day streak on any task.', icon: '🔥', condition: 'streak_3' },
  { id: 'inferno', title: 'Inferno', description: 'Reach a 7-day streak on any task.', icon: '🌋', condition: 'streak_7' },
  { id: 'streak_30', title: 'Monthly Habit', description: 'Reach a 30-day streak on any task.', icon: '🌖', condition: 'streak_30' },
  { id: 'streak_180', title: 'Half-Year Hero', description: 'Reach a 180-day streak on any task.', icon: '🌓', condition: 'streak_180' },
  { id: 'streak_365', title: 'Yearly Legend', description: 'Reach a 365-day streak on any task.', icon: '☀️', condition: 'streak_365' },

  { id: 'perfect_day', title: 'Perfect Day', description: 'Complete all your tasks in a single day.', icon: '🌟', condition: 'all_completed' },
  { id: 'time_master', title: 'Time Master', description: 'Complete a task using the timer.', icon: '⏱️', condition: 'timer_completed' },
  
  // Time-based Achievements
  { id: 'time_5m', title: 'Momentum', description: 'Spend 5 minutes focusing on tasks.', icon: '🥉', condition: 'total_time_300' },
  { id: 'time_30m', title: 'Committed', description: 'Spend 30 minutes focusing on tasks.', icon: '🥈', condition: 'total_time_1800' },
  { id: 'time_1h', title: 'Deep Work', description: 'Spend 1 hour focusing on tasks.', icon: '🥇', condition: 'total_time_3600' },
  { id: 'time_3h', title: 'Focus Specialist', description: 'Spend 3 hours focusing on tasks.', icon: '🏆', condition: 'total_time_10800' },
  { id: 'time_10h', title: 'Zen Architect', description: 'Spend 10 hours focusing on tasks.', icon: '🧘', condition: 'total_time_36000' },
  { id: 'time_20h', title: 'Focus Legend', description: 'Spend 20 hours focusing on tasks.', icon: '👑', condition: 'total_time_72000' }
];

export function useAchievements(
  tasks: Task[], 
  totalSecondsSpent: number, 
  lifetimeTasksCompleted: number, 
  dailyTasksCompleted: number,
  currentLevel: number
) {
  const [earnedIds, setEarnedIds] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse achievements", e);
      }
    }
    return {};
  });
  
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  useEffect(() => {
    if (Object.keys(earnedIds).length > 0) {
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(earnedIds));
    }
  }, [earnedIds]);

  const unlock = useCallback((id: string) => {
    setEarnedIds(prev => {
      if (prev[id]) return prev;
      
      const timestamp = Date.now();
      const ach = MASTER_ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        setNewlyUnlocked(ach);
      }
      return { ...prev, [id]: timestamp };
    });
  }, []);

  const debugUnlockNext = useCallback(() => {
    const nextAch = MASTER_ACHIEVEMENTS.find(a => !earnedIds[a.id]);
    if (nextAch) {
      unlock(nextAch.id);
    }
  }, [earnedIds, unlock]);

  // Monitor total tasks completed
  useEffect(() => {
    if (lifetimeTasksCompleted >= 1) unlock('first_step');
    if (lifetimeTasksCompleted >= 5) unlock('completed_5');
    if (lifetimeTasksCompleted >= 10) unlock('marathon');
    if (lifetimeTasksCompleted >= 20) unlock('completed_20');
    if (lifetimeTasksCompleted >= 50) unlock('completed_50');
  }, [lifetimeTasksCompleted, unlock]);

  // Monitor levels
  useEffect(() => {
    if (currentLevel >= 3) unlock('level_3');
    if (currentLevel >= 10) unlock('level_10');
    if (currentLevel >= 15) unlock('level_15');
    if (currentLevel >= 20) unlock('level_20');
    if (currentLevel >= 30) unlock('level_30');
    if (currentLevel >= 40) unlock('level_40');
    if (currentLevel >= 100) unlock('level_100');
  }, [currentLevel, unlock]);

  // Monitor daily tasks completed
  useEffect(() => {
    if (dailyTasksCompleted >= 3) unlock('daily_3');
    if (dailyTasksCompleted >= 5) unlock('daily_5');
    if (dailyTasksCompleted >= 10) unlock('daily_10');
    if (dailyTasksCompleted >= 20) unlock('daily_20');
  }, [dailyTasksCompleted, unlock]);

  // Monitor streaks and one-off conditions
  useEffect(() => {
    // Streaks
    const maxStreak = Math.max(0, ...tasks.map(t => t.streak));
    if (maxStreak >= 3) unlock('on_fire');
    if (maxStreak >= 7) unlock('inferno');
    if (maxStreak >= 30) unlock('streak_30');
    if (maxStreak >= 180) unlock('streak_180');
    if (maxStreak >= 365) unlock('streak_365');

    // Perfect Day (Requires at least some tasks to be present)
    if (tasks.length >= 3 && tasks.every(t => t.completed)) unlock('perfect_day');

    // Timer usage
    if (tasks.some(t => t.completed && t.duration !== undefined)) unlock('time_master');
  }, [tasks, unlock]);

  // Monitor total time
  useEffect(() => {
    if (totalSecondsSpent >= 300) unlock('time_5m');
    if (totalSecondsSpent >= 1800) unlock('time_30m');
    if (totalSecondsSpent >= 3600) unlock('time_1h');
    if (totalSecondsSpent >= 10800) unlock('time_3h');
    if (totalSecondsSpent >= 36000) unlock('time_10h');
    if (totalSecondsSpent >= 72000) unlock('time_20h');
  }, [totalSecondsSpent, unlock]);

  const achievements: Achievement[] = MASTER_ACHIEVEMENTS.map(a => ({
    ...a,
    earnedAt: earnedIds[a.id]
  }));

  const clearNewlyUnlocked = () => setNewlyUnlocked(null);

  return { 
    achievements, 
    earnedCount: Object.keys(earnedIds).length,
    newlyUnlocked,
    clearNewlyUnlocked,
    debugUnlockNext
  };
}
