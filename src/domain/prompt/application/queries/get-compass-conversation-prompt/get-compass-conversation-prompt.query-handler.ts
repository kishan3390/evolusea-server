import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetCompassConversationPromptQuery } from './get-compass-conversation-prompt.query';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';

@Injectable()
export class GetCompassConversationPromptQueryHandler
  implements QueryHandler<GetCompassConversationPromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCompassConversationPromptQuery): string {
    return this.promptRepository.getPrompt(
      PromptType.CompassConversion,
      query.data,
      query.promptOverride,
    );
  }
}
