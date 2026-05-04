import { Transaction } from '@building-blocks/infrastructure';
import { NoteSummary } from '@domain/note/domain/note-summary';
import { PaginatedList, Pagination } from '@building-blocks/application';

export interface FindNoteSummaryByParams {
  noteId: string;
}

export interface NoteSummaryFilters {
  userProfileId: string;
}

export abstract class NoteSummaryRepository {
  abstract create(entity: NoteSummary, tx?: Transaction): Promise<void>;
  abstract list(
    filters: NoteSummaryFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<NoteSummary>>;
  abstract findOneBy(
    params: FindNoteSummaryByParams,
  ): Promise<NoteSummary | null>;
  abstract update(entity: NoteSummary, tx?: Transaction): Promise<void>;
  abstract upsertByNoteId(entity: NoteSummary, tx?: Transaction): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
