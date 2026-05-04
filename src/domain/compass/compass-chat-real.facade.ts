import { Injectable } from '@nestjs/common';
import {
  CloseCompassChatCommand,
  CloseCompassChatCommandHandler,
  GetCompassChatsQuotaQuery,
  GetCompassChatsQuotaQueryHandler,
  GetCompassChatQuery,
  GetCompassChatQueryHandler,
  GetCompassChatStartOptionsQuery,
  GetCompassChatStartOptionsQueryHandler,
  ListCompassChatsQuery,
  ListCompassChatsQueryHandler,
  ListCompassChatsSummariesQuery,
  ListCompassChatsSummariesQueryHandler,
  StartCompassChatForCalendarEventCommand,
  StartCompassChatForCalendarEventCommandHandler,
  StartCompassChatForOpenQuestionCommand,
  StartCompassChatForOpenQuestionCommandHandler,
  StartCompassChatForPathItemCommand,
  StartCompassChatForPathItemCommandHandler,
  StartCompassChatForPersonalNoteCommand,
  StartCompassChatForPersonalNoteCommandHandler,
  StartCompassChatForQuoteCommand,
  StartCompassChatForQuoteCommandHandler,
  GetCompassChatsQuotaQueryResult,
} from '@domain/compass/application';
import { CompassChat } from '@domain/compass/domain/compass-chat';
import { PaginatedList } from '@building-blocks/application';
import { CompassChatMessage } from '@domain/compass/domain';
import { CompassChatStartOptions } from '@domain/compass/domain/compass-chat-start-options';
import { CompassChatSummary } from '@domain/compass/domain/compass-chat-summary';
import { CompassChatFacade } from '@domain/compass/compass-chat.facade';

@Injectable()
export class CompassChatRealFacade implements CompassChatFacade {
  constructor(
    private readonly startCompassChatForOpenQuestionCommandHandler: StartCompassChatForOpenQuestionCommandHandler,
    private readonly startCompassChatForPersonalNoteCommandHandler: StartCompassChatForPersonalNoteCommandHandler,
    private readonly startCompassChatForPathItemCommandHandler: StartCompassChatForPathItemCommandHandler,
    private readonly startCompassChatForCalendarEventCommandHandler: StartCompassChatForCalendarEventCommandHandler,
    private readonly startCompassChatForQuoteCommandHandler: StartCompassChatForQuoteCommandHandler,
    private readonly closeCompassChatCommandHandler: CloseCompassChatCommandHandler,
    private readonly listCompassChatsQueryHandler: ListCompassChatsQueryHandler,
    private readonly listCompassChatsSummariesQueryHandler: ListCompassChatsSummariesQueryHandler,
    private readonly getCompassChatQueryHandler: GetCompassChatQueryHandler,
    private readonly getCompassChatStartOptionsQueryHandler: GetCompassChatStartOptionsQueryHandler,
    private readonly getCompassChatsQuotaQueryHandler: GetCompassChatsQuotaQueryHandler,
  ) {}

  async startCompassChatForOpenQuestion(
    command: StartCompassChatForOpenQuestionCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    const compassChat =
      await this.startCompassChatForOpenQuestionCommandHandler.handle(command);
    return this.getCompassChatQueryHandler.handle({
      compassChatId: compassChat.getId(),
      userProfileId: command.userProfileId,
      includeMessages: true,
    });
  }

  async startCompassChatForPersonalNote(
    command: StartCompassChatForPersonalNoteCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    const compassChat =
      await this.startCompassChatForPersonalNoteCommandHandler.handle(command);
    return this.getCompassChatQueryHandler.handle({
      compassChatId: compassChat.getId(),
      userProfileId: command.userProfileId,
      includeMessages: true,
    });
  }

  async startCompassChatForPathItem(
    command: StartCompassChatForPathItemCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    const compassChat =
      await this.startCompassChatForPathItemCommandHandler.handle(command);
    return this.getCompassChatQueryHandler.handle({
      compassChatId: compassChat.getId(),
      userProfileId: command.userProfileId,
      includeMessages: true,
    });
  }

  async startCompassChatForCalendarEvent(
    command: StartCompassChatForCalendarEventCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    const compassChat =
      await this.startCompassChatForCalendarEventCommandHandler.handle(command);
    return this.getCompassChatQueryHandler.handle({
      compassChatId: compassChat.getId(),
      userProfileId: command.userProfileId,
      includeMessages: true,
    });
  }

  async startCompassChatForQuote(
    command: StartCompassChatForQuoteCommand,
  ): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    const compassChat =
      await this.startCompassChatForQuoteCommandHandler.handle(command);
    return this.getCompassChatQueryHandler.handle({
      compassChatId: compassChat.getId(),
      userProfileId: command.userProfileId,
      includeMessages: true,
    });
  }

  async closeCompassChat(command: CloseCompassChatCommand): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    await this.closeCompassChatCommandHandler.handle(command);
    return this.getCompassChatQueryHandler.handle({
      compassChatId: command.compassChatId,
      userProfileId: command.userProfileId,
      includeMessages: true,
    });
  }

  async listCompassChats(
    query: ListCompassChatsQuery,
  ): Promise<PaginatedList<CompassChat>> {
    return this.listCompassChatsQueryHandler.handle(query);
  }

  async getCompassChatsQuota(
    query: GetCompassChatsQuotaQuery,
  ): Promise<GetCompassChatsQuotaQueryResult> {
    return this.getCompassChatsQuotaQueryHandler.handle(query);
  }

  async listCompassChatsSummaries(
    query: ListCompassChatsSummariesQuery,
  ): Promise<PaginatedList<CompassChatSummary>> {
    return this.listCompassChatsSummariesQueryHandler.handle(query);
  }

  async getCompassChat(query: GetCompassChatQuery): Promise<{
    compassChat: CompassChat;
    compassChatMessages: CompassChatMessage[];
  }> {
    return this.getCompassChatQueryHandler.handle(query);
  }

  async getCompassChatStartOptions(
    query: GetCompassChatStartOptionsQuery,
  ): Promise<CompassChatStartOptions> {
    return this.getCompassChatStartOptionsQueryHandler.handle(query);
  }
}
