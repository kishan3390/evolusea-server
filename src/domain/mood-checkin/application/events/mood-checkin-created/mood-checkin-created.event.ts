import { EventBase } from '../../../../../event-emitter';

export interface MoodCheckinCreatedEventPayload {
  userProfileId: string;
  moodCheckinId: string;
}

export class MoodCheckinCreatedEvent extends EventBase<MoodCheckinCreatedEventPayload> {}
