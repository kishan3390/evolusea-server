import { AchievementCategory } from '../../../domain';

export interface GetUserAchievementsQuery {
  userProfileId: string;
}

export interface AchievementStatus {
  id: string;
  category: AchievementCategory;
  nameKey: string;
  threshold: number;
  unlocked: boolean;
  currentValue: number;
}

export interface UserAchievementsResult {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  achievements: AchievementStatus[];
  activityCounts: {
    compassChats: number;
    notes: number;
    pathsCompleted: number;
    moodCheckins: number;
    visionBoards: number;
    accountAgeDays: number;
  };
}
