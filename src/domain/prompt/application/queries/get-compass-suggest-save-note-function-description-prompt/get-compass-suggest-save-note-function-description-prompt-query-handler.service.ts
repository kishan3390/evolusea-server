import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetCompassSuggestSaveNoteFunctionDescriptionPromptQuery } from './get-compass-suggest-save-note-function-description-prompt.query';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';

@Injectable()
export class GetCompassSuggestSaveNoteFunctionDescriptionPromptQueryHandler
  implements QueryHandler<GetCompassSuggestSaveNoteFunctionDescriptionPromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCompassSuggestSaveNoteFunctionDescriptionPromptQuery): string {
    return this.promptRepository.getPrompt(
      PromptType.CompassSuggestSaveNoteFunctionDescription,
      query.data,
      query.promptOverride,
    );
  }
}
