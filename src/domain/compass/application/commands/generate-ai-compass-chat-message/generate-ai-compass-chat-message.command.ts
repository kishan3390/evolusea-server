import { AiProviders, AiReasoning } from '../../../../../ai';
import { CompassChat, CompassChatMessage } from '@domain/compass/domain';

export interface GenerateAiCompassChatMessageCommand {
  userProfileId: string;
  compassChat: CompassChat;
  compassChatMessages: CompassChatMessage[];
  hasPremiumEntitlement?: boolean;
  developerOptions?: GenerateAiCompassChatMessageCommandDeveloperOptions;
}

export interface GenerateAiCompassChatMessageCommandDeveloperOptions {
  model?: string;
  provider?: AiProviders;
  reasoning?: AiReasoning;
  compassConversationOverride?: string;
}
