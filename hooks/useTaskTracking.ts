
import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '../types';

const STORAGE_KEY_TASKS = 'focusflow_tasks';
const STORAGE_KEY_TOTAL_TIME = 'focusflow_total_time';
const STORAGE_KEY_LIFETIME_COMPLETED = 'focusflow_lifetime_completed';
const STORAGE_KEY_DAILY_COMPLETED = 'focusflow_daily_completed';

// --- Background Audio Keep-Alive Logic ---
let audioCtx: AudioContext | null = null;
let silentOscillator: OscillatorNode | null = null;

/**
 * iOS suspends JS when the screen locks. 
 * Playing "silence" via Web Audio keeps the process alive.
 */
const startBackgroundKeepAlive = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // Create a silent oscillator
    if (!silentOscillator) {
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.001; // Effectively silent
      
      silentOscillator = audioCtx.createOscillator();
      silentOscillator.type = 'sine';
      silentOscillator.frequency.value = 440;
      
      silentOscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      silentOscillator.start();
    }
  } catch (e) {
    console.warn("Background audio initialization failed", e);
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

    playTone(880, now, 0.1); // A5
    playTone(1108.73, now + 0.1, 0.08); // C#6
  } catch (e) {
    console.warn("Audio playback failed", e);
  }
};

export function useTaskTracking() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalSecondsSpent, setTotalSecondsSpent] = useState<number>(0);
  const [lifetimeTasksCompleted, setLifetimeTasksCompleted] = useState<number>(0);
  const [dailyTasksCompleted, setDailyTasksCompleted] = useState<number>(0);
  const lastTickRef = useRef<number>(Date.now());

  // Load and Migrate
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks.map((t: any) => ({ 
          ...t,
          isRunning: false // Reset running state on boot for safety
        })));
      } catch (e) { console.error("Failed to parse tasks", e); }
    }

    const savedTime = localStorage.getItem(STORAGE_KEY_TOTAL_TIME);
    if (savedTime) setTotalSecondsSpent(parseInt(savedTime) || 0);

    const savedCompletions = localStorage.getItem(STORAGE_KEY_LIFETIME_COMPLETED);
    if (savedCompletions) setLifetimeTasksCompleted(parseInt(savedCompletions) || 0);

    const savedDaily = localStorage.getItem(STORAGE_KEY_DAILY_COMPLETED);
    if (savedDaily) setDailyTasksCompleted(parseInt(savedDaily) || 0);
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOTAL_TIME, totalSecondsSpent.toString());
    localStorage.setItem(STORAGE_KEY_LIFETIME_COMPLETED, lifetimeTasksCompleted.toString());
    localStorage.setItem(STORAGE_KEY_DAILY_COMPLETED, dailyTasksCompleted.toString());
  }, [totalSecondsSpent, lifetimeTasksCompleted, dailyTasksCompleted]);

  // Accurate Timer logic
  const tick = useCallback(() => {
    const now = Date.now();
    
    setTasks(currentTasks => {
      let newlyFinishedCount = 0;
      let anyStillRunning = false;
      let shouldPlaySound = false;

      const nextTasks = currentTasks.map(task => {
        if (!task.isRunning || task.completed || !task.timerEndTime) return task;

        const msRemaining = task.timerEndTime - now;
        const secondsRemaining = Math.max(0, Math.ceil(msRemaining / 1000));

        if (secondsRemaining <= 0) {
          newlyFinishedCount++;
          shouldPlaySound = true;
          return { ...task, remainingSeconds: 0, isRunning: false, completed: true, timerEndTime: undefined };
        }

        anyStillRunning = true;
        return { ...task, remainingSeconds: secondsRemaining };
      });

      // Handle sound and haptics
      if (shouldPlaySound) {
        playCompletionSound();
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        setLifetimeTasksCompleted(prev => prev + newlyFinishedCount);
        setDailyTasksCompleted(prev => prev + newlyFinishedCount);
      }

      // Track seconds spent (only if actually running)
      if (anyStillRunning || newlyFinishedCount > 0) {
        const deltaSeconds = Math.round((now - lastTickRef.current) / 1000);
        if (deltaSeconds > 0) {
          setTotalSecondsSpent(prev => prev + deltaSeconds);
        }
      }

      if (!anyStillRunning) {
        stopBackgroundKeepAlive();
      }

      lastTickRef.current = now;
      return nextTasks;
    });
  }, []);

  // Primary Heartbeat
  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Watch for visibility changes (Phone Unlocked) to force immediate sync
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastTickRef.current = Date.now();
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [tick]);

  const addTask = (title: string, hours: number, minutes: number, seconds: number) => {
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const hasDuration = totalSeconds > 0;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: Date.now(),
      duration: hasDuration ? totalSeconds / 60 : undefined,
      remainingSeconds: hasDuration ? totalSeconds : undefined,
      isRunning: false,
      streak: 0,
    };

    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        if (nextCompleted) {
          setLifetimeTasksCompleted(count => count + 1);
          setDailyTasksCompleted(count => count + 1);
          playCompletionSound();
        }
        return { 
          ...task, 
          completed: nextCompleted, 
          isRunning: false,
          timerEndTime: undefined 
        };
      }
      return task;
    }));
  };

  const toggleTimer = (id: string) => {
    setTasks(prev => {
      const isStart = !prev.find(t => t.id === id)?.isRunning;
      
      if (isStart) {
        startBackgroundKeepAlive();
        lastTickRef.current = Date.now();
      }

      const nextTasks = prev.map(task => {
        if (task.id === id && !task.completed) {
          const nextRunning = !task.isRunning;
          const endTime = nextRunning 
            ? Date.now() + (task.remainingSeconds || 0) * 1000 
            : undefined;
          
          return { ...task, isRunning: nextRunning, timerEndTime: endTime };
        }
        return task;
      });

      // If no tasks are running after toggle, kill keep-alive
      if (!nextTasks.some(t => t.isRunning)) {
        stopBackgroundKeepAlive();
      }

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
    setDailyTasksCompleted(0);
    setTasks(prev => {
      stopBackgroundKeepAlive();
      return prev.map(task => {
        let newStreak = task.streak || 0;
        if (daysPassed === 1 && task.completed) {
          newStreak += 1;
        } else {
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
    });
  }, []);

  const exportData = () => {
    const data = {
      tasks,
      totalSecondsSpent,
      lifetimeTasksCompleted,
      dailyTasksCompleted,
      achievements: JSON.parse(localStorage.getItem('focusflow_achievements') || '{}'),
      user: JSON.parse(localStorage.getItem('focusflow_user') || '{"name":"Explorer"}'),
      version: '1.2'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${new Date().toLocaleDateString('en-CA')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks) {
          setTasks(data.tasks);
          setTotalSecondsSpent(data.totalSecondsSpent || 0);
          setLifetimeTasksCompleted(data.lifetimeTasksCompleted || 0);
          setDailyTasksCompleted(data.dailyTasksCompleted || 0);
          localStorage.setItem('focusflow_achievements', JSON.stringify(data.achievements || {}));
          localStorage.setItem('focusflow_user', JSON.stringify(data.user || { name: 'Explorer' }));
          alert('Data restored successfully!');
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return { 
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
  };
}
