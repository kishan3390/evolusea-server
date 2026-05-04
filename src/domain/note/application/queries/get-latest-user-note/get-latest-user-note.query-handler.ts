import { Injectable } from '@nestjs/common';
import { QueryHandler } from '../../../../../building-blocks/application';
import { Note, NoteRepository } from '../../../domain';
import { GetLatestUserNoteQuery } from './get-latest-user-note.query';

@Injectable()
export class GetLatestUserNoteQueryHandler
  implements QueryHandler<GetLatestUserNoteQuery, Note>
{
  constructor(private readonly noteRepository: NoteRepository) {}

  async handle(query: GetLatestUserNoteQuery): Promise<Note | null> {
    return this.noteRepository.findLatestByUserProfileId(query.userProfileId);
  }
}
