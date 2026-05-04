import { PaginatedList, Pagination } from '@building-blocks/application';
import { Transaction } from '@building-blocks/infrastructure';
import { CompassChatSummary } from '@domain/compass/domain/compass-chat-summary';

export interface FindCompassChatSummaryByParams {
  compassChatId: string;
}

export interface CompassChatSummaryFilters {
  userProfileId: string;
}

export abstract class CompassChatSummaryRepository {
  abstract create(entity: CompassChatSummary, tx?: Transaction): Promise<void>;
  abstract list(
    filters: CompassChatSummaryFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<CompassChatSummary>>;
  abstract findOneBy(
    params: FindCompassChatSummaryByParams,
  ): Promise<CompassChatSummary | null>;
  abstract update(entity: CompassChatSummary, tx?: Transaction): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
