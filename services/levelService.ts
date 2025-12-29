import { Task, UserProfile } from '../types';

export const PROGRESSION_CONFIG = {
  XP_PER_SIMPLE_TASK: 5,
  XP_PER_MINUTE: 1,
};

/**
 * Calculates how much XP a task is worth upon completion.
 * Includes a streak multiplier: exp_earned * (1 + current_streak_of_task / 100)
 * Each streak point provides a 1% bonus.
 */
export const calculateXPGain = (task: Task): number => {
  const duration = Number(task.duration);
  const baseXP = !isNaN(duration) && duration > 0
    ? Math.round(duration * PROGRESSION_CONFIG.XP_PER_MINUTE)
    : PROGRESSION_CONFIG.XP_PER_SIMPLE_TASK;

  const streak = Number(task.streak) || 0;
  // Change multiplier from 0.5% (0.5/100) to 1.0% (1.0/100)
  const streakMultiplier = 1 + (streak * 1.0) / 100;
  
  const totalGain = Math.round(baseXP * streakMultiplier);
  return isNaN(totalGain) ? PROGRESSION_CONFIG.XP_PER_SIMPLE_TASK : Math.max(1, totalGain);
};

/**
 * Calculates the XP required to reach the next level from the current level.
 * Guarantees a return value of at least 1 to prevent infinite loops.
 */
export const getXPToNextLevel = (level: number): number => {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  
  let required: number;
  if (safeLevel < 10) {
    const earlyLevels = [60, 78, 97, 115, 133, 152, 170, 188, 207];
    required = earlyLevels[safeLevel - 1] || 207;
  } else {
    required = Math.floor(207 * Math.pow(1.1, safeLevel - 9));
  }
  
  // Safety floor: Never return 0 or NaN
  return isNaN(required) || required < 1 ? 60 : required;
};

/**
 * Processes incoming XP and handles leveling up.
 */
export const processLeveling = (
  currentLevel: number,
  currentXP: number,
  xpGained: number
): { level: number; xp: number; leveledUp: boolean } => {
  // Sanitize inputs
  let newLevel = Math.max(1, Math.floor(Number(currentLevel) || 1));
  let newXP = Math.max(0, Number(currentXP) || 0) + (Number(xpGained) || 0);
  let leveledUp = false;

  // Level up loop
  let xpRequired = getXPToNextLevel(newLevel);
  
  // Secondary safety check for loop termination
  let loopGuard = 0;
  const MAX_LEVEL_UPS_PER_TASK = 100;

  while (newXP >= xpRequired && loopGuard < MAX_LEVEL_UPS_PER_TASK) {
    newXP -= xpRequired;
    newLevel++;
    leveledUp = true;
    xpRequired = getXPToNextLevel(newLevel);
    loopGuard++;
  }

  return { 
    level: newLevel, 
    xp: isNaN(newXP) ? 0 : newXP, 
    leveledUp 
  };
};

/**
 * High-level orchestration for updating a user profile with new task completion data.
 */
export const updateProfileOnCompletion = (
  user: UserProfile,
  task: Task
): { user: UserProfile; leveledUp: boolean } => {
  const xpGained = calculateXPGain(task);
  const result = processLeveling(user.level, user.xp, xpGained);
  
  return {
    user: {
      ...user,
      level: result.level,
      xp: result.xp
    },
    leveledUp: result.leveledUp
  };
};