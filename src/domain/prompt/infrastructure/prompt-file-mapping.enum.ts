import { PromptType } from '@domain/prompt/domain';

export const PromptFileName: Record<PromptType, string> = {
  [PromptType.CompassContext]: 'compass-context.hbs',
  [PromptType.CompassWelcome]: 'compass-welcome-instruction.hbs',
  [PromptType.CompassConversion]: 'compass-conversation.hbs',
  [PromptType.CompassSummarize]: 'compass-summarize.hbs',
  [PromptType.CompassChatEncourageClose]: 'compass-chat-encourage-close.hbs',
  [PromptType.CompassChatCloseFunctionDescription]: 'compass-chat-close-function-description.hbs',
  [PromptType.CompassSuggestSaveNoteFunctionDescription]: 'compass-suggest-save-note-function-description.hbs',
  [PromptType.CompassSuggestAddPathFunctionDescription]: 'compass-suggest-add-path-function-description.hbs',
  [PromptType.NoteSummarize]: 'note-summarize.hbs',

  // Calendar
  [PromptType.CalendarSyncCotext]: 'calendar/sync-context.hbs',
  [PromptType.CalendarSyncInstruction]: 'calendar/sync-instruction.hbs',
};
