import { Injectable } from '@nestjs/common';
import { PaginatedList, QueryHandler } from '@building-blocks/application';
import { Note, NoteRepository } from '../../../domain';
import { ListNotesQuery } from './list-notes.query';

@Injectable()
export class ListNotesQueryHandler
  implements QueryHandler<ListNotesQuery, PaginatedList<Note>>
{
  constructor(private readonly noteRepository: NoteRepository) {}

  async handle(query: ListNotesQuery): Promise<PaginatedList<Note>> {
    return this.noteRepository.list(
      {
        userProfileId: query.userProfileId,
        createdFrom: query.createdFrom,
        createdTo: query.createdTo,
      },
      query.pagination,
    );
  }
}
