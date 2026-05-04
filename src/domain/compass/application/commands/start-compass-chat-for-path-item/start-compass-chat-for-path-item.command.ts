import { AiProviders, AiReasoning } from '../../../../../ai';
import { CompassIntentions } from '@domain/compass/domain';

export interface StartCompassChatForPathItemCommand {
  userProfileId: string;
  accountId: string;
  intention: CompassIntentions;
  pathId: string;
  developerOptions?: StartCompassChatForPathItemCommandDeveloperOptions;
}

export interface StartCompassChatForPathItemCommandDeveloperOptions {
  model?: string;
  provider?: AiProviders;
  reasoning?: AiReasoning;
  compassContextPromptOverride?: string;
  compassWelcomePromptOverride?: string;
}
