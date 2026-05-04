import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../../../event-emitter/event-handler';
import { EventEmitter } from '../../../../../event-emitter';
import {
  PathCreatedEvent,
  PathCreatedEventPayload,
} from '../../../../path/application/events/path-created/path-created.event';
import { RecordDailyEngagementCommandHandler } from '../../commands/record-daily-engagement/record-daily-engagement.command-handler';

@Injectable()
export class OnPathCreatedRecordEngagementHandler extends EventHandler<PathCreatedEvent> {
  event = PathCreatedEvent;

  constructor(
    eventEmitter: EventEmitter,
    private readonly recordDailyEngagementHandler: RecordDailyEngagementCommandHandler,
  ) {
    super(eventEmitter);
  }

  async handle(payload: PathCreatedEventPayload): Promise<void> {
    await this.recordDailyEngagementHandler.handle({
      userProfileId: payload.userProfileId,
    });
  }
}
