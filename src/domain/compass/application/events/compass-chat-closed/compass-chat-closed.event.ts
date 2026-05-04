import { EventBase } from '../../../../../event-emitter';

export interface CompassChatClosedEventPayload {
  userProfileId: string;
  compassChatId: string;
}

export class CompassChatClosedEvent extends EventBase<CompassChatClosedEventPayload> {}
