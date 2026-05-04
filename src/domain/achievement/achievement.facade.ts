import { Injectable } from '@nestjs/common';
import {
  RecordDailyEngagementCommand,
  RecordDailyEngagementCommandHandler,
  GetUserJourneySummaryQuery,
  GetUserJourneySummaryQueryHandler,
  JourneySummaryResult,
  GetUserAchievementsQuery,
  GetUserAchievementsQueryHandler,
  UserAchievementsResult,
} from './application';

@Injectable()
export class AchievementFacade {
  constructor(
    private readonly recordDailyEngagementHandler: RecordDailyEngagementCommandHandler,
    private readonly getUserJourneySummaryHandler: GetUserJourneySummaryQueryHandler,
    private readonly getUserAchievementsHandler: GetUserAchievementsQueryHandler,
  ) {}

  async recordDailyEngagement(
    command: RecordDailyEngagementCommand,
  ): Promise<void> {
    return this.recordDailyEngagementHandler.handle(command);
  }

  async getUserJourneySummary(
    query: GetUserJourneySummaryQuery,
  ): Promise<JourneySummaryResult> {
    return this.getUserJourneySummaryHandler.handle(query);
  }

  async getUserAchievements(
    query: GetUserAchievementsQuery,
  ): Promise<UserAchievementsResult> {
    return this.getUserAchievementsHandler.handle(query);
  }
}
