import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { Note, NoteRepository } from '../../../domain';
import { GetNotesByIdsQuery } from './get-notes-by-ids.query';

@Injectable()
export class GetNotesByIdsQueryHandler
  implements QueryHandler<GetNotesByIdsQuery, Record<string, Note | null>>
{
  constructor(private readonly noteRepository: NoteRepository) {}

  async handle(
    query: GetNotesByIdsQuery,
  ): Promise<Record<string, Note | null>> {
    return this.noteRepository.findManyByProfileAndIds({
      notesIds: query.notesIds,
      userProfileId: query.userProfileId,
    });
  }
}
