import { Moods } from '../../../domain/enums';

export interface UpdateNoteCommand {
  userProfileId: string;
  noteId: string;
  title: string;
  description: string | null;
  mood?: Moods | null;
  anonymousSharingEnabled: boolean;
}
