import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../../../event-emitter/event-handler';
import { EventEmitter } from '../../../../../event-emitter';
import {
  NoteCreatedEvent,
  NoteCreatedEventPayload,
} from '../../../../note/application/events/note-created/note-created.event';
import { RecordDailyEngagementCommandHandler } from '../../commands/record-daily-engagement/record-daily-engagement.command-handler';

@Injectable()
export class OnNoteCreatedRecordEngagementHandler extends EventHandler<NoteCreatedEvent> {
  event = NoteCreatedEvent;

  constructor(
    eventEmitter: EventEmitter,
    private readonly recordDailyEngagementHandler: RecordDailyEngagementCommandHandler,
  ) {
    super(eventEmitter);
  }

  async handle(payload: NoteCreatedEventPayload): Promise<void> {
    await this.recordDailyEngagementHandler.handle({
      userProfileId: payload.userProfileId,
    });
  }
}
