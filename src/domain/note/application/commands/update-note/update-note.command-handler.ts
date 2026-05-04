import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { Note, NoteRepository } from '../../../domain';
import { UpdateNoteCommand } from './update-note.command';
import { NoteUpdatedEvent } from '@domain/note/application';
import { TransactionManager } from '@building-blocks/infrastructure';
import { EventEmitter } from '../../../../../event-emitter';

@Injectable()
export class UpdateNoteCommandHandler
  implements CommandHandler<UpdateNoteCommand, Note>
{
  constructor(
    private readonly noteRepository: NoteRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventEmitter: EventEmitter,
  ) {}

  async handle(command: UpdateNoteCommand): Promise<Note> {
    const note = await this.noteRepository.findOneBy({
      id: command.noteId,
      userProfileId: command.userProfileId,
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    note.setTitle(command.title).setDescription(command.description);

    if (command.mood !== undefined) {
      note.setMood(command.mood);
    }

    if (command.anonymousSharingEnabled) {
      note.enableAnonymousSharing();
    } else {
      note.disableAnonymousSharing();
    }

    await this.transactionManager.execute(async (tx) => {
      await this.noteRepository.update(note, tx);
      this.eventEmitter.emit(
        new NoteUpdatedEvent({
          userProfileId: command.userProfileId,
          noteId: note.getId(),
        }),
      );
    });

    return note;
  }
}
