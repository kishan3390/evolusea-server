import { EventBase } from '../../../../../event-emitter';

export interface VisionBoardCreatedEventPayload {
  userProfileId: string;
  visionBoardId: string;
}

export class VisionBoardCreatedEvent extends EventBase<VisionBoardCreatedEventPayload> {}
