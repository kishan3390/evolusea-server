import { AiProviders, AiReasoning } from '../../../../../ai';
import { CompassIntentions } from '@domain/compass/domain';

export interface StartCompassChatForPersonalNoteCommand {
  userProfileId: string;
  accountId: string;
  intention: CompassIntentions;
  noteId: string;
  developerOptions?: StartCompassChatForPersonalNoteCommandDeveloperOptions;
}

export interface StartCompassChatForPersonalNoteCommandDeveloperOptions {
  model?: string;
  provider?: AiProviders;
  reasoning?: AiReasoning;
  compassContextPromptOverride?: string;
  compassWelcomePromptOverride?: string;
}
