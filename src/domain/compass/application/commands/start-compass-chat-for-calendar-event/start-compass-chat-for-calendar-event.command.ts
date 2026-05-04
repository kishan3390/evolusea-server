import { AiProviders, AiReasoning } from '../../../../../ai';
import { CompassIntentions } from '@domain/compass/domain';

export interface StartCompassChatForCalendarEventCommand {
  userProfileId: string;
  accountId: string;
  intention: CompassIntentions;
  date: string;
  developerOptions?: StartCompassChatForCalendarEventCommandDeveloperOptions;
}

export interface StartCompassChatForCalendarEventCommandDeveloperOptions {
  model?: string;
  provider?: AiProviders;
  reasoning?: AiReasoning;
  compassContextPromptOverride?: string;
  compassWelcomePromptOverride?: string;
}
