import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../../../event-emitter/event-handler';
import { EventEmitter } from '../../../../../event-emitter';
import {
  MoodCheckinCreatedEvent,
  MoodCheckinCreatedEventPayload,
} from '../../../../mood-checkin/application/events/mood-checkin-created/mood-checkin-created.event';
import { RecordDailyEngagementCommandHandler } from '../../commands/record-daily-engagement/record-daily-engagement.command-handler';

@Injectable()
export class OnMoodCheckinCreatedRecordEngagementHandler extends EventHandler<MoodCheckinCreatedEvent> {
  event = MoodCheckinCreatedEvent;

  constructor(
    eventEmitter: EventEmitter,
    private readonly recordDailyEngagementHandler: RecordDailyEngagementCommandHandler,
  ) {
    super(eventEmitter);
  }

  async handle(payload: MoodCheckinCreatedEventPayload): Promise<void> {
    await this.recordDailyEngagementHandler.handle({
      userProfileId: payload.userProfileId,
    });
  }
}
