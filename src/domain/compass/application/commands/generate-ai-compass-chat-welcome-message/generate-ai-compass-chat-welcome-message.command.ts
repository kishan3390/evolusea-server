import { CompassChat, CompassConfig } from '@domain/compass/domain';
import { UserProfile } from '@domain/user-profile/domain';
import { Transaction } from '@building-blocks/infrastructure';
import { AiProviders, AiReasoning } from '../../../../../ai';

export interface GenerateAiCompassChatWelcomeMessageCommand {
  userProfile: UserProfile;
  compassConfig: CompassConfig;
  compassChat: CompassChat;
  developerOptions?: GenerateAiCompassChatWelcomeMessageCommandDeveloperOptions;
  tx?: Transaction;
}

export interface GenerateAiCompassChatWelcomeMessageCommandDeveloperOptions {
  model?: string;
  provider?: AiProviders;
  reasoning?: AiReasoning;
  compassWelcomePromptOverride?: string;
}
