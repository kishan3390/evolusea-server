import { UserProfile } from '@domain/user-profile/domain';
import { PromptQuery } from '../../prompt.query';
import { CompassChat, CompassConfig } from '@domain/compass/domain';

export interface GetCompassWelcomePromptQueryData {
  userProfile: UserProfile;
  compassConfig: CompassConfig;
  compassChat: CompassChat;
}

export type GetCompassWelcomePromptQuery =
  PromptQuery<GetCompassWelcomePromptQueryData>;
