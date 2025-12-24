
import { Task, UserProfile } from '../types';

export const PROGRESSION_CONFIG = {
  XP_PER_SIMPLE_TASK: 5,
  XP_PER_MINUTE: 1,
};

/**
 * Calculates how much XP a task is worth upon completion.
 */
export const calculateXPGain = (task: Task): number => {
  if (task.duration) {
    // 1 XP per minute spent
    return Math.round(task.duration * PROGRESSION_CONFIG.XP_PER_MINUTE);
  }
  return PROGRESSION_CONFIG.XP_PER_SIMPLE_TASK;
};

/**
 * Calculates the XP required to reach the next level from the current level.
 */
export const getXPToNextLevel = (level: number): number => {
  if (level < 10) {
    const earlyLevels = [60, 78, 97, 115, 133, 152, 170, 188, 207];
    return earlyLevels[level - 1] || 207;
  }
  
  return Math.floor(207 * Math.pow(1.1, level - 9));
};

/**
 * Processes incoming XP and handles leveling up.
 */
export const processLeveling = (
  currentLevel: number,
  currentXP: number,
  xpGained: number
): { level: number; xp: number; leveledUp: boolean } => {
  let newXP = currentXP + xpGained;
  let newLevel = currentLevel;
  let leveledUp = false;

  let xpRequired = getXPToNextLevel(newLevel);

  while (newXP >= xpRequired) {
    newXP -= xpRequired;
    newLevel++;
    leveledUp = true;
    xpRequired = getXPToNextLevel(newLevel);
  }

  return { level: newLevel, xp: newXP, leveledUp };
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
