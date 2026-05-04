import { AiProviders, AiReasoning } from '../../../../../ai';
import { CompassIntentions } from '@domain/compass/domain';

export interface StartCompassChatForOpenQuestionCommand {
  userProfileId: string;
  accountId: string;
  intention: CompassIntentions;
  developerOptions?: StartCompassChatCommandDeveloperOptions;
}

export interface StartCompassChatCommandDeveloperOptions {
  model?: string;
  provider?: AiProviders;
  reasoning?: AiReasoning;
  compassContextPromptOverride?: string;
  compassWelcomePromptOverride?: string;
}
