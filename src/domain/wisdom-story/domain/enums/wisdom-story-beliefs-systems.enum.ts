import { BeliefSystems } from '@domain/user-profile/domain';

export enum WisdomStoryExtraBeliefsSystems {
  // Represents wisdom stories available for all beliefs systems
  General = 'general',
}

export const WisdomStoryBeliefSystems = {
  ...BeliefSystems,
  ...WisdomStoryExtraBeliefsSystems,
} as const;
export type WisdomStoryBeliefSystems =
  (typeof WisdomStoryBeliefSystems)[keyof typeof WisdomStoryBeliefSystems];
