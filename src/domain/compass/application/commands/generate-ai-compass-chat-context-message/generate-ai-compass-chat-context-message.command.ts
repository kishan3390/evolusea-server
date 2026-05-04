import { CompassChat, CompassConfig } from '@domain/compass/domain';
import { UserProfile } from '@domain/user-profile/domain';
import { Transaction } from '@building-blocks/infrastructure';
import { AiProviders, AiReasoning } from '../../../../../ai';

export interface GenerateAiCompassChatContextMessageCommand {
  userProfile: UserProfile;
  compassConfig: CompassConfig;
  compassChat: CompassChat;
  developerOptions?: GenerateAiCompassChatContextMessageCommandDeveloperOptions;
  tx?: Transaction;
}

export interface GenerateAiCompassChatContextMessageCommandDeveloperOptions {
  model?: string;
  provider?: AiProviders;
  reasoning?: AiReasoning;
  compassContextPromptOverride?: string;
}
