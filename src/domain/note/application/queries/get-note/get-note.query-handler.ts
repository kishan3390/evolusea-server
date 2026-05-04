import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { Note, NoteRepository } from '../../../domain';
import { GetNoteQuery } from './get-note.query';

@Injectable()
export class GetNoteQueryHandler implements QueryHandler<GetNoteQuery, Note> {
  constructor(private readonly noteRepository: NoteRepository) {}

  async handle(query: GetNoteQuery): Promise<Note | null> {
    return this.noteRepository.findOneBy({
      id: query.id,
      userProfileId: query.userProfileId,
    });
  }
}
