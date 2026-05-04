import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';
import { GetCalendarSyncInstructionPromptQuery } from './get-calendar-sync-instruction-prompt.query';

@Injectable()
export class GetCalendarSyncInstructionPromptQueryHandler
  implements QueryHandler<GetCalendarSyncInstructionPromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCalendarSyncInstructionPromptQuery): string {
    const promptArgs = {
      beliefSystem: query.data.beliefSystem,
      syncStartDate: query.data.syncStartDate.toISOString(),
      syncEndDate: query.data.syncEndDate.toISOString(),
    };

    return this.promptRepository.getPrompt(
      PromptType.CalendarSyncInstruction,
      promptArgs,
      query.promptOverride,
    );
  }
}
