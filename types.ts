
export interface Task {
  id: string;
  title: string;
  completed: boolean; // Logical completion (XP awarded, streak counted)
  isChecked: boolean; // Visual completion (Checkmark and strikethrough)
  createdAt: number;
  duration?: number; // Original duration in minutes
  remainingSeconds?: number; // Current remaining time in seconds
  timerEndTime?: number; // The absolute timestamp (ms) when the timer should hit zero
  isRunning?: boolean; // Whether the timer is currently active
  streak: number; // Number of consecutive days completed
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  earnedAt?: number; // Timestamp when earned
}

export interface UserProfile {
  name: string;
  icon?: string; // Emoji or logo identifier
  level: number;
  xp: number;
}

export type ThemeType = 'light' | 'dark';
