export enum AchievementCategory {
  Streak = 'streak',
  Compass = 'compass',
  Notes = 'notes',
  Paths = 'paths',
  MoodAwareness = 'mood-awareness',
  VisionBoards = 'vision-boards',
  Account = 'account',
}

export interface AchievementDefinition {
  /** Unique identifier, e.g. 'streak-7' */
  id: string;
  category: AchievementCategory;
  /** Localization key for the milestone name */
  nameKey: string;
  /** Number threshold to unlock (days, count, etc.) */
  threshold: number;
}

export const STREAK_MILESTONES: AchievementDefinition[] = [
  { id: 'streak-3', category: AchievementCategory.Streak, nameKey: 'firstSteps', threshold: 3 },
  { id: 'streak-7', category: AchievementCategory.Streak, nameKey: 'weekOfAwareness', threshold: 7 },
  { id: 'streak-14', category: AchievementCategory.Streak, nameKey: 'growingRoots', threshold: 14 },
  { id: 'streak-30', category: AchievementCategory.Streak, nameKey: 'monthOfLight', threshold: 30 },
  { id: 'streak-50', category: AchievementCategory.Streak, nameKey: 'steadyPath', threshold: 50 },
  { id: 'streak-100', category: AchievementCategory.Streak, nameKey: 'centuryOfReflection', threshold: 100 },
  { id: 'streak-200', category: AchievementCategory.Streak, nameKey: 'devotedSeeker', threshold: 200 },
  { id: 'streak-365', category: AchievementCategory.Streak, nameKey: 'yearOfGrowth', threshold: 365 },
];

export const COMPASS_MILESTONES: AchievementDefinition[] = [
  { id: 'compass-1', category: AchievementCategory.Compass, nameKey: 'firstChat', threshold: 1 },
  { id: 'compass-10', category: AchievementCategory.Compass, nameKey: 'tenConversations', threshold: 10 },
  { id: 'compass-25', category: AchievementCategory.Compass, nameKey: 'twentyFiveConversations', threshold: 25 },
  { id: 'compass-50', category: AchievementCategory.Compass, nameKey: 'fiftyConversations', threshold: 50 },
  { id: 'compass-100', category: AchievementCategory.Compass, nameKey: 'hundredConversations', threshold: 100 },
];

export const NOTES_MILESTONES: AchievementDefinition[] = [
  { id: 'notes-1', category: AchievementCategory.Notes, nameKey: 'firstNote', threshold: 1 },
  { id: 'notes-10', category: AchievementCategory.Notes, nameKey: 'tenNotes', threshold: 10 },
  { id: 'notes-25', category: AchievementCategory.Notes, nameKey: 'twentyFiveNotes', threshold: 25 },
  { id: 'notes-50', category: AchievementCategory.Notes, nameKey: 'fiftyNotes', threshold: 50 },
  { id: 'notes-100', category: AchievementCategory.Notes, nameKey: 'hundredNotes', threshold: 100 },
];

export const PATHS_MILESTONES: AchievementDefinition[] = [
  { id: 'paths-1', category: AchievementCategory.Paths, nameKey: 'firstPathCompleted', threshold: 1 },
  { id: 'paths-5', category: AchievementCategory.Paths, nameKey: 'fivePathsCompleted', threshold: 5 },
  { id: 'paths-10', category: AchievementCategory.Paths, nameKey: 'tenPathsCompleted', threshold: 10 },
  { id: 'paths-25', category: AchievementCategory.Paths, nameKey: 'twentyFivePathsCompleted', threshold: 25 },
  { id: 'paths-50', category: AchievementCategory.Paths, nameKey: 'fiftyPathsCompleted', threshold: 50 },
];

export const MOOD_MILESTONES: AchievementDefinition[] = [
  { id: 'mood-1', category: AchievementCategory.MoodAwareness, nameKey: 'firstCheckin', threshold: 1 },
  { id: 'mood-7', category: AchievementCategory.MoodAwareness, nameKey: 'sevenCheckins', threshold: 7 },
  { id: 'mood-30', category: AchievementCategory.MoodAwareness, nameKey: 'thirtyCheckins', threshold: 30 },
  { id: 'mood-100', category: AchievementCategory.MoodAwareness, nameKey: 'hundredCheckins', threshold: 100 },
];

export const VISION_BOARD_MILESTONES: AchievementDefinition[] = [
  { id: 'vision-1', category: AchievementCategory.VisionBoards, nameKey: 'firstVisionBoard', threshold: 1 },
  { id: 'vision-5', category: AchievementCategory.VisionBoards, nameKey: 'fiveVisionBoards', threshold: 5 },
];

export const ACCOUNT_MILESTONES: AchievementDefinition[] = [
  { id: 'account-0', category: AchievementCategory.Account, nameKey: 'beginning', threshold: 0 },
  { id: 'account-30', category: AchievementCategory.Account, nameKey: 'thirtyDaysSinceJoining', threshold: 30 },
  { id: 'account-90', category: AchievementCategory.Account, nameKey: 'ninetyDaysSinceJoining', threshold: 90 },
  { id: 'account-365', category: AchievementCategory.Account, nameKey: 'oneYearAnniversary', threshold: 365 },
];

export const ALL_ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  ...STREAK_MILESTONES,
  ...COMPASS_MILESTONES,
  ...NOTES_MILESTONES,
  ...PATHS_MILESTONES,
  ...MOOD_MILESTONES,
  ...VISION_BOARD_MILESTONES,
  ...ACCOUNT_MILESTONES,
];
