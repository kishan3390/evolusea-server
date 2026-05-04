import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../../../event-emitter/event-handler';
import { EventEmitter } from '../../../../../event-emitter';
import {
  CompassChatClosedEvent,
  CompassChatClosedEventPayload,
} from '../../../../compass/application/events/compass-chat-closed/compass-chat-closed.event';
import { RecordDailyEngagementCommandHandler } from '../../commands/record-daily-engagement/record-daily-engagement.command-handler';

@Injectable()
export class OnCompassChatClosedRecordEngagementHandler extends EventHandler<CompassChatClosedEvent> {
  event = CompassChatClosedEvent;

  constructor(
    eventEmitter: EventEmitter,
    private readonly recordDailyEngagementHandler: RecordDailyEngagementCommandHandler,
  ) {
    super(eventEmitter);
  }

  async handle(payload: CompassChatClosedEventPayload): Promise<void> {
    await this.recordDailyEngagementHandler.handle({
      userProfileId: payload.userProfileId,
    });
  }
}
