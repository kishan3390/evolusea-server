import { Module } from '@nestjs/common';
import { FileSystemPromptRepository } from '@domain/prompt/infrastructure/repositories/file-system-prompt.repository';
import { TemplateModule } from '../../lib/template/template.module';
import { PromptFacade } from '@domain/prompt/prompt.facade';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import {
  GetCompassWelcomePromptQueryHandler,
  GetCompassConversationPromptQueryHandler,
  GetCompassChatEncourageClosePromptQueryHandler,
  GetCompassChatCloseFunctionDescriptionPromptQueryHandler,
  GetCompassSuggestSaveNoteFunctionDescriptionPromptQueryHandler,
  GetCompassSuggestAddPathFunctionDescriptionPromptQueryHandler,
  GetCalendarSyncInstructionPromptQueryHandler,
  GetCompassContextPromptQueryHandler,
  GetCalendarSyncContextPromptQueryHandler,
  GetCompassSummarizePromptQueryHandler,
  GetNoteSummarizePromptQueryHandler,
} from '@domain/prompt/application';

@Module({
  imports: [TemplateModule],
  providers: [
    {
      provide: PromptRepository,
      useClass: FileSystemPromptRepository,
    },
    GetCompassWelcomePromptQueryHandler,
    GetCompassContextPromptQueryHandler,
    GetCompassConversationPromptQueryHandler,
    GetCompassSummarizePromptQueryHandler,
    GetNoteSummarizePromptQueryHandler,
    GetCompassChatEncourageClosePromptQueryHandler,
    GetCompassChatCloseFunctionDescriptionPromptQueryHandler,
    GetCompassSuggestSaveNoteFunctionDescriptionPromptQueryHandler,
    GetCompassSuggestAddPathFunctionDescriptionPromptQueryHandler,
    GetCalendarSyncContextPromptQueryHandler,
    GetCalendarSyncInstructionPromptQueryHandler,
    PromptFacade,
  ],
  exports: [PromptFacade],
})
export class PromptModule {}
