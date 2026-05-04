import { JourneySummaryResult } from '../../../domain/achievement/application';

export class MilestoneDto {
  id: string;
  nameKey: string;
  threshold: number;
  remaining?: number;
}

export class JourneySummaryDto {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  nextMilestone: MilestoneDto | null;
  latestUnlockedMilestone: MilestoneDto | null;

  static fromResult(result: JourneySummaryResult): JourneySummaryDto {
    return {
      currentStreak: result.currentStreak,
      bestStreak: result.bestStreak,
      totalDays: result.totalDays,
      nextMilestone: result.nextMilestone
        ? {
            id: result.nextMilestone.id,
            nameKey: result.nextMilestone.nameKey,
            threshold: result.nextMilestone.threshold,
            remaining: result.nextMilestone.remaining,
          }
        : null,
      latestUnlockedMilestone: result.latestUnlockedMilestone
        ? {
            id: result.latestUnlockedMilestone.id,
            nameKey: result.latestUnlockedMilestone.nameKey,
            threshold: result.latestUnlockedMilestone.threshold,
          }
        : null,
    };
  }
}
