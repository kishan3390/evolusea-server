import {
  NoteCreatedEvent,
  NoteCreatedEventPayload,
} from './note-created.event';
import { EventEmitter } from '../../../../../event-emitter';
import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../../../event-emitter/event-handler';
import { SummarizeNoteCommandHandler } from '@domain/note/application';

@Injectable()
export class NoteCreatedEventHandler extends EventHandler<NoteCreatedEvent> {
  event = NoteCreatedEvent;

  constructor(
    eventEmitter: EventEmitter,
    private readonly summarizeNoteCommandHandler: SummarizeNoteCommandHandler,
  ) {
    super(eventEmitter);
  }

  async handle(payload: NoteCreatedEventPayload): Promise<void> {
    await this.summarizeNoteCommandHandler.handle(payload);
  }
}
