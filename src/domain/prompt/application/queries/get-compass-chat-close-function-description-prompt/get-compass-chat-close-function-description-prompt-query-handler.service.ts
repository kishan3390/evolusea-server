import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetCompassChatCloseFunctionDescriptionPromptQuery } from './get-compass-chat-close-function-description-prompt.query';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';

@Injectable()
export class GetCompassChatCloseFunctionDescriptionPromptQueryHandler
  implements QueryHandler<GetCompassChatCloseFunctionDescriptionPromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCompassChatCloseFunctionDescriptionPromptQuery): string {
    return this.promptRepository.getPrompt(
      PromptType.CompassChatCloseFunctionDescription,
      query.data,
      query.promptOverride,
    );
  }
}
