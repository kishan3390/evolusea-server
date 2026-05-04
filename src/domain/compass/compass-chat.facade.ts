import {
  CloseCompassChatCommand,
  GetCompassChatsQuotaQuery,
  GetCompassChatQuery,
  GetCompassChatStartOptionsQuery,
  ListCompassChatsQuery,
  ListCompassChatsSummariesQuery,
  StartCompassChatForCalendarEventCommand,
  StartCompassChatForOpenQuestionCommand,
  StartCompassChatForPathItemCommand,
  StartCompassChatForPersonalNoteCommand,
  StartCompassChatForQuoteCommand,
  GetCompassChatsQuotaQueryResult,
} from '@domain/compass/application';
import { CompassChat, CompassChatMessage } from '@domain/compass/domain';
import { PaginatedList } from '@building-blocks/application';
import { CompassChatSummary } from '@domain/compass/domain/compass-chat-summary';
import { CompassChatStartOptions } from '@domain/compass/domain/compass-chat-start-options';

export abstract class CompassChatFacade {
  abstract startCompassChatForOpenQuestion(
    command: StartCompassChatForOpenQuestionCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }>;

  abstract startCompassChatForPersonalNote(
    command: StartCompassChatForPersonalNoteCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }>;

  abstract startCompassChatForPathItem(
    command: StartCompassChatForPathItemCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }>;

  abstract startCompassChatForCalendarEvent(
    command: StartCompassChatForCalendarEventCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }>;

  abstract startCompassChatForQuote(
    command: StartCompassChatForQuoteCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }>;

  abstract closeCompassChat(command: CloseCompassChatCommand): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }>;

  abstract listCompassChats(
    query: ListCompassChatsQuery,
  ): Promise<PaginatedList<CompassChat>>;

  abstract getCompassChatsQuota(
    query: GetCompassChatsQuotaQuery,
  ): Promise<GetCompassChatsQuotaQueryResult>;

  abstract listCompassChatsSummaries(
    query: ListCompassChatsSummariesQuery,
  ): Promise<PaginatedList<CompassChatSummary>>;

  abstract getCompassChat(query: GetCompassChatQuery): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }>;

  abstract getCompassChatStartOptions(
    query: GetCompassChatStartOptionsQuery,
  ): Promise<CompassChatStartOptions>;
}
