import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { NoteSummaryRepository } from '../../../domain';
import { GetNoteSummaryQuery } from './get-note-summary.query';
import { NoteSummary } from '@domain/note/domain/note-summary';

@Injectable()
export class GetNoteSummaryQueryHandler
  implements QueryHandler<GetNoteSummaryQuery, NoteSummary>
{
  constructor(private readonly noteSummaryRepository: NoteSummaryRepository) {}

  async handle(query: GetNoteSummaryQuery): Promise<NoteSummary | null> {
    return this.noteSummaryRepository.findOneBy({
      noteId: query.noteId,
    });
  }
}
