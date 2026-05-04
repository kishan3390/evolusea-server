import { DailyEngagement } from '../daily-engagement';
import { Transaction } from '@building-blocks/infrastructure';

export abstract class DailyEngagementRepository {
  abstract upsert(entity: DailyEngagement, tx?: Transaction): Promise<void>;
  abstract findAllDatesByUserProfileId(
    userProfileId: string,
  ): Promise<string[]>;
}
