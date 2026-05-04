import { AiProviders, AiReasoning } from '../../../../../ai';

export interface SendCompassChatMessageCommand {
  userProfileId: string;
  compassChatId: string;
  content: string;
  hasPremiumEntitlement?: boolean;
  developerOptions?: SendCompassChatMessageCommandDeveloperOptions;
}

export interface SendCompassChatMessageCommandDeveloperOptions {
  model?: string;
  provider?: AiProviders;
  reasoning?: AiReasoning;
  compassConversationOverride?: string;
}
