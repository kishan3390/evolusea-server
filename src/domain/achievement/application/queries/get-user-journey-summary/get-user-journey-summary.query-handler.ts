import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import {
  GetUserJourneySummaryQuery,
  JourneySummaryResult,
} from './get-user-journey-summary.query';
import {
  DailyEngagementRepository,
  calculateStreak,
  STREAK_MILESTONES,
} from '../../../domain';
import { DateHelpers } from '../../../../../lib/date/date-helpers';

@Injectable()
export class GetUserJourneySummaryQueryHandler
  implements QueryHandler<GetUserJourneySummaryQuery, JourneySummaryResult>
{
  constructor(
    private readonly dailyEngagementRepository: DailyEngagementRepository,
  ) {}

  async handle(
    query: GetUserJourneySummaryQuery,
  ): Promise<JourneySummaryResult> {
    const dates =
      await this.dailyEngagementRepository.findAllDatesByUserProfileId(
        query.userProfileId,
      );

    const today = DateHelpers.getBangkokCurrentDateString();
    const streak = calculateStreak(dates, today);

    // Find the next streak milestone the user hasn't reached yet
    const sortedMilestones = [...STREAK_MILESTONES].sort(
      (a, b) => a.threshold - b.threshold,
    );

    let nextMilestone: JourneySummaryResult['nextMilestone'] = null;
    let latestUnlockedMilestone: JourneySummaryResult['latestUnlockedMilestone'] =
      null;

    for (const milestone of sortedMilestones) {
      if (streak.bestStreak >= milestone.threshold) {
        latestUnlockedMilestone = {
          id: milestone.id,
          nameKey: milestone.nameKey,
          threshold: milestone.threshold,
        };
      } else if (!nextMilestone) {
        nextMilestone = {
          id: milestone.id,
          nameKey: milestone.nameKey,
          threshold: milestone.threshold,
          remaining: milestone.threshold - streak.currentStreak,
        };
      }
    }

    return {
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      totalDays: streak.totalDays,
      nextMilestone,
      latestUnlockedMilestone,
    };
  }
}
