
import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, UserProfile } from '../types';
import { updateProfileOnCompletion } from '../services/levelService';
import { STORAGE_KEY_LAST_DATE } from './useDateChangeDetection';

const STORAGE_KEY_TASKS = 'focusflow_tasks';
const STORAGE_KEY_TOTAL_TIME = 'focusflow_total_time';
const STORAGE_KEY_LIFETIME_COMPLETED = 'focusflow_lifetime_completed';
const STORAGE_KEY_DAILY_COMPLETED = 'focusflow_daily_completed';
const STORAGE_KEY_USER = 'focusflow_user';
const STORAGE_KEY_LAST_TICK = 'focusflow_last_tick';

let audioCtx: AudioContext | null = null;
let silentOscillator: OscillatorNode | null = null;

const startBackgroundKeepAlive = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    if (!silentOscillator) {
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.001;
      
      silentOscillator = audioCtx.createOscillator();
      silentOscillator.type = 'sine';
      silentOscillator.frequency.value = 440;
      
      silentOscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      silentOscillator.start();
    }
  } catch (e) {
  }
};

const stopBackgroundKeepAlive = () => {
  if (silentOscillator) {
    try {
      silentOscillator.stop();
      silentOscillator.disconnect();
    } catch (e) {}
    silentOscillator = null;
  }
};

const playCompletionSound = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const playTone = (freq: number, startTime: number, volume: number) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + 1.6);
    };

    playTone(880, now, 0.1);
    playTone(1108.73, now + 0.1, 0.08);
  } catch (e) {
  }
};

const playLevelUpSound = () => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;
    const tones = [523.25, 659.25, 783.99, 1046.50];
    tones.forEach((freq, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.7);
    });
  } catch (e) {}
};

export function useTaskTracking() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalSecondsSpent, setTotalSecondsSpent] = useState<number>(0);
  const [lifetimeTasksCompleted, setLifetimeTasksCompleted] = useState<number>(0);
  const [dailyTasksCompleted, setDailyTasksCompleted] = useState<number>(0);
  const lastTickRef = useRef<number>(Date.now());

  const creditCompletion = useCallback((finishedTask: Task) => {
    setLifetimeTasksCompleted(prev => prev + 1);
    setDailyTasksCompleted(prev => prev + 1);
    playCompletionSound();
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    
    const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);
    let currentUser: UserProfile = { name: 'Explorer', icon: 'F', level: 1, xp: 0 };
    
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed) {
          currentUser = {
            ...currentUser,
            ...parsed,
            level: Number(parsed.level) || 1,
            xp: Number(parsed.xp) || 0
          };
        }
      } catch (e) {}
    }
    
    const { user: updatedUser, leveledUp } = updateProfileOnCompletion(currentUser, finishedTask);
    if (leveledUp) {
      setTimeout(() => {
        playLevelUpSound();
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 300]);
      }, 500);
    }
    
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    window.dispatchEvent(new CustomEvent('user-profile-updated', { 
      detail: { ...updatedUser, leveledUp } 
    }));
  }, []);

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (e) { }
    }
    const savedLastTick = localStorage.getItem(STORAGE_KEY_LAST_TICK);
    if (savedLastTick) lastTickRef.current = parseInt(savedLastTick);
    else lastTickRef.current = Date.now();
    const savedTime = localStorage.getItem(STORAGE_KEY_TOTAL_TIME);
    if (savedTime) setTotalSecondsSpent(parseInt(savedTime) || 0);
    const savedCompletions = localStorage.getItem(STORAGE_KEY_LIFETIME_COMPLETED);
    if (savedCompletions) setLifetimeTasksCompleted(parseInt(savedCompletions) || 0);
    const savedDaily = localStorage.getItem(STORAGE_KEY_DAILY_COMPLETED);
    if (savedDaily) setDailyTasksCompleted(parseInt(savedDaily) || 0);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOTAL_TIME, totalSecondsSpent.toString());
    localStorage.setItem(STORAGE_KEY_LIFETIME_COMPLETED, lifetimeTasksCompleted.toString());
    localStorage.setItem(STORAGE_KEY_DAILY_COMPLETED, dailyTasksCompleted.toString());
  }, [totalSecondsSpent, lifetimeTasksCompleted, dailyTasksCompleted]);

  const tick = useCallback(() => {
    const now = Date.now();
    const lastTick = lastTickRef.current;
    lastTickRef.current = now;
    localStorage.setItem(STORAGE_KEY_LAST_TICK, now.toString());
    setTasks(currentTasks => {
      let activeSecondsToAdd = 0;
      let anyStillRunning = false;
      const finishedTasksInThisTick: Task[] = [];
      const nextTasks = currentTasks.map(task => {
        if (!task.isRunning || task.completed || !task.timerEndTime) return task;
        const taskEnd = task.timerEndTime;
        const activeEnd = Math.min(now, taskEnd);
        const overlapMs = Math.max(0, activeEnd - lastTick);
        const overlapSeconds = overlapMs / 1000;
        activeSecondsToAdd = Math.max(activeSecondsToAdd, overlapSeconds);
        const msRemaining = taskEnd - now;
        const secondsRemaining = Math.max(0, Math.ceil(msRemaining / 1000));
        if (secondsRemaining <= 0) {
          const updatedTask = { ...task, remainingSeconds: 0, isRunning: false, completed: true, timerEndTime: undefined };
          finishedTasksInThisTick.push(updatedTask);
          return updatedTask;
        }
        anyStillRunning = true;
        return { ...task, remainingSeconds: secondsRemaining };
      });
      if (activeSecondsToAdd > 0) setTotalSecondsSpent(prev => prev + Math.round(activeSecondsToAdd));
      if (finishedTasksInThisTick.length > 0) finishedTasksInThisTick.forEach(t => creditCompletion(t));
      if (!anyStillRunning) stopBackgroundKeepAlive();
      return nextTasks;
    });
  }, [creditCompletion]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tick]);

  const addTask = (title: string, hours: number, minutes: number, seconds: number) => {
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const hasDuration = totalSeconds > 0;
    const newTask: Task = { id: crypto.randomUUID(), title, completed: false, createdAt: Date.now(), duration: hasDuration ? totalSeconds / 60 : undefined, remainingSeconds: hasDuration ? totalSeconds : undefined, isRunning: false, streak: 0 };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        if (nextCompleted) creditCompletion(task);
        return { ...task, completed: nextCompleted, isRunning: false, timerEndTime: undefined };
      }
      return task;
    }));
  };

  const toggleTimer = (id: string) => {
    setTasks(prev => {
      const targetTask = prev.find(t => t.id === id);
      if (!targetTask) return prev;
      const isStart = !targetTask.isRunning;
      if (isStart) {
        startBackgroundKeepAlive();
        lastTickRef.current = Date.now();
        localStorage.setItem(STORAGE_KEY_LAST_TICK, Date.now().toString());
      }
      const nextTasks = prev.map(task => {
        if (task.id === id && !task.completed) {
          const nextRunning = !task.isRunning;
          const endTime = nextRunning ? Date.now() + (task.remainingSeconds || 0) * 1000 : undefined;
          return { ...task, isRunning: nextRunning, timerEndTime: endTime };
        }
        return task;
      });
      if (!nextTasks.some(t => t.isRunning)) stopBackgroundKeepAlive();
      return nextTasks;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => {
      const filtered = prev.filter(task => task.id !== id);
      if (!filtered.some(t => t.isRunning)) stopBackgroundKeepAlive();
      return filtered;
    });
  };

  const processNewDay = useCallback((daysPassed: number) => {
    const today = new Date().toLocaleDateString('en-CA');
    localStorage.setItem(STORAGE_KEY_LAST_DATE, today);
    
    setDailyTasksCompleted(0);
    
    setTasks(prev => {
      stopBackgroundKeepAlive();
      
      const result = prev.map(task => {
        let newStreak = task.streak || 0;
        
        // Streak Logic:
        // 1. If exactly 1 day passed AND the task was completed yesterday, increment streak.
        // 2. If exactly 1 day passed BUT the task was NOT completed, reset streak to 0.
        // 3. If more than 1 day passed (multiple days missed), reset streak to 0.
        if (daysPassed === 1) {
          if (task.completed) {
            newStreak += 1;
          } else {
            newStreak = 0;
          }
        } else if (daysPassed > 1) {
          newStreak = 0;
        }
        
        return { 
          ...task, 
          completed: false, 
          isRunning: false, 
          streak: newStreak, 
          timerEndTime: undefined, 
          remainingSeconds: task.duration ? Math.round(task.duration * 60) : undefined 
        };
      });
      
      return [...result]; 
    });
  }, []);

  const exportData = () => {
    const data = { tasks, totalSecondsSpent, lifetimeTasksCompleted, dailyTasksCompleted, achievements: JSON.parse(localStorage.getItem('focusflow_achievements') || '{}'), user: JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || '{"name":"Explorer","level":1,"xp":0}'), version: '1.2.7' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `focusflow-backup-${new Date().toLocaleDateString('en-CA')}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks) {
          setTasks(data.tasks); setTotalSecondsSpent(data.totalSecondsSpent || 0); setLifetimeTasksCompleted(data.lifetimeTasksCompleted || 0); setDailyTasksCompleted(data.dailyTasksCompleted || 0);
          localStorage.setItem('focusflow_achievements', JSON.stringify(data.achievements || {})); localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user || { name: 'Explorer', level: 1, xp: 0 }));
          alert('Data restored successfully!'); window.location.reload();
        }
      } catch (err) { alert('Invalid backup file'); }
    };
    reader.readAsText(file);
  };

  return { tasks, setTasks, addTask, toggleTask, toggleTimer, deleteTask, processNewDay, totalSecondsSpent, lifetimeTasksCompleted, dailyTasksCompleted, exportData, importData };
}
