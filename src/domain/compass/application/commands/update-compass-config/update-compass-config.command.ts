import { CompassPersonalities, Goals } from '@domain/compass/domain';

export interface UpdateCompassConfigCommand {
  userProfileId: string;
  goal: Goals;
  personality: CompassPersonalities;
}
