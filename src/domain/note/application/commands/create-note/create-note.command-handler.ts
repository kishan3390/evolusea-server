import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { CreateNoteCommand } from './create-note.command';
import { Note, NoteRepository } from '../../../domain';
import { EntityIdGenerator } from '@building-blocks/domain';
import { TransactionManager } from '@building-blocks/infrastructure';
import { EventEmitter } from '../../../../../event-emitter';
import { NoteCreatedEvent } from '@domain/note/application';

@Injectable()
export class CreateNoteCommandHandler
  implements CommandHandler<CreateNoteCommand, Note>
{
  constructor(
    private readonly noteRepository: NoteRepository,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly transactionManager: TransactionManager,
    private readonly eventEmitter: EventEmitter,
  ) {}

  async handle(command: CreateNoteCommand): Promise<Note> {
    const note = Note.create({
      title: command.title,
      description: command.description,
      mood: command.mood,
      userProfileId: command.userProfileId,
      anonymousSharingEnabled: command.anonymousSharingEnabled,
      entityIdGenerator: this.entityIdGenerator,
    });

    await this.transactionManager.execute(async (tx) => {
      await this.noteRepository.create(note, tx);
      this.eventEmitter.emit(
        new NoteCreatedEvent({
          userProfileId: command.userProfileId,
          noteId: note.getId(),
        }),
      );
    });

    return note;
  }
}
