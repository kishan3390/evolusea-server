import { Moods } from '../../../../note/domain/enums';

export interface CreateMoodCheckinCommand {
  userProfileId: string;
  mood: Moods;
}
