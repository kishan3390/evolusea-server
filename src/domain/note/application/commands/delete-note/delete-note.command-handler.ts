import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { NoteRepository } from '../../../domain/repistories/note.repository';
import { DeleteNoteCommand } from './delete-note.command';

@Injectable()
export class DeleteNoteCommandHandler
  implements CommandHandler<DeleteNoteCommand, void>
{
  constructor(private readonly noteRepository: NoteRepository) {}

  async handle(command: DeleteNoteCommand): Promise<void> {
    const note = await this.noteRepository.findOneBy({
      id: command.noteId,
      userProfileId: command.userProfileId,
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.noteRepository.delete(command.noteId);
  }
}
