import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetCompassSuggestAddPathFunctionDescriptionPromptQuery } from './get-compass-suggest-add-path-function-description-prompt.query';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';

@Injectable()
export class GetCompassSuggestAddPathFunctionDescriptionPromptQueryHandler
  implements QueryHandler<GetCompassSuggestAddPathFunctionDescriptionPromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCompassSuggestAddPathFunctionDescriptionPromptQuery): string {
    return this.promptRepository.getPrompt(
      PromptType.CompassSuggestAddPathFunctionDescription,
      query.data,
      query.promptOverride,
    );
  }
}
