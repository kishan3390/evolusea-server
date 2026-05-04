import { EventBase } from '../../../../../event-emitter';

export interface NoteCreatedEventPayload {
  userProfileId: string;
  noteId: string;
}

export class NoteCreatedEvent extends EventBase<NoteCreatedEventPayload> {}
