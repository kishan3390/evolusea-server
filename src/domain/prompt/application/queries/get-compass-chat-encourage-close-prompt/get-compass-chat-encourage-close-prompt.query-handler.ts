import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetCompassChatEncourageClosePromptQuery } from './get-compass-chat-encourage-close-prompt.query';
import { PromptRepository } from '@domain/prompt/domain/prompt.repository';
import { PromptType } from '@domain/prompt/domain';

@Injectable()
export class GetCompassChatEncourageClosePromptQueryHandler
  implements QueryHandler<GetCompassChatEncourageClosePromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetCompassChatEncourageClosePromptQuery): string {
    return this.promptRepository.getPrompt(
      PromptType.CompassChatEncourageClose,
      query.data,
      query.promptOverride,
    );
  }
}
