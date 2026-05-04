import { AiProviders, AiReasoning } from '../../../../../ai';
import { CompassIntentions } from '@domain/compass/domain';

export interface StartCompassChatForQuoteCommand {
  userProfileId: string;
  accountId: string;
  intention: CompassIntentions;
  quoteId: string;
  developerOptions?: StartCompassChatForQuoteCommandDeveloperOptions;
}

export interface StartCompassChatForQuoteCommandDeveloperOptions {
  model?: string;
  provider?: AiProviders;
  reasoning?: AiReasoning;
  compassContextPromptOverride?: string;
  compassWelcomePromptOverride?: string;
}
