import { CompassPersonalities, Goals } from '@domain/compass/domain';

export interface CreateCompassConfigCommand {
  userProfileId: string;
  goal: Goals;
  personality: CompassPersonalities;
}
