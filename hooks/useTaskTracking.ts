
import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';

const STORAGE_KEY_TASKS = 'focusflow_tasks';
const STORAGE_KEY_TOTAL_TIME = 'focusflow_total_time';
const STORAGE_KEY_LIFETIME_COMPLETED = 'focusflow_lifetime_completed';
const STORAGE_KEY_DAILY_COMPLETED = 'focusflow_daily_completed';
const STORAGE_KEY_ACHIEVEMENTS = 'focusflow_achievements';

// Audio Context helper for the completion chime
let audioCtx: AudioContext | null = null;

const playCompletionSound = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // Create a pleasant dual-tone chime (Major Third)
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

    // Play two notes slightly offset for a "chime" effect
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

  // Load tasks, total time, and lifetime completions
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Migration logic: Ensure all fields exist
        setTasks(parsedTasks.map((t: any) => ({ 
          id: t.id || crypto.randomUUID(),
          title: t.title || 'Untitled',
          completed: !!t.completed,
          createdAt: t.createdAt || Date.now(),
          duration: t.duration,
          remainingSeconds: t.remainingSeconds,
          isRunning: false,
          streak: t.streak ?? 0
        })));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }

    const savedTime = localStorage.getItem(STORAGE_KEY_TOTAL_TIME);
    if (savedTime) {
      setTotalSecondsSpent(parseInt(savedTime) || 0);
    }

    const savedCompletions = localStorage.getItem(STORAGE_KEY_LIFETIME_COMPLETED);
    if (savedCompletions) {
      setLifetimeTasksCompleted(parseInt(savedCompletions) || 0);
    }

    const savedDaily = localStorage.getItem(STORAGE_KEY_DAILY_COMPLETED);
    if (savedDaily) {
      setDailyTasksCompleted(parseInt(savedDaily) || 0);
    }
  }, []);

  // Persist tasks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // Persist total time
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOTAL_TIME, totalSecondsSpent.toString());
  }, [totalSecondsSpent]);

  // Persist lifetime completions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LIFETIME_COMPLETED, lifetimeTasksCompleted.toString());
  }, [lifetimeTasksCompleted]);

  // Persist daily completions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DAILY_COMPLETED, dailyTasksCompleted.toString());
  }, [dailyTasksCompleted]);

  // Timer Heartbeat (1s)
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(currentTasks => {
        let activeInThisTick = 0;
        let newlyFinishedCount = 0;
        let shouldPlaySound = false;
        
        const newTasks = currentTasks.map(task => {
          if (task.isRunning && task.remainingSeconds !== undefined && task.remainingSeconds > 0) {
            activeInThisTick++;
            const nextSeconds = task.remainingSeconds - 1;
            if (nextSeconds === 0) {
              newlyFinishedCount++;
              shouldPlaySound = true;
              return { ...task, remainingSeconds: 0, isRunning: false, completed: true };
            }
            return { ...task, remainingSeconds: nextSeconds };
          }
          return task;
        });

        if (shouldPlaySound) {
          playCompletionSound();
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }

        if (activeInThisTick > 0) {
          setTotalSecondsSpent(prev => prev + activeInThisTick);
        }
        
        if (newlyFinishedCount > 0) {
          setLifetimeTasksCompleted(prev => prev + newlyFinishedCount);
          setDailyTasksCompleted(prev => prev + newlyFinishedCount);
        }

        return newTasks;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
          isRunning: nextCompleted ? false : task.isRunning 
        };
      }
      return task;
    }));
  };

  const toggleTimer = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id && !task.completed) {
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        return { ...task, isRunning: !task.isRunning };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const processNewDay = useCallback((daysPassed: number) => {
    setDailyTasksCompleted(0);
    setTasks(prev => prev.map(task => {
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
        remainingSeconds: task.duration ? Math.round(task.duration * 60) : undefined 
      };
    }));
  }, []);

  const exportData = () => {
    const data = {
      tasks,
      totalSecondsSpent,
      lifetimeTasksCompleted,
      dailyTasksCompleted,
      achievements: JSON.parse(localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS) || '{}'),
      user: JSON.parse(localStorage.getItem('focusflow_user') || '{"name":"Explorer"}'),
      version: '1.1'
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
          localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(data.achievements || {}));
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
