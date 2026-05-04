import { UserProfile } from '@domain/user-profile/domain';
import { PromptQuery } from '../../prompt.query';
import { CompassChat, CompassConfig } from '@domain/compass/domain';
import { CompassChatSummary } from '@domain/compass/domain/compass-chat-summary';
import { NoteSummary } from '@domain/note/domain/note-summary';
import { Path } from '@domain/path/domain';

export interface GetChatContextPromptQueryData {
  userProfile: UserProfile;
  compassConfig: CompassConfig;
  compassChat: CompassChat;
  compassChatsSummaries: CompassChatSummary[];
  notesSummaries: NoteSummary[];
  paths: Path[];
}

export type GetCompassContextPromptQuery =
  PromptQuery<GetChatContextPromptQueryData>;
