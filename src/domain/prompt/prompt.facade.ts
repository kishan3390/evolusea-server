import { GetCompassWelcomePromptQuery } from '@domain/prompt/application/queries/get-compass-welcome-prompt/get-compass-welcome-prompt.query';
import { GetCompassWelcomePromptQueryHandler } from '@domain/prompt/application/queries/get-compass-welcome-prompt/get-compass-welcome-prompt.query-handler';
import {
  GetCompassChatEncourageClosePromptQuery,
  GetCompassChatEncourageClosePromptQueryHandler,
  GetCompassChatCloseFunctionDescriptionPromptQuery,
  GetCompassChatCloseFunctionDescriptionPromptQueryHandler,
  GetCompassSuggestSaveNoteFunctionDescriptionPromptQuery,
  GetCompassSuggestSaveNoteFunctionDescriptionPromptQueryHandler,
  GetCompassSuggestAddPathFunctionDescriptionPromptQuery,
  GetCompassSuggestAddPathFunctionDescriptionPromptQueryHandler,
  GetCalendarSyncInstructionPromptQuery,
  GetCalendarSyncInstructionPromptQueryHandler,
  GetCompassConversationPromptQuery,
  GetCompassConversationPromptQueryHandler,
  GetCalendarSyncContextPromptQuery,
  GetCalendarSyncContextPromptQueryHandler,
  GetCompassContextPromptQuery,
  GetCompassContextPromptQueryHandler,
} from '@domain/prompt/application';
import { Injectable } from '@nestjs/common';
import {
  GetCompassSummarizePromptQuery,
  GetCompassSummarizePromptQueryHandler,
} from '@domain/prompt/application/queries/get-compass-summarize-prompt';
import {
  GetNoteSummarizePromptQuery,
  GetNoteSummarizePromptQueryHandler,
} from '@domain/prompt/application/queries/get-note-summarize-prompt';

@Injectable()
export class PromptFacade {
  constructor(
    private getCompassWelcomePromptQueryHandler: GetCompassWelcomePromptQueryHandler,
    private getCompassContextPromptQueryHandler: GetCompassContextPromptQueryHandler,
    private getCompassConversationPromptQueryHandler: GetCompassConversationPromptQueryHandler,
    private getCompassSummarizePromptQueryHandler: GetCompassSummarizePromptQueryHandler,
    private getNoteSummarizePromptQueryHandler: GetNoteSummarizePromptQueryHandler,
    private getCompassChatEncourageClosePromptQueryHandler: GetCompassChatEncourageClosePromptQueryHandler,
    private getCompassChatCloseFunctionDescriptionPromptQueryHandler: GetCompassChatCloseFunctionDescriptionPromptQueryHandler,
    private getCompassSuggestSaveNoteFunctionDescriptionPromptQueryHandler: GetCompassSuggestSaveNoteFunctionDescriptionPromptQueryHandler,
    private getCompassSuggestAddPathFunctionDescriptionPromptQueryHandler: GetCompassSuggestAddPathFunctionDescriptionPromptQueryHandler,
    private getCalendarSyncContextPromptQueryHandler: GetCalendarSyncContextPromptQueryHandler,
    private getCalendarSyncInstructionPromptQueryHandler: GetCalendarSyncInstructionPromptQueryHandler,
  ) {}

  getCompassWelcomePrompt(query: GetCompassWelcomePromptQuery): string {
    return this.getCompassWelcomePromptQueryHandler.handle(query);
  }

  getCompassContextPrompt(query: GetCompassContextPromptQuery): string {
    return this.getCompassContextPromptQueryHandler.handle(query);
  }

  getCompassConversationPrompt(
    query: GetCompassConversationPromptQuery,
  ): string {
    return this.getCompassConversationPromptQueryHandler.handle(query);
  }

  getCompassSummarizePrompt(query: GetCompassSummarizePromptQuery): string {
    return this.getCompassSummarizePromptQueryHandler.handle(query);
  }

  getCompassChatEncourageClosePrompt(
    query: GetCompassChatEncourageClosePromptQuery,
  ): string {
    return this.getCompassChatEncourageClosePromptQueryHandler.handle(query);
  }

  getCompassChatCloseFunctionDescriptionPrompt(
    query: GetCompassChatCloseFunctionDescriptionPromptQuery,
  ): string {
    return this.getCompassChatCloseFunctionDescriptionPromptQueryHandler.handle(
      query,
    );
  }

  getNoteSummarizePrompt(query: GetNoteSummarizePromptQuery): string {
    return this.getNoteSummarizePromptQueryHandler.handle(query);
  }

  getCompassSuggestSaveNoteFunctionDescriptionPrompt(
    query: GetCompassSuggestSaveNoteFunctionDescriptionPromptQuery,
  ): string {
    return this.getCompassSuggestSaveNoteFunctionDescriptionPromptQueryHandler.handle(
      query,
    );
  }

  getCompassSuggestAddPathFunctionDescriptionPrompt(
    query: GetCompassSuggestAddPathFunctionDescriptionPromptQuery,
  ): string {
    return this.getCompassSuggestAddPathFunctionDescriptionPromptQueryHandler.handle(
      query,
    );
  }

  getCalendarSyncContextPrompt(
    query: GetCalendarSyncContextPromptQuery,
  ): string {
    return this.getCalendarSyncContextPromptQueryHandler.handle(query);
  }

  getCalendarSyncInstructionPrompt(
    query: GetCalendarSyncInstructionPromptQuery,
  ): string {
    return this.getCalendarSyncInstructionPromptQueryHandler.handle(query);
  }

}
