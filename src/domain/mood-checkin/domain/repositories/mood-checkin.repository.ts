import { PaginatedList, Pagination } from '@building-blocks/application';
import { MoodCheckin } from '../mood-checkin';
import { Transaction } from '@building-blocks/infrastructure';

export interface MoodCheckinFilters {
  userProfileId: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export abstract class MoodCheckinRepository {
  abstract create(entity: MoodCheckin, tx?: Transaction): Promise<void>;
  abstract findLatestByUserProfileId(
    userProfileId: string,
  ): Promise<MoodCheckin | null>;
  abstract list(
    filters: MoodCheckinFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<MoodCheckin>>;
}
