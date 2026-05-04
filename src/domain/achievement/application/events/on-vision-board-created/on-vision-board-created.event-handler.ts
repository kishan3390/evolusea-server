import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../../../event-emitter/event-handler';
import { EventEmitter } from '../../../../../event-emitter';
import {
  VisionBoardCreatedEvent,
  VisionBoardCreatedEventPayload,
} from '../../../../vision-board/application/events/vision-board-created/vision-board-created.event';
import { RecordDailyEngagementCommandHandler } from '../../commands/record-daily-engagement/record-daily-engagement.command-handler';

@Injectable()
export class OnVisionBoardCreatedRecordEngagementHandler extends EventHandler<VisionBoardCreatedEvent> {
  event = VisionBoardCreatedEvent;

  constructor(
    eventEmitter: EventEmitter,
    private readonly recordDailyEngagementHandler: RecordDailyEngagementCommandHandler,
  ) {
    super(eventEmitter);
  }

  async handle(payload: VisionBoardCreatedEventPayload): Promise<void> {
    await this.recordDailyEngagementHandler.handle({
      userProfileId: payload.userProfileId,
    });
  }
}
