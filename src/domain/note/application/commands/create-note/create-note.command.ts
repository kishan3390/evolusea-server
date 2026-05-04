import { Moods } from '../../../domain/enums';

export interface CreateNoteCommand {
  userProfileId: string;
  title: string;
  description: string | null;
  mood?: Moods | null;
  anonymousSharingEnabled: boolean;
}
