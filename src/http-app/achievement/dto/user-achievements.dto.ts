import {
  UserAchievementsResult,
  AchievementStatus,
} from '../../../domain/achievement/application';

export class AchievementStatusDto {
  id: string;
  category: string;
  nameKey: string;
  threshold: number;
  unlocked: boolean;
  currentValue: number;

  static fromStatus(status: AchievementStatus): AchievementStatusDto {
    return {
      id: status.id,
      category: status.category,
      nameKey: status.nameKey,
      threshold: status.threshold,
      unlocked: status.unlocked,
      currentValue: status.currentValue,
    };
  }
}

export class ActivityCountsDto {
  compassChats: number;
  notes: number;
  pathsCompleted: number;
  moodCheckins: number;
  visionBoards: number;
  accountAgeDays: number;
}

export class UserAchievementsDto {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  achievements: AchievementStatusDto[];
  activityCounts: ActivityCountsDto;

  static fromResult(result: UserAchievementsResult): UserAchievementsDto {
    return {
      currentStreak: result.currentStreak,
      bestStreak: result.bestStreak,
      totalDays: result.totalDays,
      achievements: result.achievements.map(AchievementStatusDto.fromStatus),
      activityCounts: result.activityCounts,
    };
  }
}
