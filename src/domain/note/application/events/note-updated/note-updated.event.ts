import { EventBase } from '../../../../../event-emitter';

export interface NoteUpdatedEventPayload {
  userProfileId: string;
  noteId: string;
}

export class NoteUpdatedEvent extends EventBase<NoteUpdatedEventPayload> {}
