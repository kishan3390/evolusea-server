import { EventBase } from '../../../../../event-emitter';

export interface PathCreatedEventPayload {
  userProfileId: string;
  pathId: string;
}

export class PathCreatedEvent extends EventBase<PathCreatedEventPayload> {}
