import {
  NoteUpdatedEvent,
  NoteUpdatedEventPayload,
} from './note-updated.event';
import { EventEmitter } from '../../../../../event-emitter';
import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../../../event-emitter/event-handler';
import { SummarizeNoteCommandHandler } from '@domain/note/application';

@Injectable()
export class NoteUpdatedEventHandler extends EventHandler<NoteUpdatedEvent> {
  event = NoteUpdatedEvent;

  constructor(
    eventEmitter: EventEmitter,
    private readonly summarizeNoteCommandHandler: SummarizeNoteCommandHandler,
  ) {
    super(eventEmitter);
  }

  async handle(payload: NoteUpdatedEventPayload): Promise<void> {
    await this.summarizeNoteCommandHandler.handle(payload);
  }
}
