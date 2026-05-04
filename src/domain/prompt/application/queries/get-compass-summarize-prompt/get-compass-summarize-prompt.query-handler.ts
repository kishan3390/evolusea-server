import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetCompassSummarizePromptQuery } from './get-compass-summarize-prompt.query';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';

@Injectable()
export class GetCompassSummarizePromptQueryHandler
  implements QueryHandler<GetCompassSummarizePromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCompassSummarizePromptQuery): string {
    return this.promptRepository.getPrompt(
      PromptType.CompassSummarize,
      query.data,
      query.promptOverride,
    );
  }
}
