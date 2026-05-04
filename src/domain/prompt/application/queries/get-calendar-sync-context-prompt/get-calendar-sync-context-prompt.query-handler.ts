import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';
import { GetCalendarSyncContextPromptQuery } from './get-calendar-sync-context-prompt.query';

@Injectable()
export class GetCalendarSyncContextPromptQueryHandler
  implements QueryHandler<GetCalendarSyncContextPromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCalendarSyncContextPromptQuery): string {
    const promptArgs = {};

    return this.promptRepository.getPrompt(
      PromptType.CalendarSyncCotext,
      promptArgs,
      query.promptOverride,
    );
  }
}
