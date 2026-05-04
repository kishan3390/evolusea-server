import { Injectable } from '@nestjs/common';
import {
  PaginatedList,
  QueryHandler,
} from '@building-blocks/application';
import { NoteSummaryRepository } from '../../../domain';
import { ListNotesSummariesQuery } from './list-notes-summaries.query';
import { NoteSummary } from '@domain/note/domain/note-summary';

@Injectable()
export class ListNotesSummariesQueryHandler
  implements QueryHandler<ListNotesSummariesQuery, PaginatedList<NoteSummary>>
{
  constructor(private readonly noteSummaryRepository: NoteSummaryRepository) {}

  async handle(query: ListNotesSummariesQuery): Promise<PaginatedList<NoteSummary>> {
    return this.noteSummaryRepository.list(
      { userProfileId: query.userProfileId },
      query.pagination,
    );
  }
}
